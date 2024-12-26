import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : true,
    },

    lastName : {
        type : String,
    },

    email : {
        type : String,
        required : true,
        unique : true,
        trim : true
    },

    password : {
        type : String,
        required : true,
        trim : true
    },

    refreshToken : {
        type : String,
    },

    socketId : {}
} , {});

userSchema.pre("save" , async function (next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password , 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password , this.password)
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName : `${this.firstName} ${this.lastName}`
        },
        process.env.USER_REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.USER_REFRESH_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.USER_ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.USER_ACCESS_TOKEN_EXPIRY
        }
    )
}

export const userModel = mongoose.model("user" , userSchema)