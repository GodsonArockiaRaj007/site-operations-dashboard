import pool from "../config/db.js";

// Get all installations
export const getInstallations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        installations.id,
        installations.site_id,
        installations.activity_type,
        installations.status,
        installations.scheduled_date,
        installations.completed_date,
        installations.notes,
        installations.created_at,
        sites.name AS site_name,
        sites.location AS site_location,
        users.name AS assigned_to
      FROM installations
      JOIN sites
        ON installations.site_id = sites.id
      LEFT JOIN users
        ON installations.assigned_to = users.id
      ORDER BY installations.id DESC
    `);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching installations:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch installations",
    });
  }
};

// Create an installation
export const createInstallation = async (req, res) => {
  try {
    const {
      site_id,
      assigned_to,
      activity_type,
      status,
      scheduled_date,
      completed_date,
      notes,
    } = req.body;

    // Validation
    if (!site_id || !activity_type) {
      return res.status(400).json({
        success: false,
        message: "Site and activity type are required",
      });
    }

    // Check whether site exists
    const siteCheck = await pool.query(
      "SELECT id FROM sites WHERE id = $1",
      [site_id]
    );

    if (siteCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Site not found",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO installations
      (
        site_id,
        assigned_to,
        activity_type,
        status,
        scheduled_date,
        completed_date,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        site_id,
        assigned_to || null,
        activity_type,
        status || "pending",
        scheduled_date || null,
        completed_date || null,
        notes || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Installation created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating installation:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create installation",
    });
  }
};

// Get installation by ID
export const getInstallationById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        installations.id,
        installations.activity_type,
        installations.status,
        installations.scheduled_date,
        installations.completed_date,
        installations.notes,
        installations.created_at,
        sites.id AS site_id,
        sites.name AS site_name,
        sites.location AS site_location,
        users.id AS assigned_to_id,
        users.name AS assigned_to
      FROM installations
      JOIN sites
        ON installations.site_id = sites.id
      LEFT JOIN users
        ON installations.assigned_to = users.id
      WHERE installations.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Installation not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching installation:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch installation",
    });
  }
};

// Update installation
export const updateInstallation = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      site_id,
      assigned_to,
      activity_type,
      status,
      scheduled_date,
      completed_date,
      notes,
    } = req.body;

    if (!site_id || !activity_type || !status) {
      return res.status(400).json({
        success: false,
        message: "Site, activity type and status are required",
      });
    }

    // Check whether site exists
    const siteCheck = await pool.query(
      "SELECT id FROM sites WHERE id = $1",
      [site_id]
    );

    if (siteCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Site not found",
      });
    }

    const result = await pool.query(
      `
      UPDATE installations
      SET
        site_id = $1,
        assigned_to = $2,
        activity_type = $3,
        status = $4,
        scheduled_date = $5,
        completed_date = $6,
        notes = $7
      WHERE id = $8
      RETURNING *
      `,
      [
        site_id,
        assigned_to || null,
        activity_type,
        status,
        scheduled_date || null,
        completed_date || null,
        notes || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Installation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Installation updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating installation:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update installation",
    });
  }
};

// Delete installation
export const deleteInstallation = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM installations
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Installation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Installation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting installation:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete installation",
    });
  }
};