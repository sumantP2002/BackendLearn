import { app } from './app.js';
import connectDB from './db/db.js'
import dotenv from "dotenv"
dotenv.config({
    path: './.env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is running at PORT: ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log("MongoDB connection failed!", err)
})