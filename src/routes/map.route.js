import express  from "express";
import { authUser } from "../middleweres/auth.middleware.js";
import { getCoordinates } from "../controllers/map.controller.js";
import { query } from "express-validator";

const router = express.Router();

router.get("/get-coordinates" ,
    query("address").isString().isLength({min : 3})
    , authUser , getCoordinates )

export default router;