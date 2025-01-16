import { useState } from 'react'
import './App.css'
import { Routes, Route} from 'react-router-dom'
import Start from './pages/Start'
import UserSignUp from './pages/UserSignUp'
import UserSignIn from './pages/UserSignIn'
import CaptainSignUp from './pages/CaptainSignUp'
import CaptainSignIn from './pages/CaptainSignIn'
import Home from './pages/Home'
import UserProtectWrapper from './pages/UserProtectWrapper'
import CaptainHome from './pages/CaptainHome'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Map from './pages/Map'

function App() {

  return (
    <>
      <ToastContainer />
        <Routes>
          <Route path='/' element={<Start />} />
          <Route path='/home' element={<UserProtectWrapper><Home /></UserProtectWrapper>} />
          <Route path='/captain-home' element={<UserProtectWrapper> <CaptainHome /> </UserProtectWrapper>} />
          <Route path='/signup' element={<UserSignUp />} />
          <Route path='/signin' element={<UserSignIn />} />
          <Route path='/captain-signup' element={<CaptainSignUp />} />
          <Route path='/captain-signin' element={<CaptainSignIn />} />
          <Route path='/map' element={<Map/>}  />
        </Routes>
    </>
  )
}

export default App
