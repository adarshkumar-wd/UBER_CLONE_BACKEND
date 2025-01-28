import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"

dotenv.config({})

const app = express();

app.use(cors({
    origin : "http://localhost:5173",
    credentials : true
}))
app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser())


// Routes...

import userRouter from "./src/routes/user.route.js"
import captainRouter from "./src/routes/captain.route.js"
import mapRouter from "./src/routes/map.route.js"

// Routes Decleration... 

app.use("/api/v1/users" , userRouter);
app.use("/api/v1/captains" , captainRouter);
app.use("/api/v1/maps" , mapRouter)


app.get("/" , (req , res) => res.send("Hello world"));

export {app}