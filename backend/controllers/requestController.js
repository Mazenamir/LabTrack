const TestRequest = require("../models/TestRequest");
const TestRequestItem = require("../models/TestRequestItem");
const User = require("../models/User");


// -----------Request (DOCTOR) -----------------

const createRequest = async (req , res) => {

try { 
    const {patientId , urgency , notes , testTypeId } = req.body ;

    //check the patient 
    const patient = await User.findBy(patientId) ;

    if (!patient || patient.role !== "patient")
        return res.status(404).json({msg : "patient not found"}) ; 


    //crate the request 

    const request =  await testRequest.create({
        patientId,
        doctorId : req.user.id, // comes from token
      urgency,
      clinicalNotes    })


      const items = await Promise.all(
      testTypeIds.map((testTypeId) =>
        TestRequestItem.create({
          testRequestId: request._id,
          testTypeId,
        })
      )
    );
} 
catch {

}
}