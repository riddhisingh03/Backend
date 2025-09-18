import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, password, role, grade, studentId, studentIdNumber, ngoId } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user object with role-specific fields
    const userData = { name, email, passwordHash, role };
    
    // Add role-specific fields
    if (role === 'student') {
      if (grade) userData.grade = grade;
      if (studentId) userData.studentId = studentId; // This links student to a school
      if (studentIdNumber) userData.studentIdNumber = studentIdNumber; // Student's personal ID/roll number
    } else if (role === 'ngo') {
      if (ngoId) userData.ngoId = ngoId;
    }
    // Note: Schools only need name and email, no additional fields required

    const user = new User(userData);
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    
    // Remove password hash from response
    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.status(201).json({ token, user: userResponse });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    
    // Remove password hash from response
    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.json({ token, user: userResponse });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};