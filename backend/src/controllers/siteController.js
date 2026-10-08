import pool from "../config/db.js";

const DEFAULT_CREATED_BY_USER_ID = 1;

// Get all sites
export const getSites = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        sites.id,
        sites.name,
        sites.location,
        sites.status,
        sites.created_at,
        users.name AS created_by
      FROM sites
      LEFT JOIN users
        ON sites.created_by = users.id
      ORDER BY sites.id DESC
    `);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching sites:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch sites",
    });
  }
};

// Create a new site
export const createSite = async (req, res) => {
  try {
    const { name, location, status } = req.body;

    // Validation
    if (!name || !location) {
      return res.status(400).json({
        success: false,
        message: "Name and location are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO sites (name, location, status, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        name,
        location,
        status || "pending",
        DEFAULT_CREATED_BY_USER_ID,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Site created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating site:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create site",
    });
  }
};


// Get a single site by ID
export const getSiteById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        sites.id,
        sites.name,
        sites.location,
        sites.status,
        sites.created_at,
        users.name AS created_by
      FROM sites
      LEFT JOIN users
        ON sites.created_by = users.id
      WHERE sites.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Site not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching site:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch site",
    });
  }
};

// Update a site
export const updateSite = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, status } = req.body;

    if (!name || !location || !status) {
      return res.status(400).json({
        success: false,
        message: "Name, location and status are required",
      });
    }

    const result = await pool.query(
      `
      UPDATE sites
      SET
        name = $1,
        location = $2,
        status = $3
      WHERE id = $4
      RETURNING *
      `,
      [name, location, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Site not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Site updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating site:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update site",
    });
  }
};


// Delete a site
export const deleteSite = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM sites
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Site not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Site deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting site:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete site",
    });
  }
};