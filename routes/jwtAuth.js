const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const validInfo = require("../middleware/validInfo");
const authorization = require("../middleware/authorization");


router.post("/register", validInfo, async (req, res) => {

    try {

        const { email, phoneNumber, password, firstName, lastName, dateOfbirth, home, country,genderType } = req.body;
        //verify all the fields
        if (!email || !phoneNumber || !password || !firstName || !lastName || !dateOfbirth || !home || !country) {
            return res.status(400).json({ message: "All input fields are required " })
        }
        // verify if user exists
        //hash password
        //create the user with the email-phone and password 
        //get the created user id 
        //add or creat profile with the remaining information and user_id 
        //return success response 

        // verify if user exists
        const user = await pool.query("SELECT * FROM users WHERE user_email =$1 AND user_phone =$2", [email,phoneNumber]);


        if (user.rows.length != 0) {
            return res.status(401).send("User already exist");
        }

        const saltRound = 10;

        const salt = await bcrypt.genSalt(saltRound);
        const bcryptPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query("INSERT INTO users (user_email,user_phone,user_password) VALUES($1,$2,$3) RETURNING *", [email, phoneNumber, bcryptPassword]);
        //res.json(newUser.rows[0]);
        
        const user_id=newUser.rows[0].user_id;
        const newprofile = await pool.query("INSERT INTO profile(first_name,last_name,date_of_birth,home_address,country_state,user_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING *", [firstName, lastName, dateOfbirth, home, country, user_id]);


      const newGen = await pool.query("INSERT INTO Gender(gender,user_id) VALUES($1,$2) RETURNING *",[genderType,user_id]);



        const token = jwtGenerator(newUser.rows[0].user_id);
        return res.json({ token });

    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server error")
    }



});


router.post("/login", async (req, res) => {

    try {
        //1 destructure the req.body

        const { email,phoneNumber, password } = req.body;

        if(!email && !phoneNumber && !password){
            return res.status(400).json({message : " email,  phone number or password is missing "});
        }

        //2. check if user does not exist (if not then we throw error)
        const user = await pool.query("SELECT * FROM users WHERE user_email = $1 OR user_phone =$2", [email,phoneNumber]);

        if (user.rows.length === 0) {
            return res.status(401).json(" incorrect credentials ");
        }



        //3 check if the incoming password is the same the database password

        const validPassword = await bcrypt.compare(password, user.rows[0].user_password);
        if (!validPassword) {
            return res.status(401).json("Password or Email is incorrect ");
        }

        // 4 give them the jwt token 

        const token = jwtGenerator(user.rows[0].user_id);
        res.json({ token });



    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server error")
    }
});



// child register


















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
