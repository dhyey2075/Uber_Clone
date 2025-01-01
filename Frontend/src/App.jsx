import { useState } from 'react'
import './App.css'
import { Routes, Route} from 'react-router-dom'
import Start from './pages/Start'
import UserSignUp from './pages/UserSignUp'
import UserSignIn from './pages/UserSignIn'
import CaptainSignUp from './pages/CaptainSignUp'
import CaptainSignIn from './pages/CaptainSignIn'
import Home from './pages/Home'

function App() {

  return (
    <>
        <Routes>
          <Route path='/' element={<Start />} />
          <Route path='/home' element={<Home />} />
          <Route path='/signup' element={<UserSignUp />} />
          <Route path='/signin' element={<UserSignIn />} />
          <Route path='/captain-signup' element={<CaptainSignUp />} />
          <Route path='/captain-signin' element={<CaptainSignIn />} />
        </Routes>
    </>
  )
}

export default App
