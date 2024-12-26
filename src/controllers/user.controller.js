import { userModel } from "../models/user.model.js";
import { asyncHandler } from "../asyncHandler/asyncsHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {ApiError} from "../utils/ApiError.js"
import { generateAccessAndRefreshToken } from "../utils/generateTokens.js";
import jwt from "jsonwebtoken"

const registerUser = asyncHandler(async (req , res) => {

    const {firstName , lastName , email , password} = req.body;

    if (!firstName || !email || !password) {
        throw new ApiError(400 , "Star Marked fields must be required.")
    }

    const emailCheck = await userModel.findOne({email});

    if (emailCheck) {
        throw new ApiError(400 , "Email Already Exist")
    } 

    const user = await userModel.create({
        firstName,
        lastName,
        email,
        password
    });

    if (!user) {
        throw new ApiError(500 , "Something went wrong while creating the user.");
    }

    const userData = await userModel.findOne({"_id" : user._id}).select("-password");

    if (!userData) {
        throw new ApiError(500 , "User Data not found in the Database.");
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            {userData},
            "User Created Sucessfully.."
        )
    )


})

const loginUser = asyncHandler(async (req , res) => {

    const {email , password} = req.body

    if (!email || !password) {
        throw new ApiError(400 , "All fields are Required.");
    }

    const user = await userModel.findOne({email});

    if (!user) {
        throw new ApiError(404 , "User Not Found.");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(400 , "Invalid Credentials.");
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id);

    if (!accessToken || !refreshToken) {
        throw new ApiError(500 , "Error While Generating Tokens.");
    }

    const userData = await userModel.findOne({"_id" : user._id}).select("-password -refreshToken");

    if (!userData) {
        throw new ApiError(500 , "User Data not found in the Database.");
    }

    const option = {
        httpOnly : true,
        secure : process.env.NODE_ENV === "production",
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

        const decodedToken = jwt.verify(inCommingTokens , process.env.REFRESH_TOKEN_SECRET);

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
        throw new ApiError(401 , "UnAuthorized User.");
    }

    user.refreshToken = undefined;
    user.save({validateBeforeSave : false});
    const option = {
        httpOnly : true,
        secure : process.env.NODE_ENV === "production",
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



export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser
}