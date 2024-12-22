import mongoose from "mongoose"

export const connectDatabase = async () => {
    try {
        const dbconnect = await mongoose.connect(process.env.MONGODB_URI);
        if(!dbconnect){
            console.log("Something went wrong while Databse connection");
        } else {
            console.log("Database connected sucessfully");
        }
    } catch (error) {
        console.log("Error at DB connection : " , error);
    }
}