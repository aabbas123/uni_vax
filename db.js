const Pool =require("pg").Pool

const pool = new Pool(
    {
        user:"postgres",
        password:"pppl1822",
        host:"localhost",
        port:5432,
        database:"univax"
    }
);

module.exports =pool; 