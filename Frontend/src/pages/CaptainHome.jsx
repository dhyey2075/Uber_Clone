import React, { useEffect, useState } from 'react'

const CaptainHome = () => {
  const [captain, setCaptain] = useState(null)
  useEffect(() => {
    const captainString = localStorage.getItem('captain');
    const captain = JSON.parse(captainString);
    setCaptain(captain);
  },[])
  return (
    captain && <div>
      <h1>{captain.fullname.firstname}</h1>
      <h1>{captain.fullname.lastname}</h1>
      <p>{captain.email}</p>
      <h1>{captain.vehicle.color}</h1>
      <h1>{captain.vehicle.capacity}</h1>
      <h1>{captain.vehicle.vehicleType}</h1>
      <h1>{captain.vehicle.plate}</h1>

    </div>
  )
}

export default CaptainHome