'use client'
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = (props) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY
    const router = useRouter()

    const { user } = useUser()
    const { getToken } = useAuth()

    const [products, setProducts] = useState([])
    const [userData, setUserData] = useState(false)
    const [isSeller, setIsSeller] = useState(false)
    const [cartItems, setCartItems] = useState({})

    const fetchProductData = async () => {
        try {
            
            const {data} = await axios.get('/api/product/list')

            if (data.success) {
                setProducts(data.products)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    const fetchUserData = async () => {
        try {

            if (user.publicMetadata.role === 'seller') {
                setIsSeller(true)
            }

            const token = await getToken()

            const { data } = await axios.get('/api/user/data', { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                setUserData(data.user)
                
                // Sanitize cart items - remove invalid ObjectIds
                const sanitizedCart = {};
                const isValidObjectId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
                
                for (const key in data.user.cartItems) {
                    if (isValidObjectId(key)) {
                        sanitizedCart[key] = data.user.cartItems[key];
                    }
                }
                
                setCartItems(sanitizedCart)
                
                // Update cart in DB if sanitization removed items
                if (Object.keys(sanitizedCart).length !== Object.keys(data.user.cartItems).length) {
                    await axios.post('/api/cart/update', {cartData: sanitizedCart}, {headers:{Authorization: `Bearer ${token}`}})
                }
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    const addToCart = async (itemId) => {

        if (!user) {
            return toast('Please login',{
                icon: '⚠️',
              })
        }

        // Validate itemId is a valid MongoDB ObjectId
        const isValidObjectId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
        if (!isValidObjectId(itemId)) {
            return toast.error('Invalid product ID');
        }

        let cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            cartData[itemId] += 1;
        }
        else {
            cartData[itemId] = 1;
        }
        setCartItems(cartData);
        if (user) {
            try {
                const token = await getToken()
                await axios.post('/api/cart/update', {cartData}, {headers:{Authorization: `Bearer ${token}`}} )
                toast.success('Item added to cart')
            } catch (error) {
                toast.error(error.message)
            }
        }
    }

    const updateCartQuantity = async (itemId, quantity) => {

        // Validate itemId is a valid MongoDB ObjectId
        const isValidObjectId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
        if (!isValidObjectId(itemId)) {
            return toast.error('Invalid product ID');
        }

        let cartData = structuredClone(cartItems);
        if (quantity === 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }
        setCartItems(cartData);
        if (user) {
            try {
                const token = await getToken()
                await axios.post('/api/cart/update', {cartData}, {headers:{Authorization: `Bearer ${token}`}} )
                toast.success('Cart Updated')
            } catch (error) {
                toast.error(error.message)
            }
        }
    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const key in cartItems) {
            const itemId = key;
            const exists = products.find((p) => String(p._id) === String(itemId));
            if (exists && cartItems[itemId] > 0) {
                totalCount += cartItems[itemId];
            }
        }
        return totalCount;
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            const itemId = items;
            const itemInfo = products.find((product) => String(product._id) === String(itemId));
            if (itemInfo && cartItems[itemId] > 0) {
                const price = (itemInfo.offerPrice ?? itemInfo.price) || 0;
                totalAmount += price * cartItems[itemId];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    useEffect(() => {
        fetchProductData()
    }, [])

    useEffect(() => {
        if (user) {
            fetchUserData()
        }
    }, [user])

    const value = {
        user, getToken,
        currency, router,
        isSeller, setIsSeller,
        userData, fetchUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}