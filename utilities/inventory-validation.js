const invModel = require("../models/inventory-model")
const utilities = require(".")
  const { body, validationResult } = require("express-validator")
  const validate = {}

  validate.classRules = () => {
    return [
      body("classification_name")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Classification name cannot be empty.")
        .matches(/^[a-zA-Z0-9]+$/)
        .withMessage("Classification name must not contain spaces or special characters.")
        .custom(async (classification_name) => {
          const exists = await invModel.checkExistingClassification(classification_name); // Check if classification name already exists
          if (exists) {
            throw new Error("Classification name already exists. Please choose another.");
          }
        }),
    ];
  };

  validate.delClassRules = () => {
    return [
      body("classification_name")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Classification name cannot be empty.")
        .matches(/^[a-zA-Z0-9]+$/)
        .withMessage("Classification name must not contain spaces or special characters.")
        .custom(async (classification_name) => {
          const exists = await invModel.checkExistingClassification(classification_name); // Check if classification name already exists
          if (!exists) {
            throw new Error("Classification name does not exist. Please choose another.");
          }
        }),
    ];
  };
  
  validate.checkClassData = async (req, res, next) => {
    const { classification_name } = req.body;
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      const nav = await utilities.getNav(); // Fetch navigation data
      return res.render("inventory/addClassification", {
        errors,
        title: "Add Classification",
        nav,
        classification_name, // Pre-fill input for user convenience
      });
    }
  
    next(); // Proceed if no errors
  };


  validate.checkDelClassData = async (req, res, next) => {
    const { classification_name } = req.body;
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      const nav = await utilities.getNav(); // Fetch navigation data
      return res.render("inventory/delClassification", {
        errors,
        title: "Delete Classification",
        nav,
        classification_name, // Pre-fill input for user convenience
      });
    }
  
    next(); // Proceed if no errors
  };

validate.inventoryRules = () => {
  return [
    // Classification ID
    body("classification_id")
      .notEmpty()
      .withMessage("Classification must be selected.")
      .isInt()
      .withMessage("Classification ID must be a valid integer."),

    // Make
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Make cannot be empty.")
      .matches(/^[a-zA-Z ]+$/)
      .withMessage("Make must contain only alphabetic characters and spaces."),

    // Model
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Model cannot be empty.")
      .matches(/^[a-zA-Z ]+$/)
      .withMessage("Model must contain only alphabetic characters and spaces."),

    // Year
    body("inv_year")
      .notEmpty()
      .withMessage("Year cannot be empty.")
      .isInt({ min: 1900, max: new Date().getFullYear() })
      .withMessage(`Year must be between 1900 and ${new Date().getFullYear()}.`),

    // Price
    body("inv_price")
      .notEmpty()
      .withMessage("Price cannot be empty.")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),

    // Miles
    body("inv_miles")
      .notEmpty()
      .withMessage("Miles cannot be empty.")
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive integer."),

    // Color
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Color cannot be empty.")
      .matches(/^[a-zA-Z]+$/)
      .withMessage("Color must contain only alphabetic characters."),

    // Description
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Description cannot be empty.")
      .isLength({ max: 500 })
      .withMessage("Description must be less than 500 characters."),
    // Image Path
    body("inv_image")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Image path cannot be empty."),
      // .matches(/^\/images\/.+$/)
      // .withMessage("Image path must start with '/images/'."),

    // Thumbnail Path
    body("inv_thumbnail")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Thumbnail path cannot be empty.")
      // .matches(/^\/images\/.+$/)
      // .withMessage("Thumbnail path must start with '/images/'."),
  ];
};

validate.checkInventoryData = async (req, res, next) => {
    const errors = validationResult(req);
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color, } = req.body;
  
    if (!errors.isEmpty()) {
      const nav = await utilities.getNav(); // Fetch navigation bar
      const classificationList = await utilities.buildClassificationList(req.body.classification_id);
  
      return res.render("./inventory/addInventory", {
        errors,
        title: "Add Vehicle",
        nav,
        classificationList,
        inv_make,
        inv_model,
        inv_year, inv_description, inv_image, inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
      });
    }
  
    next(); // Proceed if no validation errors
  };

  validate.checkUpdateData = async (req, res, next) => {
    const errors = validationResult(req);
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color, inv_id } = req.body;
  
    if (!errors.isEmpty()) {
      const nav = await utilities.getNav(); // Fetch navigation bar
      const classificationSelect = await utilities.buildClassificationList(req.body.classification_id);
  
      return res.render("./inventory/edit-Inventory", {
        errors,
        title: `Edit ${inv_make} ${inv_model}`,
        nav,
        classificationSelect,
        inv_make,
        inv_model,
        inv_year, inv_description, inv_image, inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        inv_id
      });
    }
  
    next(); // Proceed if no validation errors
  };
  
  module.exports = validate