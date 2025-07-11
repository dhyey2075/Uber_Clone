import React, { useEffect, useState, useRef, useContext } from 'react'
import { UserContext } from '../contexts/UserContext'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChevronDown, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { BlinkBlur } from 'react-loading-indicators';
import { ThreeDot } from 'react-loading-indicators';
import { SocketContext } from '../contexts/SocketContext';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";
import 'leaflet-routing-machine';
import { faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

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
  const [captainRide, setCaptainRide] = useState(null)
  const [otp, setOTP] = useState(null)
  const [cnfRide, setCnfRide] = useState(false)
  const [rideStarted, setRideStarted] = useState(false)
  const [creatingRide, setCreatingRide] = useState(false)
  const [captainCoords, setCaptainCoords] = useState(null)
  const [positions, setPositions] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  const carRef = useRef(null)
  const autoRef = useRef(null)
  const motoRef = useRef(null)
  const acceptRideRef = useRef(null)
  const mapRef = useRef(null);
  const MapRef = useRef(null);
  const navigator = useNavigate();

  const latitude = 0;
  const longitude = 0;

  const customCarIcon = L.icon({
    iconUrl: 'https://imgs.search.brave.com/wjnuc5LPqljfMKA1Pw-Nz-GVA7wakGDtBrUyEi_ueXs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wbHVz/cG5nLmNvbS9pbWct/cG5nL2Nhci1wbmct/dG9wLXdoaXRlLXRv/cC1jYXItcG5nLWlt/YWdlLTM0ODY3LTU4/Ny5wbmc',
    iconSize: [40, 15],
    iconAnchor: [15, 10],
    popupAnchor: [-3, -76]
  });
  const userLocationIcon = L.divIcon({
    className: 'custom-div-icon',
    html: "<div style='background-color: #3b82f6; width: 15px; height: 15px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #3b82f6;'></div>",
    iconSize: [15, 15],
    iconAnchor: [7.5, 7.5],
    popupAnchor: [0, -7.5]
  });


  const socket = useContext(SocketContext)

  const navigate = useNavigate();

  const setCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        setPickupCoords({ lat: latitude, lng: longitude });
        // Reverse geocode to get address
        fetch(`${import.meta.env.VITE_BASE_URL}/maps/getReverseGeocode?lat=${latitude}&long=${longitude}`)
          .then(res => res.json())
          .then(data => {
            setPickup(data.name);
          })
          .catch(err => console.log(err));
      });
    }
  };


  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        console.log(latitude, longitude)
        setPickupCoords({ lat: latitude, lng: longitude })
      });
    }

    const userString = localStorage.getItem('user');
    const user = JSON.parse(userString);
    setUser(user);
  }, [])

  useEffect(() => {
    if (socket) {
      console.log('Socket ID:', socket.id);

      setMapLoaded(true);

      if (user) {
        socket.emit('addSocketIdToUserDb', { userId: user._id, type: "user" });
      }

      socket.on('rideAcceptedToUser', async (data) => {
        console.log("Ride acc data", data)
        setCaptainRide(data);


      })

      socket.on('captain-location-update', (data) => {
        console.log('New Captain location:', data);
        if (captainRide) {
          console.log("Changing location...")
          setCaptainRide({ ...captainRide, captain: { ...captainRide.captain, location: data.location } })
        }
      })

      socket.on('otp-verify-response', (data) => {
        if (data.message === 'OTP Verified') {
          setRideStarted(true)
        } else {
          alert('Invalid OTP')
        }
      })

      socket.on('end-ride-to-user', (data) => {
        console.log('Ride ended:', data);
        setRideStarted(false);
        setRideAccepted(false);
        setCnfRide(false);
        setIsFindRide(false);
        setIsConfirmRide(false);
        setCaptainRide(null);
        setOTP(null);
        setRideData(null);
        setFare(null);
        setVehicleType('');
        setExpectedTime(null);
        alert('Your ride has ended. Thank you for using our service!');

      });
    }
  }, [socket, user]);

  useEffect(() => {
    console.log("captainRide", captainRide);
    if (captainRide && rideData) { // Add null check for captainRide
      rideData.captains.forEach(captain => {
        if (captain.socketId !== captainRide.captain.socketId) {
          console.log("cancel request sent to", captain.socketId)
          socket.emit('rideRequestCancel', { userSocketId: user.socketId, ride: rideData.ride, captain: captain });
        }
      });
    }
    if (captainRide && pickupCoords) { // Add null check for both captainRide and pickupCoords
      console.log(captainRide)
      setPositions([[captainRide.captain.location.lat, captainRide.captain.location.lng], [pickupCoords.lat, pickupCoords.lng]]);
    }
    if (captainRide) { // Only set rideAccepted if captainRide exists
      setRideAccepted(true);
    }
  }, [captainRide])

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
    console.log(pickupCoords, destinationCoords)
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/maps/getDistance?slat=${pickupCoords.lat}&slong=${pickupCoords.lng}&elat=${destinationCoords.lat}&elong=${destinationCoords.lng}`)
    const data = await response.json()

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
    setCreatingRide(true)
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/rides/create-ride`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        pickup,
        destination,
        vehicleType,
        user: user._id,
        distance: fare.distance,
      })
    })
    const data = await response.json()
    setRideAccepted(false)
    console.log(data);
    setRideData(data);
    setOTP(data.ride.otp)
    console.log(data.captains.length, "captains available")
    data.captains.forEach(captain => {
      console.log("sent to", captain.socketId)
      socket.emit('rideRequest', { captainSocketId: captain.socketId, ride: data.ride });
    });
    setCreatingRide(false)
  }

  const handleLogout = async () => {
    console.log('Logging out...');

    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/users/logout`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    const data = await res.json()
    console.log(data);
    socket.emit('removeSocketIdFromUserDb', ({ userId: user._id, type: "user" }));
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  }

  const RoutingMachine = ({ start, end }) => {
    const map = useMap();

    React.useEffect(() => {
      if (!map) return;

      const routingControl = L.Routing.control({
        waypoints: [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)],
        routeWhileDragging: false,
        addWaypoints: false, // Disable adding waypoints by clicking
        show: true, // Hide the instruction panel
        createMarker: () => null,
      }).addTo(map);

      return () => map.removeControl(routingControl);
    }, [map, start, end]);

    return null;
  };

  useEffect(() => {
    const user = localStorage.getItem('user')
    if(!user) {
      navigator('/signin')
    }
  }, [])


  return (
    <div className='' >
      <div className={`flex justify-between w-screen pt-2 pl-5 h-[5%] ${isPanelOpen ? 'bg-white' : 'bg-[#f2f3f4]'}`}>
        <div>
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" className='w-20 a' alt="" />
        </div>
        <div className='mr-2'>
          <FontAwesomeIcon onClick={handleLogout} className='text-2xl text-red-500' icon={faArrowRightFromBracket} /> <br />
          <h3 className='text-lg font-bold text-red-500'>Logout</h3>
        </div>
      </div>
      <div className='h-[60vh] w-screen block' ref={MapRef} >
        {mapLoaded ? (pickupCoords && <MapContainer center={[pickupCoords.lat, pickupCoords.lng]} zoom={13} ref={mapRef} style={{ height: "60vh", width: "100vw" }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          />
          {/* User's current location marker */}
          {pickupCoords && <Marker position={[pickupCoords.lat, pickupCoords.lng]} icon={userLocationIcon}>
            <Popup>Your current location</Popup>
          </Marker>}

          {/* Captain's location marker when ride is accepted */}
          {captainRide && captainRide.captain && captainRide.captain.location && <Marker position={[captainRide.captain.location.lat, captainRide.captain.location.lng]} icon={customCarIcon}>
            <Popup>Captain: {captainRide.captain.fullname.firstname}</Popup>
          </Marker>}

          {/* Routing between captain and user */}
          {captainRide && captainRide.captain && captainRide.captain.location && pickupCoords && positions.length > 0 && <RoutingMachine start={{ lat: captainRide.captain.location.lat, lng: captainRide.captain.location.lng }} end={{ lat: pickupCoords.lat, lng: pickupCoords.lng }} />}
        </MapContainer>) : (
          <div className="flex flex-col items-center justify-center h-full pt-20">
            <ThreeDot variant="bounce" color="black" size="large" text="Loading map..." textColor="black" />
          </div>
        )
        }
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
            <div className="relative">
              <input
                className='bg-[#f2f3f4] w-[85%] ml-7 pl-7 pt-2 pb-2 rounded-md text-lg font-semibold mb-3'
                onClick={() => { setIsPanelOpen(true); setActiveInput('pickup'); setIsFindRide(false); MapRef.current.style.display = 'none' }}
                type="text"
                placeholder='Enter Pickup'
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentLocation();
                }}
                className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                title="Use current location"
              >
                <FontAwesomeIcon icon={faLocationCrosshairs} />
              </button>
            </div>
            <div><input className='bg-[#f2f3f4] w-[85%] ml-7 pl-7 pt-2 pb-2 pr-3 rounded-md text-lg font-semibold mb-7' type="text" placeholder='Enter your destination'
              value={destination}
              onClick={() => { setIsPanelOpen(true); setActiveInput('destination'); setIsFindRide(false) }}
              onChange={(e) => setDestination(e.target.value)}
            /></div>
            <div className='m-auto text-center'><button onClick={() => MapRef.current.style.display = 'block'} type='submit' className='bg-black text-white w-1/2 rounded-sm pt-2 pb-2 font-semibold text-xl' >Find Rides</button></div>
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
          {isFindRide && !fare && (
            <div className='flex flex-col items-center pt-10'>
              <ThreeDot variant="bounce" color="black" size="large" text="Fetching fare..." textColor="black" />
            </div>
          )}


          {isConfirmRide &&
            <div className='relative'>
              {!rideAccepted && <div onClick={() => { setIsFindRide(true); setIsConfirmRide(false); setRideData(null); setRideAccepted(true) }} className={`h-10 w-10 text-center flex justify-center items-center rounded-full bg-gray-300 absolute ${rideAccepted ? 'top-[-16%]' : 'top-[-15%]'} left-0`}>
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
                {isConfirmRide && <div className='bg-gray-200 p-2 border-2 w-[90%] border-black rounded-md m-2'>
                  <h3 className='text-lg font-semibold' >From: {rideData && rideData?.ride?.pickup?.slice(0, 34)}</h3>
                  <h3 className='text-lg font-semibold' >To: {rideData && rideData?.ride?.destination?.slice(0, 34)}</h3>
                </div>}
                {isConfirmRide && <div>
                  <h3 className={`text-2xl font-bold ${rideAccepted ? 'm-2' : 'mt-32'}`} >Fare: ₹{fare && fare[vehicleType]}</h3>
                </div>}
                <button ref={acceptRideRef} className='absolute top-[-10%]' onClick={() => { setRideAccepted(!rideAccepted); }} >accept ride</button>
                {/* <button  className='absolute top-[-10%] left-0' onClick={() => { setIsFindRide(!isFindRide); }} >Is find Rode</button>
                <button  className='absolute top-[-10%] left-20' onClick={() => { setIsConfirmRide(!isConfirmRide); }} >Is confirm Ride</button>
                <button  className='absolute top-[-10%] left-64' onClick={() => { setRideAccepted(!rideAccepted); }} >rideAccepted</button> */}
                {rideAccepted && captainRide && <div className='bg-gray-200 p-2 border-2 w-[90%] border-black rounded-md m-2'>
                  <h3 className='text-xl font-semibold' >{rideStarted ? 'Ride Started' : rideAccepted ? 'Ride Accepted' : 'Waiting for details...'}</h3>
                  <h3 className='text-xl font-bold' >Captain Name: {captainRide && captainRide.captain.fullname.firstname}</h3>
                </div>}
                {rideAccepted && captainRide && !rideStarted && <div className='flex flex-col items-center'>
                  <h3 className='text-xl font-semibold' >Your OTP: </h3>
                  <div className='flex gap-2'>
                    <div className='w-7 h-7 bg-black text-white flex justify-center items-center' >
                      <h3 className='font-bold' >{otp && otp[0]}</h3>
                    </div>
                    <div className='w-7 h-7 bg-black text-white flex justify-center items-center' >
                      <h3 className='font-bold' >{otp && otp[1]}</h3>
                    </div>
                    <div className='w-7 h-7 bg-black text-white flex justify-center items-center' >
                      <h3 className='font-bold' >{otp && otp[2]}</h3>
                    </div>
                    <div className='w-7 h-7 bg-black text-white flex justify-center items-center' >
                      <h3 className='font-bold' >{otp && otp[3]}</h3>
                    </div>
                  </div>
                  {rideStarted && <div>
                    <h3 className='text-xl font-semibold' >Ride Start</h3>
                    <h3>{captainRide.captain.fullname.firstname} colored {captainRide && captainRide.captain.vehicle.type} with {captainRide && captainRide.captain.vehicle.plate} number plate</h3>

                  </div>}

                </div>}
                {
                  rideStarted && <div className='mt-5 absolute left-10 top-56'>
                    <div className='text-xl font-semibold capitalize'>
                      <h3>{captainRide && captainRide.captain.vehicle.color}</h3>
                      <h3>{captainRide && captainRide.captain.vehicle.vehicleType}</h3>
                      <h3>{captainRide && captainRide.captain.vehicle.plate}</h3>
                    </div>

                  </div>
                }

                {rideAccepted && captainRide && !rideStarted && <div className='absolute bottom-[15%] right-5 w-16 h-16 bg-black flex flex-col justify-center items-center rounded-lg' >
                  <h3 className='text-white text-md font-bold' >In</h3>
                  <h3 className='text-white text-md font-bold'>20 mins</h3>
                </div>}
                <div className='w-[80%] flex justify-between mt-3  mr-2'>
                  {/* <button className='bg-red-600 w-screen pt-2 pb-2 rounded-md' ><h3 className='text-white text-xl font-bold ' >Cancel Ride</h3></button> */}
                </div>
              </div>
            </div>}


        </div>
        <div ref={PanelOpenRef} className={`bg-white ${isFindRide ? 'h-0' : ''}`}>
          {isPanelOpen && !predictions.predictions && (
            <div className='flex flex-col items-center pt-5'>
              <BlinkBlur color="black" size="medium" text="Enter text to get suggestions..." textColor="black" />
            </div>
          )}
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