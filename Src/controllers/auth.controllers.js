import { User } from "../models/User.models";
import { ApiResponse } from "../utils/api-response";
import {ApiError} from "../utils/api-error";
import { asyncHandler } from "../utils/async-handler";
import { emailVerificationMailgenContent } from "../utils/mail"; 
import { forgotPasswordMailgenContent } from "../utils/mail";
import { sendEmail } from "../utils/mail";


const generateAccessAndRefreshTokens=async(userId)=>{
    try{
        const user=await User.findById(userId);
        const accessToken=User.generateAccessToken();
        const refreshToken=User.generateRefreshToken();
        
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken};

    }catch(error)
    {
        throw new ApiError(
            500,
            "Something went wrong while generating access token"
        );
    }
}
const registerUser=asyncHandler(async(req,res)=>{
    const{email,username,password,role}=req.body;
    const existedUser=await findOne({
        $or:[{username},{email}],
    });

    if(existedUser){
        throw new ApiError(409,"User already exist");
    }

    const user=await User.create({
        email,
        password,
        username,
        isEmailVerified:false,
    });

    const {unHashedToken,hashedToken,tokenExpiry}=user.generateTemporaryToken();

    user.emailVerificationToken=hashedToken;
    user.emailVerificationExpiry=tokenExpiry;
    await user.save({validateBeforeSave:false});

    await sendEmail({
        email:user?.email,
        subject:"Please verify your email",
        mailgenContent:emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        )
    });


    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken -emailVerification -emailVerificationExpiry",
    );

    if(!createdUser)
    {
        throw new ApiError(500,"Something went wrong while registering a user");
    }
    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            {user:createdUser},
            "User registered successfully and verification email has been sent on your email",
        ),
    );

});

const login=asyncHandler(async (req,res)=>{
    const{email,password,username}=req.body;

    if(!email)
    {
        throw new ApiError(400,"email is required");

    }
    const user= await User.findOne({email});
    if(!user)
    {
        throw new ApiError(400,"user does not exists");
    }

    const isPasswordValid= await user.isPasswordCorrect(password);
    if(!isPasswordValid)
    {
        throw new ApiError(400,"Invalid credentials");
    }

    const {accessToken,refreshToken}= await generateAccessAndRefreshTokens(user._id);

    const loggedInUser= await User.findById(user._id).select(
        "-password -refreshToken -emailVerficationToken -emailVerificationExpiry",
    );

    const options={
        httpOnly:true,
        secure:true,
    };
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,
                accessToken,
                refreshToken,
            },
            "user logged in successfully",
        ),
    )
})