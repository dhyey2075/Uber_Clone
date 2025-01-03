import React, { useEffect, useState, useRef } from 'react'
import { UserContext } from '../contexts/UserContext'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


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
    if(pickupCoords){
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

  useGSAP(function(){
    if(isPanelOpen && !isFindRide){
      gsap.to(PanelOpenRef.current, {height: '70%', duration: 0.5})
      gsap.to(PanelCloseRef.current, {opacity: 1, duration: 0.5})
    }
    else{
      gsap.to(PanelOpenRef.current, {height: '0%', duration: 0.5})
      gsap.to(PanelCloseRef.current, {opacity: 0, duration: 0.5})

    }
  },[isPanelOpen])

  const handlePredictionClick = (e, prediction) => {
    const name = prediction.name
    console.log(prediction.coordinates);
    if(activeInput === 'pickup'){
      setPickup(name);
      setPickupCoords(prediction.coordinates)
    }
    else{
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
  }

  return (
    <div className='h-screen bg-cover' style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/48603081/97194124-ca9eb580-17cf-11eb-94a7-0499777e321b.png")' }}>
      <div className={`w-screen pt-4 pl-5 pb-4 h-[5%] ${isPanelOpen ? 'bg-white' : 'bg-[#f2f3f4]'}`}>
        <img src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" className='w-20 a' alt="" />
      </div>
      <div className='h-[95%] flex flex-col justify-end'>
        <div className={`bg-white w-screen relative ${isFindRide ? 'h-[50%]' : 'h-[30%]'}`}>
          <div className='h-10 w-1 absolute top-24 left-10 rounded-full bg-black' ></div>
          <div className='h-2 w-2 absolute top-20 left-[38px] rounded-full bg-black' ></div>
          <div className='h-2 w-2 absolute top-36 left-[38px] bg-black' ></div>
          <form action="" onSubmit={handleFindRide}>
            <div className='flex justify-between'>
            <h3 className='pl-7 text-2xl font-semibold mb-5 mt-3'>Where to go?</h3>
            <h3 ref={PanelCloseRef} onClick={() => setIsPanelOpen(false)} className='mr-10'>down</h3>
            </div>
            <div><input className='bg-[#f2f3f4] w-[85%] ml-7 pl-7 pt-2 pb-2 rounded-md text-lg font-semibold mb-3' 
              onClick={() =>{ setIsPanelOpen(true); setActiveInput('pickup'); setIsFindRide(false)}} 
              type="text" placeholder='Enter Pickup' 
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
            /></div>
            <div><input className='bg-[#f2f3f4] w-[85%] ml-7 pl-7 pt-2 pb-2 pr-3 rounded-md text-lg font-semibold mb-7' type="text" placeholder='Enter your destination' 
              value={destination}
              onClick={() =>{ setIsPanelOpen(true); setActiveInput('destination'); setIsFindRide(false)}}
              onChange={(e) => setDestination(e.target.value)}
            /></div>
            <div className='m-auto text-center'><button type='submit' className='bg-black text-white w-1/2 rounded-sm pt-2 pb-2 font-semibold text-xl' >Find Rides</button></div>
          </form>
          {isFindRide && <div>
            <h3 className='m-10 text-xl' >Distance: {rideData.readable_distance} kms</h3>
            <h3 className='m-10 text-xl'>Time: {rideData.readable_duration}</h3>
          </div>}
        </div>
        <div ref={PanelOpenRef} className={`bg-white ${isFindRide ? 'h-0' : ''}`}>
          {isPanelOpen && !predictions.predictions && <div className='text-center pt-5'><h3 className='text-xl font-semibold'>Enter text to get suggestions...</h3></div>}
          {!isFindRide && predictions.predictions && predictions.predictions.map((prediction, index) => {
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