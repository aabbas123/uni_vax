const jwt = require("jsonwebtoken");
require("dotenv").config()




module.exports = async(req, res, next ) => {
    try{


        const jwtToken = req.header("token");
        if(!jwtToken){
            return res.status(403).json({message:"Not Authorize"});
        }  

        const payload = jwt.verify(jwtToken,process.env.jwtSecret);
        if(!payload){
            return res.status(401).json("Not Authorize");
        }
        req.user = payload.user;
        console.log(payload);
        next();

    }
    catch(err)  {
        console.error(err.message,"Hi");
        return res.status(500).json({message:"Not Authorize "});

    }
};