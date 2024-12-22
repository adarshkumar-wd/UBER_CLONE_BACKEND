import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"

dotenv.config({})

const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))
app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser())


// Routes...

import userRouter from "./src/routes/user.route.js"

// Routes Decleration... 

app.use("/api/v1/users" , userRouter);


app.get("/" , (req , res) => res.send("Hello world"));

export {app}