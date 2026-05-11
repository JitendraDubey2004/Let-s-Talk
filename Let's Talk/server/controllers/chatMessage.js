import ChatMessage from "../models/ChatMessage.js";
import { encrypt, decrypt } from "../utils/encryption.js";

export const createMessage = async (req, res) => {
  const messageData = { ...req.body };
  if (messageData.message) {
    messageData.message = encrypt(messageData.message);
  }
  
  const newMessage = new ChatMessage(messageData);

  try {
    await newMessage.save();
    const result = newMessage.toObject();
    result.message = decrypt(result.message);
    res.status(201).json(result);
  } catch (error) {
    res.status(409).json({
      message: error.message,
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.find({
      chatRoomId: req.params.chatRoomId,
    });
    
    const decryptedMessages = messages.map(msg => {
      const m = msg.toObject();
      m.message = decrypt(m.message);
      return m;
    });

    res.status(200).json(decryptedMessages);
  } catch (error) {
    res.status(409).json({
      message: error.message,
    });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { chatRoomId, userId } = req.body;

    await ChatMessage.updateMany(
      {
        chatRoomId,
        sender: { $ne: userId }, // Don't mark own messages as read
        'readBy.userId': { $ne: userId } // Don't update if already read
      },
      {
        $push: {
          readBy: { userId, readAt: new Date() }
        },
        status: 'read'
      }
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(409).json({
      message: error.message,
    });
  }
};

export const addReaction = async (req, res) => {
  try {
    const { messageId, emoji, userId, userName } = req.body;

    const message = await ChatMessage.findByIdAndUpdate(
      messageId,
      {
        $push: {
          reactions: {
            emoji,
            userId,
            userName,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const result = message.toObject();
    result.message = decrypt(result.message);
    res.status(200).json(result);
  } catch (error) {
    res.status(409).json({
      message: error.message,
    });
  }
};

export const removeReaction = async (req, res) => {
  try {
    const { messageId, emoji, userId } = req.body;

    const message = await ChatMessage.findByIdAndUpdate(
      messageId,
      {
        $pull: {
          reactions: { emoji, userId }
        }
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const result = message.toObject();
    result.message = decrypt(result.message);
    res.status(200).json(result);
  } catch (error) {
    res.status(409).json({
      message: error.message,
    });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { messageId, newMessage, userId } = req.body;

    const message = await ChatMessage.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender !== userId) {
      return res.status(403).json({ message: "You can only edit your own messages" });
    }

    const updatedMessage = await ChatMessage.findByIdAndUpdate(
      messageId,
      {
        message: encrypt(newMessage),
        isEdited: true,
        editedAt: new Date()
      },
      { new: true }
    );

    const result = updatedMessage.toObject();
    result.message = decrypt(result.message);
    res.status(200).json(result);
  } catch (error) {
    res.status(409).json({
      message: error.message,
    });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId, userId } = req.body;

    const message = await ChatMessage.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender !== userId) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    await ChatMessage.findByIdAndDelete(messageId);

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(409).json({
      message: error.message,
    });
  }
};

export const searchMessages = async (req, res) => {
  try {
    const { chatRoomId, query } = req.params;

    const messages = await ChatMessage.find({
      chatRoomId
    }).sort({ createdAt: -1 });

    const filteredMessages = messages
      .map(msg => {
        const m = msg.toObject();
        m.message = decrypt(m.message);
        return m;
      })
      .filter(msg => msg.message.toLowerCase().includes(query.toLowerCase()));

    res.status(200).json(filteredMessages);
  } catch (error) {
    res.status(409).json({
      message: error.message,
    });
  }
};

