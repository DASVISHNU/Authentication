import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
//import crypto form "crypto";
import crypto from "crypto";
import jwt from "jsonwebtoken";
const userSchema=new Schema(
    {
        avatar:{
            type:{
                url:String,
                localPath:String,
            },
            default:{
                url:`https://placehold.co/200x200`,
                localPath:""
            }
        },
        username:{
            type:String,
            required:true,
            unique:true,
            trim:true,
            index:true,
            lowercase:true,
        },
        email:{
            type:String,
            required:true,
            unique:true,
            trim:true,
            index:true,
            lowercase:true,
        },
        fullname:{
            type:String,
            required:true,
            trim:true,

        },
        password:{
            type:String,
            trim:true,
            required:[true,"Password required"]
        },
         isEmailVerified:{
            type:Boolean,
            default:false
        },
        refreshToken:{
            type:String
        },
        forgotPasswordToken:{
            type:String
        },
        forgotPasswordExpiry:{
            type:Date
        },
        emailVerificationToken:{
            type:String
        },
        emailVerificationExpiry:{
            type:Date
        }


    },{
        timestamps:true,
    }
)


userSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return

    this.password=await bcrypt.hash(this.password,10)
    
})

userSchema.methods.isPasswordCorrect=async function (password) {
    return await bcrypt.compare(password,this.password)
    
}