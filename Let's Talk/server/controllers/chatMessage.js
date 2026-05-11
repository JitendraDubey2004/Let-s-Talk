import ChatMessage from "../models/ChatMessage.js";

export const createMessage = async (req, res) => {
  const newMessage = new ChatMessage(req.body);

  try {
    await newMessage.save();
    res.status(201).json(newMessage);
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
    res.status(200).json(messages);
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

    res.status(200).json(message);
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

    res.status(200).json(message);
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
        message: newMessage,
        isEdited: true,
        editedAt: new Date()
      },
      { new: true }
    );

    res.status(200).json(updatedMessage);
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
      chatRoomId,
      message: { $regex: query, $options: 'i' }
    }).sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(409).json({
      message: error.message,
    });
  }
};
