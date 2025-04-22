// controllers/accountControllers.js
import bcrypt from "bcrypt";
import {User} from "../models/userSchema.js";
import {changePasswordSchema, setPasswordSchema} from "../zodSchemas/passwordSchema.js";

export const changePassword = async (req, res) => {
    try {
        const parseResult = changePasswordSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                message: "Invalid input.",
                errors: parseResult.error.flatten(),
            });
        }
        const id = req.user;

        const user = await User.findById(id).select("+password");
        if (!user) {
            return res.status(404).json({error: "User not found"});
        }


        const {currentPassword, newPassword} = parseResult.data;

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res
                .status(400)
                .json({message: "Current password is incorrect."});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({message: "Password changed successfully."});
    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({error: "Internal server error."});
    }
};

export const setPassword = async (req, res) => {
    try {
        const parseResult = setPasswordSchema.safeParse(req.body);

        if (!parseResult.success) {
            return res
                .status(400)
                .json({
                    message: "Invalid input.",
                    errors: parseResult.error.flatten(),
                });
        }

        const id = req.user;
        const user = await User.findById(id).select("+password");
        if (!user) {
            return res.status(404).json({error: "User not found"});
        }

        if (user.password) {
            return res.status(400).json({message: "Password is already present, try change password."});
        }


        const {password} = parseResult.data;

        const saltRounds = 10; // Or another number for the complexity of the salt
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({message: "Password set successfully."});

    } catch (error) {
        console.error("Error setting password:", error);
        return res.status(500).json({error: "Internal server error."});
    }
};
