const express = require("express");
const app = express();
const cors = require("cors");


app.use(express.json());
app.use(cors());    
app.use("/auth",require("./routes/jwtAuth"));
app.use("/dashboard",require("./routes/dashboard"));
app.use("/users",require("./routes/users"));
     
const port = process.env.PORT || 5000;
app.listen(port,() => {
    console.log(`Server is runnong on port ${port}`);
})