import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const CaptainSignUp = () => {
  const navigator = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [color, setColor] = useState("");
  const [plate, setPlate] = useState("");
  const [capacity, setCapacity] = useState("");
  const [type, setType] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(e.target.type.value === ""){
      alert("Please select a vehicle type");
      return;
    }
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setColor(""); 
    setPlate("");
    setCapacity("");
    setType("");

    console.log(e.target.type.value);
    


    const res = await fetch('http://localhost:4000/captains/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullname: {
          firstname: e.target.firstName.value,
          lastname: e.target.lastName.value
        },
        email: e.target.email.value,
        password: e.target.password.value,
        vehicle: {
          color: e.target.color.value,
          plate: e.target.plate.value,
          capacity: e.target.capacity.value,
          vehicleType: e.target.type.value
        }
      })
    });
    const data = await res.json();
    console.log(data);
    if (data.token) {
      navigator('/home');
    }
    else {
      alert(data.errors[0].msg);
    }
  }

  return (
    <div className='flex flex-col justify-between h-screen'>
      <div>
        <div className='flex gap-3 mb-5'>
          {/* <img src="https://w7.pngwing.com/pngs/567/356/png-transparent-uber-logo-decal-lyft-business-text-people-logo-thumbnail.png" alt="uber driver logo" className='w-36 pt-5 pl-10' /> */}
          <img src='https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png' alt='Uber Logo' className='w-36 pt-5 pl-10' />
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOBEuitMoAr2s45E8-bl2hJcXBp01s3gBbGR5OGWfiRA0Rq9BZAFFDPVYni4tWYgF9ACk&usqp=CAU" alt="uber driver logo" className='w-12 pt-5' />
        </div>
        <h3 className='ml-10 text-xl font-bold mb-3' >Our Captain's Details</h3>
        <form onSubmit={(e) => handleSubmit(e)} className='flex flex-col items-center'>
          <div className='flex justify-between w-full px-10 mb-5'>
            <div>
              <h3 className='text-xl mb-3'>First Name</h3>
              <input type="text" id="firstName" name="firstName" required
                value={firstname}
                onChange={(e) => setFirstName(e.target.value)}
                className='w-36 bg-[#e6e9ec] p-3 rounded-lg' />
            </div>
            <div>
              <h3 className='text-xl mb-3'>Last Name</h3>
              <input type="text" id="lastName" name="lastName" required
                value={lastname}
                onChange={(e) => setLastName(e.target.value)}
                className='w-36 bg-[#e6e9ec] p-3 rounded-lg' />
            </div>
          </div>
          <div className='flex flex-col items-center'>
            <div className='flex flex-col mb-5'>
              <h3 className='text-xl mb-3'>Email</h3>
              <input type="email" id="email" name="email" required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-80 bg-[#e6e9ec] p-3 rounded-lg'
              />
            </div>
            <div className='flex flex-col mb-5'>
              <h3 className='text-xl mb-3'>New Password</h3>
              <input type="password" id="password" name="password" required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-80 bg-[#e6e9ec] p-3 rounded-lg'
              />
            </div>
          </div>

          <h3 className='text-xl font-bold mb-3' >Vehicle Information</h3>

          <div className=''>
            <div className='flex justify-between px-10 mb-5'>
              <div className='mr-20'>
                <h3 className="text-xl mb-2 font-bold">Color</h3>
                <input type="text" id="color" name="color" required
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className='w-40 bg-[#e6e9ec] p-3 rounded-lg'
                />
              </div>
              <div>
                <h3 className="text-xl mb-2 font-bold">Plate</h3>
                <input type="text" id="plate" name="plate" required
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  className='w-40 bg-[#e6e9ec] p-3 rounded-lg'
                />
              </div>
            </div>
            <div className='flex justify-between px-10 mb-5'>
              <div className='mr-20'>
                <h3 className="text-xl mb-2 font-bold">Capacity</h3>
                <input type="number" id="capacity" name="capacity" required
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className='w-40 bg-[#e6e9ec] p-3 rounded-lg'
                />
              </div>
              <div>
                <h3 className="text-xl mb-2 font-bold">Type</h3>
                {/* <input type="text" id="type" name="type" required
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className='w-40 bg-[#e6e9ec] p-3 rounded-lg'
                /> */}
                <select name="type" id="type">
                  required
                  <option value="">Select</option>
                  <option value="car">Car</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>
          </div>
          <button className='bg-black text-white w-1/2 pt-2 pb-2 text-xl rounded-md mb-5' type="submit">Sign Up</button>
        </form>
        <div className='text-center m-auto text-lg mb-5'>Already have an account? <Link to={'/captain-signin'} className='text-blue-700'>Sign in here</Link></div>
      </div>
      <div className='mb-24 pt-3 pb-3 items-center m-auto bg-yellow-500 w-1/2 flex justify-center rounded-lg'>
        <Link to={'/signup'} className='text-lg font-bold' >Sign up as User</Link>
      </div>
    </div>
  )
}

export default CaptainSignUp