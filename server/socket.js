import {Server as SocketIOServer} from "socket.io";
import Message from "./models/MessageModel.js";
import Channel from "./models/channelModel.js";

const setupSocket = (server) => {
    const allowedOrigins = [
        "http://localhost:5173",
        "https://chat-mern-front-nine.vercel.app"
    ];
    const io = new SocketIOServer(server,
        {
            cors: {
                origin: allowedOrigins,
                credentials: true,
                methods: ['GET','POST']
            }
        })
    const userSocketMap = new Map();

    const disconnect=(socket)=>{
        console.log(`Client disconnected: ${socket.id}`);
        for(const [userId,socketId] of userSocketMap.entries()){
            if(socketId===socket.id){
                userSocketMap.delete(userId);
                break;
            }
        }

    }

    const sendMessage=async (message)=>{
        const senderSocketId=userSocketMap.get(message.sender);
        const recipientSocketId=userSocketMap.get(message.recipient);
        const createMessage=await Message.create(message);

        const messageData=await Message.findById(createMessage._id)
            .populate("sender","_id email firstName lastName image color")
            .populate("recipient","_id email firstName lastName image color")
        if(recipientSocketId){
            io.to(recipientSocketId).emit("receiveMessage",messageData);
        }
        if(senderSocketId){
            io.to(senderSocketId).emit("receiveMessage",messageData);
        }

    }
    const sendChannelMessage=async (message)=>{
        const {channelId,sender,fileUrl,content,messageType}=message;
        console.log(message)
        const createdMessage=await Message.create({
            sender,
            recipient:null,
            messageType
            ,content,
            fileUrl
            ,timestamp:new Date()});
        const messageData=await Message.findById(createdMessage.id).populate("sender","_id email firstName lastName image color");
        // Update the channel with the new message
         await Channel.findByIdAndUpdate(channelId, {
            $push: { messages: createdMessage.id },
        }, { new: true }).populate("members admin");

         const channel  = await  Channel.findById(channelId).populate("members")

        const finalData={...messageData._doc,channelId:channel.id};
        if(channel && channel.members){
            channel.members.forEach((member)=>{
                const memberSocketId=userSocketMap.get(member._id.toString());
                if(memberSocketId){
                    io.to(memberSocketId).emit("receive-channel-message",finalData);
                }
            })
            const adminSocketId=userSocketMap.get(channel.admin._id.toString());
            if(adminSocketId){
                io.to(adminSocketId).emit("receive-channel-message",finalData);
            }
        }
    }


    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;

        if (userId){
            userSocketMap.set(userId,socket.id);
            console.log(`User Connected: ${userId} with socket ID: ${socket.id}`)
        }else {
            console.log("User not provided during connection")
        }

        socket.on('sendMessage', sendMessage)
        socket.on("send-channel-message",sendChannelMessage);
        socket.on('disconnect', () => disconnect(socket))
    })
}

export default setupSocket;