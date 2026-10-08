export const validateSite = (req, res, next) => {
  const { name, location, status } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Site name is required",
    });
  }

  if (!location || !location.trim()) {
    return res.status(400).json({
      success: false,
      message: "Site location is required",
    });
  }

  const allowedStatuses = [
    "pending",
    "active",
    "completed",
  ];

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid site status. Allowed values: pending, active, completed",
    });
  }

  next();
};

export const validateInstallation = (req, res, next) => {
  const {
    site_id,
    activity_type,
    status,
    scheduled_date,
    completed_date,
  } = req.body;

  if (!site_id) {
    return res.status(400).json({
      success: false,
      message: "Site ID is required",
    });
  }

  if (!Number.isInteger(Number(site_id))) {
    return res.status(400).json({
      success: false,
      message: "Site ID must be a valid number",
    });
  }

  if (!activity_type || !activity_type.trim()) {
    return res.status(400).json({
      success: false,
      message: "Activity type is required",
    });
  }

  const allowedStatuses = [
    "pending",
    "in_progress",
    "completed",
  ];

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid installation status. Allowed values: pending, in_progress, completed",
    });
  }

  if (scheduled_date && isNaN(Date.parse(scheduled_date))) {
    return res.status(400).json({
      success: false,
      message: "Invalid scheduled date",
    });
  }

  if (completed_date && isNaN(Date.parse(completed_date))) {
    return res.status(400).json({
      success: false,
      message: "Invalid completed date",
    });
  }

  next();
};