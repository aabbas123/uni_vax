const router = require("express").Router();
const authorization = require("../middleware/authorization");
//const bcrypt = require("bcrypt");
const bcrypt = require('bcryptjs');
//const authorize = require("../middleware/authorize");
const pool = require("../db");
const getDays = require("../utils/getDays");





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
        const { vax_name, vax_date, name_of_provider } = req.body;

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







// Update the profile information of parent

router.put("/user/:user_id/profile/:profile_id", authorization, async (req, res) => {
    try {
        const { user_id, profile_id } = req.params;
        const { first_name, last_name,dateOfbirth,gender, address,country } = req.body;

        const Updateprofile = await pool.query("UPDATE profile SET first_name = $1, last_name = $2 ,date_of_birth=$3, gender = $4,  home_address=$5, country_state=$6 WHERE profile_id = $7 AND user_id = $8 RETURNING *", [first_name, last_name,dateOfbirth,gender,address,country, profile_id, req.user.id]);


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

    try {


        const { name, address, phone_number, blood_type, emergency, allergic, medicat, condition, number, provider, group, hospital, pharmacy, user_id } = req.body;
        const Info = await pool.query(" INSERT INTO more_information(Doctor_name,Doctor_address,Doctor_phone_number,BLOOD_TYPE,Emergency_Contact,Allergies,Medication,Medical_Condition,Social_Security_Number,Insurance_Provider,Group_Number,Preferred_Hospital,Preferred_Pharmacy,user_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *", [name, address, phone_number, blood_type, emergency, allergic, medicat, condition, number, provider, group, hospital, pharmacy, req.user.id]);

        res.json(Info.rows[0]);
    }
    catch (err) {
        console.error(err.message);
    }

});




// Update the more information

router.put("/more_information/:id", authorization, async (req, res) => {
    try {
        const { id } = req.params;

        const { name, address, phone_number, blood_type, emergency, allergic, medicat, condition, number, provider, group, hospital, pharmacy } = req.body;
        const Info = await pool.query(" UPDATE more_information SET Doctor_name=$1,Doctor_address=$2,Doctor_phone_number=$3,BLOOD_TYPE=$4,Emergency_Contact=$5,Allergies=$6,Medication=$7,Medical_Condition=$8,Social_Security_Number=$9,Insurance_Provider=$10,Group_Number=$11,Preferred_Hospital=$12,Preferred_Pharmacy=$13 WHERE more_information_id=$14 AND user_id=$15 RETURNING *", [name, address, phone_number, blood_type, emergency, allergic, medicat, condition, number, provider, group, hospital, pharmacy, id, req.user.id]);

        if (Info.rows.length == 0) {
            return res.json("This not is your information");
        }
        res.json("Your information has been updated");
    }
    catch (err) {
        console.error(err.message);
    }

});












// Add child 
router.post("/family", authorization, async (req, res) => {
    try {
        const { firstName, lastName, dateOfbirth } = req.body;

        //  if(getage(dateOfbirth) >= 18){
        //    return res.status(400).json({ message : "Users above 18 can create their own account "});
        //





        const user = await pool.query("SELECT * FROM family WHERE first_name =$1 AND last_name=$2 AND user_id=$3", [firstName, lastName, req.user.id]);


        if (user.rows.length != 0) {
            return res.status(401).send(" Member already exist");
        }



        const newMember = await pool.query("INSERT INTO family (first_name,last_name,date_of_birth,user_id) VALUES($1,$2,$3,$4) RETURNING *", [firstName, lastName, dateOfbirth, req.user.id]);

        return res.json({ message: " Account created succssfuly", data: newMember.rows[0] });
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

router.post("/family/:id/vaccine_detail", authorization, async (req, res) => {
    try {
        const { id } = req.params;
        const { vax_name, vax_date, name_of_provider } = req.body;

        const memberExist = await pool.query("SELECT * FROM family WHERE family_id =$1", [id]);
        if (memberExist.rows.length <= 0) {
            return res.status(400).json({ message: "This Family member does not exist" });
        }
        const vaccineInUse = await pool.query("SELECT vax_name from vaccine_detail WHERE vax_name = $1 AND family_id =$2 AND  user_id=$3", [vax_name, id, req.user.id]);
        if (vaccineInUse.rows.length > 0) {
            return res.status(405).send("You already got this vaccine ");
        }

        const newVaccine = await pool.query(
            "INSERT INTO vaccine_detail (vax_name, vax_date,name_of_provider,family_id,user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *", [vax_name, vax_date, name_of_provider, id, req.user.id]
        );
        res.json(newVaccine.rows[0]);
    } catch (err) {
        console.log(err.message);
    }
});

//update the vaccine_detail of child

router.put("/family/:family_id/vaccine_detail/:id", authorization, async (req, res) => {
    try {
        const { family_id, id } = req.params;
        const { vax_name, vax_date, name_of_provider } = req.body;

        const Updatevaccine = await pool.query("UPDATE vaccine_detail SET vax_name = $1, vax_date = $2 , name_of_provider = $3 WHERE vax_id = $4 AND family_id = $5 RETURNING *", [vax_name, vax_date, name_of_provider, id, family_id]);


        if (Updatevaccine.rows.length == 0) {
            return res.json("This vaccine_information is not yours");
        }
        res.json("Vaccine_detail has been updated");

    }
    catch (err) {
        console.error(err.message);
    }
});



//create the profile of child 

router.post("/family/:id/profile", authorization, async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name,dateOfbirth,gender, address,country } = req.body;
        const userInfo = await pool.query(" INSERT INTO profile(first_name,last_name,date_of_birth,gender,home_address,country_state,user_id,family_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *", [first_name, last_name, dateOfbirth,gender, address, country, req.user.id, id]);

        res.json(userInfo.rows[0]);
    }
    catch (err) {
        console.error(err.message);
    }

});



// update the profile of child

router.put("/family/:family_id/profile/:profile_id", authorization, async (req, res) => {
    try {
        const { family_id, profile_id } = req.params;
        const { first_name, last_name, dateOfbirth, address, country } = req.body;

        const Updateprofile = await pool.query("UPDATE profile SET first_name = $1, last_name = $2 , date_of_birth = $3, home_address=$4,country_state=$5 WHERE profile_id = $7 AND family_id = $8 RETURNING *", [first_name, last_name, dateOfbirth, address, country, family_id, profile_id]);


        if (Updateprofile.rows.length == 0) {
            return res.json("This not is your profile");
        }
        res.status(200).json({ message: "Your profile has been updated" });

    }
    catch (err) {
        console.error(err.message);

    }
});




router.post("/family/:id/more_information", authorization, async (req, res) => {

    try {
        const { id } = req.params;

        const { name, address, phone_number, blood_type, emergency, allergic, medicat, condition, number, provider, group, hospital, pharmacy, family_id } = req.body;
        const Info = await pool.query(" INSERT INTO more_information(Doctor_name,Doctor_address,Doctor_phone_number,BLOOD_TYPE,Emergency_Contact,Allergies,Medication,Medical_Condition,Social_Security_Number,Insurance_Provider,Group_Number,Preferred_Hospital,Preferred_Pharmacy,family_id,user_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *", [name, address, phone_number, blood_type, emergency, allergic, medicat, condition, number, provider, group, hospital, pharmacy, id, req.user.id]);

        res.json(Info.rows[0]);
    }
    catch (err) {
        console.error(err.message);
    }

});


router.post("/appointment", authorization, async (req, res) => {

    try {
        const { id } = req.user;
        const { date, name, location } = req.body;
        if (!date || !name || !location) {
            return res.status(400).json({ message: "All fields required" });
        }
        const apt = await pool.query("SELECT * FROM appointment WHERE apt_date=$1 AND apt_vax_name = $2 AND user_id=$3 ", [date, name, id]);
        if (apt.rows.length != 0) {
            return res.status(400).json({ message: "Your appointment is already scheduled " })
        }
        const newApt = await pool.query("INSERT INTO appointment (apt_date,apt_vax_name,apt_location,user_id) VALUES($1,$2,$3,$4)", [date, name, location, id]);

        return res.status(201).json({ message: "Your appointment has been scheduled successfully" });

    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ message: "server error" });
    }

});

