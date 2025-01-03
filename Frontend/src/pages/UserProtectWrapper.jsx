import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

const UserProtectWrapper = ({children}) => {
    const navigator = useNavigate();
    const token = localStorage.getItem('token');
    
    if(!token){
        useEffect(() => {
            navigator('/signin');
        }, []);
    }
  return (
    <>
        {children}
    </>
  )
}

export default UserProtectWrapper