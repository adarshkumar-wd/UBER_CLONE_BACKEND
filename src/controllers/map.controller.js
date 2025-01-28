import { getAddressCoordinates } from "../service/map.service.js";
import { asyncHandler } from "../asyncHandler/asyncsHandler.js";
import { validationResult } from "express-validator";
import { ApiResponse } from "../utils/apiResponse.js";

const getCoordinates = asyncHandler(async (req , res) => {

    const error = validationResult(req);

    if(!error.isEmpty()){
        return res.status(400).json({success : false , message : "Please provide valid data.."})
    }

    const {address} = req.query;

    try {
        const coordinates = await getAddressCoordinates(address)
        return res.status(200).json(
            new ApiResponse(
                200,
                coordinates,
                "Coordinates fetches succesfully.."
            )
        )
    } catch (error) {
        return res.status(500).json({success : false ,  message : error.message || "Server error while fetching the coordinates.."})
    }
})

export{
    getCoordinates
}