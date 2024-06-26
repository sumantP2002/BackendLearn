import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import multer from 'multer';

const app = express();

//configuration for cors origin
app.use(cors({
    origin: process.env.CORS_ORIGIN
}));
//config for json data that come to backend and setting the limit tp save our 
app.use(express.json({
    limit: "16kb"
}))
//config when data come as url 
app.use(express.urlencoded({extended: true}))
//cookie-parser is for allowing server to access the cookies on client system and perform crud operating
app.use(cookieParser());
// sometime i want to store private file or folder on our local system so create public folder
app.use(express.static("public")); 


//routes import
import userRouter from './routes/user.routes.js'

//routes declaration -> as we have placed route outside so get will not work we have to use 'use' middleware
app.use("/api/v1/users", userRouter);


export { app } 