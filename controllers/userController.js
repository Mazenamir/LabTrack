const User = require("../models/User") ;

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

module.exports = {
    register
};