import http from "http"
import { app } from "./app.js"
import { connectDatabase } from "./src/dbConnection.js/dbConnect.js"

const server = http.createServer(app)

connectDatabase()
.then(() => {
    server.listen(process.env.PORT , () => {
        console.log(`Server is running on port ${process.env.PORT}`)
    })
}).catch((error) => {
    console.log("Database not able to Connect , error : " , error);
})