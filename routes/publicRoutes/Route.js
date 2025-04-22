// routes/publicRoutes/Route.js
import express from "express";
import publicAuthorize from "../../middleware/publicAuthorize.js"
import authRoutes from "./authRoutes.js"

const router = express.Router();

router.use(publicAuthorize);

router.use('/auth', authRoutes);


export default router;