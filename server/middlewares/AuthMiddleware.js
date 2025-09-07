import jwt from "jsonwebtoken";

export const verifyToken = (req , res , next) => {
    const token = req.cookies.jwt;
     if (!token)return res.status(401).json({msg : "You are not authenticated"});

     jwt.verify(token , process.env.JWT_KEY , (err , payload) => {
         if (err)return res.status(403).json({msg : "Token is not valid"});
         req.userId = payload.userId
         next()
     })

};

export const verifyUser=(cookieName)=>{
    return async (req,res,next)=>{
        try{

            if(!cookieName) throw new Error("no cookie");
            req.user=null;
            const token=req.cookies[cookieName];
            if(!token) throw new Error("no token");
            const payload=Token.getPayload(token);
            if(!payload) throw new Error("no payload");
            req.user=payload;
            next();
        }
        catch(error){
            throw new Error("Error getting the token and payload in verify user");
        }
    }

}