const router = require("express").Router();
const authorization = require("../middleware/authorization");
const bcrypt = require("bcrypt");
//const authorize = require("../middleware/authorize");
const pool = require("../db");
const getage =require("../utils/getage");





router.get("/", authorization, async (req, res) => {
    try {
        // const user = await pool.query(
        //       //   "SELECT user_name FROM users WHERE user_id = $1",
        //       //   [req.user.id]
        //       // );

        const user = await pool.query(
            //"SELECT users.user_name, vaccine_detail.vax__id, t.description FROM users AS u LEFT JOIN todos AS t ON u.user_id = t.user_id WHERE u.user_id = $1",
            "SELECT   users.user_name, vax_name, vax_date, name_of_provider FROM users  LEFT JOIN vaccine_detail ON users.user_id = vaccine_detail.user_id WHERE users.user_id = $1",
            [req.user.id]
        );

        res.json(user.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});




// Create the deatail of vacation for the parent 

router.post("/vaccine_detail", authorization, async (req, res) => {
    try {
        const { vax_name, vax_date, name_of_provider, user_id } = req.body;
        const vaccineInUse = await pool.query("SELECT vax_name from vaccine_detail WHERE vax_name = $1 AND user_id =$2", [vax_name, req.user.id]);
        if (vaccineInUse.rows.length > 0) {
            return res.status(405).send("You already got this vaccine ");
        }

        const newVaccine = await pool.query(
            "INSERT INTO vaccine_detail (vax_name, vax_date,name_of_provider,user_id) VALUES ($1, $2, $3, $4) RETURNING *", [vax_name, vax_date, name_of_provider, req.user.id]



        );


        res.json(newVaccine.rows[0]);
    } catch (err) {
        console.log(err.message);
    }
});


router.put("/vaccine_detail/:id", authorization, async (req, res) => {
    try {
        const { id } = req.params;
        const { vax_name, vax_date, name_of_provider, user_id } = req.body;

        const Updatevaccine = await pool.query("UPDATE vaccine_detail SET vax_name = $1, vax_date = $2 , name_of_provider = $3 WHERE vax_id = $4 AND user_id = $5 RETURNING *", [vax_name, vax_date, name_of_provider, id, req.user.id]);


        if (Updatevaccine.rows.length == 0) {
            return res.json("This vaccine_information is not yours");
        }
        res.json("Vaccine_detail has been updated");

    }
    catch (err) {
        console.error(err.message);
    }
});




// Create profile information of parent 

router.post("/profile", authorization, async (req, res) => {
    try {
        const {  first_name, last_name, phone_number, email,dob,address,user_id } = req.body;
        const userInfo = await pool.query(" INSERT INTO profile(first_name,last_name,phone_number,email,DOB,Address,user_id) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *", [first_name, last_name, phone_number, email,dob,address,req.user.id]);

        res.json(userInfo.rows[0]);
    }
    catch (err) {
        console.error(err.message);
    }

});


// Update the profile information of parent

router.put("/profile/:id", authorization, async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, phone_number, email,dob,address, user_id } = req.body;

        const Updateprofile = await pool.query("UPDATE profile SET first_name = $1, last_name = $2 , phone_number = $3, email=$4,DOB=$5, Address=$6 WHERE profile_id = $7 AND user_id = $8 RETURNING *", [first_name, last_name, phone_number, email,dob,address, id, req.user.id]);


        if (Updateprofile.rows.length == 0) {
            return res.json("This not is your profile");
        }
        res.json("Your profile has been updated");

    }
    catch (err) {
        console.error(err.message);
    }
});


// Create the more information in the profile


router.post("/more_information", authorization, async (req, res) => {
try{      const { name, address, phone_number,blood_type,emergency,allergic,medicat,condition,number,provider,group,hospital,pharmacy ,user_id } = req.body;
        const Info = await pool.query(" INSERT INTO more_information(Primary_care_Doctor_name,Primary_care_Doctor_address,Primary_care_Doctor_phone_number,BLOOD_TYPE,Emergency_Contact,Allergies,Medication,Medical_Condition,Social_Security_Number,Insurance_Provider,Group_Number,Preferred_Hospital,Preferred_Pharmacy,user_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *", [name, address, phone_number,blood_type,emergency,allergic,medicat,condition,number,provider,group,hospital,pharmacy,req.user.id]);

        res.json(Info.rows[0]);
    }
    catch (err) {
        console.error(err.message);
    }

});


















