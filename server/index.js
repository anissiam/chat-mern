
const express = require("express");

const app = express();
const cors = require("cors");
const port = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE_URL;
// إعداد CORS
app.use(cors({
    origin: "*", // أو حط دومينك: "https://your-frontend.vercel.app"
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Routes
app.get("/", (req, res) => {
    res.json({ message: "Hello from Express on Vercel" });
    res.send("Hello from Express on Vercel");
    console.log("dsdsdsd")
});

const server =app.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`);
})

