import express from "express";
import privateAuthorize from "../../middleware/privateAuthorize.js";
import profileRoutes from "./profileRoutes.js"
import accountRoutes from "./accountRoutes.js"
import { logout } from "../../controllers/auth/logout.js"

const router = express.Router();

router.use(privateAuthorize)

router.use('/profile', profileRoutes);
router.use('/account', accountRoutes);


// ----------Logout--------------
router.post('/auth/logout', logout);

export default router;