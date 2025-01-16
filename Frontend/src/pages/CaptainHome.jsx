import React, { useEffect, useState, useContext, useRef } from 'react'
import { SocketContext } from '../contexts/SocketContext'
import { use } from 'react'

const CaptainHome = () => {
  const [captain, setCaptain] = useState(null)
  const [rides, setRides] = useState([])
  const [isAccepted, setIsAccepted] = useState(false)
  const [acceptedRide, setAcceptedRide] = useState(null)
  const [otp, setOtp] = useState('')
  const [rideStarted, setRideStarted] = useState(false)

  const socket = useContext(SocketContext)

  useEffect(() => {
    if (socket) {
      console.log('Socket', socket.id)
      if (captain) {
        socket.emit('addSocketIdToUserDb', { userId: captain._id, type: 'captain' })
      }
      const rideRequestHandler = (data) => {
        rides.find(ride => ride._id === data.ride._id) ? console.log('Ride already exists') :
          setRides((rides) => [...rides, data.ride]);
      };

      socket.on('rideRequestToCaptain', rideRequestHandler);

      socket.on('otp-verify-response', (data) => {
        console.log(data);
        if (data.message === 'OTP Verified') {
          setRideStarted(true)
        } else {
          alert('Invalid OTP')
          setOtp('')
        }
      })

      socket.on('rideRequestCancelToCaptain', (data) => {
        console.log("rides after cancel",data);
        setRides(rides.filter(ride => ride._id !== data.ride._id))
      })
    }
  }, [socket, captain])

  useEffect(() => {
    console.log(rides)
  }, [rides])

  useEffect(() => {
    const captainString = localStorage.getItem('captain');
    const captain = JSON.parse(captainString);
    setCaptain(captain);
    console.log(captain);

  }, [])

  useEffect(() => {
    const sendLocation = () => {
      console.log("Hello")
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          const { latitude, longitude } = position.coords;
          console.log(latitude, longitude)
          console.log("Here",acceptedRide)
          if(acceptedRide?.user.socketId) console.log(acceptedRide.user.socketId)
          if(acceptedRide?.user.socketId) socket.emit('update-location-captain', { userId: captain._id, location: { lat: latitude, lng: longitude }, userSocketId: acceptedRide?.user?.socketId });
        });
      }
    };

    const intervalId = setInterval(sendLocation, 5000);

    return () => clearInterval(intervalId);
  }, [socket, captain, acceptedRide]);

  const handleLogout = async () => {
    console.log('Logging out...');

    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/captains/logout`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    const data = await res.json()
    console.log(data);
    socket.emit('removeSocketIdFromUserDb', ({ userId: captain._id, type: "captain" }));
    localStorage.removeItem('token');
    localStorage.removeItem('captain');
    window.location.reload()
  }

  const handleAcceptRide = async () => {
    console.log('Accepting Ride...');
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/rides/confirm-ride`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ ride: rides[0], captainId: captain._id })
    })
    const data = await res.json()
    console.log(data);
    setAcceptedRide(data);
  }
  useEffect(() => {
    if (acceptedRide) {
      setRides([])
      setIsAccepted(true)
      socket.emit('rideAccepted', { userSocketId: acceptedRide.user.socketId, ride: acceptedRide.ride, captain: acceptedRide.captain })
    }
  }, [acceptedRide])

  const handleDeclineRide = () => {
    console.log('Declining Ride...');
    setRides(rides.filter(ride => ride._id !== rides[0]._id))
  }

  return (
    <div className='relative h-screen bg-cover flex flex-col justify-between' style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/48603081/97194124-ca9eb580-17cf-11eb-94a7-0499777e321b.png")' }}>
      <div className='flex justify-between bg-[#f2f3f4] items-center'>
        <div >
          <img className='h-12 mt-3 ml-5 pb-4' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="uber logo" />
        </div>
        <div onClick={handleLogout}>
          <h3 className='text-xl font-bold mr-6 bg-red-500 px-4 py-0 rounded-sm'>Logout</h3>
        </div>
      </div>
      <div onClick={() => {
        if (rides.length == 0) {
          setRides([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        } else {
          setRides([])
        }
      }} ><button onClick={() => setIsAccepted(false)} >Here</button></div>
      {rides.length == 0 && !isAccepted && <div className='h-[50%] bg-white p-3' >
        <div className='flex justify-start gap-4 items-center'>
          <div className='bg-gray-300 w-12 h-12 rounded-full flex justify-center items-center'>
            <img className='h-10' src="https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png" alt="user" />
          </div>
          <div className=''>
            <h1 className='text-lg font-bold'>Welcome {captain?.fullname.firstname}</h1>
            <p className='text-lg text-gray-500'>Captain</p>
          </div>
          <div className='ml-24'>
            <h1 className='text-2xl font-bold'>₹{rides.length > 0 && rides[0].fare}</h1>
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
      {!acceptedRide && rides.length > 0 && <div className='h-[50%] bg-white p-3' >
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
              <h1 className='text-2xl font-bold'>₹{rides.length > 0 && rides[0]?.fare}</h1>
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
              <h3 className='text-xl font-semibold' >{rides.length > 0 && rides[0].pickup}</h3>
            </div>
          </div>
          <div name="ridestartend" className='flex justify-start items-center mt-4'>
            <div className='mr-8'>
              <img className='h-12' src="https://e7.pngegg.com/pngimages/760/399/png-clipart-map-computer-icons-flat-design-location-logo-location-icon-photography-heart-thumbnail.png" alt="start location" />
            </div>
            <div>
              <h3 className='text-xl font-semibold' >{rides.length > 0 && rides[0].destination}</h3>
            </div>
          </div>
        </div>
        <div>
          <div>
            <button onClick={handleAcceptRide} className='bg-green-500 text-white text-2xl font-bold w-full p-3 mt-4 rounded-md'>Accept Ride</button>
          </div>
          <div>
            <button onClick={handleDeclineRide} className='bg-red-500 text-white text-2xl font-bold w-full p-3 mt-4 rounded-md'>Decline Ride</button>
          </div>
        </div>
      </div>}
      {isAccepted && <div className='h-[50%] bg-white p-3'>
        <h1 className='text-xl my-2 font-semibold capitalize'>Passenger Name: {acceptedRide && acceptedRide?.user?.fullname?.firstname}</h1>
        <h1 className='text-xl my-2 font-semibold'>Pickup Point - {acceptedRide && acceptedRide?.ride?.pickup}</h1>
        {rideStarted && <button className='bg-red-500 text-white text-2xl font-bold w-full p-3 mt-4 rounded-md' onClick={() => {
          console.log('Ending Ride...');
          socket.emit('end-ride', { rideId: acceptedRide.ride._id, captainId: captain._id, userSocketId: acceptedRide.user.socketId });
          setRideStarted(false);
          setIsAccepted(false);
          setAcceptedRide(null);
        }}>End Ride</button>}
        {!rideStarted && <h1 className='text-lg font-semibold'>Enter OTP</h1>}
        {!rideStarted && <div className='flex justify-center items-center'>
          <input type="text"
            className='border-2 border-gray-300 p-2 rounded-md w-28 mt-4'
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          /> <br />
          <button onClick={() => {
            console.log(acceptedRide.ride._id, otp, acceptedRide.user._id)
            socket.emit('otp-verify', { rideId: acceptedRide.ride._id, otp, socketId: acceptedRide.user.socketId })
          }} className='bg-black text-white px-10 py-1 mx-10 rounded-s-full rounded-e-full'>Submit</button>
        </div>}
      </div>
      }
    </div>
  )
}

export default CaptainHome