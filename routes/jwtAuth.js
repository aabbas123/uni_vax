const router = require("express").Router();
const pool = require("../db");
//const bcrypt = require("bcrypt");
const bcrypt = require('bcryptjs');
const jwtGenerator = require("../utils/jwtGenerator");
const validInfo = require("../middleware/validInfo");
const authorization = require("../middleware/authorization");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

function transporter() {
    return nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })
}


router.post("/register", validInfo, async (req, res) => {

    try {

        const { userName, email, phoneNumber, password, firstName, lastName, dateOfbirth, home, country, state, zip, genderType } = req.body;
        //verify all the fields
        if (!email || !phoneNumber || !password || !firstName || !lastName || !dateOfbirth || !home || !country || !genderType) {
            return res.status(400).json({ message: "All input fields are required " })
        }
        // verify if user exists
        //hash password
        //create the user with the email-phone and password 
        //get the created user id 
        //add or creat profile with the remaining information and user_id 
        //return success response 

        // verify if user exists
        const user = await pool.query("SELECT * FROM users WHERE user_email =$1 AND user_phone =$2", [email, phoneNumber]);


        if (user.rows.length != 0) {
            return res.status(401).json({message:"User already exist"});
        }

        const saltRound = 10;

        const salt = await bcrypt.genSalt(saltRound);
        const bcryptPassword = await bcrypt.hash(password, salt);
        const verificationToken = jwt.sign({ email: email }, process.env.VERFICATION_KEY, { expiresIn: "1hr" });

        const newUser = await pool.query("INSERT INTO users (user_name,user_email,user_phone,user_password,verification_token,isverified) VALUES($1,$2,$3,$4,$5,$6) RETURNING *", [userName, email, phoneNumber, bcryptPassword, verificationToken, false]);
        //res.json(newUser.rows[0]);
        const user_id = newUser.rows[0].user_id;
        const newprofile = await pool.query("INSERT INTO profile(first_name,last_name,date_of_birth,gender,home_address,country,state,zip_code,user_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *", [firstName, lastName, dateOfbirth, genderType, home, country, state, zip, user_id]);

        const emailData = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Account verification",
            html: `<h2>UNIVERSAL_VAX</h2>
    <p> Hi</p>
    <p> plz verify your account by clicking on this link</p>
    <p>${process.env.CLIENT_URL}/verify/${verificationToken}</p>  
    `  }

        let info = await transporter().sendMail(emailData);
        console.log(info.messageId);
        return res.status(200).json({ message: "Register successfully, verfication email has been sent" });

        //const token = jwtGenerator(newUser.rows[0].user_id);
        //return res.json({ token });

    } catch (err) {
        console.error(err)
        res.status(500).send("Server error")
    }



});


router.get("/verify/:token", async (req, res) => {
    try {
        const { token } = req.params;

        let decoded = jwt.verify(token, process.env.VERFICATION_KEY);
        const { email } = decoded;
        const verifiedUser = await pool.query("SELECT * FROM users where user_email = $1", [email]);
       console.log('logs',verifiedUser.rows[0]);
       if(verifiedUser.rows[0].isverified){
           return res.status(400).json({message:"Account is verified"});
        }
        const user = await pool.query("SELECT * FROM users where user_email = $1 AND verification_token=$2", [email, token]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: "Invalid Link" });
        }
        const updateUser = await pool.query("UPDATE users SET isverified =$1,verification_token=$2 WHERE user_email =$3 AND verification_token=$4", [true, '', email, token]);
       //const tok = jwtGenerator(user.rows[0].user_id);
       //return res.json({token:tok});
       
        return res.json({ message:"Your account has been verified, you can login now"});  



    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Link expired " });
    }
})


router.post("/login", async (req, res) => {

    try {
        //1 destructure the req.body

        const { email, phoneNumber, password } = req.body;

        if (!email || !phoneNumber && !password) {
            return res.status(400).json({ message: " email,  phone number or password is missing " });
        }

        //2. check if user does not exist (if not then we throw error)
        const user = await pool.query("SELECT * FROM users WHERE user_email = $1 OR user_phone =$2", [email, phoneNumber]);

       
        if (user.rows.length === 0) {
            return res.status(401).json({message:" incorrect credentials "});
        }
        //verifiy the user
        const checkIfverified = await pool.query("SELECT * from users WHERE user_email=$1 AND isverified=$2", [email, true]);
        if (checkIfverified.rows.length === 0) {
            return res.status(403).json({ message: "This user is not verified" })
        }
        // return res.status(403).json({message: ""})

        //3 check if the incoming password is the same the database password

        const validPassword = await bcrypt.compare(password, user.rows[0].user_password);
        if (!validPassword) {
            return res.status(401).json({message:"Password or Email is incorrect "});
        }
        return res.status(200).json({ message: "You have been login successfully" });
        // 4 give them the jwt token 

        const token = jwtGenerator(user.rows[0].user_id);
        res.json({ token });



    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server error")
    }
});



router.post("/forgot", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: "This user does not exist" });
        }

        const token = jwt.sign({ email, id: user.rows[0].user_id }, process.env.PASSWORD_RESET_KEY, { expiresIn: "15m" });

        const updateUser = await pool.query("UPDATE users SET reset_token = $1 WHERE user_email =$2", [token, email]);
        const emailData = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "PASSWORD RESET",
            html: `<h2>UNIVERSAL_VAX</h2>
            <p> Hi</p>
            <p> Follow the link below to reset your password</p>
            <p>${process.env.CLIENT_URL}/reset/${token}</p>  
            `  }

        let info = await transporter().sendMail(emailData);
        console.log(info.messageId);
        return res.status(200).json({ message: "Reset email sent" });



    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
})


router.get("/reset/:token", async (req, res) => {
    try {
        const { token } = req.params;

        let decoded = jwt.verify(token, process.env.PASSWORD_RESET_KEY);
        const { id, email } = decoded;
        return res.status(200).json({ message: "Link is Valid" });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: "Invalid Link" });

    }

})



router.put('/update-password', async (req, res) => {


    try {
        const { token, password } = req.body;
        //const{password} = req.body.password;

        let decoded = jwt.verify(token, process.env.PASSWORD_RESET_KEY);
        const { email, id } = decoded;
        const availableUser = await pool.query("SELECT * FROM users WHERE user_id=$1 AND user_email=$2 AND reset_token=$3", [id, email, token]);
        if (availableUser.rows.length === 0) {
            return res.status(404).json({ message: "Invalid token" });
        }
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const passwordHash = await bcrypt.hash(password, salt);
        const updatedPass = await pool.query("UPDATE users SET user_password =$1 , reset_token = $2 WHERE user_email=$3 AND user_id=$4 AND reset_token=$5 ", [passwordHash, '', email, id, token]);
        //console.log(updatedPass);
        return res.status(200).json({ message: "Your password has been updated " });
    }
    catch (err) {
        console.log(err.message);
        res.status(500).json({ message: "Server error" });
    }

});












router.get("/is-verify", authorization, async (req, res) => {
    try {

        res.json(true);
        //console.log(res);

    }
    catch (err) {
        console.error(err.message)
        res.status(500).send("Server error")
    }
});





module.exports = router;
