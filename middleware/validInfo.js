module.exports = (req, res, next) => {
    const {userName, email,phoneNumber, password,firstName,lastName,dateOfbirth,home,country } = req.body;
  
    function validEmail(userEmail) {
      return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail);
    }
  
    if (req.path === "/register") {
      
      if (![userName,email,phoneNumber , password,firstName,lastName,dateOfbirth,home,country].every(Boolean)) {
        return res.status(400).json("Missing Credentials");
      } else if (!validEmail(email)) {
        return res.status(400).json("Invalid Email");
      }
    } else if (req.path === "/login") {
      if (![email, password].every(Boolean)) {
        return res.status(400).json("Missing Credentials");
      } else if (!validEmail(email)) {
        return res.status(400).json("Invalid Email");
      }
    }
  
    next();
  };         