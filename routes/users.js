const router = require("express").Router();
const authorization = require("../middleware/authorization");

const pool = require("../db");
const getage =require("../utils/getDays");


router.get("",async (req, res) => {
    try{
        const users =await pool.query("SELECT * from users");
        return res.status(200).json({users:users.rows});

    }  catch(err){
        return res.status(500).json({message : "server error"});
    }
})

router.get("/:id",async(req,res) => {
    try{
        const{id} = req.params;
        const user = await pool.query("SELECT * FROM users WHERE user_id=$1",[id]);
        
        return res.status(200).json({user:user.rows});
        

    }catch(err){
        console.log(err.message)
        return res.status(500).json({message: "sever error"});
    }

})

router.delete("/users/:id",async(req, res) => {
    try{
        const { id } = req.params;
        const deletuser = await pool.query(" DELETE FROM users WHERE user_id =$1",[id]);
        res.json("User has been deleted ");
    }catch(err){
      console.error(err.message);
    }
})
// crud for children

module.exports = router;