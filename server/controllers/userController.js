import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
  try {
    // ✅ Use userId from middleware
    const userId = req.userId;

    // ✅ Correct method to find by ID
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // ✅ Use correct field name (check your schema spelling)
    res.json({
      success: true,
      userData: {
        name: user.name,
        isAccountVerfied: user.isAccountVerfied, 
        email: user.email,
      },
    });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};
