'use client'
import React, { useEffect, useState } from 'react'
import { useAppContext } from '@/context/AppContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import Loading from '@/components/Loading'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// Dynamically import Recharts to avoid SSR issues
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false })
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false })
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false })
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false })
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false })
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false })
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false })
const Legend = dynamic(() => import('recharts').then(mod => mod.Legend), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false })

const RADIAN = Math.PI / 180

const renderPaymentMethodLabel = ({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text x={x} y={y} fill='white' textAnchor={x > cx ? 'start' : 'end'} dominantBaseline='central'>
      {(percent * 100).toFixed(0)}%
    </text>
  )
}

const PaymentMethodsLegend = ({ payload, currency }) => {
  if (!payload || payload.length === 0) return null

  return (
    <div className='flex flex-wrap justify-center gap-6 mt-4'>
      {payload.map((entry) => (
        <div key={entry.value} className='flex items-center gap-3 text-sm'>
          <span
            className='w-3 h-3 rounded-full'
            style={{ backgroundColor: entry.color }}
          />
          <span className='font-medium text-gray-700'>{entry.value}</span>
          <span className='text-gray-500'>{currency}{Number(entry.payload.value || 0).toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

const PaymentMethodsPie = ({ data, currency }) => {
  return (
    <PieChart>
      <Pie
        data={data}
        cx='50%'
        cy='50%'
        innerRadius={0}
        outerRadius={110}
        dataKey='value'
        labelLine={false}
        label={renderPaymentMethodLabel}
        isAnimationActive={false}
        stroke='#ffffff'
        strokeWidth={1}
      >
        {data.map((entry, index) => (
          <Cell
            key={`payment-method-${index}`}
            fill={entry.fill ?? entry.color ?? (entry.name === 'COD' ? '#f97316' : '#6ead20')}
          />
        ))}
      </Pie>
      <Tooltip
        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827', boxShadow: '0 10px 25px rgba(15, 23, 42, 0.12)' }}
        formatter={(value, name) => [`${currency}${Number(value || 0).toLocaleString()}`, name]}
      />
      <Legend
        verticalAlign='bottom'
        align='center'
        content={(props) => <PaymentMethodsLegend {...props} currency={currency} />}
      />
    </PieChart>
  )
}

const Dashboard = () => {
  const { getToken, currency } = useAppContext()
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCategories: 0,
    monthlyOrders: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    codRevenue: 0,
    onlineRevenue: 0,
    codOrders: 0,
    onlineOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [recentProducts, setRecentProducts] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [lowStockItems, setLowStockItems] = useState([])
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([])
  const [orderStatusData, setOrderStatusData] = useState([])
  const [paymentMethodData, setPaymentMethodData] = useState([])
  const router = useRouter()

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = await getToken()

      // Fetch all data in parallel (get all orders for dashboard)
      const [productsRes, ordersRes, categoriesRes] = await Promise.all([
        axios.get('/api/product/seller-list', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/order/seller-orders?all=true', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/category', { headers: { Authorization: `Bearer ${token}` } })
      ])

      const products = productsRes.data.success ? productsRes.data.products : []
      const orders = ordersRes.data.success ? ordersRes.data.orders : []
      const categories = categoriesRes.data.success ? categoriesRes.data.data : []

      // Get current date info
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      // Calculate revenue from orders
      const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0)

      // Calculate monthly orders and revenue (current month)
      const monthlyOrders = orders.filter(order => {
        const orderDate = new Date(order.date)
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
      })
      
      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + (order.amount || 0), 0)

      // Calculate yearly revenue (current year)
      const yearlyRevenue = orders
        .filter(order => {
          const orderDate = new Date(order.date)
          return orderDate.getFullYear() === currentYear
        })
        .reduce((sum, order) => sum + (order.amount || 0), 0)

      // Calculate COD vs Online revenue
      const codOrders = orders.filter(order => order.paymentMethod === 'COD')
      const onlineOrders = orders.filter(order => order.paymentMethod === 'Online')
      
      const codRevenue = codOrders.reduce((sum, order) => sum + (order.amount || 0), 0)
      const onlineRevenue = onlineOrders.reduce((sum, order) => sum + (order.amount || 0), 0)

      // Calculate order status breakdown
      const pendingOrders = orders.filter(order => order.status === 'Order Placed').length
      const processingOrders = orders.filter(order => order.status === 'Processing').length
      const shippedOrders = orders.filter(order => order.status === 'Shipped').length
      const deliveredOrders = orders.filter(order => order.status === 'Delivered').length

      // Calculate stock status
      const lowStockProducts = products.filter(product => product.stock > 0 && product.stock <= 10).length
      const outOfStockProducts = products.filter(product => product.stock === 0).length

      // Get top selling products (based on order frequency)
      const productSales = {}
      orders.forEach(order => {
        order.items?.forEach(item => {
          const productId = item.product?._id || item.product
          if (productId) {
            productSales[productId] = (productSales[productId] || 0) + (item.quantity || 0)
          }
        })
      })

      const topSellingProducts = products
        .map(product => ({
          ...product,
          totalSold: productSales[product._id] || 0
        }))
        .filter(product => product.totalSold > 0)
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 5)

      // Get out of stock items (inactive products)
      const outOfStock = products
        .filter(product => product.isActive === false)
        .slice(0, 5)

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        totalCategories: categories.length,
        monthlyOrders: monthlyOrders.length,
        monthlyRevenue,
        yearlyRevenue,
        codRevenue,
        onlineRevenue,
        codOrders: codOrders.length,
        onlineOrders: onlineOrders.length,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        lowStockProducts,
        outOfStockProducts
      })

      // Get recent orders (last 5)
      setRecentOrders(orders.slice(0, 5))
      
      // Get recent products (last 5)
      setRecentProducts(products.slice(0, 5))

      // Set top products and out of stock items
      setTopProducts(topSellingProducts)
      setLowStockItems(outOfStock)

      // Prepare chart data - Last 6 months revenue
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const last6Months = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const month = date.getMonth()
        const year = date.getFullYear()
        
        const monthRevenue = orders
          .filter(order => {
            const orderDate = new Date(order.date)
            return orderDate.getMonth() === month && orderDate.getFullYear() === year
          })
          .reduce((sum, order) => sum + (order.amount || 0), 0)
        
        last6Months.push({
          month: monthNames[month],
          revenue: parseFloat(monthRevenue.toFixed(0))
        })
      }
      setMonthlyRevenueData(last6Months)

      // Order Status Chart Data
      setOrderStatusData([
        { name: 'Order Placed', value: pendingOrders, color: '#84cc16' },
        { name: 'Processing', value: processingOrders, color: '#3b82f6' },
        { name: 'Shipped', value: shippedOrders, color: '#84cc16' },
        { name: 'Delivered', value: deliveredOrders, color: '#22c55e' }
      ])

      // Payment Method Chart Data
      setPaymentMethodData([
        { name: 'COD', value: parseFloat(codRevenue.toFixed(0)), orders: codOrders.length, fill: '#f97316' },
        { name: 'Online', value: parseFloat(onlineRevenue.toFixed(0)), orders: onlineOrders.length, fill: '#6ead20' }
      ])

    } catch (error) {
      toast.error('Failed to load dashboard data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    fetchDashboardData()
  }, [])

  if (loading) {
    return  <> <div className='flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm'>
      <Loading />
    </div>
    </>
  }

  return (
    <div className='flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm'>
      <div className='md:p-10 p-4 space-y-5'>
        <h2 className='text-lg font-medium'>Dashboard</h2>
        
        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5'>

           <div className='bg-white p-5 rounded-md shadow-sm border'>
            <h3 className='text-base font-medium text-gray-600'>Total Orders</h3>
            <p className='text-2xl font-bold text-lime-600'>{stats.totalOrders}</p>
          </div>

          {/* <div className='bg-white p-5 rounded-md shadow-sm border'>
            <h3 className='text-base font-medium text-gray-600'>Orders This Month</h3>
            <p className='text-2xl font-bold text-lime-600'>{stats.monthlyOrders}</p>
          </div> */}

          <div className='bg-white p-5 rounded-md shadow-sm border'>
            <h3 className='text-base font-medium text-gray-600'>Total Products</h3>
            <p className='text-2xl font-bold text-lime-600'>{stats.totalProducts}</p>
          </div>

          <div className='bg-white p-5 rounded-md shadow-sm border'>
            <h3 className='text-base font-medium text-gray-600'>Total Categories</h3>
            <p className='text-2xl font-bold text-lime-600'>{stats.totalCategories}</p>
          </div>

          <div className='bg-white p-5 rounded-md shadow-sm border'>
            <h3 className='text-base font-medium text-gray-600'>Total Revenue</h3>
            <p className='text-2xl font-bold text-lime-600'>{currency}{stats.totalRevenue.toFixed(0)}</p>
          </div>
        </div>

        {/* Revenue Analytics */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          {/* Monthly & Yearly Revenue */}
          <div className='bg-white p-5 rounded-md shadow-sm border'>
            <h3 className='text-lg font-medium mb-4 text-gray-800'>Revenue Analytics</h3>
            <div className='space-y-4'>
              <div className='flex justify-between items-center p-3  rounded-lg border'>
                <div>
                  <p className='text-sm text-gray-600'>This Month</p>
                  <p className='text-xl font-bold text-lime-600'>{currency}{stats.monthlyRevenue.toFixed(0)}</p>
                </div>
                <div className='w-12 h-12  rounded-full flex items-center justify-center'>
                  <svg className='w-6 h-6 text-lime-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                  </svg>
                </div>
              </div>
              
              <div className='flex justify-between items-center p-3 rounded-lg border'>
                <div>
                  <p className='text-sm text-gray-600'>This Year</p>
                  <p className='text-xl font-bold text-lime-600'>{currency}{stats.yearlyRevenue.toFixed(0)}</p>
                </div>
                <div className='w-12 h-12  rounded-full flex items-center justify-center'>
                  <svg className='w-6 h-6 text-lime-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Breakdown */}
          <div className='bg-white p-5 rounded-md shadow-sm border'>
            <h3 className='text-lg font-medium mb-4 text-gray-800'>Payment Methods</h3>
            <div className='space-y-4'>
              <div className='flex justify-between items-center p-3 rounded-lg border'>
                <div>
                  <p className='text-sm text-gray-600'>Cash on Delivery</p>
                  <p className='text-xl font-bold text-lime-600'>{currency}{stats.codRevenue.toFixed(0)}</p>
                  <p className='text-xs text-gray-500 mt-1'>{stats.codOrders} orders</p>
                </div>
                <div className='w-12 h-12  rounded-full flex items-center justify-center'>
                  <svg className='w-6 h-6 text-lime-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' />
                  </svg>
                </div>
              </div>
              
              <div className='flex justify-between items-center p-3 rounded-lg border'>
                <div>
                  <p className='text-sm text-gray-600'>Online Payment</p>
                  <p className='text-xl font-bold text-lime-600'>{currency}{stats.onlineRevenue.toFixed(0)}</p>
                  <p className='text-xs text-gray-500 mt-1'>{stats.onlineOrders} orders</p>
                </div>
                <div className='w-12 h-12  rounded-full flex items-center justify-center'>
                  <svg className='w-6 h-6 text-lime-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {mounted && (
        <>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
          {/* Revenue Trend Chart */}
          <div className='bg-white p-5 rounded-lg shadow-sm border'>
            <h3 className='text-lg font-medium mb-4 text-gray-800'>Revenue Trend (Last 6 Months)</h3>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                <XAxis dataKey='month' stroke='#6b7280' style={{ fontSize: '12px' }} />
                <YAxis stroke='#6b7280' style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value) => [`${currency}${value}`, 'Revenue']}
                />
                <Line type='monotone' dataKey='revenue' stroke='#84cc16' strokeWidth={3} dot={{ fill: '#84cc16', r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status Pie Chart */}
           <div className='bg-white p-5 rounded-lg shadow-sm border'>
          <h3 className='text-lg font-medium mb-4 text-gray-800'>Payment Methods Distribution</h3>
          <ResponsiveContainer width='100%' height={300}>
            <PaymentMethodsPie data={paymentMethodData} currency={currency} />
          </ResponsiveContainer>
        </div>
        </div>

       
       
        </>
        )}

       
        {/* Top Selling Products & Low Stock Items */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
          {/* Top Selling Products */}
          <div className='bg-white p-5 rounded-md shadow-sm border'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-medium text-gray-800'>Top Selling Products</h3>
              <span className='text-xs bg-lime-100 text-lime-700 px-2 py-1 rounded-full font-medium'>Best Performers</span>
            </div>
            {topProducts.length > 0 ? (
              <div className='space-y-3'>
                {topProducts.map((product, index) => (
                  <div key={index} className='flex justify-between items-center p-3 bg-gray-50 rounded-lg transition'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 bg-lime-600 text-white rounded-full flex items-center justify-center text-sm font-bold'>
                        {index + 1}
                      </div>
                      <div>
                        <p className='font-medium text-sm'>{product.name}</p>
                        <p className='text-xs text-gray-500'>{product.category}</p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-bold text-lime-600'>{product.totalSold} sold</p>
                      <p className='text-xs text-gray-500'>{currency}{product.offerPrice}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-gray-500 text-center py-8'>No sales data yet</p>
            )}
          </div>

          {/* Out of Stock Items */}
          <div className='bg-white p-5 rounded-md shadow-sm border'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-medium text-gray-800'>Out of Stock Items</h3>
              <span className='text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium'>Urgent Action</span>
            </div>
            {lowStockItems.length > 0 ? (
              <div className='space-y-3'>
                {lowStockItems.map((product, index) => (
                  <div key={index} className='flex justify-between items-center p-3 bg-red-50 rounded-lg transition'>
                    <div>
                      <p className='font-medium text-sm'>{product.name}</p>
                      <p className='text-xs text-gray-500'>{product.category}</p>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-bold text-red-600'>Out of Stock</p>
                      <p className='text-xs text-gray-500'>{currency}{product.offerPrice}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-gray-500 text-center py-8'>All products in stock! </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className='bg-gray-50 p-6 rounded-lg border'>
          <h3 className='text-lg font-medium mb-4 text-gray-800'>Quick Actions</h3>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
            <Link href='/seller' className='flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:shadow-md transition border border-gray-200 '>
              <svg className='w-8 h-8 text-lime-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
              </svg>
              <span className='text-sm font-medium text-gray-700'>Add Product</span>
            </Link>

            <Link href='/seller/orders' className='flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:shadow-md transition border border-gray-200 '>
              <svg className='w-8 h-8 text-lime-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
              </svg>
              <span className='text-sm font-medium text-gray-700'>View Orders</span>
            </Link>

            <Link href='/seller/product-list' className='flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:shadow-md transition border border-gray-200 '>
              <svg className='w-8 h-8 text-lime-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' />
              </svg>
              <span className='text-sm font-medium text-gray-700'>Manage Products</span>
            </Link>

            <Link href='/seller/blog' className='flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:shadow-md transition border border-gray-200 '>
              <svg className='w-8 h-8 text-lime-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
              </svg>
              <span className='text-sm font-medium text-gray-700'>Write Blog</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard