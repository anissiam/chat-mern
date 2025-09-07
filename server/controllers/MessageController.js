import Message from "../models/MessageModel.js";
import{ renameSync} from "fs";
export const getMessage = async (req, res) => {
    try {
        const user1 = req.userId;
        const user2= req.body.id;

        if (!user1 || !user2){
            return res.status(400).json({message: 'User1 and User2 are required'});
        }

        const message = await Message.find({
            $or: [
                {sender: user1, recipient: user2},
                {sender: user2, recipient: user1}
            ]
        }).sort({timestamp: 1})
        return res.status(200).json({messages: message})
    }catch (err){
        console.log(err)
        return res.status(500).json({message: 'Internal Server Error'})
    }
}

export const uploadFile = async (req, res) => {
    try {
        if(!req.file){
            return res.status(400).send("File is required");
        }
        const date=Date.now();
        let fileName=`${date}-${req.file.originalname}`;
        renameSync(req.file.path,`uploads/files/${fileName}`);
        return res.status(200).json({fileName:fileName});
    }catch (err){
        console.log(err)
        return res.status(500).json({message: 'Internal Server Error'})
    }
}