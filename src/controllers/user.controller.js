import { userModel } from "../models/user.model.js";
import { asyncHandler } from "../asyncHandler/asyncsHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {ApiError} from "../utils/ApiError.js"
import { generateAccessAndRefreshToken } from "../utils/generateTokens.js";
import jwt from "jsonwebtoken"
import { json } from "express";

const registerUser = asyncHandler(async (req , res) => {

    const {firstName , lastName , email , password} = req.body;

    if (!firstName || !email || !password) {
        return res.status(400).json({success : false , message : "All fields are required except lastname"})
    }

    const emailCheck = await userModel.findOne({email});

    if (emailCheck) {
        return res.status(400).json({success : false , message : "Email Already Exist"})
    } 

    const user = await userModel.create({
        firstName,
        lastName,
        email,
        password
    });

    if (!user) {
        return res.status(500).json({success : false , message : "Server error while creating the user"})
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)

    const userData = await userModel.findOne({"_id" : user._id}).select("-password -refreshToken");

    if (!userData) {
        return res.status(404).json({success : false , message : "User not found in database"})
    }

    const options = {
        httpOnly : true,
        secure : false,
        sameSite: "Lax"
    }

    return res
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .status(201)
    .json(
        new ApiResponse(
            201,
            {userData},
            "User Created Sucessfully.."
        )
    )


})

const loginUser = asyncHandler(async (req , res) => {

    const {email , password} = req.body

    if (!email || !password) {
        return res.status(400).json({success : false , message : "All fields are required"})
    }

    const user = await userModel.findOne({email});

    if (!user) {
        return res.status(404).json({success : false , message : "Email does't exised"})
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        return res.status(400).json({success : false , message : "Invalid credentials"})
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id);

    if (!accessToken || !refreshToken) {
        return res.status(500).json({success : false , message : "Server error while generating user tokens"})
    }

    const userData = await userModel.findOne({"_id" : user._id}).select("-password -refreshToken");

    if (!userData) {
        return res.status(404).json({success : false , message : "User not found"})
    }

    const option = {
        httpOnly : true,
        secure : false,
        sameSite: "Lax"
    }

    return res
    .status(200)
    .cookie("refreshToken" , refreshToken , option)
    .cookie("accessToken" , accessToken , option)
    .json(
        new ApiResponse(
            200,
            {
                userData,
                accessToken,
                refreshToken
            },
            "User LoggedIn Successfully.."
        )
    )



})

const refreshAccessToken = asyncHandler(async (req , res) => {

    const inCommingTokens = req.body.cookie || req.header().Authorization.split(" ")[1]

    if (!inCommingTokens) {
        throw new ApiError(401 , "Tokens Not Found.")
    }

    try {

        const decodedToken = jwt.verify(inCommingTokens , process.env.USER_REFRESH_TOKEN_SECRET);

        if (!decodedToken) {
            throw new ApiError(402 , "Invalid Token.");
        }

        const user = await userModel.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(402 , "Invalid Token")
        }

        if (inCommingTokens !== user?.refreshToken) {
            throw new ApiError(402 , "Invalid user Found.")
        }

        const {accessToken , refreshToken : newRefreshToken} = await generateAccessAndRefreshToken(user._id);

        if (!accessToken || !newRefreshToken) {
            throw new ApiError(500 , "Something went wrong while generating the tokens.");
        }

        const option = {
            httpOnly : true,
            secure : process.env.NODE_ENV === "production",
        }

        user.refreshToken = newRefreshToken

        user.save({validateBeforeSave : false});

        return res
        .status(200)
        .cookie("accessToken" , accessToken , option)
        .cookie("refreshToken" , newRefreshToken , option)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken : newRefreshToken
                },
                "Tokens Generated Sucessfully."
            )
        )
        
    } catch (error) {
        throw new ApiError(500 , error?.message || "Something went wrong while Generating the tokens.");
    }


})

const logoutUser = asyncHandler(async (req , res) => {

    const user = req?.user;

    if (!user) {
        return res.status(400).json({success : false , message : "unAuthorised User"})
    }

    user.refreshToken = undefined;
    user.save({validateBeforeSave : false});
    const option = {
        httpOnly : true,
        secure : false,
    }

    return res
       .status(200)
         .clearCookie("accessToken" , option)
            .clearCookie("refreshToken" , option)
                .json(
                    new ApiResponse(
                        200,
                        {},
                        "User Logged Out Successfully."
                    )
                )

});

const validateUserToken = asyncHandler(async (req , res) => {
    const token = req.cookies?.accessToken;

    if(!token){
        return res.status(400).json({success : false , message : "unAuthorised user"})
    }

    try {
        const decoded = jwt.verify(token , process.env.USER_ACCESS_TOKEN_SECRET);

        if (!decoded) {
            return res.status(500).json({success : false , message : "Not Authorized to access this route."})
        }

        const user = await userModel.findById(decoded?._id).select("-password -refreshToken");

        if (!user) {
            return res.status(400).json({success : false , message : "Invalid Tokens"})
        }
    } catch (error) {
        return res.status(500).json({success : false , message : "unAuthorised user"})
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            {},
            "Authenticates User"
        )
      )
});

const userProfile = asyncHandler(async (req , res) => {
    
    const user = req?.user;

    if (!user) {
        return res.status(400).json({success : false , message : "unAuthorised user"})
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {user},
            "User Profile Data."
        )
    )
});



export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    userProfile,
    validateUserToken
}