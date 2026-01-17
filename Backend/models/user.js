import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  plan: { type: String, enum: ['free', 'premium'], default: 'free' },
  status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  nextBillingDate: { type: Date, default: null },
  premiumCredits: { type: Number, default: 0 },
  premiumCreditsUsed: { type: Number, default: 0 },
  lastPayment: {
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'SOL' },
    txnHash: { type: String, default: null },
    walletAddress: { type: String, default: null },
    timestamp: { type: Date, default: null }
  },
  paymentHistory: [{
    amount: { type: Number },
    currency: { type: String },
    txnHash: { type: String },
    walletAddress: { type: String },
    timestamp: { type: Date },
    plan: { type: String }
  }]
}, { _id: false });

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  token: { type: String, required: true },
  avatar: { type: String, default: "" },
  lastLogin: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  subscription: { type: subscriptionSchema, default: () => ({}) },
  connectedWallet: { type: String, default: null }
});

export const userModel = mongoose.model("Users", userSchema);