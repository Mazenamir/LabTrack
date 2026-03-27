const TestRequest = require("../models/TestRequest");
const TestRequestItem = require("../models/TestRequestItem");
const User = require("../models/User");


// -----------Request (DOCTOR) -----------------

const createRequest = async (req , res) => {

try { 
    const {patientId , urgency , notes , testTypeIds } = req.body ;

    //check the patient 
    const patient = await User.findById(patientId) ;

    if (!patient || patient.role !== "patient")
        return res.status(404).json({msg : "patient not found"}) ; 


    //crate the request 

    const request =  await TestRequest.create({
        patientId,
        doctorId : req.user.id, // comes from token
      urgency,
      notes    })


      const items = await Promise.all(
      testTypeIds.map((testTypeId) =>
        TestRequestItem.create({
          testRequestId: request._id,
          testTypeId,
        })
      )
    );

    res.status(201).json({msg : "Request created successfully", request, items});
  } 
  catch (error) {
    res.status(500).json({msg : "Server Error" , error : error.message}) ;
  }
};


// ----- 2. listRequests

const listRequests = async (req , res) => {
  try {
    
    let filter = {} ;
  
    if (req.user.role === "doctor") {
      filter = {doctorId : req.user.id}
    } else if (req.user.role === "patient") {
      filter = {patientId : req.user.id}
    } else if (req.user.role === "technician") {
        filter = {
          status: {
            $in: ["requested", "sample_collected", "processing", "results_ready"],
          },
        };
    }
  
  const requests = await TestRequest.find(filter)
    .populate("patientId" , "name email") 
    .populate("doctorId" , "name email")
    .populate("technicianId" , "name email")
    .sort({createdAt : -1})
  
    res.status(200).json ({requests}) ;
  } catch (error) {
    res.status(500).json({msq : "Server Error" , error : error.message})

    
  }

}



// ─── Get Single Request ────────────────────────────────────────
const getRequest = async (req, res) => {
  try {
    let request = await TestRequest.findById(req.params.id)
      .populate("patientId", "name email phone")
      .populate("doctorId", "name email specialization")
      .populate("technicianId", "name email");

    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }

    if (
      req.user.role === "doctor" &&
      request.doctorId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: "Access denied" });
    }

    if (
      req.user.role === "patient" &&
      request.patientId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const items = await TestRequestItem.find({
      testRequestId: request._id,
    }).populate("testTypeId", "name category normalRange unit");

    res.status(200).json({ request, items });

  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};




// ─── Update Request Status (State Machine) ────────────────────

const updateStatus = async (req , res) => {
try {
  const {status , techinicianId} = req.body

  const request = await TestRequest.findById(req.params.id) ;

  if (!request) {
    return  res.status(404) .json ({msg : "request not found"}) ;
  }
// ─── Define allowed transitions ───────────────────────────
    const transitions = {
      requested:        "sample_collected",
      sample_collected: "processing",
      processing:       "results_ready",
      results_ready:    "reviewed",
      reviewed:         "released",
    };

  const expectedNext = transitions[request.status];

  // ─── Check if transition is valid ─────────────────────────
    if (status !== expectedNext) {
      return res.status(400).json({
        msg: `Invalid status transition. Current: "${request.status}" → Expected next: "${expectedNext}"`,
      });
    }

    // ─── Role checks per transition ───────────────────────────
    const technicianStages = ["sample_collected", "processing", "results_ready"];
    const doctorStages = ["reviewed", "released"];

    if (technicianStages.includes(status) && req.user.role !== "technician") {
      return res.status(403).json({ msg: "Only technicians can update this stage" });
    }

    if (doctorStages.includes(status) && req.user.role !== "doctor") {
      return res.status(403).json({ msg: "Only doctors can update this stage" });
    }

    // ─── Assign technician when sample is collected ────────────
    if (status === "sample_collected") {
      request.technicianId = req.user.id;
    }

    // ─── Apply the new status ─────────────────────────────────
    request.status = status;
    await request.save();

    res.status(200).json({ msg: "Status updated successfully", request });


} catch (error) {
      res.status(500).json({ msg: "Server Error", error: error.message });

}



}


// ─── Update Single Item Result (TECHNICIAN) ──────────────────
const updateItemResult = async (req, res) => {
  try {
    const { resultValue, notes } = req.body;
    const { itemId } = req.params;

    const item = await TestRequestItem.findByIdAndUpdate(
      itemId,
      { 
        resultValue, 
        notes,
      },
      { new: true }
    ).populate("testTypeId", "name unit normalRange");

    if (!item) {
      return res.status(404).json({ msg: "Test item not found" });
    }

    res.status(200).json({ msg: "Result updated successfully", item });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

module.exports = { createRequest, listRequests, getRequest , updateStatus , updateItemResult};

