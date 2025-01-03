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

function App() {

  return (
    <>
        <Routes>
          <Route path='/' element={<Start />} />
          <Route path='/home' element={<UserProtectWrapper><Home /></UserProtectWrapper>} />
          <Route path='/captain-home' element={<UserProtectWrapper> <CaptainHome /> </UserProtectWrapper>} />
          <Route path='/signup' element={<UserSignUp />} />
          <Route path='/signin' element={<UserSignIn />} />
          <Route path='/captain-signup' element={<CaptainSignUp />} />
          <Route path='/captain-signin' element={<CaptainSignIn />} />
        </Routes>
    </>
  )
}

export default App
