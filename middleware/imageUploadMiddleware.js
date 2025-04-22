// middleware/uploadImageMiddleware.js
import multer from "multer";
import crypto from "crypto";
import path from "path";
import { utapi } from "../utils/uploadthing.js";

// Configure Multer for memory storage (or disk storage if preferred)
const storage = multer.memoryStorage();

// Create the Multer upload instance, handling a single file named 'image'
const uploadImage = multer({
  storage,
  fileFilter: (req, file, cb) => {
      console.log("File received:", file); // Debug log
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed."));
      }
    },
        limits: { fileSize: 5 * 1024 * 1024 }, // Optional: 5MB limit
}).single("image");

// Middleware function to handle the image upload and add a random filename to the request
const imageUploader = (req, res, next) => {
  uploadImage(req, res, async function (err) {
    if (err) {
      return res
        .status(400)
        .json({ error: "Image upload failed", details: err });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    try {
      const fileExt = path.extname(req.file.originalname);
      const randomFileName = crypto.randomUUID() + fileExt;

      // Create a File object for UploadThing
      const file = new File([req.file.buffer], randomFileName, {
        type: req.file.mimetype,
      });


      const uploadedFile = await utapi.uploadFiles(file);
      console.log("UploadThing response:", JSON.stringify(uploadedFile, null, 2));

      if (!uploadedFile || uploadedFile.error) {
        console.error("UploadThing error:", uploadedFile?.error);
        return res
          .status(500)
          .json({
            error: "UploadThing upload failed",
            details: uploadedFile?.error,
          });
      }

      // Attach the uploadedFile and randomFileName to the req object for the next handler
      req.uploadedFile = uploadedFile; // Assuming uploadFiles returns an array
      req.randomFileName = randomFileName;

      next(); // Proceed to the actual controller to update the database
    } catch (error) {
      console.error("Middleware error:", error);
      return res
        .status(500)
        .json({ error: "Internal server error in upload middleware" });
    }
  });
};

export default imageUploader;
