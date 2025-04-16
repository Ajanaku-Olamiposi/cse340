const pool = require("../database/");

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql =
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
  } catch (error) {
    return error.message;
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const email = await pool.query(sql, [account_email]);
    return email.rowCount;
  } catch (error) {
    return error.message;
  }
}

/* **********************
 *   Check for existing password
 * ********************* */
const bcrypt = require("bcryptjs");

/* **********************
 *   Check for existing password (bcrypt)
 * ********************* */
async function checkExistingPassword(account_password, account_email) {
  try {
    const sql = "SELECT account_password FROM account WHERE account_email = $1";
    const result = await pool.query(sql, [account_email]);

    // Check if email exists
    if (result.rowCount > 0) {
      const hashedPassword = result.rows[0].account_password;

      // Use bcrypt to compare the hashed password
      const isMatch = await bcrypt.compare(account_password, hashedPassword);
      if (isMatch){
        console.log('Password Match:')}
        else{
        console.log('Password Not Match:')};
       // Log the result of the comparison
      return isMatch; // Returns true if passwords match
    } else {
      return false; // Email does not exist
    }
  } catch (error) {
    return error.message;
  }
}


/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

async function getAccountById(account_id) {
  const query = 'SELECT * FROM account WHERE account_id = $1';
  const result = await pool.query(query, [account_id]);
  return result.rows[0];
}

async function updateAccount(account_id, firstname, lastname, email) {
  const query = 'UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4';
  const result = await pool.query(query, [firstname, lastname, email, account_id]);
  return result.rowCount > 0;
}

async function updatePassword(account_id, hashedPassword) {
  const query = 'UPDATE account SET account_password = $1 WHERE account_id = $2';
  const result = await pool.query(query, [hashedPassword, account_id]);
  return result.rowCount > 0;
}

module.exports = { registerAccount, checkExistingEmail, checkExistingPassword, getAccountByEmail, getAccountById, updateAccount, updatePassword };