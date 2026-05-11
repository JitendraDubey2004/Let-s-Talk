import express from "express";

import {
  createChatRoom,
  getChatRoomOfUser,
  getChatRoomOfUsers,
  updateChatRoom,
  muteChatRoom,
  unmuteChatRoom,
  pinMessage,
  unpinMessage,
} from "../controllers/chatRoom.js";

const router = express.Router();

router.post("/", createChatRoom);
router.get("/:userId", getChatRoomOfUser);
router.get("/:firstUserId/:secondUserId", getChatRoomOfUsers);
router.put("/:chatRoomId", updateChatRoom);
router.post("/mute", muteChatRoom);
router.post("/unmute", unmuteChatRoom);
router.post("/pin", pinMessage);
router.post("/unpin", unpinMessage);

export default router;
