import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";

import "./config/mongo.js";

import { VerifyToken, VerifySocketToken } from "./middlewares/VerifyToken.js";
import chatRoomRoutes from "./routes/chatRoom.js";
import chatMessageRoutes from "./routes/chatMessage.js";
import userRoutes from "./routes/user.js";

const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(VerifyToken);

const PORT = process.env.PORT || 8080;

app.use("/api/room", chatRoomRoutes);
app.use("/api/message", chatMessageRoutes);
app.use("/api/user", userRoutes);

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

io.use(VerifySocketToken);

global.onlineUsers = new Map();

const getKey = (map, val) => {
  for (let [key, value] of map.entries()) {
    if (value === val) return key;
  }
};

io.on("connection", (socket) => {
  global.chatSocket = socket;

  socket.on("addUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.emit("getUsers", Array.from(onlineUsers));
  });

  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    const sendUserSocket = onlineUsers.get(receiverId);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("getMessage", {
        senderId,
        message,
      });
    }
  });

  socket.on("typing", ({ chatRoomId, senderId, isTyping }) => {
    // Get all users in the chat room except the sender
    // For now, we'll broadcast to all online users (can be improved with room-based messaging)
    socket.broadcast.emit("typing", {
      chatRoomId,
      senderId,
      isTyping,
    });
  });

  socket.on("addReaction", ({ chatRoomId, messageId, emoji, userId, userName }) => {
    socket.broadcast.emit("reactionAdded", {
      chatRoomId,
      messageId,
      emoji,
      userId,
      userName,
    });
  });

  socket.on("removeReaction", ({ chatRoomId, messageId, emoji, userId }) => {
    socket.broadcast.emit("reactionRemoved", {
      chatRoomId,
      messageId,
      emoji,
      userId,
    });
  });

  socket.on("messageEdited", ({ chatRoomId, messageId, newMessage, editedAt }) => {
    socket.broadcast.emit("messageUpdated", {
      chatRoomId,
      messageId,
      newMessage,
      isEdited: true,
      editedAt,
    });
  });

  socket.on("messageDeleted", ({ chatRoomId, messageId }) => {
    socket.broadcast.emit("messageRemoved", {
      chatRoomId,
      messageId,
    });
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(getKey(onlineUsers, socket.id));
    socket.emit("getUsers", Array.from(onlineUsers));
  });
});
