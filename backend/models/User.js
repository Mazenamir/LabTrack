const mongoose = require("mongoose") ;
const bcrypt = require('bcrypt');



const userSchema = new  mongoose.Schema( {
    name : {
        type : String ,
        required : true ,
        trim : true
    } , 

    email : {
        type : String ,
        required : true ,
        trim : true ,
        unique : true ,
        lowercase : true ,
    },

    password : {
        type : String , 
        requiredd : true ,

    } ,

    role : {
        type : String ,
        required : true ,
        enum: ["admin", "doctor", "technician", "patient"],
        default : "patient"
    },
    specialization : {
        type : String  , 
        default : null ,

    },
    phone : { 
        type : String , 
        default : null  , 
    } ,
    isActive: {
      type: Boolean,
      default: true,
    },
},{timestamps : true})

// hash password before save
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return ;
//   const salt = await bcrypt.genSalt(12);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;  // early return — no next needed

  const salt = await bcrypt.genSalt(12);     // bump to 12 (recommended 2026 default)
  this.password = await bcrypt.hash(this.password, salt);
  // Mongoose waits automatically — no next() call
});

// compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;