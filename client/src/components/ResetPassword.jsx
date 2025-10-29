import React, { useState, useRef, useContext } from "react";
import { assets } from "../assets/assets/assets";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContent } from "../context/AppContent";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
  const [otp, setOtp] = useState("");
  const inputRefs = useRef([]);
  const { backendURL } = useContext(AppContent);
  axios.defaults.withCredentials = true;

  // Input focus handling
  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
    const otpValue = inputRefs.current.map((el) => el.value).join("");
    setOtp(otpValue);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
    const otpValue = pasteArray.join("").slice(0, 6);
    setOtp(otpValue);
  };


  // STEP 1 → Send OTP
  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendURL}/api/auth/send-reset-otp`, { email });
      data.success ? toast.success(data.message) : toast.error(data.message);
      data.success && setIsEmailSent(true);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };



 
 
   const onsubmitotp=async(e)=>{
e.preventDefault();
const otpArray=inputRefs.current.map(e=>e.value)
setOtp(otpArray.join(''))
setIsOtpSubmitted(true)
      }
        const onSubmitNewPassword=async(e)=>{
    e.preventDefault();
    try{
      const {data}=await axios.post(backendURL+'/api/auth/reset-password',{email,otp,newPassword})
      data.success ? toast.success(data.message):toast.error(data.message);
      data.success && navigate('/login')
    }catch(error){
      toast.error(error.message)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      {/* Logo */}
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="Logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      {/* STEP 1 — Email Input */}
      {!isEmailSent && (
        <form onSubmit={onSubmitEmail} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Reset Password
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter your registered email address
          </p>

          <div className="flex items-center gap-3 w-full px-5 py-2.5 mb-6 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="mail icon" className="w-4 h-4" />
            <input
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent outline-none text-white w-full"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-medium hover:opacity-90"
          >
            Send OTP
          </button>
        </form>
      )}
     

      {/* STEP 2 — OTP Input */}
      {!isOtpSubmitted && isEmailSent && (
        <form onSubmit={onsubmitotp} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            Verify OTP
          </h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter the 6-digit code sent to your email
          </p>

          <div className="flex justify-between mb-8" onPaste={handlePaste}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  required
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md outline-none"
                />
              ))}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-medium hover:opacity-90"
          >
            Submit OTP
          </button>
        </form>
      )}

      {/* STEP 3 — New Password */}
      {isOtpSubmitted && (
        <form onSubmit={onSubmitNewPassword} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold text-center mb-4">
            New Password
          </h1>
          <p className="text-center mb-6 text-indigo-300">Enter your new password</p>

          <div className="flex items-center gap-3 w-full px-5 py-2.5 mb-6 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="lock icon" className="w-4 h-4" />
            <input
              type="password"
              placeholder="Enter new password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-transparent outline-none text-white w-full"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-medium hover:opacity-90"
          >
            Update Password
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
