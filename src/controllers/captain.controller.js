import { asyncHandler } from "../asyncHandler/asyncsHandler.js";
import {ApiResponse} from "../utils/apiResponse.js";
import {ApiError} from "../utils/ApiError.js";
import { validationResult } from "express-validator";
import { captainModel } from "../models/captain.model.js";
import { generateCaptainAccessAndRefreshToken } from "../utils/generateCaptainTokens.js";
import jwt from "jsonwebtoken";

const registerCaptain = asyncHandler(async (req , res) => {

    const error = validationResult(req);

    if (!error.isEmpty()) {
        return res.status(400).json({success : false , message : "please provide Valid data"})
    }

    try {

        const {fullName , email , password , vechile} = req.body;

        if (!fullName.firstName || !email || !password || !vechile.color || !vechile.capacity || !vechile.vechileNumber || !vechile.vechileType) {
            return res.status(400).json({success : false , message : "Please provide all requires fields."})
        }

        const existCaptain = await captainModel.findOne({email});

        if (existCaptain) {
            return res.status(500).json({success : false , message : "Capain already exist"})
        }

        const captain = await captainModel.create({
            fullName,
            email,
            password,
            vechile
        });

        if (!captain) {
            return res.status(500).json({success : false , message : "Server error while creating the user"})
        }

        const {accessToken , refreshToken} = await generateCaptainAccessAndRefreshToken(captain._id)

        if (!accessToken || !refreshToken) {
            return res.status(500).json({success : false , message : "Server error while generating the tokens"})
        }

        const captainData = await captainModel.findById(captain._id).select("-password -refreshToken");

        if (!captainData) {
            return res.status(404).json({success : false , message : "Captain not found"})
        }

        const options = {
            httpOnly : true,
            secure : false,
            sameSite : "Lax"
        }

        return res
            .cookie("accessToken" , accessToken , options)
            .cookie("refreshToken" , refreshToken , options)
            .status(201)
            .json(
                new ApiResponse(
                    200,
                    captainData,
                    "Captain Registered Successfully."
                )
            )
        
    } catch (error) {
        throw new ApiError(500 , error.message);
    }
});

const loginCaptain = asyncHandler(async (req , res) => {

    const error = validationResult(req);

    if (!error.isEmpty()) {
        return res.status(400).json({success : false , message : "please provide Valid data"})
    }

    try {

        const {email , password} = req.body;

        if (!email || !password) {
            return res.status(500).json({success : false , message : "please provide all requires fields.."})
            
        }

        const captain = await captainModel.findOne({email});

        if (!captain) {
           return res.status(500).json({success : false , message : "Email does't exist"})
        }

        const passwordMatch = await captain.isPasswordCorrect(password);

        if (!passwordMatch) {
            return res.status(400).json({success : false , message : "password is incorrect"})
        }

        const {accessToken , refreshToken} = await generateCaptainAccessAndRefreshToken(captain._id);

        if (!accessToken || !refreshToken) {
            return res.status(500).json({success : false , message : "server error in generating tokens"})
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
        return res.status(400).json({success : false , message : "unAuthorised Captain"})
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

const validateCaptainToken = asyncHandler(async (req , res) => {

    
    const token = req.cookies?.accessToken

    if (!token) {
        return res.status(400).json({success : false , message : "un Authorised captain"})
    }
    try {
        const decoded = jwt.verify(token , process.env.CAPTAIN_ACCESS_TOKEN_SECRET);

        if(!decoded){
            // return res.status(401).json(new ApiResponse(401, {}, "Not Authorized to access this route."));
            return res.status(400).json({success : false , message : "Incorrect tokens"})
        }

        const captain = await captainModel.find({_id : decoded._id}).select("-password -refreshToken");

        if(!captain){
            return res.status(404).json({success : false , message : "Captain not found with given token"})
        }

    } catch (error) {
        throw new ApiError(401 , error.message || "unAuthorised Captain")
    }

    return res
      .status(200)
      .json(
        new ApiError(
            200,
            {},
            "Valide User Accessed"
        )
      )
})

const captainProfile = asyncHandler(async (req , res) => {
    
    const captain = req?.captain;

    if (!captain) {
        return res.status(400).json({success : false , message : "unAuthorised captain"})
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
    captainProfile,
    validateCaptainToken
};