const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')

router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))
router.get('/', utilities.checkLogin, utilities.handleErrors(accountController.buildManagementView));
// Route to display the update view
router.get(
  '/update/:account_id',
  utilities.handleErrors(accountController.buildUpdateView)
);

// Route to handle account updates
router.post(
  '/update',
  regValidate.updateAccountRules(), // Apply validation rules for account update
  regValidate.checkUpdateData,     // Check and handle validation errors
  utilities.handleErrors(accountController.updateAccount)
);

// Route to handle password updates
router.post(
  '/update-password',
  regValidate.passwordRules(),     // Apply validation rules for password update
  regValidate.checkPasswordData,   // Check and handle validation errors
  utilities.handleErrors(accountController.updatePassword)
);
// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.logCheckRegData,
  utilities.handleErrors(accountController.accountLogin)
)

router.get('/logout', utilities.handleErrors(accountController.accountLogout));

module.exports = router;