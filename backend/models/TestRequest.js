const mongoose = require("mongoose") ;

const testRequestSchema = new mongoose.Schema({ 
patientId : {
    type : mongoose.Schema.Types.ObjectId , 
    ref : "User"  ,
    required : true , 
} , 

doctorId : {
    type  : mongoose.Schema.Types.ObjectId ,
    ref : "User" , 
    required : true ,
} , 
technicianId : {
    type  : mongoose.Schema.Types.ObjectId ,
    ref : "User" , 
    required : false , // ← Changed to false (will be assigned later)
} ,
status : {
    type : String , 
    enum : [
        "requested",
        "sample_collected",
        "processing",
        "results_ready",
        "reviewed",
        "released",
    ] ,
    default :  "requested" ,
} ,
urgency: {
      type: String,
      enum: ["normal", "urgent"],
      default: "normal",
    },
notes : {
    type : String  , 
    default : null , 

},

},{timestamps : true}) ;


const TestRequest = mongoose.model("TestRequest" , testRequestSchema)

module.exports = TestRequest ; 