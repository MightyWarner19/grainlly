'use client'
import { useAppContext } from '@/context/AppContext'
import { MdOutlineDone } from "react-icons/md";
import { useEffect } from 'react'

const OrderPlaced = () => {

  const { router } = useAppContext()

  useEffect(() => {
    setTimeout(() => {
      router.push('/my-orders')
    }, 3000)
  }, [])

  return (
    <div className='h-screen flex flex-col justify-center items-center gap-5'>
      <div className="flex justify-center items-center relative">
        <MdOutlineDone className="absolute p-5 text-lime-700 text-5xl" />
        <div className="animate-spin rounded-full h-24 w-24 border-4 border-t-lime-700 border-gray-200"></div>
      </div>
      <div className="text-center text-2xl font-semibold">Order Placed Successfully</div>
      <div className="text-center text-gray-500/70">You will be redirected to your orders in 3 seconds</div>
      <button onClick={() => router.push('/my-orders')} className="px-12 py-2 border rounded text-gray-500/70 hover:bg-slate-50/90 transition">
        Go to orders
      </button>
    </div>
  )
}

export default OrderPlaced