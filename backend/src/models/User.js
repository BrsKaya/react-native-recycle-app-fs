import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
            minlenght: 6
        },
        profileImage: {
            type: String,
            default:""
        },
        coins: {
            type: Number,
            default: 0
        },
        glassMaterial: {
            type: Number,
            default: 0
        },
        plasticMaterial: {
            type: Number,
            default: 0
        },
        metalMaterial: {
            type: Number,
            default: 0
        },
        paperMaterial: {
            type: Number,
            default: 0
        },
        organicMaterial: {
            type: Number,
            default: 0
        }
    }, 
    {
        timestamps: true
    }
);

//hash password before saving user to db
userSchema.pre("save", async function (next){

    if(!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
})

//compare password func
userSchema.methods.comparePassword = async function (userPassword) {
    return await bcrypt.compare(userPassword, this.password);
}

const User = mongoose.model("User", userSchema);

export default User;