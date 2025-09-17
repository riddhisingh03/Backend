import Activity from "../models/Activity.js";

export const createActivity = async (req, res) => {
  try {
    const activity = new Activity({
      title: req.body.title,
      description: req.body.description,
      schoolId: req.user.id
    });
    await activity.save();
    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const listActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ schoolId: req.user.id });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};