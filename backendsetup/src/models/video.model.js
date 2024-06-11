import mongoose, { Schema } from 'mongoose'
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const VideosSchema = new mongoose.Schema({
    videoFile: {
        type: String,   //cloudanary url
        required: true
    },
    thumbnail: {
        type: String,   //cloudanary url
        required: true
    },
    title: {
        type: String,   
        required: true
    },
    description: {
        type: String,   
        required: true
    },
    duration: {
        type: Number,   //from cloudinary   
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true});

//this allow us to write aggregate queries 
VideosSchema.plugin(mongooseAggregatePaginate); 

export const Videos = mongoose.model("Videos", VideosSchema);