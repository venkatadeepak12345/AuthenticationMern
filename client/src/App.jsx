import React from 'react'
import './index.css';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import EmailVerify from './pages/EmailVerify';
import ResetPassword from './components/ResetPassword';
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <div>
      <ToastContainer/>
     <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/emailverify' element={<EmailVerify/>}/>
      <Route path='/resetpassword' element={<ResetPassword/>}/>
     </Routes>
    </div>
  )
}

export default App