// routes/publicRoutes/authRoutes.js
import { loginUser } from "../../controllers/auth/login.js";
import { signup } from "../../controllers/auth/signup.js";
import express from "express"

//express instance
const router = express.Router();


router.post('/login', loginUser);
router.post('/signup', signup);


export default router;
