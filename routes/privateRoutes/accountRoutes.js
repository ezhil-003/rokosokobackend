// routes/accountRoutes.js
import express from "express"

import { changePassword, setPassword } from "../../controllers/accountControllers.js";


//express instance
const router = express.Router();

//auth middleware

router.post('/changePassword', changePassword);
router.post('/setPassword', setPassword);


export default router;