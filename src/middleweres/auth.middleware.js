import jwt from "jsonwebtoken";
import { userModel } from "../models/user.model.js";
import { asyncHandler } from "../asyncHandler/asyncsHandler.js";
import {ApiError} from "../utils/ApiError.js";

export const authUser = asyncHandler(async (req , res , next) => {

    const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return next(new ApiError(401 , "Not Authorized to access this route."));
    }

    try {
        const decoded = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET);

        if (!decoded) {
            return next(new ApiError(401 , "Not Authorized to access this route."));
        }

        const user = await userModel.findById(decoded?._id);

        if (!user) {
            return next(new ApiError(404 , "No user found with this Id."));
        }

        req.user = user;

        next();
    } catch (error) {
        return next(new ApiError(401 , "Not Authorized to access this route."));
    }
});