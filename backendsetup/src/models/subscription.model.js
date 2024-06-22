import mongoose, {Schema, mongo} from "mongoose"

const SubscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: Schema.Types.ObjectId,        //one who is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,        //one whose channel is this
        ref: "User"
    }
}, {timestamps: true});

export const Subscription = mongoose.model("Subscription", SubscriptionSchema);