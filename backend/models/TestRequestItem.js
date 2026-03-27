const mongoose = require("mongoose") ;

const tesrRequestItemSchema = new mongoose.Schema(

{
testRequestId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "TestRequest" , 
        required : true ,
    } , 

    testTypeId : {
        type : mongoose.Schema.Types.ObjectId , 
        ref : "TestType" , 
        required : true , 

    }  ,
    resultValue : { 
        type : Number , 
        required : false , 
        trim : true , 
        default : null ,

    } , 
    resultFile: {
      type: String,
      default: null,
    },
    notes : {
        type  : String , 
        trim  : true , 
        default : null ,  
    }
} , 
{timestamps : true})


const testRequestItem = mongoose.model ("testRequestItem" , tesrRequestItemSchema)

module.exports = testRequestItem ; 