router.get("/appointment", authorization, async (req, res) => {

    try {
        const { id } = req.user;
        
        
        const apt = await pool.query("SELECT * FROM appointment WHERE user_id=$1 ", [id]);
        
        

        return res.status(201).json({ appointments: apt.rows });

    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ message: "server error" });
    }

});

router.get("/appointment/:id", authorization, async (req, res) => {

    try {
        const user_id= req.user.id;
        const appointment_id=req.params.id;
        
        
        const apt = await pool.query("SELECT * FROM appointment WHERE user_id=$1 AND appointment_id =$2", [user_id,appointment_id]);
       // if(getDays(apt.rows[0].apt_date) <=7  ){      
      //  }
      apt.rows[0].remainingDays=getDays(apt.rows[0].apt_date);
        return res.status(201).json(apt.rows[0]);

    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ message: "server error" });
    }

});


router.post("/family/:family_id/appointment", authorization, async (req, res) => {

    try {
        const { family_id } = req.params;
        const { date, name, location } = req.body;
        if (!date || !name || !location) {
            return res.status(400).json({ message: "All fields required" });
        }
        const apt = await pool.query("SELECT * FROM appointment WHERE apt_date=$1 AND apt_vax_name = $2 AND family_id=$3 ", [date, name, family_id]);
        if (apt.rows.length != 0) {
            return res.status(400).json({ message: "Your appointment is already scheduled " })
        }
        const newApt = await pool.query("INSERT INTO appointment (apt_date,apt_vax_name,apt_location,family_id,user_id) VALUES($1,$2,$3,$4,$5)", [date, name, location, family_id,req.user.id]);

        return res.status(201).json({ message: "Your appointment has been scheduled successfully" });

    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ message: "server error" });
    }

});





module.exports = router;