import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const captainsSchema = new mongoose.Schema({

    fullName: {
        firstName : {
            type : String,
            required : [true , "First Name is Required."],
            minlength : [3 , "First Name must be atleast 3 characters long."],
        },

        lastName : {
            type : String,
        }
    },

    email: {
        type : String,
        required : [true , "Email is Required."],
        unique : [true , "Email Already Exist."],
        match : [
            /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g,
            "Please Enter a valid Email Address."
        ]
    },

    password: {
        type : String,
        required : [true , "Password is Required."],
        minlength : [3 , "Password must be atleast 3 characters long."],
    },

    refreshToken: {
        type : String
    },

    vechile: {

        color: {
            type : String,
            required : [true , "Color is Required."]
        },

        vechileNumber: {
            type : String,
            required : [true , "Vechile Number is Required."]
        },

        capacity: {
            type : Number,
            required : [true , "Capacity is Required."],
            default : 1
        },

        vechileType: {
            type : String,
            required : [true , "Vechile Type is Required."]
        }
    }

} , {timestamps : true});

captainsSchema.pre("save" , async function(next) {
    if (!this.isModified("password")) {
        next();
    }

    this.password =  await bcrypt.hash(this.password , 10);
});

captainsSchema.methods.isPasswordCorrect = async function(password) {
    try {
        return await bcrypt.compare(password , this.password);

    } catch (error) {
        throw new Error("Something went wrong while comparing the password.");
    }
};

captainsSchema.methods.generateAccessToken = function() {
    return jwt.sign({ _id : this._id } , process.env.CAPTAIN_ACCESS_TOKEN_SECRET , { expiresIn : process.env.CAPTAIN_ACCESS_TOKEN_EXPIRY });
};

captainsSchema.methods.generateRefreshToken = function() {
    return jwt.sign({ _id : this._id } , process.env.CAPTAIN_REFRESH_TOKEN_SECRET , { expiresIn : process.env.CAPTAIN_REFRESH_TOKEN_EXPIRY });
};

export const captainModel = mongoose.model("captain" , captainsSchema);