// Add child 
router.post("/child", authorization, async (req, res) => {
    try {
        const { firstName, lastName, dateOfbirth } = req.body;

        if(getage(dateOfbirth) >= 18){
            return res.status(400).json({ message : "Users above 18 can create their own account "});
        }



        const user = await pool.query("SELECT * FROM child WHERE child_first_name =$1 AND child_last_name=$2 AND user_id=$3", [firstName, lastName, req.user.id]);


        if (user.rows.length != 0) {
            return res.status(401).send("Child already exist");
        }



        const newChild = await pool.query("INSERT INTO child (child_first_name,child_last_name,date_of_birth,user_id) VALUES($1,$2,$3,$4) RETURNING *", [firstName, lastName, dateOfbirth, req.user.id]);

        return res.json({ message: "child account created succssfuly", data: newChild.rows[0] });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
        console.log(err);
    }
});



// router.get("/",authorization,parent, async (req, res) =>{

//     try{
//         const allUsers = await pool.query("SELECT  FROM users ");
//         res.json(allUsers.rows);
//     } catch(err) {
//         //res.status(500).json({ message: "Server error" });
//         console.error(err.message);
//     }

// });



// create the vaccine for the child

router.post("/child/:id/vaccine_detail", authorization, async (req, res) => {
    try {
        const { id } = req.params;
        const { vax_name, vax_date, name_of_provider } = req.body;

        const childexist = await pool.query("SELECT * FROM child WHERE child_id =$1", [id]);
        if (childexist.rows.length <= 0) {
            return res.status(400).json({ message: "This child does not exist" });
        }
        const vaccineInUse = await pool.query("SELECT vax_name from vaccine_detail WHERE vax_name = $1 AND child_id =$2 AND  user_id=$3", [vax_name, id, req.user.id]);
        if (vaccineInUse.rows.length > 0) {
            return res.status(405).send("You already got this vaccine ");
        }

        const newVaccine = await pool.query(
            "INSERT INTO vaccine_detail (vax_name, vax_date,name_of_provider,child_id,user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *", [vax_name, vax_date, name_of_provider, id, req.user.id]
        );
        res.json(newVaccine.rows[0]);
    } catch (err) {
        console.log(err.message);
    }
});

//update the vaccine_detail of child

router.put("/child/:id1/vaccine_detail/:id", authorization, async (req, res) => {
    try {
        const {id1, id } = req.params;
        const { vax_name, vax_date, name_of_provider } = req.body;

        const Updatevaccine = await pool.query("UPDATE vaccine_detail SET vax_name = $1, vax_date = $2 , name_of_provider = $3 WHERE vax_id = $4 AND child_id = $5 RETURNING *", [vax_name, vax_date, name_of_provider, id, id1]);


       // if (Updatevaccine.rows.length == 0) {
       //     return res.json("This vaccine_information is not yours");
       // }
        res.json("Vaccine_detail has been updated");

    }
    catch (err) {
        console.error(err.message);
    }
});



//create the profile of child 

router.post("/child/:id/profile", authorization, async (req, res) => {
    try {
        const { id } = req.params;
        const {  first_name, last_name, phone_number, email,dob,address } = req.body;
        const userInfo = await pool.query(" INSERT INTO profile(first_name,last_name,phone_number,email,DOB,Address,user_id,child_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *", [first_name, last_name, phone_number, email,dob,address,req.user.id,id]);

        res.json(userInfo.rows[0]);
    }
    catch (err) {
        console.error(err.message);
    }

});



// update the profile of child

router.put("/child/:id1/profile/:id", authorization, async (req, res) => {
    try {
        const { id1, id } = req.params;
        const { first_name, last_name, phone_number, email,dob,address,child_id} = req.body;

        const Updateprofile = await pool.query("UPDATE profile SET first_name = $1, last_name = $2 , phone_number = $3, email=$4,DOB=$5, Address=$6 WHERE profile_id = $7 AND child_id = $8 RETURNING *", [first_name, last_name, phone_number, email,dob,address,id,id1]);


        if (Updateprofile.rows.length == 0) {
            return res.json("This not is your profile");
        }
        res.status(200).json({message:"Your profile has been updated"});

    }
    catch (err) {
        console.error(err.message);
        
    }
});







   



module.exports = router;