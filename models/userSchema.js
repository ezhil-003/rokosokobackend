//models/userSchema.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      minlength: 8, // for security
      select: false, // exclude from queries unless explicitly selected
    },
    auth_provider: {
      type: String,
      enum: ["custom", "google", "facebook"],
      required: true,
    },
    uid: {
      type: String,
      default: null, // Optional for custom auth
      validate: {
          validator: function (value) {
            if (this.auth_provider === "custom") {
              return value === null;
            } else {
              return typeof value === "string" && value.length > 0;
            }
          },
          message: function (props) {
            if (this.auth_provider === "custom") {
              return "UID must be null for custom auth.";
            } else {
              return "UID is required for social logins (Google/Facebook).";
            }
          },
        },
    },
    
    status: {
      type: String,
      default: "active",
      enum: ["active", "Deactivated", "Suspended", "inactive"],
    },
    mobile: {
      type: String,
      match: [/^\d{10,15}$/, "Mobile number is invalid"],
    },
    aboutMe: {
      type: String,
      maxlength: 500,
      default: "",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },
    state: {
      type: String,
      trim: true,
      default: "",
    },
    country: {
      type: String,
      trim: true,
      default: "",
    },
    profilePicUrl: {
      type: String,
      default: "",
    }
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  },
);

export const User = mongoose.model("users", userSchema);
