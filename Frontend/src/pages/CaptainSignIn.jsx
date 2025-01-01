import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const CaptainSignIn = () => {
  const navigator = useNavigate();
    const [email, setEmail] = useState("");   
    const [password, setPassword] = useState("");
  
    const handleSubmit = async(e) => {
      e.preventDefault();
      setEmail("");
      setPassword("");
      const res = await fetch('http://localhost:4000/captains/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: e.target.email.value,
          password: e.target.password.value
        })
      });
      const data = await res.json();
      if(data.token){
        console.log("Here");
        navigator('/home');
      }
      else{
        alert("Invalid email or password");
      }
    }
  
    return (
      <div className='flex flex-col justify-between h-screen'>
        <div>
        <div className='flex gap-3 mb-10'>
          {/* <img src="https://w7.pngwing.com/pngs/567/356/png-transparent-uber-logo-decal-lyft-business-text-people-logo-thumbnail.png" alt="uber driver logo" className='w-36 pt-5 pl-10' /> */}
          <img src='https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png' alt='Uber Logo' className='w-36 pt-5 pl-10' />
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOBEuitMoAr2s45E8-bl2hJcXBp01s3gBbGR5OGWfiRA0Rq9BZAFFDPVYni4tWYgF9ACk&usqp=CAU" alt="uber driver logo" className='w-12 pt-5' />
        </div>
        <h3 className='text-center text-2xl font-bold mb-6 mt-4'>Sign in using email and password</h3>
        <form onSubmit={(e) => handleSubmit(e)} className='flex flex-col items-center'>
          <div className='flex flex-col items-center'>
            <div className='flex flex-col mb-10'>
              <h3 className='text-3xl mb-3'>Email</h3>
              <input type="email" id="email" name="email" required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-80 bg-[#e6e9ec] p-3 rounded-lg'
              />
            </div>
            <div className='flex flex-col mb-10'>
              <h3 className='text-3xl mb-3'>Password</h3>
              <input type="password" id="password" name="password" required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-80 bg-[#e6e9ec] p-3 rounded-lg'
              />
            </div>
            <button className='bg-black text-white w-1/2 pt-2 pb-2 text-xl rounded-md mb-10' type="submit">Sign In</button>
          </div>
        </form>
        <div className='text-center m-auto text-lg'>Don't have an account? <Link to={'/captain-signup'} className='text-blue-700'>Register here</Link></div>
        </div>
        <div className='mb-24 pt-3 pb-3 items-center m-auto bg-yellow-500 w-1/2 flex justify-center rounded-lg'>
          <Link to={'/signin'} className='text-lg font-bold' >Sign in as User</Link>
        </div>
      </div>
    )
  }

export default CaptainSignIn