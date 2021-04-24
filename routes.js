const router = require("express").Router();
const QR = require("./Controllers/qrgenerator");
const InventryMaster = require("./Controllers/Inventry");
const AuthMaster = require("./Controllers/Auth");
//QR 
// router.get("/", QR.myFunc);
router.get("/getQRlist", QR.getQRData);
router.get("/getQRlistbyItemNumber", QR.getQRlistbyItemNumberData);

//Inventry 
router.get("/inventryList", InventryMaster.getInventryList);
router.post("/inventryList", InventryMaster.addInventryData);
router.put("/inventryList", InventryMaster.updateInventryData);
router.delete("/inventryList", InventryMaster.deleteInventryData);

//Authentication -Login

router.get("/users", AuthMaster.getUsersList);
router.get("/login", AuthMaster.Login);

//Authentication -SignUp
router.post("/sendOTP", AuthMaster.sendOTP);
router.post("/validateOTP", AuthMaster.validateOTP);
router.post("/registration", AuthMaster.registration);

//Authentication -Forgot Password
router.get("/forgotPassword", AuthMaster.forgotPassword);
router.put("/newpassword", AuthMaster.newPassword);

module.exports = router;
