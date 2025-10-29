import jwt from "jsonwebtoken";
const userAuth=async(req,res,next)=>{
    const {token}=req.cookies;
    if(!token){
        return res.json({success:false,message:"NOT AUTHORIZED LOGIN AGAIN"})
    }
    try{
       const tokenDecode= jwt.verify(token,process.env.JWT_SECRET)
       if(tokenDecode.id){
        req.userId=tokenDecode.id

       }else{
        return res.json({success:false,message:'NOT AUTHORISED LOGIN AGAIN'})
       }
       next();


    }
    catch(err){
        return res.json({success:false,message:err.message})
    }
}
export default userAuth;