const router = require("express").Router();
const QR = require("./Controllers/qrgenerator");
// const InventryMaster = require("./Controllers/Inventry");

//QR 
// router.get("/", QR.myFunc);
router.get("/getQRlist", QR.getQRData);
router.get("/getQRlistbyItemNumber", QR.getQRlistbyItemNumberData);

//Inventry 
router.get("/inventryList", InventryMaster.getInventryList);
router.post("/inventryList", InventryMaster.addInventryData);
router.put("/inventryList", InventryMaster.updateInventryData);
router.delete("/inventryList", InventryMaster.deleteInventryData);


module.exports = router;
