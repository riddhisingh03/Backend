import Campaign from "../models/Campaign.js";
import Resource from "../models/Resource.js";

export const createCampaign = async (req, res) => {
  try {
    const { title, description } = req.body;
    const campaign = new Campaign({ title, description, ngoId: req.user.id });
    await campaign.save();
    res.status(201).json(campaign);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const listCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ ngoId: req.user.id });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const listResources = async (req, res) => {
  try {
    const resources = await Resource.find({ ngoId: req.user.id });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};