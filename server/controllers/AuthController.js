import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import {compare} from "bcrypt";
import {renameSync , unlinkSync} from "fs";
const maxAge = 1000 * 60 * 60 * 24 * 3;


const createToken = (email, userId) => {
    return jwt.sign({email,userId}, process.env.JWT_KEY, {expiresIn: maxAge})
}

export const signup = async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(400).json({message: 'Email or Password is required'})
        }

        const user = await User.create({email, password});

        res.cookie('jwt',createToken(email,user.id),{
            maxAge,
            secure:true,
            sameSite: 'none',
        })

        return res.status(201).json(
            {user:{id:user.id,
                email:user.email,
                profileSetup:user.profileSetup}
            ,message: 'User created successfully'}
        )
    }catch (err){
        console.log(err)
        return res.status(500).json({message: 'Internal Server Error'})
    }
}

export const login = async (req, res) => {
    try {

        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(400).json({message: 'Email or Password is required'})
        }

        const user = await User.findOne({email});
        if (!user){
            return res.status(404).json({message: 'User not found'});
        }
        const auth = await compare(password , user.password)

        if (!auth){

            return res.status(401).json({message: 'Password is incorrect'})
        }

        res.cookie('jwt',createToken(email,user.id),{
            maxAge,
            secure:true,
            sameSite: 'none',
        })

        return res.status(200).json(
            {user:{id:user.id,
                    email:user.email,
                    profileSetup:user.profileSetup,
                firstName :user.firstName,
                lastName :user.lastName,
                image:user.image,
                color:user.color}
                ,message: 'User found successfully'}
        )
    }catch (err){
        return res.status(500).json({message: 'Internal Server Error'})
    }
}

export const getUserInfo = async (req, res) => {
    try {

        const user = await User.findById(req.userId);
        if (!user){
            return res.status(404).json({message: 'User not found'});
        }

        return res.status(200).json(
            {user:{id:user.id,
                    email:user.email,
                    profileSetup:user.profileSetup,
                    firstName :user.firstName,
                    lastName :user.lastName,
                    image:user.image,
                    color:user.color}
                ,message: 'User found successfully'}
        )
    }catch (err){
        console.log(err)
        return res.status(500).json({message: 'Internal Server Error'})
    }
}

export const updateUser = async (req,res)=>{
    try {
        const {userId} = req;
        const {firstName, lastName, color} = req.body;
        //
        if (!firstName|| !lastName || !color){
            return res.status(400).json({message: 'FirstName lastName and color is required'});
        }
        const user= await User.findByIdAndUpdate(userId, {firstName, lastName, color , profileSetup:true}, {new:true , runValidators:true});
        return res.status(200).json(
            {user:{id:user.id,
                    email:user.email,
                    profileSetup:user.profileSetup,
                    firstName :user.firstName,
                    lastName :user.lastName,
                    image:user.image,
                    color:user.color}
                ,message: 'User Updated successfully'}
        )
    }catch (err){
        console.log(err)
        return res.status(500).json({message: 'Internal Server Error'})
    }
}

export const addProfileImage = async (req,res)=>{
    try {

        if (!req.file){
            return  res.status(400).json({message: 'Image is required'});
        }
        const date = Date.now();
        let fileName = "uploads/profiles/"+date + req.file.originalname;

        renameSync(req.file.path, fileName);
        const updateuser = await User.findByIdAndUpdate(req.userId
            , {image: fileName}, {new: true, runValidators: true});


        return res.status(200).json(
            {image:updateuser.image,message: 'Profile image added successfully'}
        )
    }catch (err){
        console.log(err)
        return res.status(500).json({message: 'Internal Server Error'})
    }
}

export const removeProfileImage = async (req,res)=>{
    try {
        const {userId} = req;

        const user = await User.findById(userId);

        if (!user){
            return res.status(404).json({message: 'User not found'});
        }

       if (user.image){
           unlinkSync(user.image);
       }
        user.image = null;
        await user.save();

        return res.status(200).json(
            {message: 'Profile image removed successfully'}
        )
    }catch (err){
        console.log(err)
        return res.status(500).json({message: 'Internal Server Error'})
    }
}



export const logout = async (req,res)=>{
    try {

        res.cookie('jwt','',{maxAge:1 , secure:true, sameSite: 'None'});

        return res.status(200).json(
            {message: 'Logout successfully'}
        )
    }catch (err){
        console.log(err)
        return res.status(500).json({message: 'Internal Server Error'})
    }
}