import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async (userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()


        //need to save refresh token so that no need to ask user again and again for password
        user.refreshToken = refreshToken
        //this statement tell that do not validate before save -> mujhe pata hai main kya kar raha hu
        //otherwise it require all the feild tha tis marked required in model
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken};
    } catch(error){
        throw new ApiError(500, "Something went wrong while generating Refresh and Access token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //it is a challenge so first steps
    //1. get user fill details from frontend
    //2. Validation(not empty)
    //3. check if already exist (username, email)
    //4. check for img, check for avatar
    //5. upload them to cloudanary, avatar
    //6. create user object -> create entry in db
    //7. remove encripted password and refresh token feild from response
    //8. check if response came or not
    //9. return res

    const {fullName, email, username, password} = req.body;

    //2. validation
    //1st way
    // if(fullname === ""){
    //     throw new ApiError(400, "Fullname is Required")
    // }

    //2nd way
    if([fullName, email, username, password].some((feild) => 
        feild?.trim() === "")
    ){
        throw new ApiError(400, "All feilds are Required")
    }
    

    //3. exist or not
    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })
    if(existedUser){
        console.log("have error")
        throw new ApiError(409, "User Already Exist");
    }



    //4. check for img, check for avatar
    //multer give access to req.files
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) 
    && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar File is Required");
    }

    //cloudinary upload
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar file not uploaded");
    }
   
    //create object and save to db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()

    })

    //removed password and refreshToken to get to frontend or in createdUser
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )
})

const loginUser = asyncHandler( async (req, res) => {
    //get the input(username, password) -> from req body
    // username or email hai ya nahi 
    //password hai ya nahi
    //find user -> if no return
    //password check -> if wrong no entry
    //generate access and refresh token 
    //send cookies
    //all done

    //get data
    const {email, username, password} = req.body

    //check for empty
    if(!username && !email){
        throw new ApiError(400, "Username or Password is Required");
    }

    //find user
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    //check if user exist
    if(!user){
        throw new ApiError(404, "No User Found")
    }

    //password validation 
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(404, "Password incorrect");
    }

    //generate tokens
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    //now one problem : the user ref we have have empty refresh token because we have updated user after taking a refrence
    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    //send cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("RefreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged in Successfully"
        )
    )

})

const logoutUser = asyncHandler( async(req, res) => {
    //steps
    //1. remove all cookies
    //2. reset all access token and refresh token

    //problem1 :  how to get the refrence of user here in this
    //solution :  using middleware that is authjwt
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
                accessToken: undefined
            }
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"))
})

const refreshAccessToken = asyncHandler( async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized Request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401, "Invalid Refesh Token")
        }
    
        //now mathc with user
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh Token Expired or Used");
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
           new ApiResponse(
               200,
               {accessToken, refreshToken: newRefreshToken},
               "AccessToken Refreshed"
           )
        )
    } catch (error) {
        throw new ApiError(500, error?.message || "Invalid Refresh Token")
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}