import express from 'express';
import dotenv from "dotenv";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import authRoutes from "./routes/AuthRoutes.js";
import contactsRoutes from "./routes/ConcatsRoutes.js";
import setupSocket from "./socket.js";
import messageRoutes from "./routes/MessagesRoutes.js";
import channelRouter from "./routes/ChannelRoute.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE_URL;

app.use(cors({
    origin: [process.env.ORIGIN],
    methods: ["GET", "POST", "PUT","PATCH", "DELETE"],
    allowedHeaders: ['Content-Type', 'Origin', 'X-Requested-With', 'Accept', 'x-client-key', 'x-client-token', 'x-client-secret', 'Authorization'],
    credentials:true
}));


app.use("/uploads/profiles", express.static("uploads/profiles"))
app.use("/uploads/files", express.static("uploads/files"))

app.use(cookieParser());
app.use(express.json());

app.get('/',(req,res)=>{
    res.send("Running")
})

app.use('/api/auth',authRoutes);
app.use('/api/contacts',contactsRoutes);
app.use('/api/messages',messageRoutes);
app.use('/api/channel',channelRouter);

const server =app.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`);
})

setupSocket(server);
mongoose.connect(databaseURL).then(()=> {
    console.log("Connected to database")})
.catch(err=>{
    console.log(err.message)
})