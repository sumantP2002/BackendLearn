import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    console.log("email : ", email)

    //2. validation
    //1st way
    // if(fullname === ""){
    //     throw new ApiError(400, "Fullname is Required")
    // }

    //2nd way
    if([fullName, email, username, password].some((feild) => 
        feild?.trim() === "")
    ){
        throw ApiError(400, "All feilds are Required")
    }
    

    //3. exist or not
    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })
    if(existedUser){
        throw ApiError(409, "User Already Exist");
    }

    //4. check for img, check for avatar
    //multer give access to req.files
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) 
    && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar File is Required");
    }

    //cloudinary upload

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw ApiError(400, "Avatar file not uploaded");
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
        throw ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )
})


export {registerUser}