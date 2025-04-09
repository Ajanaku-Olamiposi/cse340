const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}
/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next){
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    })
}
/* ***************************
 *  Build inventory by single view
 * ************************** */
invCont.buildSingleView = async function (req, res, next){
    const vehicle_id = req.params.inv_id
    const data = await invModel.getInventoryByVehicleId(vehicle_id)
    const singleView = await utilities.buildSingleView(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name;
    res.render("./inventory/singleView", {
        title: className + " vehicles",
        nav,
        singleView,
    })
}

// Add this method to invController
invCont.triggerError = async function (req, res, next){
    res.render("./inventory/singleView", {
        title: className + " vehicles",
        nav,
        singleView,
    })
}

module.exports = invCont