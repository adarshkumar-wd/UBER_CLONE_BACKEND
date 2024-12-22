import express from "express"
import dotenv from "dotenv"

dotenv.config({})

const app = express();

app.get("/" , (req , res) => res.send("Hello world"));

export {app}