const TestRequest = require("../models/TestRequest");
const TestRequestItem = require("../models/TestRequestItem");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const generateResultsPdf = require("../utils/generateResultsPdf");


// -----------Request (DOCTOR) -----------------

const createRequest = async (req , res) => {

try { 
    const {patientId , urgency , notes , testTypeIds } = req.body ;

    //check the patient 
    const patient = await User.findById(patientId) ;

    if (!patient || patient.role !== "patient")
        return res.status(404).json({msg : "patient not found"}) ; 


    //create the request 

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

    // ─── Send notification email to patient ────────────────────
    const urgencyText = urgency === "urgent" ? "⚠️ HIGH PRIORITY" : "Normal";
    
    await sendEmail(
      patient.email,
      `🧬 New Lab Test Request - ${urgencyText}`,
      `
        <h2>New Lab Test Request</h2>
        <p>Hi ${patient.name},</p>
        <p>Your doctor has ordered a new lab test for you.</p>
        <p><strong>Urgency:</strong> ${urgencyText}</p>
        <p><strong>Request ID:</strong> ${request._id}</p>
        <p><strong>Number of Tests:</strong> ${items.length}</p>
        ${notes ? `<p><strong>Doctor's Notes:</strong> ${notes}</p>` : ""}
        <p>Our laboratory will contact you shortly to arrange sample collection.</p>
        <p>Best regards,<br>LabTrack Team</p>
      `
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
        // ─── Technicians see unclaimed requests OR their own claimed requests ───────
        filter = {
          status: {
            $in: ["requested", "sample_collected", "processing", "results_ready"],
          },
          $or: [
            { technicianId: null },  // Unclaimed requests
            { technicianId: req.user.id }  // Their own claimed requests
          ]
        };
    }
  
  const requests = await TestRequest.find(filter)
    .populate("patientId" , "name email") 
    .populate("doctorId" , "name email")
    .populate("technicianId" , "name email")
    .sort({createdAt : -1})
  
    res.status(200).json ({requests}) ;
  } catch (error) {
    res.status(500).json({msg : "Server Error" , error : error.message})

    
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

    // ─── Technicians can only view unclaimed or their own assigned requests ───────
    if (req.user.role === "technician") {
      const isUnclaimed = !request.technicianId;
      const isAssignedToThisTechnician = request.technicianId?.toString() === req.user.id;
      
      if (!isUnclaimed && !isAssignedToThisTechnician) {
        return res.status(403).json({ msg: "Access denied - This request is claimed by another technician" });
      }
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

  const request = await TestRequest.findById(req.params.id)
    .populate("patientId", "name email")
    .populate("doctorId", "name email");

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

    // ─── Technicians can only update unclaimed or their own assigned requests ───────
    if (req.user.role === "technician") {
      const isUnclaimed = !request.technicianId;
      const isAssignedToThisTechnician = request.technicianId?.toString() === req.user.id;
      
      if (!isUnclaimed && !isAssignedToThisTechnician) {
        return res.status(403).json({ msg: "This request is already being worked on by another technician" });
      }
    }

    // ─── Assign technician when sample is collected ────────────
    if (status === "sample_collected") {
      request.technicianId = req.user.id;
    }

    // ─── Apply the new status ─────────────────────────────────
    request.status = status;
    await request.save();

    // ─── Send notification email to patient ────────────────────
    const statusMessages = {
      sample_collected: "Your lab test sample has been collected. We're now processing it.",
      processing: "Your test is currently being processed in the lab.",
      results_ready: "Your test results are ready for review.",
      reviewed: "Your test results have been reviewed by the doctor.",
      released: "Your test results have been released. You can now view them.",
    };

    const emailSubject = {
      sample_collected: "Lab Sample Collected ✓",
      processing: "Test in Progress 🔬",
      results_ready: "Results Ready 📋",
      reviewed: "Results Reviewed ✓",
      released: "Results Released 🎉",
    };

    const patientEmail = request.patientId.email;
    const patientName = request.patientId.name;

    let attachments = [];

    if (status === "results_ready") {
      const items = await TestRequestItem.find({ testRequestId: request._id })
        .populate("testTypeId", "name category normalRange unit");

      const pdfBuffer = await generateResultsPdf(request, items);

      attachments.push({
        filename: `LabResults-${request._id}.pdf`,
        content: pdfBuffer,
      });
    }

    await sendEmail(
      patientEmail,
      emailSubject[status],
      `
        <h2>Lab Test Update</h2>
        <p>Hi ${patientName},</p>
        <p>${statusMessages[status]}</p>
        <p><strong>Status:</strong> ${status.replace(/_/g, " ").toUpperCase()}</p>
        <p>Request ID: ${request._id}</p>
        <p>If you have any questions, please contact your doctor.</p>
        <p>Best regards,<br>LabTrack Team</p>
      `,
      attachments
    );

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

