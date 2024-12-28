import { asyncHandler } from "../asyncHandler/asyncsHandler.js";
import {ApiResponse} from "../utils/apiResponse.js";
import {ApiError} from "../utils/ApiError.js";
import { generateAccessAndRefreshToken } from "../utils/generateTokens.js";
import { validationResult } from "express-validator";
import { captainModel } from "../models/captain.model.js";
import { generateCaptainAccessAndRefreshToken } from "../utils/generateCaptainTokens.js";
import jwt from "jsonwebtoken";

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

const refreshAccessToken = asyncHandler(async (req , res) => {

    const token = req.cookies.refreshToken || req.header.Authorization.split(" ")[1];

    if (!token) {
        throw new ApiError(404 , "Token not found.");
    }

    try {

        const decodedToken = jwt.verify(token, process.env.CAPTAIN_REFRESH_TOKEN_SECRET);

        if (!decodedToken) {
            throw new ApiError(401 , "Please Enter Valid Token.");
        }

        const captain = await captainModel.findById(decodedToken._id);

        if (!captain) {
            throw new ApiError(401 , "Incorrect Token.");
        }

        if (token !== captain.refreshToken) {
            throw new ApiError(401 , "Invalid Token.");
        }

        const {accessToken , refreshToken : newRefreshToken} = await generateCaptainAccessAndRefreshToken(captain._id);

        if (!accessToken || !newRefreshToken) {
            throw new ApiError(500 , "Something went wrong while generating the tokens.");
        }

        captain.refreshToken = newRefreshToken;

        return res
           .status(200)
           .cookie("accessToken" , accessToken , options)
           .cookie("refreshToken" , newRefreshToken , options)
           .json(
            new ApiResponse(
                200,
                {
                    captain,
                    accessToken,
                    refreshToken : newRefreshToken
                },
                "Token Refreshed Successfully."
            )
           )
        
    } catch (error) {
        throw new ApiError(500 , error.message || "Token Refresh Failed.");
    }

});

const logoutCaptain = asyncHandler(async (req , res) => {

    const captain = req?.captain ;

    if (!captain) {
        throw new ApiError(401 , "unAuthorized captain.");
    }

    captain.refreshToken = undefined;

    const options = {
        httpOnly : true,
        secure : process.env.NODE_ENV === "development"
    }

    return res
     .status(200)
     .clearCookie("accessToken" , options)
     .clearCookie("refreshToken" , options)
     .json(
        new ApiResponse(
            200,
            {},
            "Captain Logged Out Successfully."
        )
     )

});

const captainProfile = asyncHandler(async (req , res) => {
    
    const captain = req?.captain;

    if (!captain) {
        throw new ApiError(401 , "unAuthorized Captain.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                captain,
                "Captain Profile."
            )
        )
});

export {
    registerCaptain,
    loginCaptain,
    refreshAccessToken,
    logoutCaptain,
    captainProfile
};