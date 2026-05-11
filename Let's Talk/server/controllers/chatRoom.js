import ChatRoom from "../models/ChatRoom.js";
import ChatMessage from "../models/ChatMessage.js";
import { decrypt } from "../utils/encryption.js";

export const createChatRoom = async (req, res) => {
  const newChatRoom = new ChatRoom({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    await newChatRoom.save();
    res.status(201).json(newChatRoom);
  } catch (error) {
    res.status(409).json({
      message: error.message,
    });
  }
};

export const getChatRoomOfUser = async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find({
      members: { $in: [req.params.userId] },
    });

    // For each chat room, find the last message
    const chatRoomsWithLastMessage = await Promise.all(
      chatRooms.map(async (room) => {
        const lastMessage = await ChatMessage.findOne({ chatRoomId: room._id })
          .sort({ createdAt: -1 })
          .lean();
        
        const roomObj = room.toObject();
        if (lastMessage) {
          lastMessage.message = decrypt(lastMessage.message);
          roomObj.lastMessage = lastMessage;
        }
        return roomObj;
      })
    );

    res.status(200).json(chatRoomsWithLastMessage);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};


export const getChatRoomOfUsers = async (req, res) => {
  try {
    const chatRoom = await ChatRoom.find({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    res.status(200).json(chatRoom);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const updateChatRoom = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { name, description, avatar } = req.body;

    const updatedRoom = await ChatRoom.findByIdAndUpdate(
      chatRoomId,
      { name, description, avatar },
      { new: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: "Chat room not found" });
    }

    res.status(200).json(updatedRoom);
  } catch (error) {
    res.status(409).json({
      message: error.message,
    });
  }
};

export const muteChatRoom = async (req, res) => {
  try {
    const { chatRoomId, userId } = req.body;

    const updatedRoom = await ChatRoom.findByIdAndUpdate(
      chatRoomId,
      { $addToSet: { mutedBy: userId } },
      { new: true }
    );

    res.status(200).json(updatedRoom);
  } catch (error) {
    res.status(409).json({
      message: error.message,
    });
  }
};

export const unmuteChatRoom = async (req, res) => {
  try {
    const { chatRoomId, userId } = req.body;

    const updatedRoom = await ChatRoom.findByIdAndUpdate(
      chatRoomId,
      { $pull: { mutedBy: userId } },
      { new: true }
    );

    res.status(200).json(updatedRoom);
  } catch (error) {
    res.status(409).json({
      message: error.message,
    });
  }
};

export const pinMessage = async (req, res) => {
  try {
    const { chatRoomId, messageId } = req.body;

    const updatedRoom = await ChatRoom.findByIdAndUpdate(
      chatRoomId,
      { $addToSet: { pinnedMessages: messageId } },
      { new: true }
    );

    res.status(200).json(updatedRoom);
  } catch (error) {
    res.status(409).json({
      message: error.message,
    });
  }
};

export const unpinMessage = async (req, res) => {
  try {
    const { chatRoomId, messageId } = req.body;

    const updatedRoom = await ChatRoom.findByIdAndUpdate(
      chatRoomId,
      { $pull: { pinnedMessages: messageId } },
      { new: true }
    );

    res.status(200).json(updatedRoom);
  } catch (error) {
    res.status(409).json({
      message: error.message,
    });
  }
};
