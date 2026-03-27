const express = require("express") ;
const router = express.Router() ;
const {createRequest , listRequests, getRequest ,updateStatus , updateItemResult} = require("../controllers/requestController") ;
const { verifyToken } = require("../middleware/userMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");




router.post ("/" , verifyToken , allowRoles("doctor") , createRequest) ;


router.get("/" , verifyToken , listRequests) ; 

router.get("/:id", verifyToken, getRequest);   // use :id for single request

router.patch("/:id/status", verifyToken, allowRoles("doctor", "technician"), updateStatus);

router.patch("/item/:itemId/result", verifyToken, allowRoles("technician"), updateItemResult);
module.exports  = router ;
