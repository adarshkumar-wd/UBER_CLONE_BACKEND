import { captainModel } from "../models/captain.model.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

export const authCaptain = async (req , _ , next) => {

    const incommingToken = req.header.Authorization?.split(" ")[1] || req.cookies.accessToken ;

    if (!incommingToken) {
        throw new ApiError(404 , "Token not found.");
    }

    const decodedToken = jwt.verify(incommingToken, process.env.CAPTAIN_ACCESS_TOKEN_SECRET);

    if (!decodedToken) {
        throw new ApiError(401 , "Please Enter Valid Token.");
    }

    const captain = await captainModel.findById(decodedToken._id);

    if (!captain) {
        throw new ApiError(401 , "Incorrect Token.");
    }

    req.captain = captain;

    next();

};