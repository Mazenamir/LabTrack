const mongoose = require ("mongoose") ;
const testTypeSchema = new mongoose.Schema({

    name : {
        type : String ,
        required : true ,
        trim : true ,
        unique : true ,
    } , 

    category  : { 
        type : String  , 
        required : true ,
        trim  : true ,
    },
    description : {
        type : String , 
        default : null ,

    }, 

    normalRange : {
        type : String , 
        default : null ,
    },
    unit  : {
        type : String , 
        default  : null , 
    },
     turnaroundDays: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const TestType = mongoose.model("TestType",testTypeSchema)

module.exports = TestType