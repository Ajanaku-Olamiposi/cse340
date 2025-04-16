const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const regValidate = require('../utilities/inventory-validation')

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId); // For classification view
router.get("/detail/:inv_id", invController.buildSingleView); // For single vehicle view
router.get("/trigger-error", invController.triggerError);

// Route to build management view and add view
router.get('/',invController.checkAdminOrEmployee, utilities.handleErrors(invController.buildManagementView));
router.get('/addClassification', invController.checkAdminOrEmployee, utilities.handleErrors(invController.buildAddClassView));
router.get('/delClassification', invController.checkAdminOrEmployee, utilities.handleErrors(invController.buildDelClassView));

router.get('/addInventory', invController.checkAdminOrEmployee, utilities.handleErrors(invController.buildAddInventoryView));
router.get("/getInventory/:classification_id", invController.checkAdminOrEmployee, utilities.handleErrors(invController.getInventoryJSON));
router.get("/edit/:inv_id", invController.checkAdminOrEmployee, utilities.handleErrors(invController.editInventoryView));
router.get("/delete/:inv_id", invController.checkAdminOrEmployee, utilities.handleErrors(invController.deleteInventoryView));

router.post("/update/", regValidate.inventoryRules(),
regValidate.checkUpdateData,utilities.handleErrors(invController.updateInventory))

router.post("/delete/",utilities.handleErrors(invController.deleteInventory))


router.post(
    "/addClassification",
    regValidate.classRules(),
    regValidate.checkClassData,
    utilities.handleErrors(invController.addClass)
)

router.post(
    "/delClassification",
    regValidate.delClassRules(),
    regValidate.checkDelClassData,
    utilities.handleErrors(invController.delClass)
)

router.post(
    "/addInventory",
    regValidate.inventoryRules(),
    regValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
)

module.exports = router;