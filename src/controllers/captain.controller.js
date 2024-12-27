import { asyncHandler } from "../asyncHandler/asyncsHandler.js";
import {ApiResponse} from "../utils/apiResponse.js";
import {ApiError} from "../utils/ApiError.js";
import { generateAccessAndRefreshToken } from "../utils/generateTokens.js";
import { validationResult } from "express-validator";
import { captainModel } from "../models/captain.model.js";
import { generateCaptainAccessAndRefreshToken } from "../utils/generateCaptainTokens.js";

const registerCaptain = asyncHandler(async (req , res) => {

    const error = validationResult(req);

    if (!error.isEmpty()) {
        throw new ApiError(400 , "Please provide valid data.");
    }

    try {

        const {fullName , email , password , vechile} = req.body;

        if (!fullName.firstName || !email || !password || !vechile.color || !vechile.capacity || !vechile.vechileNumber || !vechile.vechileType) {
            throw new ApiError(400 , "Please provide all the required fields.");
        }

        const existCaptain = await captainModel.findOne({email});

        if (existCaptain) {
            throw new ApiError(400 , "Captain Already Exist , with this email.");
        }

        const captain = await captainModel.create({
            fullName,
            email,
            password,
            vechile
        });

        if (!captain) {
            throw new ApiError(500 , "Something went wrong while creating the user.");
        }

        const captainData = await captainModel.findById(captain._id).select("-password");

        if (!captainData) {
            throw new ApiError(400 , "User Data not Found.");
        }

        return res
            .status(201)
            .json(
                new ApiResponse(
                    200,
                    captainData,
                    "Captain Registered Successfully."
                )
            )
        
    } catch (error) {
        console.log("hloo--------- ",error.message);
        throw new ApiError(500 , "User Registration Failed.");
    }
});

const loginCaptain = asyncHandler(async (req , res) => {

    const error = validationResult(req);

    if (!error.isEmpty()) {
        throw new ApiError(400 , "Please provide valid data.");
    }

    try {

        const {email , password} = req.body;

        if (!email || !password) {
            throw new ApiError(400 , "Please provide all the required fields.");
            
        }

        const captain = await captainModel.findOne({email});

        if (!captain) {
            throw new ApiError(400 , "Captain not found with this email.");
        }

        const passwordMatch = await captain.isPasswordCorrect(password);

        if (!passwordMatch) {
            throw new ApiError(400 , "Password is Incorrect.");
        }

        const {accessToken , refreshToken} = await generateCaptainAccessAndRefreshToken(captain._id);

        if (!accessToken || !refreshToken) {
            throw new ApiError(500 , "Something went wrong while generating the tokens.");
        }

        const options = {
            httpOnly : true,
            secure : process.env.NODE_ENV === "development"
        };

        const captainData = await captainModel.findById(captain._id).select("-password -refreshToken");

        if (!captainData) {
            throw new ApiError(500 , "Captain Data not found in the Database.");
        }

        return res
            .status(200)
            .cookie("accessToken" , accessToken , options)
            .cookie("refreshToken" , refreshToken , options)
            .json(
                new ApiResponse(
                    200,
                    {
                        captainData,
                        accessToken,
                        refreshToken
                    },
                    "Captain Login Successfully."
                )
            )
        
    } catch (error) {
        throw new ApiError(500 , error.message || "User Login Failed.");
        
    }
    
});

export {
    registerCaptain,
    loginCaptain
};