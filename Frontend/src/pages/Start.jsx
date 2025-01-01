import React from 'react';
import { Link } from 'react-router-dom';

const Start = () => {
return (
    <div className='bg-cover bg-center h-screen flex flex-col justify-between' style={{ backgroundImage: "url('https://images.pexels.com/photos/2958070/pexels-photo-2958070.jpeg?auto=compress&cs=tinysrgb&w=600')" }}>
            <div>
                    <img src='https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png' alt='Uber Logo' className='w-32 pt-10 pl-10 invert' />
            </div>
            <div className='items-center text-center pb-20 mb-12 ml-5 mr-5 rounded-lg pt-10 bg-[#e6e9ec]'>
                    <h1 className=' text-4xl font-bold'>Welcome to Uber</h1>
                    <p className=' mt-4'>Get moving with Uber</p>
                    <Link to={'/signin'} ><button className='mt-8 bg-black text-white py-2 px-4 rounded w-56 text-xl'>Get Started</button></Link>
            </div>
    </div>
)
}

export default Start