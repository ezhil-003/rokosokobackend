import multer from "multer";
import {utapi} from "../utils/uploadthing.js";
import {User} from "../models/userSchema.js";
import {Sessions} from "../models/sessionSchema.js";
import crypto from "crypto";
import path from "path";


export const uploadProfileImage = async (req, res) => {
    try {
      const id = req.user;
      // Log the full req.uploadedFile for debugging
      console.log("Controller received req.uploadedFile:", JSON.stringify(req.uploadedFile, null, 2));

      // Validate req.uploadedFile and key
      if (!req.uploadedFile) {
        console.error("req.uploadedFile is undefined or null");
        return res.status(500).json({error: "Uploadthing file data not available", details: "req.uploadedFile is missing"});
      }

      if (!req.uploadedFile.data.key) {
        console.error("req.uploadedFile.key is missing:", req.uploadedFile);
        return res.status(500).json({error: "Uploadthing file key not available", details: "Key missing in req.uploadedFile"});
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({error: "User not found"});
      }

      const updatedUser = await User.findByIdAndUpdate(
          { _id : id},
          { profilePicUrl : req.uploadedFile.data.key }, // Access the key from req.uploadedFile
          { new : true },
      );

      // Construct the URL for the frontend (optional)
      const fileUrl = `https://utfs.io/f/${req.uploadedFile.data.key}`; // Adjust prefix as needed

      return res.status(200).json({
        message: "Image uploaded",
        key: updatedUser.profilePicUrl,
        fileUrl, // Include URL for frontend convenience
      });

    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({error: "Internal server error"});
    }
};

export const removeProfileImage = async (req, res) => {
    try {
        const id = req.user;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({error: "User not found"});
        }
        console.log("User removed:", JSON.stringify(user));

        if (!user || !user.profilePicUrl)
            return res.status(404).json({error: "No profile image to remove"});

        // delete from UploadThing
        await utapi.deleteFiles(user.profilePicUrl); // user.image stores UploadThing file key

        // remove from DB
        user.profilePicUrl = "";
        await user.save();

        return res
            .status(200)
            .json({message: "Profile image removed successfully"});
    } catch (err) {
        console.error("Error removing profile image:", err);
        return res.status(500).json({error: "Internal server error"});
    }
};
