import { userModel } from "../models/user.model.js";
import { asyncHandler } from "../asyncHandler/asyncsHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {ApiError} from "../utils/ApiError.js"

const registerUser = asyncHandler(async (req , res) => {

    const {firstName , lastName , email , password} = req.body;

    if (!firstName || !email || !password) {
        throw new ApiError(400 , "Star Marked fields must be required.")
    }

    const emailCheck = await userModel.findOne({email});
    console.log("email::>>>>>>",emailCheck)

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
    console.log("userData :>>>>" , userData)

    if (!userData) {
        throw new ApiError(500 , "User Data not found in the Database.");
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            userData,
            "User Created Sucessfully.."
        )
    )


})



export {
    registerUser
}