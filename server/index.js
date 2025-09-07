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

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(o => o.trim())
    .filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow non-browser tools with no Origin header (e.g., curl, health checks)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Origin",
        "X-Requested-With",
        "Accept",
        "Authorization",
        "x-client-key",
        "x-client-token",
        "x-client-secret"
    ]
};

app.use(cors(corsOptions));
// Explicitly handle preflight for all routes
app.options("*", cors(corsOptions));



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