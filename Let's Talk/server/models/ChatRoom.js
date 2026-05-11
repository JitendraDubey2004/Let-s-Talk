import mongoose from "mongoose";

const ChatRoomSchema = mongoose.Schema(
  {
    members: Array,
    name: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: null
    },
    avatar: {
      type: String,
      default: null
    },
    isGroupChat: {
      type: Boolean,
      default: false
    },
    createdBy: String,
    mutedBy: [String],
    pinnedMessages: [String]
  },
  { timestamps: true }
);

const ChatRoom = mongoose.model("ChatRoom", ChatRoomSchema);

export default ChatRoom;
