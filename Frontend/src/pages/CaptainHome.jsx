import React, { useEffect, useState } from 'react'

const CaptainHome = () => {
  const [captain, setCaptain] = useState(null)
  const [rides, setRides] = useState([])

  useEffect(() => {
    const captainString = localStorage.getItem('captain');
    const captain = JSON.parse(captainString);
    setCaptain(captain);
    console.log(captain);
    
  }, [])
  return (
    <div className='relative h-screen bg-cover flex flex-col justify-between' style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/48603081/97194124-ca9eb580-17cf-11eb-94a7-0499777e321b.png")' }}>
      <div className='bg-[#f2f3f4]' >
        <img className='h-12 mt-3 ml-5 pb-4' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="uber logo" />
      </div>
      <div onClick={() => {
        if(rides.length == 0) {
          setRides([1,2,3,4,5,6,7,8,9,10])
        } else {
          setRides([])
        }
      }} ><button>Here</button></div>
      {rides.length == 0 && <div className='h-[50%] bg-white p-3' >
        <div className='flex justify-start gap-4 items-center'>
          <div className='bg-gray-300 w-12 h-12 rounded-full flex justify-center items-center'>
            <img className='h-10' src="https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png" alt="user" />
          </div>
          <div className=''>
            <h1 className='text-lg font-bold'>Welcome {captain?.fullname.firstname}</h1>
            <p className='text-lg text-gray-500'>Captain</p>  
          </div>
          <div className='ml-24'>
          <h1 className='text-2xl font-bold'>₹292.90</h1>
          <p className='text-lg text-gray-500'>Earned</p>
          </div>
        </div>
        <div className='flex flex-col gap-4 mt-4 m-3 bg-[#f2f3f4] p-3 rounded-lg'>
          <div>
            <h3 className='text-3xl font-bold'>Earnings</h3>
          </div>
          <div className=' flex gap-4 justify-between'>
            <div>
              <h3 className='text-2xl font-semibold'>Today</h3>
              <p className='text-lg'>₹292.90</p>
            </div>
            <div>
              <h3 className='text-2xl font-semibold'>This Week</h3>
              <p className='text-lg'>₹292.90</p>
            </div>
            <div>
              <h3 className='text-2xl font-semibold'>Till Now</h3>
              <p className='text-lg'>₹292.90</p>
            </div>
          </div>
        </div>
      </div>}
      {rides.length > 0 && <div className='h-[50%] bg-white p-3' >
        <div className='flex justify-between items-center'>
          <h3 className='text-2xl font-bold mb-4'>New Ride Available</h3>
        </div>
        <div name="rideinfo" className='flex justify-start gap-4 items-center bg-yellow-300 p-3 rounded-md'>
          <div className='bg-gray-300 w-12 h-12 rounded-full flex justify-center items-center'>
            <img className='h-10' src="https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png" alt="user" />
          </div>
          <div className='flex justify-between w-full items-center'>
          <div className=''>
            <h1 className='text-xl font-bold'>{captain?.fullname.firstname}</h1>
          </div>
          <div className=''>
          <h1 className='text-2xl font-bold'>₹292.90</h1>
          <p className='text-xl text-black-500 font-semibold'>2.2kms</p>
          </div>
          </div>
        </div>
        <div className=''>
          <div className='flex justify-start items-center mt-4 gap-10'>
            <div className='ml-2'>
              <img className='h-10' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCOksQcaJtnUw6xaUktQq5xZovJ4zI_6SGrA&s" alt="start location" />
            </div>
            <div>
              <h3 className='text-xl font-semibold' >DAIICT College</h3>
            </div>
          </div>
          <div name="ridestartend" className='flex justify-start items-center mt-4'>
            <div className='mr-8'>
              <img className='h-12' src="https://e7.pngegg.com/pngimages/760/399/png-clipart-map-computer-icons-flat-design-location-logo-location-icon-photography-heart-thumbnail.png" alt="start location" />
            </div>
            <div>
              <h3 className='text-xl font-semibold' >Kalupur Railway Station</h3>
            </div>
          </div>
        </div>
        <div>
          <div>
            <button className='bg-green-500 text-white text-2xl font-bold w-full p-3 mt-4 rounded-md'>Accept Ride</button>
          </div>
          <div>
            <button className='bg-red-500 text-white text-2xl font-bold w-full p-3 mt-4 rounded-md'>Decline Ride</button>
          </div>
        </div>
      </div>}
    </div>
  )
}

export default CaptainHome