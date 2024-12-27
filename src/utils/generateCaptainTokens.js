import { captainModel } from "../models/captain.model.js"; 
import { ApiError } from "./ApiError.js";

export const generateCaptainAccessAndRefreshToken = async (captainId) => {

    const captain = await captainModel.findById(captainId);

    if (!captain) {
        throw new ApiError(404 , "Captain not found.");
    }

    const accessToken =  await captain.generateAccessToken();
    const refreshToken = await captain.generateRefreshToken();

    if (!accessToken || !refreshToken) {
        throw new ApiError(500 , "Something went wrong while generating tokens.");
        
    }

    captain.refreshToken = refreshToken;

    captain.save({validateBeforeSave : false});

    return {
        accessToken,
        refreshToken
    }
};