import express from 'express';
import privateRoute from "./privateRoutes/Route.js"
import publicRoute from "./publicRoutes/Route.js"


const router = express.Router();

//------------Public Routes-------------
router.use('/public', publicRoute);

//----------Private Routes------------
router.use('/private', privateRoute);


//*********************ADMIN ONLY ROUTES******************
//router.use('/users', userRoutes);

export default router;