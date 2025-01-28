import axios from "axios"

const getAddressCoordinates = async(address , _ , res) => {

    const apiKey = process.env.MAP_API_KEY

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`

    try {
        const response = await axios.get(url);
        const data = response.data;
        console.log("response : ",data)
        if (data.status === "OK") {
            const location = data.results[0].geometry.location;
            return {
                ltd : location.lat,
                lng : location.lng
            }
        } else {
            return res.status(400).json({success : false , message : "Invalid Address."});
        }
    } catch (error) {
        return res.status(500).json({success : false , message : error.message || "Something went wrong while fetching the address coordinates."});
    }
}

export {getAddressCoordinates}