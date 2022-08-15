const Pool = require("pg").Pool


const pool = new Pool(
    {
        user: process.env.dbuser || "postgres",
        password: process.env.dbpassword || "pppl1822",
        host: process.env.dbhost || "localhost",
        port: process.env.dbport || 5432,
        database: process.env.dbname || "univax",
      // ssl: {    /* <----- Add SSL option */
      //   rejectUnauthorized: false,
      // }
    }

);

module.exports = pool; 