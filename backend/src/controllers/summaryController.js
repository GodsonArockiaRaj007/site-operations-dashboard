import pool from "../config/db.js";

export const getSummary = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM sites) AS total_sites,

        (SELECT COUNT(*)
         FROM sites
         WHERE status = 'active') AS active_sites,

        (SELECT COUNT(*)
         FROM installations) AS total_installations,

        (SELECT COUNT(*)
         FROM installations
         WHERE status = 'completed') AS completed_installations,

        (SELECT COUNT(*)
         FROM installations
         WHERE status = 'pending') AS pending_installations,

        (SELECT COUNT(*)
         FROM installations
         WHERE status = 'in_progress') AS in_progress_installations
    `);

    const summary = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        totalSites: Number(summary.total_sites),
        activeSites: Number(summary.active_sites),
        totalInstallations: Number(summary.total_installations),
        completedInstallations: Number(summary.completed_installations),
        pendingInstallations: Number(summary.pending_installations),
        inProgressInstallations: Number(
          summary.in_progress_installations
        ),
      },
    });
  } catch (error) {
    console.error("Error fetching summary:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch operational summary",
    });
  }
};