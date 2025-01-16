import { Hono } from "hono";
import { cors } from "hono/cors";
import { Server } from "socket.io";
import { serve } from "@hono/node-server";
import mongoose from "mongoose";
import { config } from "dotenv";

config();

import { ChatBot } from "./routes/response.js";
import { ImageBot } from "./routes/image.js";
import googleLoginRoute from "./routes/googleLogin.js";
import verifyRoute from "./routes/verify.js";
import discordLoginRoute from "./routes/discordLogin.js";
import registerRoute from "./routes/register.js";
import loginRoute from "./routes/login.js";
import chatRoute from "./routes/chat.js";
import messageRoute from "./routes/message.js";
import fetchChatsRoute from "./routes/fetchChats.js";
import fetchChatRoute from "./routes/fetchChat.js";

const app = new Hono();

app.use("*", cors());

const dbUrl = process.env.DATABASE_URL;
mongoose.connect(dbUrl);

const port = process.env.PORT || 3001;

const server = serve({
  fetch: app.fetch,
  port,
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Set up routes, passing io to the ones that need it
app.get("/", (c) => c.text("Hello World!"));
// app.route('/api/response', responseRoute)
app.route("/api/googleauth", googleLoginRoute);
app.route("/api/verify", verifyRoute);
app.route("/api/discordauth", discordLoginRoute);
app.route("/api/register", registerRoute);
app.route("/api/login", loginRoute);
app.route("/api/chat", chatRoute(io)); // Pass io to chatRoute
app.route("/api/message", messageRoute);
app.route("/api/fetchchats", fetchChatsRoute);
app.route("/api/fetchchat", fetchChatRoute);

const chatbot = new ChatBot();
const imagebot = new ImageBot();
const conversationHistories = new Map();

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("message", async ({ message, model, provider, chatId }) => {
    // console.log(provider)
    // console.log(conversationHistories)
    // console.log(message)
    // console.log(chatId)
    if (!chatId) {
      socket.emit("error", "Chat ID is required");
      return;
    }

    let history;
    if (!conversationHistories.has(chatId)) {
      socket.emit("requestHistory", chatId);

      history = await new Promise((resolve) => {
        socket.once("provideHistory", (data) => {
          if (data && Array.isArray(data.history)) {
            resolve(data.history);
          } else {
            resolve([]);
          }
        });

        setTimeout(() => {
          resolve([]);
        }, 5000);
      });

      conversationHistories.set(chatId, history);
    } else {
      history = conversationHistories.get(chatId);
    }

    try {
      history.push({ role: "user", content: message });

      let fullResponse;
      const imageModels = ["flux", "flux-pro", "midjourney", "flux-dev"];
      if (imageModels.includes(model)) {

        fullResponse = await imagebot.generateImage(
          socket,
          message,
          model,
          provider
        );
      } else {

        fullResponse = await chatbot.getResponse(
          socket,
          model,
          provider,
          history
        );
      }
      if (fullResponse == undefined) {
        fullResponse =
          "Error: failed to generate response. Try with another model or provider.";
      }
      history.push({ role: "assistant", content: fullResponse });
      // console.log(fullResponse)

      conversationHistories.set(chatId, history);
    } catch (error) {
      console.error("Error processing message:", error);
      socket.emit("error", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

console.log(`Server running at http://localhost:${port}`);

export { server };
