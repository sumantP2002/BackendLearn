import { asyncHandler } from "../utils/asyncHandler.js";


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

    
})


export {registerUser}