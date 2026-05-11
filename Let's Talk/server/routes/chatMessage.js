import express from "express";

import { createMessage, getMessages, markMessagesAsRead, addReaction, removeReaction, editMessage, deleteMessage, searchMessages } from "../controllers/chatMessage.js";

const router = express.Router();

router.post("/", createMessage);
router.get("/:chatRoomId", getMessages);
router.put("/read", markMessagesAsRead);
router.post("/reaction", addReaction);
router.delete("/reaction", removeReaction);
router.put("/edit", editMessage);
router.delete("/delete", deleteMessage);
router.get("/search/:chatRoomId/:query", searchMessages);

export default router;
