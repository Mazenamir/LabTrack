const User = require("../models/User") ;
const jwt = require("jsonwebtoken");

// ─── Generate JWT Token ───────────────────────────────────────
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};



//Register 

const register = async (req ,res) => {

    try {
    const { name, email, password, role, specialization, phone } = req.body;
    
    const  findUser = await User.findOne({email}) ;

    if (findUser) {
        return res.status(400).json({msg : "E-Mail is used already"}) ;


    }

    const user = await User.create({
        name, email, password, role, specialization, phone,
    }) ; 

    res.status(201).json({msg :"User registered successfully"  , user }) ;

}
catch (error) {
    res.status(500).json({msg : "Server Error" , error : error.message}) ;
}
} ;



// Login
const login = async (req , res) => {
    try {
        const {email , password} = req.body ;

        const user = await User.findOne({email})
        if (!user){
            return res.status(400).json({msg :"invailed E-mail or password"})

        }

        if (!user.isActive){
            return res.status(400).json({msg :"Account isn't Active"})
            
        }

        //Check the password

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
    } catch (error) {
        res.status(500).json({msg : "Server Error" , error : error.message});
    }
};

module.exports = {
    register , login
};