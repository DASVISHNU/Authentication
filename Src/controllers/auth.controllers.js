import { User } from "../models/User.models.js";
import { ApiResponse } from "../utils/api-response.js";
import {ApiError} from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailgenContent } from "../utils/mail.js"; 
import { forgotPasswordMailgenContent } from "../utils/mail.js";
import { sendEmail } from "../utils/mail.js";

const generateAccessAndRefreshTokens=async(userId)=>{
    try{
           console.log("ACCESS:", process.env.ACCESS_TOKEN_SECRET);
console.log("REFRESH:", process.env.REFRESH_TOKEN_SECRET);
        const user= await User.findById(userId)
        
        if (!user) {
    throw new ApiError(404, "User not found");
}
        const accessToken=user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        user.refreshToken=refreshToken;
        //user.accessToken=accessToken;
     
        await user.save({validateBeforeSave:false})
        return{accessToken,refreshToken}
    }
    catch(error)
    {
throw new ApiError(500,
    "something went wrong while generating temporaray token"
)
    }
}


const registeruser=asyncHandler(async (req,res)=>{
    const {email,password,username,role}=req.body;
    const existedUser=await User.findOne({
        $or:[{username},{email}],
    });
    if(existedUser)
    {
        throw new ApiError(409,"User with email or username already exist")
    }
    const user=await User.create({
        email:email,
        password:password,
        username:username,
        isEmailVerified:false
    });
    const {unHashedToken,hashedToken,tokenExpiry}=user.generateTemporaryToken();



    user.emailVerificationExpiry=tokenExpiry;
    user.emailVerificationToken=hashedToken;


    await user.save({validateBeforeSave:false});



    await sendEmail({
        email:user.email,
        subject:"please verify your email",
        mailgenContent:emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
            
        ),
    });

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );
    if(!createdUser)
    {
        throw new ApiError(500,"something went wrong while registering a user");

    }
    return res.status(201).json(new ApiResponse(
        200,
        {
            user:createdUser
        },
        "User registered successfull and verification email has been sent on the mail"
    ))

})

// register  wala part is done now login wala part

const login=asyncHandler(async (req,res)=>{

    const{email,password,username}=req.body;
    
    if(!email)
    {
        throw new ApiError(400,"email is required");


    }

    const user=await User.findOne({email});

    if(!user)
    {
        throw new ApiError(400,"User does not exists");
    }

    const isPasswordValid=await user.isPasswordCorrect(password);

    if(!isPasswordValid)
    {
        throw new ApiError(400,"Invalid credentials");
    }

    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id);

    const loggedInUser= await User.findById(user._id).select(
       "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
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
            "User logged in successfully",
        )
    )

})

//Now logout user -to log out you must remove the access token from the database;
const logoutUser=asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:"",
            }
        },
        {
            new:true,
        },
    );
    const options={
        httpOnly:true,
        secure:true,
    };
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out"));
})


const getCurrentUser=asyncHandler(async (req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"Current user fetched successfully"));
})

const verifyEmail=asyncHandler(async(req,res)=>{
    const {verficationToken}=req.params;
    if(!verficationToken)
    {
        throw new ApiError(400,"Email verification token is missing");
    }

    let hashedToken=crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

    const user=await User.findOne({
        emailVerificationToken:hashedToken,
        emailVerificationExpiry:{$gt:Date.now()},
    });

    if(!user)
    {
        throw new ApiError(400,"Token is invalid or expired");
    }
    user.emailVerificationToken=undefined;
    user.emailVerificationExpiry=undefined;

    user.isEmailVerified=true;
    await user.save({validateBeforeSave:false});

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                isEmailVerified:true,
            },
            "Email is verified",
        ),
    );
})

const resendEmailVerification=asyncHandler(async (req,res)=>{
    const user=await User.findById(req.user?._id);

    if(!user)
    {
        throw new ApiError(404,"User does not exist");
    }

    if(user.isEmailVerified)
    {
        throw new ApiError(404,"Email is already verified");
    }
    const {unHashedToken,hashedToken,tokenExpiry}=user.generateTemporaryToken();

    user.emailVerificationExpiry=tokenExpiry;
    user.emailVerificationToken=hashedToken;

    await user.save({validateBeforeSave:false});
    await sendEmail({
        email:user?.email,
        subject:"please verify your email",
        mailgenContent:emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
        ),
    });

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Mail has been sent to your email ID"))
})



export {registeruser,login};