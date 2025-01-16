import React, { useEffect, useState, useTransition } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useContext } from 'react'
import { UserContext } from '../contexts/UserContext'
import { toast, Bounce } from 'react-toastify';
import { ThreeDot } from 'react-loading-indicators'

const UserSignIn = () => {
  const { user, updateUser } = useContext(UserContext)
  const navigator = useNavigate();
  const [email, setEmail] = useState("");   
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState();


  const handleSubmit = async(e) => {
    setIsSubmitting(true);
    e.preventDefault();
    setEmail("");
    setPassword("");
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/users/login`, {
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
        localStorage.setItem('token', data.token);
      updateUser(data.user.fullname.firstname, data.user.fullname.lastname, data.user.email);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Logged in successfully!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
          })
      navigator('/home')
    }
    else{
      toast.error('Invalid email or password!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
        });
        
    }
    setIsSubmitting(false);
  }

  return (
    <div className='flex flex-col justify-between h-screen bg-cover bg-center' style={{ backgroundImage: "url('https://images.unsplash.com/photo-1593950315186-76a92975b60c?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}>
      <div>
      <div className='pb-10'>
        <img src='https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png' alt='Uber Logo' className='w-32 pt-5 pl-10' />
      </div>
      <h3 className='text-center text-2xl font-bold mb-6 mt-4 text-white'>Sign in using email and password</h3>
      <form onSubmit={(e) => handleSubmit(e)} className='flex flex-col items-center'>
        <div className='flex flex-col items-center'>
          <div className='flex flex-col mb-10'>
            <h3 className='text-3xl mb-3 text-white'>Email</h3>
            <input type="email" id="email" name="email" required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-80 bg-[#e6e9ec] p-3 rounded-lg'
              placeholder='john@doe.com'
            />
          </div>
          <div className='flex flex-col mb-10'>
            <h3 className='text-3xl mb-3 text-white'>Password</h3>
            <input type="password" id="password" name="password" required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-80 bg-[#e6e9ec] p-3 rounded-lg'
              placeholder='********'
            />
          </div>
          <button className='bg-black text-white w-1/2 pt-2 pb-2 text-xl rounded-md mb-10' disabled={isSubmitting} type="submit">{isSubmitting ? <ThreeDot color="#ffffff" size="small" text="" textColor="" /> : "Sign in"}</button>
        </div>
      </form>
      <div className='text-center m-auto text-lg text-white'>Don't have an account? <Link to={'/signup'} className='text-blue-700 hover:underline'>Register here</Link></div>
      </div>
      <div className='mb-24 pt-3 pb-3 items-center m-auto bg-green-500 w-1/2 flex justify-center rounded-lg'>
        <Link to={'/captain-signin'} className='text-xl text-white font-bold' >Sign in as Captain</Link>
      </div>
    </div>
  )
}

export default UserSignIn