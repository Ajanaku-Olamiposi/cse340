const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId); // For classification view
router.get("/detail/:inv_id", invController.buildSingleView); // For single vehicle view
router.get("/trigger-error", invController.triggerError);

module.exports = router;