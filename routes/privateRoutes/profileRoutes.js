// routes/profileRoutes.js
import express from "express"
import { getProfileById, editProfile } from "../../controllers/profileController.js";
import { uploadProfileImage, removeProfileImage } from "../../controllers/profileimageController.js";
import imageUploader from "../../middleware/imageUploadMiddleware.js";

//express instance
const router = express.Router();

router.post('/editProfile', editProfile);
router.get('/getProfile', getProfileById);
router.post('/uploadProfileImage',imageUploader, uploadProfileImage);
router.delete('/removeProfileImage', removeProfileImage);

export default router;