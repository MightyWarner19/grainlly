'use client'
import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'
import toast from 'react-hot-toast'
import { FaSignOutAlt } from 'react-icons/fa'

const Navbar = () => {
  const { signOut } = useClerk()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      await signOut()
      window.location.href = '/'
      toast.success('Logged out successfully')
      
    } catch (error) {
      console.error('Error during logout:', error)
      toast.error('Failed to logout')
    }
  }

  return (
    <div className='flex items-center px-4 md:px-8 py-3 justify-between border-b'>
      <Image 
        onClick={() => router.push('/')} 
        className='w-14 lg:w-16 cursor-pointer' 
        src="/brand-logo.jpeg" 
        width={100} 
        height={100} 
        alt="Brand Logo" 
      />
      <button 
        onClick={handleLogout}
        className='bg-gray-600 flex items-center gap-2 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm hover:bg-gray-700 transition-colors'
      >
       <span className='mr-2'>Logout</span>
       <FaSignOutAlt />
      </button>
    </div>
  )
}

export default Navbar