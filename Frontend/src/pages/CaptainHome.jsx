import React, { useEffect, useState, useContext, useRef } from 'react'
import { SocketContext } from '../contexts/SocketContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { ThreeDot } from 'react-loading-indicators';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";
import 'leaflet-routing-machine';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const CaptainHome = () => {
  const [captain, setCaptain] = useState(null)
  const [rides, setRides] = useState([])
  const [isAccepted, setIsAccepted] = useState(false)
  const [acceptedRide, setAcceptedRide] = useState(null)
  const [otp, setOtp] = useState('')
  const [rideStarted, setRideStarted] = useState(false)
  const [captainLocation, setCaptainLocation] = useState(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  const socket = useContext(SocketContext)
  const mapRef = useRef(null)
  const navigator = useNavigate()

  // Captain's vehicle icon
  const captainIcon = L.icon({
    iconUrl: 'https://imgs.search.brave.com/wjnuc5LPqljfMKA1Pw-Nz-GVA7wakGDtBrUyEi_ueXs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wbHVz/cG5nLmNvbS9pbWct/cG5nL2Nhci1wbmct/dG9wLXdoaXRlLXRv/cC1jYXItcG5nLWlt/YWdlLTM0ODY3LTU4/Ny5wbmc',
    iconSize: [40, 20],
    iconAnchor: [20, 10],
    popupAnchor: [0, -10]
  });

  // User location icon for pickup point
  const userLocationIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854929.png',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });

  useEffect(() => {
    if (socket) {
      console.log('Socket', socket.id)
      if (captain) {
        console.log('Captain logged in')
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
    
    // Get captain's current location and set up map
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        setCaptainLocation({ lat: latitude, lng: longitude });
        setMapLoaded(true);
      });
    }
  }, [])

  useEffect(() => {
    if (captain && socket) {
      console.log('Emitting addSocketIdToUserDb');
      socket.emit('addSocketIdToUserDb', { userId: captain._id, type: 'captain' });
    }
  }, [captain, socket])

  useEffect(() => {
  const sendLocation = () => {
    if (!captain || !socket) return; // Don't proceed if captain or socket is null

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          const locationData = { lat: latitude, lng: longitude };
          
          // Update local state
          setCaptainLocation(locationData);
          
          // Prepare socket data with null checks
          const socketData = {
            captainId: captain._id,
            location: locationData,
            userSocketId: acceptedRide?.user?.socketId || null,
            captainSocketId: socket.id
          };

          // Only emit if we have valid captain ID and socket
          if (socketData.captainId && socketData.captainSocketId) {
            socket.emit('update-location-captain', socketData);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const intervalId = setInterval(sendLocation, 5000);
  return () => clearInterval(intervalId);
}, [socket, captain, acceptedRide]);

useEffect(() => {
  if (acceptedRide && captain && socket) {
    // Ensure we have all required data
    const rideData = {
      userSocketId: acceptedRide.user?.socketId,
      ride: {
        ...acceptedRide,
        captain: {
          ...captain,
          location: captainLocation, // Include current location
          socketId: socket.id // Include current socket ID
        }
      },
      captain: {
        ...captain,
        location: captainLocation,
        socketId: socket.id
      }
    };

    // Only emit if we have user socket ID
    if (rideData.userSocketId) {
      setIsAccepted(true);
      setRides([]);
      console.log("2 july", rideData)
      socket.emit('rideAccepted', rideData);
    } else {
      console.error('Missing user socket ID for ride acceptance');
    }
  }
}, [acceptedRide, captain, socket, captainLocation]);

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
  if (!captain || !rides[0]) {
    console.error('Missing required data for ride acceptance');
    return;
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/rides/confirm-ride`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        ride: rides[0],
        captainId: captain._id,
        location: captainLocation, // Include current location
        socketId: socket?.id // Include socket ID
      })
    });

    if (!res.ok) throw new Error('Failed to confirm ride');
    
    const data = await res.json();
    if (data && data.user?.socketId) {
      setAcceptedRide(data);
    } else {
      console.error('Invalid ride data received');
    }
  } catch (error) {
    console.error('Error accepting ride:', error);
    alert('Failed to accept ride. Please try again.');
  }
};
  
  const handleDeclineRide = () => {
    setRides(rides.slice(1))
  }

  const handleVerifyOtp = async () => {
    const rideId = acceptedRide.ride._id
    const userSocketId = acceptedRide.user.socketId
    console.log("2july", rideId, otp, userSocketId);
    socket.emit('otp-verify', { rideId, otp, socketId: userSocketId })
  }

  const handleEndRide = async () => {
    const rideId = acceptedRide._id
    const userSocketId = acceptedRide.user.socketId
    const captainId = captain._id
    socket.emit('end-ride', { rideId, userSocketId, captainId })
    setAcceptedRide(null)
    setIsAccepted(false)
    setRideStarted(false)
    setOtp('')
  }

  // Routing component for showing route to pickup location
  const RoutingMachine = ({ start, end }) => {
    const map = useMap();
  
    React.useEffect(() => {
      if (!map) return;
  
      const routingControl = L.Routing.control({
        waypoints: [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)],
        routeWhileDragging: false,
        addWaypoints: false,
        show: false,
        createMarker: () => null,
      }).addTo(map);
  
      return () => map.removeControl(routingControl);
    }, [map, start, end]);
  
    return null;
  };

  useEffect(() => {
    const captain = localStorage.getItem('captain')
    if(!captain) {
      navigator("/")
      toast.error("Please login first.")
    }
  })

  return (
    <div className='h-screen bg-cover flex flex-col'>
      {/* Header */}
      <div className='flex justify-between bg-white items-center p-4 shadow-md'>
        <div>
          <img className='h-12' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="uber logo" />
        </div>
        <div onClick={handleLogout} className='cursor-pointer'>
          <FontAwesomeIcon className='text-2xl text-red-500 mb-1' icon={faArrowRightFromBracket} />
          <h3 className='text-lg font-bold text-red-500'>Logout</h3>
        </div>
      </div>

      {/* Map Section */}
      <div className='h-[60vh] w-full'>
        {mapLoaded && captainLocation ? (
          <MapContainer 
            center={[captainLocation.lat, captainLocation.lng]} 
            zoom={15} 
            ref={mapRef}
            style={{ height: "60vh", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
            />
            
            {/* Captain's current location */}
            <Marker position={[captainLocation.lat, captainLocation.lng]} icon={captainIcon}>
              <Popup>
                <div className='text-center'>
                  <strong>You are here</strong><br/>
                  Captain: {captain?.fullname?.firstname}<br/>
                  Status: {isAccepted ? 'On Trip' : 'Available'}
                </div>
              </Popup>
            </Marker>
            
            {/* Show pickup location if ride is accepted */}
            {acceptedRide && acceptedRide.pickupCoords && (
              <Marker position={[acceptedRide.pickupCoords.lat, acceptedRide.pickupCoords.lng]} icon={userLocationIcon}>
                <Popup>
                  <div className='text-center'>
                    <strong>Pickup Location</strong><br/>
                    {acceptedRide.pickup}
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Show route to pickup location */}
            {acceptedRide && acceptedRide.pickupCoords && captainLocation && (
              <RoutingMachine 
                start={{lat: captainLocation.lat, lng: captainLocation.lng}} 
                end={{lat: acceptedRide.pickupCoords.lat, lng: acceptedRide.pickupCoords.lng}} 
              />
            )}
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="text-center">
              <ThreeDot variant="bounce" color="black" size="large" text="Loading map..." textColor="black" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Panel */}
      <div className='flex-1 bg-white'>
        {/* No rides and not accepted */}
        {rides.length === 0 && !isAccepted && (
          <div className='h-full bg-white p-5'>
            <div className='flex justify-start gap-4 items-center mb-6'>
              <div className='bg-gray-300 w-12 h-12 rounded-full flex justify-center items-center'>
                <img className='h-10' src="https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png" alt="user" />
              </div>
              <div className='flex-1'>
                <h1 className='text-lg font-bold'>Welcome {captain?.fullname?.firstname}</h1>
                <p className='text-lg text-gray-500'>Captain</p>
              </div>
              <div>
                <h1 className='text-2xl font-bold'>₹0</h1>
                <p className='text-lg text-gray-500'>Earned</p>
              </div>
            </div>
            
            <div className='bg-[#f2f3f4] p-4 rounded-lg'>
              <h3 className='text-3xl font-bold mb-4'>Earnings</h3>
              <div className='flex gap-4 justify-between'>
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
          </div>
        )}

        {/* Ride requests */}
        {rides.length > 0 && !isAccepted && (
          <div className='h-full p-5'>
            <h2 className='text-2xl font-bold mb-4'>New Ride Request</h2>
            <div className='bg-gray-100 p-4 rounded-lg mb-4'>
              <h3 className='text-lg font-semibold'>From: {rides[0].pickup}</h3>
              <h3 className='text-lg font-semibold'>To: {rides[0].destination}</h3>
              <h3 className='text-lg font-semibold'>Fare: ₹{rides[0].fare}</h3>
              <h3 className='text-lg font-semibold'>Distance: {rides[0].distance || 'N/A'}</h3>
            </div>
            <div className='flex gap-4'>
              <button onClick={handleAcceptRide} className='bg-green-500 text-white px-6 py-3 rounded-lg font-bold flex-1'>
                Accept Ride
              </button>
              <button onClick={handleDeclineRide} className='bg-red-500 text-white px-6 py-3 rounded-lg font-bold flex-1'>
                Decline
              </button>
            </div>
          </div>
        )}

        {/* Accepted ride */}
        {isAccepted && acceptedRide && (
          <div className='h-full p-5'>
            <h2 className='text-2xl font-bold mb-4'>
              {rideStarted ? 'Ride in Progress' : 'Ride Accepted'}
            </h2>
            <div className='bg-gray-100 p-4 rounded-lg mb-4'>
              <h3 className='text-lg font-semibold'>Passenger: {acceptedRide.user.fullname.firstname}</h3>
              <h3 className='text-lg font-semibold'>From: {acceptedRide.pickup}</h3>
              <h3 className='text-lg font-semibold'>To: {acceptedRide.destination}</h3>
              <h3 className='text-lg font-semibold'>Fare: ₹{acceptedRide.fare}</h3>
            </div>
            
            {!rideStarted && (
              <div className='mb-4'>
                <label className='block text-lg font-semibold mb-2'>Enter OTP:</label>
                <input 
                  type="text" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)}
                  className='w-full p-3 border-2 border-gray-300 rounded-lg text-center text-2xl font-bold'
                  placeholder="0000"
                  maxLength="4"
                />
                <button onClick={handleVerifyOtp} className='w-full bg-blue-500 text-white py-3 rounded-lg font-bold mt-2'>
                  Start Ride
                </button>
              </div>
            )}
            
            {rideStarted && (
              <button onClick={handleEndRide} className='w-full bg-red-500 text-white py-3 rounded-lg font-bold'>
                End Ride
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CaptainHome