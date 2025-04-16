const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { validationResult } = require("express-validator");

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

// management view, add vehicle, add classification
invCont.buildAddClassView = async function (req, res, next){
    let nav = await utilities.getNav()
    res.render("./inventory/addClassification", {
        title: "Add Classification",
        nav,
        errors: null,
    })
}

invCont.buildDelClassView = async function (req, res, next){
  let nav = await utilities.getNav()
  res.render("./inventory/delClassification", {
      title: "Delete Classification",
      nav,
      errors: null,
  })
}
invCont.buildAddInventoryView = async function (req, res, next){
  const classificationList = await utilities.buildClassificationList(req.body?.classification_id || null);
    let nav = await utilities.getNav()
    res.render("./inventory/addInventory", {
        title: "Add Vehicle",
        nav,
        classificationList,
        errors: null,
    })
}
invCont.buildManagementView = async function (req, res, next){
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()
    res.render("./inventory/management", {
        title: "Vehicle Management",
        nav,
        classificationSelect,
        errors: null,
    })
}

invCont.addClass = async (req, res) => {
  const { classification_name } = req.body; // Extract classification name from the request body

  try {
    // Attempt to insert the classification into the database
    const success = await invModel.addClassification(classification_name);

    // Refresh navigation
    const nav = await utilities.getNav();

    if (success) {
      // On success, set a success flash message and redirect to inventory page
      req.flash("success", `Classification '${classification_name}' added successfully!`);
      return res.redirect("/inv"); // Redirect to inventory management
    } else {
      // On failure, set a notice flash message and redirect back
      req.flash("notice", `Failed to add classification '${classification_name}'. Please try again.`);
      return res.redirect("/inv");
    }
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error in addClass:", error.message);

    // Handle unexpected errors gracefully
    req.flash("notice", "An unexpected error occurred. Please try again.");
    return res.redirect("/inv"); // Redirect to inventory management
  }
};
  invCont.delClass = async (req, res) => {
    try {
      // Extract classification_name from the request body
      const { classification_name } = req.body;
  
      // Validate that classification_name is provided
      if (!classification_name || classification_name.trim() === "") {
        req.flash("notice", "Classification name is required.");
        return res.redirect("/inv");
      }
  
      // Attempt to delete the classification from the database
      const deleteResult = await invModel.deleteClassificationByName(classification_name);
  
      if (deleteResult) {
        // If deletion is successful
        req.flash("success", `Classification '${classification_name}' deleted successfully!`);
        res.redirect("/inv");
      } else {
        // If deletion fails (e.g., classification not found)
        req.flash("notice", `Failed to delete classification '${classification_name}'. It may not exist.`);
        res.redirect("/inv");
      }
    } catch (error) {
      // Handle unexpected errors gracefully
      console.error("Error in deleteClassByName:", error.message);
      req.flash("notice", "An unexpected error occurred. Please try again.");
      res.redirect("/inv");
    }
  };


// 
invCont.addInventory = async (req, res) => {
  const {
    classification_id, // Include classification_id from the form
    inv_make,
    inv_model,
    inv_year,
    inv_price,
    inv_miles,
    inv_color,
    inv_description,
    inv_image,
    inv_thumbnail,
  } = req.body;

  try {
    const errors = validationResult(req); // Collect validation errors
    if (!errors.isEmpty()) {
      const nav = await utilities.getNav();
      const classificationList = await utilities.buildClassificationList(); // Fetch classification list
      return res.render("inventory/addInventory", {
        title: "Add Vehicle",
        nav,
        classificationList,
        errors,
        stickyData: req.body, // Preserve user input
      });
    }

    // Insert inventory into the database
    const success = await invModel.addInventory({
      classification_id, // Include classification_id
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      inv_miles,
      inv_color,
      inv_description,
      inv_image,
      inv_thumbnail,
    });

    const nav = await utilities.getNav();
    if (success) {
      req.flash("success", "Inventory item added successfully!");
      return res.redirect("/inv");
    } else {
      const classificationList = await utilities.buildClassificationList();
      return res.render("inventory/addInventory", {
        title: "Add Vehicle",
        nav,
        classificationList,
        errors: {
          array: () => [{ msg: "Failed to add inventory item. Please try again." }],
        },
      });
    }
  } catch (error) {
    console.error("Error in addInventory:", error);
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    return res.render("inventory/addInventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors: {
        array: () => [{ msg: "An unexpected error occurred. Please try again." }],
      },
    });
  }
};


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = (await invModel.getInventoryByVehicleId(inv_id))[0];
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}


/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

// Build delete inventory view
invCont.deleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = (await invModel.getInventoryByVehicleId(inv_id))[0];
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
    classification_id: itemData.classification_id
  })
}


// Delete inventory 
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price,
    classification_id
  } = req.body
  const deleteResult = await invModel.deleteInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price,
    classification_id
  )

  if (deleteResult) {
    // const itemName = deleteResult.inv_make + " " + deleteResult.inv_model
    req.flash("notice", `The Vehicle was successfully deleted.`)
    res.redirect("/inv/")
  } else {
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the deletion failed.")
    res.status(501).render("inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price,
    classification_id
    })
  }
}


const jwt = require("jsonwebtoken");

invCont.checkAdminOrEmployee = async function(req, res, next) {
    const token = req.cookies.jwt; // Assuming the JWT token is stored in cookies
    if (!token) {
        req.flash("notice", "You must be logged in to access this page.");
        return res.redirect("/account/login");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const accountType = decodedToken.account_type; // Extract the account type from the JWT payload

        // Allow access only if account type is "Employee" or "Admin"
        if (accountType === "Employee" || accountType === "Admin") {
            req.account = decodedToken; // Pass the decoded token to the request for further use
            next();
        } else {
            req.flash("notice", "You do not have permission to access this page.");
            res.redirect("/account/login");
        }
    } catch (error) {
        console.error("JWT verification error:", error);
        req.flash("notice", "Invalid token. Please log in again.");
        res.redirect("/account/login");
    }
}

module.exports = invCont