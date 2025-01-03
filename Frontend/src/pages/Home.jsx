import React, { useEffect, useState, useRef } from 'react'
import { UserContext } from '../contexts/UserContext'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const Home = () => {
  const [user, setUser] = useState(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  useEffect(() => {
    const userString = localStorage.getItem('user');
    const user = JSON.parse(userString);
    setUser(user);
  }, [])

  const PanelOpenRef = useRef(null);
  const PanelCloseRef = useRef(null);

  useGSAP(function(){
    if(isPanelOpen){
      gsap.to(PanelOpenRef.current, {height: '70%', duration: 0.5})
      gsap.to(PanelCloseRef.current, {opacity: 1, duration: 0.5})
    }
    else{
      gsap.to(PanelOpenRef.current, {height: '0%', duration: 0.5})
      gsap.to(PanelCloseRef.current, {opacity: 0, duration: 0.5})

    }
  },[isPanelOpen])

  return (
    <div className='h-screen bg-cover' style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/48603081/97194124-ca9eb580-17cf-11eb-94a7-0499777e321b.png")' }}>
      <div className={`w-screen pt-4 pl-5 pb-4 h-[5%] ${isPanelOpen ? 'bg-white' : 'bg-[#f2f3f4]'}`}>
        <img src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" className='w-20 a' alt="" />
      </div>
      <div className='h-[95%] flex flex-col justify-end'>
        <div className='bg-white w-screen h-[30%] relative'>
          <div className='h-10 w-1 absolute top-24 left-10 rounded-full bg-black' ></div>
          <div className='h-2 w-2 absolute top-20 left-[38px] rounded-full bg-black' ></div>
          <div className='h-2 w-2 absolute top-36 left-[38px] bg-black' ></div>
          <form action="">
            <div className='flex justify-between'>
            <h3 className='pl-7 text-2xl font-semibold mb-5 mt-3'>Where to go?</h3>
            <h3 ref={PanelCloseRef} onClick={() => setIsPanelOpen(false)} className='mr-10'>down</h3>
            </div>
            <div><input className='bg-[#f2f3f4] w-[85%] ml-7 pl-7 pt-2 pb-2 rounded-md text-lg font-semibold mb-3' onClick={() => setIsPanelOpen(true)} type="text" placeholder='Enter Pickup' /></div>
            <div><input className='bg-[#f2f3f4] w-[85%] ml-7 pl-7 pt-2 pb-2 rounded-md text-lg font-semibold mb-7' type="text" placeholder='Enter your destination' /></div>
            <div className='m-auto text-center'><button className='bg-black text-white w-1/2 rounded-sm pt-2 pb-2 font-semibold text-xl' >Find Rides</button></div>
          </form>
        </div>
        <div ref={PanelOpenRef} className='bg-red-400 h-[0%]'>
    
        </div>
      </div>
    </div>
  )
}

export default Home