import { asyncHandler } from "../asyncHandler/asyncsHandler.js"
import { ApiError } from "./ApiError.js";
import { userModel } from "../models/user.model.js";

export const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await userModel.findOne({"_id" : userId})
    
        if (!user) {
            throw new ApiError(404, "Error Not Found");
        }
    
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
    
        if (!accessToken || !refreshToken) {
            throw new ApiError(500 , "Error While Generating Tokens.");
        }
        user.refreshToken = refreshToken;
    
        user.save({validateBeforeSave : false});
    
        return {
            accessToken,
            refreshToken
        }
    } catch (error) {
        throw new ApiError(500 , "Something went wrong while generating the Tokens.")
    }

}