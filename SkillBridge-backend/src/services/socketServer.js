const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const Student = require("../models/Student");
const Company = require("../models/Company");
const Admin = require("../models/Admin");
const Conversation = require("../models/Conversation");
const isAllowedOrigin = require("../utils/isAllowedOrigin");

const MODEL_BY_ROLE = {
  student: Student,
  company: Company,
  admin: Admin,
};

const userRoom = (role, id) => `user:${role}:${id}`;
const conversationRoom = (id) => `conversation:${id}`;

module.exports = function attachSocketServer(server, app) {
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) return callback(null, true);
        return callback(new Error("Origin is not allowed by CORS"));
      },
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    let decoded;
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));

      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return next(new Error("Authentication failed"));
    }

    try {
      const Model = MODEL_BY_ROLE[decoded.role];
      if (!Model) return next(new Error("Authentication failed"));

      const user = await Model.findById(decoded.id).select("_id status");
      if (!user || (decoded.role === "company" && user.status !== "approved")) {
        return next(new Error("Authentication failed"));
      }

      socket.data.user = { id: user._id.toString(), role: decoded.role };
      return next();
    } catch (err) {
      console.error("Could not verify Socket.IO user:", err);
      return next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const { id, role } = socket.data.user;
    socket.join(userRoom(role, id));

    socket.on("conversation:join", async (conversationId, acknowledge) => {
      const respond = typeof acknowledge === "function" ? acknowledge : () => {};
      if (!mongoose.isValidObjectId(conversationId)) {
        respond({ ok: false, error: "Invalid conversation ID." });
        return;
      }

      try {
        const conversation = await Conversation.findById(conversationId);
        const participant =
          conversation && (
            (role === "student" && conversation.student?.equals(id)) ||
            (role === "company" && conversation.company?.equals(id)) ||
            (role === "admin" && conversation.admin?.equals(id))
          );
        if (!participant) {
          respond({ ok: false, error: "Not authorized for this conversation." });
          return;
        }

        await socket.join(conversationRoom(conversationId));
        respond({ ok: true });
      } catch (err) {
        console.error("Could not join messaging conversation:", err);
        respond({ ok: false, error: "Could not join conversation." });
      }
    });

    socket.on("conversation:leave", (conversationId) => {
      if (mongoose.isValidObjectId(conversationId)) {
        socket.leave(conversationRoom(conversationId));
      }
    });
  });

  app.set("io", io);
  return io;
};

module.exports.userRoom = userRoom;
module.exports.conversationRoom = conversationRoom;
