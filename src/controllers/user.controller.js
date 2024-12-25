import { userModel } from "../models/user.model.js";
import { asyncHandler } from "../asyncHandler/asyncsHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {ApiError} from "../utils/ApiError.js"
import { generateAccessAndRefreshToken } from "../utils/generateTokens.js";

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



export {
    registerUser,
    loginUser
}