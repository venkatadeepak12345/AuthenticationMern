import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE,PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js";

export const register=async(req,res)=>{
    const {name,email,password}=req.body;
    if(!name || !email || !password){
        return res.json({success:false,message:"Missing Details"})
    }
    try{
        const existingUser=await userModel.findOne({email})
        if(existingUser){
            return res.json({success:false,message:"User Already Exists"})
        }
        const hashedPassword=await bcrypt.hash(password,10)
        const user=new userModel({name,email,password:hashedPassword})
        await user.save();
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
        res.cookie("token",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:process.env.NODE_ENV==="production"?"none":"strict",
            maxAge:7*24*60*60*1000
        })
  const mailOptions={
    from:process.env.SENDER_EMAIL,
    to:email,
    subject:'Welcome to greatStack🎉',
    text:`Welcome to greatstack website your account has been created with emailId :${email}`

  }

await transporter.sendMail(mailOptions)
return res.json({success:true})

    }catch(err){
        res.json({
            success:false, message:err.message
        })
    }
}
export const login=async(req,res)=>{
    const {email,password}=req.body;
    if(!email || !password){
        return res.json({success:false,message:"Email and Password are required"})
    }
    try{
        const user=await userModel.findOne({email})
        if(!user){
            return res.json({success:false,message:'Invalid email'})
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
             return res.json({success:false,message:'Invalid Password'}) 
        }
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
        res.cookie("token",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:process.env.NODE_ENV==="production"?"none":"strict",
            maxAge:7*24*60*60*1000
        })
        return res.json({success:true})

    }catch(err){
        return res.json({success:false,message:err.message})
    }
}
export const logout=async(req,res)=>{
    try{

        res.clearCookie('token',{
             httpOnly:true,
            secure:process.env.NODE_ENV==="production",
            sameSite:process.env.NODE_ENV==="production"?"none":"strict",
        

        })
        return res.json({success:true,message:"Logged Out"})
    }catch(err){
        return res.json({success:false,message:err.message})
    }
}
//Send Verfication OTP to the Users Email
export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.userId; // ✅ get from middleware
    if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.isAccountVerfied) {
      return res.json({ success: false, message: "Account already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
user.verifyOtpExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
await user.markModified("verifyOtp");
await user.markModified("verifyOtpExpiresAt");
await user.save();


    console.log(`Generated OTP for ${user.email}: ${otp}`);

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP 🎉",
      // text: `Your OTP is ${otp}. Verify your account using this OTP.`,
      html:EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}",user.email)
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`OTP email sent to ${user.email}`);
    } catch (emailErr) {
      console.error("Error sending OTP email:", emailErr);
      return res.status(500).json({ success: false, message: "Failed to send OTP email", error: emailErr.message });
    }

    return res.json({ success: true, message: "Verification OTP sent on email" });

  } catch (err) {
    console.error("sendVerifyOtp error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
export const VerifyEmail = async (req, res) => {
  try {
    const userId = req.userId; // ✅ get from middleware
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, message: "OTP is required" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    user.isAccountVerfied = true;
    user.verifyOtp = "";
    user.verifyOtpExpiresAt = 0;
    await user.save();

    return res.json({ success: true, message: "Email verified successfully" });

  } catch (err) {
    console.error("VerifyEmail error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
//Check if user is authenticated
export const isAuthenticated=async(req,res)=>{
    try{
        return res.json({success:true})
    }catch(err){
        return res.json({success:false,message:err.message})
    }

}
// Send Password Reset OTP

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ Generate a 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // ✅ Save OTP and expiration time
    user.resetOtp = otp;
    user.resetOtpExpiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // ✅ Configure email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
    //   text: `Your OTP for resetting your password is: ${otp}\n\nThis OTP will expire in 15 minutes.`,
    html:PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
    };

    // ✅ Send the email
    await transporter.sendMail(mailOptions);

    console.log(`Reset OTP sent to ${user.email}: ${otp}`); // Log for debugging

    return res.json({ success: true, message: "OTP sent to email successfully" });
  } catch (err) {
    console.error("Error in sendResetOtp:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
//Reset User Password

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Basic validation
  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Email, OTP, and new password are required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Validate OTP
    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Check expiration
    if (user.resetOtpExpiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpiresAt = 0;
    await user.save();

    return res.json({ success: true, message: "Password has been reset successfully" });

  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};