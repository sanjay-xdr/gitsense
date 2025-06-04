import React from 'react'
import Navbar from '@/components/Navbar'

export default function NavLayout({children}:{children:React.ReactNode}) {
  return (
    <>
 <div style={{border:"1px solid red"}} className='flex justify-center w-full'>
     <Navbar/>
 </div>
    
    <div>
        {children}
    </div>
    </>
  )
}
