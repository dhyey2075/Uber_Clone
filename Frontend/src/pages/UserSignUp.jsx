import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
const UserSignUp = () => {
    const navigator = useNavigate();
    const [email, setEmail] = useState("");   
    const [password, setPassword] = useState("");
    const [firstname, setFirstName] = useState("");
    const [lastname, setLastName] = useState("");
  
    const handleSubmit = async(e) => {
      e.preventDefault();
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      console.log(e.target.firstName.value);
      
      const res = await fetch('http://localhost:4000/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullname:{
            firstname: e.target.firstName.value,
            lastname: e.target.lastName.value
          },
          email: e.target.email.value,
          password: e.target.password.value
        })
      });
      const data = await res.json();
      console.log(data);
      if(data.token){
        console.log("Here");
        navigator('/home');
      }
      else{
        alert(data.errors[0].msg);
      }
    }

  return (
    <div className='flex flex-col justify-between h-screen'>
      <div>
        <div className='pb-10'>
          <img src='https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png' alt='Uber Logo' className='w-32 pt-5 pl-10' />
        </div>
        <h3 className='text-center text-2xl font-bold mb-6 mt-4'>Sign up using email and password</h3>
        <form onSubmit={(e) => handleSubmit(e)} className='flex flex-col items-center'>
          <div className='flex justify-between w-full px-10 mb-10'>
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
            <div className='flex flex-col mb-10'>
              <h3 className='text-xl mb-3'>Email</h3>
              <input type="email" id="email" name="email" required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-80 bg-[#e6e9ec] p-3 rounded-lg'
              />
            </div>
            <div className='flex flex-col mb-10'>
              <h3 className='text-xl mb-3'>New Password</h3>
              <input type="password" id="password" name="password" required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-80 bg-[#e6e9ec] p-3 rounded-lg'
              />
            </div>
            <button className='bg-black text-white w-1/2 pt-2 pb-2 text-xl rounded-md mb-10' type="submit">Sign Up</button>
          </div>
        </form>
        <div className='text-center m-auto text-lg'>Already have an account? <Link to={'/signin'} className='text-blue-700'>Sign in here</Link></div>
      </div>
      <div className='mb-24 pt-3 pb-3 items-center m-auto bg-green-500 w-1/2 flex justify-center rounded-lg'>
        <Link to={'/captain-signup'} className='text-lg text-white' >Sign up as Captain</Link>
      </div>
    </div>
  )
}

export default UserSignUp