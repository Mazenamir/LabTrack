const mongoose = require("mongoose") ;

const tesrRequestItemSchema = new mongoose.Schema(

{
testRequestId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "testRequest" , 
        required : true ,
    } , 

    testTypeId : {
        type : mongoose.Schema.Types.ObjectId , 
        ref : "testTypes" , 
        required : true , 

    }  ,
    resultValue : { 
        type : String , 
        required : true , 
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


const testRequestItem = mongoose.model ("tesrRequestItem" , tesrRequestItemSchema)

modules.exports = testRequestItem ; 


