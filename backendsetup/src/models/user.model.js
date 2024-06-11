import mongoose from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true         //to make it more optimized for searching
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,       //cloudinary url
        required: true,
    },
    coverImage: {
        type: String,       //cloudinary url
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Videos",
        }
    ],
    password: {
        type: String,   //challenge to encript
        required: [true, 'Password is required']
    },
    refreshToken: {
        type: String
    }
    

}, {timestamps: true})

//middleware to hash password before the data save
UserSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return next();
    }
    this.password = bcrypt.hash(this.password, 10);     //password, slat or no of round
    next();
})

//custom methouds to check if password correct
UserSchema.method.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)        //it return true or false
}

UserSchema.method.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

UserSchema.method.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", UserSchema);