import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  message_id: { type: String, required: true },
  role: { type: String, required: true },
  model: { type: String, required: false },
  provider: { type: String, required: false },
  timeItTook: { type: Number, required: false },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  user_id: { type: String, required: true },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const chatModel = mongoose.model("Chats", chatSchema);