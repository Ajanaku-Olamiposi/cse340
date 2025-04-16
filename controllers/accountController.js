const utilities = require('../utilities')
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

async function buildLogin(req, res, next){
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null
    })
  }

  /* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body
  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null
    })
  }
}



/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  
  if (!accountData) {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", { title: "Login", nav, errors: null, account_email });
  }

  try {
      if (await bcrypt.compare(account_password, accountData.account_password)) {
          req.session.clientLoggedIn = true; // Set login state
          delete accountData.account_password;
          const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
          res.cookie("jwt", accessToken, { httpOnly: true, secure: process.env.NODE_ENV !== 'development' });
          return res.redirect("/");
      } else {
          req.flash("notice", "Invalid credentials. Try again.");
          return res.status(400).render("account/login", { title: "Login", nav, errors: null, account_email });
      }
  } catch (error) {
      throw new Error("Access Forbidden");
  }
}

async function accountLogout(req, res) {
  req.session.clientLoggedIn = false; // Clear login state
  res.clearCookie("jwt");
  res.redirect("/");
}

async function buildManagementView(req, res, next) {
  try {
      let nav = await utilities.getNav();
      const token = req.cookies.jwt; // Retrieve JWT token
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // Decode token
      const accountType = decodedToken.account_type; // Extract account type
      const firstName = decodedToken.account_firstname; // Extract first name
      const accountId = decodedToken.account_id; // Extract account ID

      // Render the view with dynamic content
      res.render("account/management", {
          title: "Account Management",
          nav,
          firstName,
          accountType,
          accountId,
          errors: null,
      });
  } catch (error) {
      console.error("Error in buildManagementView:", error);
      next(error);
  }
}


async function buildUpdateView(req, res, next) {
  try {
    // Retrieve navigation for the view
    const nav = await utilities.getNav();

    // Retrieve JWT from cookies
    const token = req.cookies.jwt;
    if (!token) {
      req.flash("notice", "You must be logged in to access this page.");
      return res.redirect("/login");
    }

    // Verify and decode the JWT
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // Ensure ACCESS_TOKEN_SECRET is set
    } catch (err) {
      console.error("JWT verification failed:", err.message);
      req.flash("notice", "Your session is invalid or expired. Please log in again.");
      return res.redirect("/login");
    }

    // Extract required fields from the token
    const { account_id, account_firstname, account_lastname, account_email, account_password } = decodedToken;

    // Debugging: Log the extracted values
    // Render the update view with extracted account data
    res.render("account/update", {
      title: "Update Account",
      nav,
      accountData: { // Pass the necessary data to the view
        account_id,
        account_firstname,
        account_lastname,
        account_email,
        account_password
      },
      errors: null, // No errors initially
    });
  } catch (error) {
    // Log and handle unexpected errors gracefully
    console.error("Error in buildUpdateView:", error.message);
    next(error); // Pass error to the global error handler
  }
}


async function updateAccount(req, res, next) {
  try {
    const nav = await utilities.getNav();

    // Extract values from request body
    const { account_firstname, account_lastname, account_email, account_id } = req.body;

    // Debugging: Log extracted values for troubleshooting
    console.log("Updating Account:", { account_id, account_firstname, account_lastname, account_email });

    // Call the update method from the account model
    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );

    // If update succeeds, redirect to management view
    if (updateResult) {
      req.flash("notice", "Account updated successfully.");
      res.redirect("/account/");
    } else {
      // If update fails, render the form again with a failure message
      req.flash("notice", "Update failed. Please try again.");
      res.render("account/update", {
        title: "Update Account",
        nav,
        accountData: { // Pass the data back to the view to pre-fill the form
          account_id,
          account_firstname,
          account_lastname,
          account_email,
        },
        errors: null, // No validation errors here
      });
    }
  } catch (error) {
    // Log the error and pass it to the global error handler
    console.error("Error in updateAccount:", error.message);
    next(error);
  }
}

async function buildUpdateView(req, res, next) {
  try {
    // Retrieve navigation for the view
    const nav = await utilities.getNav();

    // Retrieve JWT from cookies
    const token = req.cookies.jwt;
    if (!token) {
      req.flash("notice", "You must be logged in to access this page.");
      return res.redirect("/login");
    }

    // Verify and decode the JWT
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // Ensure ACCESS_TOKEN_SECRET is set
    } catch (err) {
      console.error("JWT verification failed:", err.message);
      req.flash("notice", "Your session is invalid or expired. Please log in again.");
      return res.redirect("/login");
    }

    // Extract required fields from the token
    const { account_id, account_firstname, account_lastname, account_email, account_password } = decodedToken;

    // Debugging: Log the extracted values
    // Render the update view with extracted account data
    res.render("account/update", {
      title: "Update Account",
      nav,
      accountData: { // Pass the necessary data to the view
        account_id,
        account_firstname,
        account_lastname,
        account_email,
        account_password
      },
      errors: null, // No errors initially
    });
  } catch (error) {
    // Log and handle unexpected errors gracefully
    console.error("Error in buildUpdateView:", error.message);
    next(error); // Pass error to the global error handler
  }
}


async function updateAccount(req, res, next) {
  try {
    const nav = await utilities.getNav();

    // Extract values from request body
    const { account_firstname, account_lastname, account_email, account_id } = req.body;

    // Debugging: Log extracted values for troubleshooting
    console.log("Updating Account:", { account_id, account_firstname, account_lastname, account_email });

    // Call the update method from the account model
    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );

    // If update succeeds, redirect to management view
    if (updateResult) {
      req.flash("notice", "Account updated successfully.");
      res.redirect("/account/");
    } else {
      // If update fails, render the form again with a failure message
      req.flash("notice", "Update failed. Please try again.");
      res.render("account/update", {
        title: "Update Account",
        nav,
        accountData: { // Pass the data back to the view to pre-fill the form
          account_id,
          account_firstname,
          account_lastname,
          account_email,
        },
        errors: null, // No validation errors here
      });
    }
  } catch (error) {
    // Log the error and pass it to the global error handler
    console.error("Error in updateAccount:", error.message);
    next(error);
  }
}

async function updatePassword(req, res, next) {
  try {
      let nav = await utilities.getNav();
      const { account_password, account_id } = req.body;

      const hashedPassword = await bcrypt.hash(account_password, 10);
      const updateResult = await accountModel.updatePassword(account_id, hashedPassword);

      if (updateResult) {
          req.flash('notice', 'Password updated successfully.');
          res.redirect('/account/');
      } else {
          req.flash('notice', 'Password update failed. Please try again.');
          res.render('account/update', {
              title: 'Change Password',
              nav,
              accountData: req.body,
              errors: null,
          });
      }
  } catch (error) {
      next(error);
  }
}

module.exports = {buildLogin, 
  buildRegister, 
  registerAccount, 
  accountLogin, 
  buildManagementView,
  accountLogout,
  buildUpdateView,
  updateAccount,
  updatePassword
}