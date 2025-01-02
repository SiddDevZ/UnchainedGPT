import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  token: { type: String, required: true },
  avatar: { type: String, default: "" },
  lastLogin: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

export const userModel = mongoose.model("Users", userSchema);