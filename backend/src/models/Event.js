import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
    {
        title : {
            type: String,
            required: true,
        },
        caption : {
            type: String,
            required: true,
        },
        eventDate : {
            type: String,
            required: true,
        },
        location : {
            type: String,
            required: true,
        },
        user: {
            type : mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        participants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }]
    },

    {
        timestamps : true
    }
);

const Event = mongoose.model("Event",eventSchema);

export default Event;