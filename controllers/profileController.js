import { User } from "../models/userSchema.js";
import { Sessions } from "../models/sessionSchema.js";
import { editProfileSchema } from "../zodSchemas/profileSchema.js"; // Assuming the schema is defined here

export const editProfile = async (req, res) => {
  const id = req.user;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate incoming data
    const parseResult = editProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.flatten() });
    }

    // Update the user fields with validated data
    const updatedData = parseResult.data;
    const updatedUser = await User.findByIdAndUpdate(user._id, updatedData, {
      new: true,
    });

    // Return the updated user profile
    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//get getProfileById
export const getProfileById = async (req, res) => {
  try {
    const id = req.user;
    console.log(id)

    // Find the user by the userId stored in the session
    const user = await User.findById(id).select(
      "username aboutMe gender state country mobile email"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the public data of the user
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};