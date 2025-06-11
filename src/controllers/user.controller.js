import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req,res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists:username email
    // check for images,check for avatar
    // upload to them cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response


    const {username,fullName,email,password}=req.body;

    //
    if(username=="") throw new ApiError(400,"username is required");
    if(fullName=="") throw new ApiError(400,"fullName is required");
    if(email=="") throw new ApiError(400,"email is required");
    if(password=="") throw new ApiError(400,"password is required");

    //
    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with email or username already exists");
    }

    const avatarLocalPath=req.files?.avatar[0].path;
    const coverImageLocalPath=req.files?.coverImage[0].path;

    if(!avatarLocalPath) throw new ApiError(400,"Avatar File is Required");

    const avatarResp= await uploadOnCloudinary(avatarLocalPath);
    const coverResp= await uploadOnCloudinary(coverImageLocalPath);

    if(!avatarResp) throw new ApiError(400,"Avatar file cloudinary resp didnt come");

    const user = await User.create({
        fullName,
        avatar: avatarResp.url,
        coverImage: coverResp?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id)?.select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(201,createdUser,"User Registered Successfully")
    )

    


   
})

export {registerUser};