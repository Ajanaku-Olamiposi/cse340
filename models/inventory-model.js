const pool = require("../database");

async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
}

async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i
             JOIN public.classification AS c
             ON i.classification_id = c.classification_id
             WHERE i.classification_id = $1`,
            [classification_id]
        );
        return data.rows;
    } catch (error) {
        console.error("getInventoryByClassificationId error: ", error);
    }
}

async function getInventoryByVehicleId(vehicle_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i
             JOIN public.classification AS c
             ON i.classification_id = c.classification_id
             WHERE i.inv_id = $1`,
            [vehicle_id]
        );
        return data.rows;
    } catch (error) {
        console.error("getInventoryByVehicleId error: ", error);
    }
}

async function addClassification(classification_name) {
    try {
        const result = await pool.query(
            "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING classification_id",
            [classification_name]
        );
        return result.rowCount > 0; // True if insertion is successful
    } catch (error) {
        console.error("addClassification error: ", error);
        return false;
    }
}

async function checkExistingClassification(classification_name) {
    try {
        const result = await pool.query(
            "SELECT COUNT(*) AS count FROM public.classification WHERE classification_name = $1",
            [classification_name]
        );
        return parseInt(result.rows[0].count) > 0; // True if classification exists
    } catch (error) {
        console.error("checkExistingClassification error: ", error);
        return false;
    }
}

async function addInventory(inventoryData){
    try {
      const query = `
        INSERT INTO inventory (
          classification_id, -- Include classification_id
          inv_make,
          inv_model,
          inv_year,
          inv_price,
          inv_miles,
          inv_color,
          inv_description,
          inv_image,
          inv_thumbnail
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *;
      `;
      const values = [
        inventoryData.classification_id, // Include classification_id
        inventoryData.inv_make,
        inventoryData.inv_model,
        inventoryData.inv_year,
        inventoryData.inv_price,
        inventoryData.inv_miles,
        inventoryData.inv_color,
        inventoryData.inv_description,
        inventoryData.inv_image,
        inventoryData.inv_thumbnail,
      ];
      const result = await pool.query(query, values);
      return result.rows.length > 0; // Returns true if insertion succeeded
    } catch (error) {
      console.error("Error inserting inventory item:", error);
      return false; // Indicates failure
    }
  };


/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
  ) {
    try {
      const sql =
        "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
      const data = await pool.query(sql, [
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
        inv_id
      ])
      return data.rows[0]
    } catch (error) {
      console.error("model error: " + error)
    }
  }


// 
async function deleteInventory(
    inv_id,
) {
  try {
    const sql =
      'DELETE FROM inventory WHERE inv_id = $1';
    const data = await pool.query(sql, [
      inv_id
    ])
    return data
  } catch (error) {
    console.error("model error: " + error)
  }
}


const deleteClassificationByName = async (classification_name) => {
  const query = `
    DELETE FROM classification
    WHERE classification_name = $1
    RETURNING *;
  `;
  const values = [classification_name];
  const result = await pool.query(query, values);
  return result.rowCount > 0; // Returns true if a row was deleted
};
module.exports = {
    getClassifications,
    getInventoryByClassificationId,
    getInventoryByVehicleId,
    addClassification,
    checkExistingClassification,
    addInventory,
    updateInventory,
    deleteInventory,
    deleteClassificationByName
};