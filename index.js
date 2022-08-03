const express = require("express");
const app = express();
const cors = require("cors");
const path =require("path");
const cookieParser =require("cookie-parser");

app.use(express.json());
app.use(cors());
app.use(cookieParser()); 

app.use("/auth",require("./routes/jwtAuth"));
app.use("/dashboard",require("./routes/dashboard"));
app.use("/users",require("./routes/users"));
   
if(process.env.NODE_ENV==="production"){
    app.use(express.static("client/build"));
    app.get("*",(req,res) =>{
        res.sendFile(path.resolve(__dirname, 'client','build','index.html'));
    })
}

const port = process.env.PORT || 5000;
app.listen(port,() => {
    console.log(`Server is runnong on port ${port}`);
})

