import React from 'react'
import Image from 'next/image'

const LoadingSpinner = () => {
    return (
        <div className="flex justify-center items-center h-[80vh]">
            <Image src="/GRAINLLY.gif" alt="loading" width={300} height={300} />
        </div>
    )
}

export default LoadingSpinner