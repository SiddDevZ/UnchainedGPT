import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import mongoose from "mongoose";
import { config } from "dotenv";

config();

import googleLoginRoute from "./routes/googleLogin.js";
import verifyRoute from "./routes/verify.js";
import discordLoginRoute from "./routes/discordLogin.js";
import registerRoute from "./routes/register.js";
import loginRoute from "./routes/login.js";
import chatRoute from "./routes/chat.js";
import messageRoute from "./routes/message.js";
import fetchChatsRoute from "./routes/fetchChats.js";
import fetchChatRoute from "./routes/fetchChat.js";
import fetchModelsRoute from "./routes/fetchModels.js";
import v1Route from "./routes/v1.js";
import streamMessageRoute from "./routes/streamMessage.js";
import subscriptionRoute from "./routes/subscription.js";
import premiumMessageRoute from "./routes/premiumMessage.js";

const app = new Hono();

app.use("*", cors());

const dbUrl = process.env.DATABASE_URL;

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Database connected successfully!");
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });

const port = process.env.PORT || 3001;

app.get("/", (c) => c.text("Hello World!"));
app.route("/api/googleauth", googleLoginRoute);
app.route("/api/verify", verifyRoute);
app.route("/api/discordauth", discordLoginRoute);
app.route("/api/register", registerRoute);
app.route("/api/login", loginRoute);
app.route("/api/chat", chatRoute);
app.route("/api/message", messageRoute);
app.route("/api/streammessage", streamMessageRoute);
app.route("/api/fetchchats", fetchChatsRoute);
app.route("/api/fetchchat", fetchChatRoute);
app.route("/api/fetchmodels", fetchModelsRoute);
app.route("/api/subscription", subscriptionRoute);
app.route("/api/premiummessage", premiumMessageRoute);
app.route("/v1", v1Route);

const server = serve({
  fetch: app.fetch,
  port,
});

console.log(`Server running at http://localhost:${port}`);

export { server };
