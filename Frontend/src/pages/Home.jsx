import React, { useEffect, useState, useRef } from 'react'
import { UserContext } from '../contexts/UserContext'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { BlinkBlur } from 'react-loading-indicators';
import { ThreeDot } from 'react-loading-indicators';

const Home = () => {
  const [user, setUser] = useState(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [pickup, setPickup] = useState('')
  const [destination, setDestination] = useState('')
  const [predictions, setPredictions] = useState({})
  const [pickupCoords, setPickupCoords] = useState(null)
  const [destinationCoords, setDestinationCoords] = useState(null)
  const [activeInput, setActiveInput] = useState('')
  const [isFindRide, setIsFindRide] = useState(false)
  const [rideData, setRideData] = useState(null)
  const [vehicleType, setVehicleType] = useState('')
  const [fare, setFare] = useState(null)
  const [expectedTime, setExpectedTime] = useState(null)
  const [isConfirmRide, setIsConfirmRide] = useState(false)
  const [rideAccepted, setRideAccepted] = useState(false)

  const carRef = useRef(null)
  const autoRef = useRef(null)
  const motoRef = useRef(null)


  useEffect(() => {
    const userString = localStorage.getItem('user');
    const user = JSON.parse(userString);
    setUser(user);
  }, [])

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const fetchPredictions = async (input) => {
    // Replace with your API call
    let location = ''
    if (pickupCoords) {
      location = pickupCoords.lat + ',' + pickupCoords.lng
    }
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/maps/getAutoComplete?input=${input}&location=${location}`);
    const data = await response.json();
    setPredictions(data);
  };

  const debouncedFetchPredictions = useRef(debounce(fetchPredictions, 300)).current;

  useEffect(() => {
    if (pickup) {
      debouncedFetchPredictions(pickup);
    }
  }, [pickup]);

  useEffect(() => {
    if (destination) {
      debouncedFetchPredictions(destination);
    }
  }, [destination]);

  const PanelOpenRef = useRef(null);
  const PanelCloseRef = useRef(null);

  useGSAP(function () {
    if (isPanelOpen && !isFindRide) {
      gsap.to(PanelOpenRef.current, { height: '70%', duration: 0.5 })
      gsap.to(PanelCloseRef.current, { opacity: 1, duration: 0.5 })
    }
    else {
      gsap.to(PanelOpenRef.current, { height: '0%', duration: 0.5 })
      gsap.to(PanelCloseRef.current, { opacity: 0, duration: 0.5 })

    }
  }, [isPanelOpen])

  const handlePredictionClick = (e, prediction) => {
    const name = prediction.name
    if (activeInput === 'pickup') {
      setPickup(name);
      setPickupCoords(prediction.coordinates)
    }
    else {
      setDestination(name);
      setDestinationCoords(prediction.coordinates)
    }
    setPredictions({});
  }

  const handleFindRide = async (e) => {
    e.preventDefault();

    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/maps/getDistance?slat=${pickupCoords.lat}&slong=${pickupCoords.lng}&elat=${destinationCoords.lat}&elong=${destinationCoords.lng}`)
    const data = await response.json()

    setRideData(data)
    setIsFindRide(true)
    PanelCloseRef.current.click()
    const rideResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/rides/get-fare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        pickup,
        destination,
      })
    })
    const fareData = await rideResponse.json()
    setFare(fareData)

  }

  const confirmRide = async () => {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/rides/create-ride`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        pickup,
        destination,
        vehicleType
      })
    })
    const data = await response.json()
    setRideAccepted(false)
    console.log(data);
    setRideData(data)
  }

  return (
    <div className='h-screen bg-cover' style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/48603081/97194124-ca9eb580-17cf-11eb-94a7-0499777e321b.png")' }}>
      <div className={`w-screen pt-4 pl-5 pb-4 h-[5%] ${isPanelOpen ? 'bg-white' : 'bg-[#f2f3f4]'}`}>
        <img src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" className='w-20 a' alt="" />
      </div>
      <div className='h-[95%] flex flex-col justify-end'>
        <div className={`bg-white w-screen relative ${isFindRide ? 'h-[60%]' : 'h-[45%]'}`}>
          {!isFindRide && !isConfirmRide && <div className='h-10 w-1 absolute top-24 left-10 rounded-full bg-black' ></div>}
          {!isFindRide && !isConfirmRide && <div className='h-2 w-2 absolute top-20 left-[38px] rounded-full bg-black' ></div>}
          {!isFindRide && !isConfirmRide && <div className='h-2 w-2 absolute top-36 left-[38px] bg-black' ></div>}
          {!isFindRide && !isConfirmRide && <form action="" onSubmit={handleFindRide}>
            <div className='flex justify-between'>
              <h3 className='pl-7 text-2xl font-semibold mb-5 mt-3'>Where to go?</h3>
              <h3 ref={PanelCloseRef} onClick={() => setIsPanelOpen(false)} className='mr-10 mt-5'><FontAwesomeIcon icon={faChevronDown} /></h3>
            </div>
            <div><input className='bg-[#f2f3f4] w-[85%] ml-7 pl-7 pt-2 pb-2 rounded-md text-lg font-semibold mb-3'
              onClick={() => { setIsPanelOpen(true); setActiveInput('pickup'); setIsFindRide(false) }}
              type="text" placeholder='Enter Pickup'
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
            /></div>
            <div><input className='bg-[#f2f3f4] w-[85%] ml-7 pl-7 pt-2 pb-2 pr-3 rounded-md text-lg font-semibold mb-7' type="text" placeholder='Enter your destination'
              value={destination}
              onClick={() => { setIsPanelOpen(true); setActiveInput('destination'); setIsFindRide(false) }}
              onChange={(e) => setDestination(e.target.value)}
            /></div>
            <div className='m-auto text-center'><button type='submit' className='bg-black text-white w-1/2 rounded-sm pt-2 pb-2 font-semibold text-xl' >Find Rides</button></div>
          </form>}
          {/* {isFindRide && <div>
            <h3 className='m-10 text-xl' >Distance: {rideData.readable_distance} kms</h3>
            <h3 className='m-10 text-xl'>Time: {rideData.readable_duration}</h3>
          </div>} */}

          {isFindRide &&
            fare &&
            <div className='flex flex-col gap-5 justify-center relative'>
              <div onClick={() => { setIsFindRide(false); setFare(null) }} className='h-10 w-10 text-center flex justify-center items-center rounded-full bg-gray-300 absolute top-[-10%] left-0'>
                <FontAwesomeIcon icon={faArrowLeft} />
              </div>
              {fare && <div className='text-xl font-bold ml-5' >Distance: {fare.distance}kms <br /> drop off in: {fare.time}</div>}
              <div ref={carRef} onClick={() => { setVehicleType('car') }} className={`flex items-center border-black border-solid border-2 w-screen h-28 ${vehicleType === 'car' ? 'bg-gray-200' : ''}`}>
                <div className='w-32'>
                  <img src="https://www.pngplay.com/wp-content/uploads/8/Uber-PNG-Photos.png" alt="uber car" />
                </div>
                <div className='mr-8  text-xl font-semibold'>
                  Uber Go <br />
                  Affordable compact rides <br />
                  {fare && <p>₹{fare.car}</p>}

                </div>
              </div>
              <div ref={autoRef} onClick={() => setVehicleType('auto')} className={`flex items-center border-black border-solid border-2 w-screen h-28 ${vehicleType === 'auto' ? 'bg-gray-200' : ''}`}>
                <div className='w-28 mr-4'>
                  <img src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png" alt="uber car" />
                </div>
                <div className='mr-8  text-xl font-semibold'>
                  Uber Auto <br />
                  Cheap and fast rides <br />
                  {fare && <p>₹{fare.auto}</p>}

                </div>
              </div>
              <div ref={motoRef} onClick={() => { setVehicleType('motorcycle') }} className={`flex items-center border-black border-solid border-2 w-screen h-28 ${vehicleType === 'motorcycle' ? 'bg-gray-200' : ''}`}>
                <div className='w-32'>
                  <img src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png" alt="uber car" />
                </div>
                <div className='mr-8  text-xl font-semibold'>
                  Uber Motor <br />
                  Less but fast rides <br />
                  {fare && <p>₹{fare.motorcycle}</p>}
                </div>
              </div>
              <div onClick={() => { setIsFindRide(false); setIsConfirmRide(true) }} className='m-auto text-center'>
                <button onClick={confirmRide} className='bg-black text-white w-screen rounded-md pr-20 pt-3 pb-3 pl-20 text-xl font-bold hover:bg-gray-800'>Book {vehicleType === '' ? 'Now' : vehicleType}</button>
              </div>
            </div>}
          {isFindRide && !fare && <div className='text-center pt-5'><h3 className='text-2xl font-bold' >Fetching fare...</h3></div>}


          {isConfirmRide &&
            <div className='relative'>
              {!rideAccepted && <div onClick={() => { setIsFindRide(true); setIsConfirmRide(false); setRideData(null); rideAccepted(true) }} className={`h-10 w-10 text-center flex justify-center items-center rounded-full bg-gray-300 absolute ${rideAccepted ? 'top-[-16%]' : 'top-[-15%]'} left-0`}>
                <FontAwesomeIcon icon={faArrowLeft} />
              </div>}
              <div className='flex flex-col items-center'>
                {!rideAccepted && <div className='flex flex-col items-center'>
                  <h3 className='text-xl font-semibold mt-2' ><ThreeDot variant="bounce" color="black" size="medium" text="" textColor="" /></h3>
                  <h3 className='text-xl font-semibold' >Looking for captains nearby...</h3>
                </div>}
                {!rideAccepted && <div className='w-40 absolute top-48'>
                  <img
                    src={
                      vehicleType === 'car'
                        ? 'https://www.pngplay.com/wp-content/uploads/8/Uber-PNG-Photos.png'
                        : vehicleType === 'auto'
                          ? 'https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png'
                          : 'https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png'
                    }
                    alt="vehicle type image"
                  />
                </div>}
                <div className='bg-gray-200 p-2 border-2 w-[90%] border-black rounded-md m-2'>
                  <h3 className='text-lg font-semibold' >From: {rideData && rideData.pickup?.slice(0, 34)}</h3>
                  <h3 className='text-lg font-semibold' >To: {rideData && rideData.destination?.slice(0, 34)}</h3>
                </div>
                <div>
                  <h3 className={`text-2xl font-bold ${rideAccepted ? 'm-2' : 'mt-32'}`} >Fare: ₹{fare && fare[vehicleType]}</h3>
                </div>
                <button className='absolute top-[-10%]' onClick={() => { setRideAccepted(!rideAccepted) }} >accept ride</button>
                {rideAccepted && <div className='bg-gray-200 p-2 border-2 w-[90%] border-black rounded-md m-2'>
                  <h3 className='text-xl font-semibold' >{rideAccepted ? 'Ride Accepted' : 'Ride not accepted'}</h3>
                  <h3 className='text-xl font-bold' >Driver's Name: 19 letter name</h3>
                </div>}
                {rideAccepted && <div className='flex flex-col items-center'>
                  <h3 className='text-xl font-semibold' >Your OTP: </h3>
                  <div className='flex gap-2'>
                    <div className='w-7 h-7 bg-black text-white flex justify-center items-center' >
                      <h3 className='font-bold' >{rideData?.otp && rideData.otp[0]}</h3>
                    </div>
                    <div className='w-7 h-7 bg-black text-white flex justify-center items-center' >
                      <h3 className='font-bold' >{rideData?.otp && rideData.otp[1]}</h3>
                    </div>
                    <div className='w-7 h-7 bg-black text-white flex justify-center items-center' >
                      <h3 className='font-bold' >{rideData?.otp && rideData.otp[2]}</h3>
                    </div>
                    <div className='w-7 h-7 bg-black text-white flex justify-center items-center' >
                      <h3 className='font-bold' >{rideData?.otp && rideData.otp[3]}</h3>
                    </div>
                  </div>
                </div>}
                {rideAccepted && <div className='absolute bottom-[15%] right-5 w-16 h-16 bg-black flex flex-col justify-center items-center rounded-lg' >
                  <h3 className='text-white text-md font-bold' >In</h3>
                  <h3 className='text-white text-md font-bold'>20 mins</h3>
                </div>}
                <div className='w-[80%] flex justify-between mt-3  mr-2'>
                  <button className='bg-red-600 w-screen pt-2 pb-2 rounded-md' ><h3 className='text-white text-xl font-bold ' >Cancel Ride</h3></button>
                </div>
              </div>
            </div>}


        </div>
        <div ref={PanelOpenRef} className={`bg-white ${isFindRide ? 'h-0' : ''}`}>
          {isPanelOpen && !predictions.predictions && <div className='text-center pt-5'><h3 className='text-xl font-semibold'>Enter text to get suggestions...</h3></div>}
          {!isFindRide && !isConfirmRide && predictions.predictions && predictions.predictions.map((prediction, index) => {
            return (
              <div
                key={index}
                onClick={(e) => handlePredictionClick(e, prediction)}
                className='flex justify-between pl-7 pr-7 pt-3 pb-3 border-b-2 border-gray-200'
                data-name={prediction.name}
                data-id={prediction.coordinates.toString()}
                data-address={prediction.address}
                data-type={prediction.type}
              >

                <div>
                  <h3 className='text-xl font-semibold'>{prediction.name}</h3>
                  <p className='text-lg pl-4'>{prediction.address}</p>
                  <p className='text-md font-semibold' >{prediction.type.replaceAll('_', ' ').toLocaleUpperCase()}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Home