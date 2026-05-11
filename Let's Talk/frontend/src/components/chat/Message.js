import { format } from "timeago.js";
import { CheckIcon, CheckCircleIcon } from "@heroicons/react/solid";
import { useState } from "react";
import { addReaction, removeReaction, editMessage, deleteMessage } from "../../services/ChatService";
import { pinMessage, unpinMessage } from "../../services/ChatRoomService";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffInHours < 48) {
    return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
           ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
};

const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];

export default function Message({ message, self, currentUser, socket, onMessageUpdate, onMessageDelete, chatRoomId, isPinned, onPinMessage }) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showMessageMenu, setShowMessageMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.message);

  const isOwnMessage = self === message.sender;

  const getStatusIcon = () => {
    if (!isOwnMessage) return null;

    const status = message.status || 'sent';

    switch (status) {
      case 'sent':
        return <CheckIcon className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCircleIcon className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCircleIcon className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleReactionClick = async (emoji) => {
    const existingReaction = message.reactions?.find(
      r => r.emoji === emoji && r.userId === currentUser.uid
    );

    if (existingReaction) {
      await removeReaction(message._id, emoji, currentUser.uid);
      socket.emit("removeReaction", {
        chatRoomId: message.chatRoomId,
        messageId: message._id,
        emoji,
        userId: currentUser.uid,
      });
    } else {
      await addReaction(message._id, emoji, currentUser.uid, currentUser.displayName);
      socket.emit("addReaction", {
        chatRoomId: message.chatRoomId,
        messageId: message._id,
        emoji,
        userId: currentUser.uid,
        userName: currentUser.displayName,
      });
    }
    setShowReactionPicker(false);
  };

  const handleEditMessage = async () => {
    if (editedText.trim() === message.message) {
      setIsEditing(false);
      return;
    }

    const updatedMessage = await editMessage(message._id, editedText, currentUser.uid);
    if (updatedMessage) {
      socket.emit("messageEdited", {
        chatRoomId: message.chatRoomId,
        messageId: message._id,
        newMessage: editedText,
        editedAt: updatedMessage.editedAt,
      });
      onMessageUpdate?.(message._id, editedText);
      setIsEditing(false);
    }
  };

  const handleDeleteMessage = async () => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      await deleteMessage(message._id, currentUser.uid);
      socket.emit("messageDeleted", {
        chatRoomId: message.chatRoomId,
        messageId: message._id,
      });
      onMessageDelete?.(message._id);
    }
  };

  const handlePinMessage = async () => {
    if (isPinned) {
      await unpinMessage(chatRoomId, message._id);
    } else {
      await pinMessage(chatRoomId, message._id);
    }
    onPinMessage?.(message._id, !isPinned);
  };

  const getReactionCounts = () => {
    const counts = {};
    message.reactions?.forEach(reaction => {
      counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
    });
    return counts;
  };

  const reactionCounts = getReactionCounts();

  return (
    <>
      <li
        className={classNames(
          self !== message.sender ? "justify-start" : "justify-end",
          "flex group"
        )}
      >
        <div className="relative">
          <div
            className={classNames(
              self !== message.sender
                ? "text-gray-700 dark:text-gray-400 bg-white border border-gray-200 shadow-md dark:bg-gray-900 dark:border-gray-700"
                : "bg-blue-600 dark:bg-blue-500 text-white",
              "relative max-w-xl px-4 py-2 rounded-lg shadow"
            )}
          >
            {/* Reply to message */}
            {message.replyTo && (
              <div className="mb-2 p-2 border-l-2 border-gray-400 dark:border-gray-500 bg-opacity-10 bg-gray-400 dark:bg-opacity-10 rounded text-sm">
                <p className="font-semibold text-gray-700 dark:text-gray-300">{message.replyTo.sender}</p>
                <p className="text-gray-600 dark:text-gray-400 truncate">{message.replyTo.message}</p>
              </div>
            )}

            {isEditing ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded"
                  autoFocus
                />
                <button
                  onClick={handleEditMessage}
                  className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  onClick={() => { setIsEditing(false); setEditedText(message.message); }}
                  className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <span className="block font-normal">{message.message}</span>
                {message.isEdited && (
                  <span className="text-xs opacity-70">(edited)</span>
                )}
              </>
            )}

            <div className="flex items-center justify-end mt-1 space-x-1">
              <span className="text-xs opacity-70">
                {formatMessageTime(message.createdAt)}
              </span>
              {getStatusIcon()}
            </div>
          </div>

          {/* Reaction bar */}
          {Object.keys(reactionCounts).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(reactionCounts).map(([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={() => handleReactionClick(emoji)}
                  className={classNames(
                    message.reactions?.some(r => r.emoji === emoji && r.userId === currentUser.uid)
                      ? "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-600"
                      : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600",
                    "flex items-center space-x-1 px-2 py-1 text-xs rounded-full border hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  )}
                >
                  <span>{emoji}</span>
                  <span className="text-gray-600 dark:text-gray-300">{count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Message actions menu */}
          <div className="absolute -bottom-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isOwnMessage && (
              <button
                onClick={() => setShowMessageMenu(!showMessageMenu)}
                className="bg-gray-200 dark:bg-gray-700 rounded-full p-1 shadow-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <span className="text-sm">⋮</span>
              </button>
            )}
            <button
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              className="bg-gray-100 dark:bg-gray-700 rounded-full p-1 shadow-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <span className="text-sm">😊</span>
            </button>
          </div>

          {/* Message menu dropdown */}
          {showMessageMenu && isOwnMessage && (
            <div className="absolute bottom-8 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden z-10">
              <button
                onClick={() => { setIsEditing(true); setShowMessageMenu(false); }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => { handlePinMessage(); setShowMessageMenu(false); }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isPinned ? '📌 Unpin' : '📌 Pin'}
              </button>
              <button
                onClick={() => { handleDeleteMessage(); setShowMessageMenu(false); }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                🗑️ Delete
              </button>
            </div>
          )}

          {/* Reaction picker */}
          {showReactionPicker && (
            <div className="absolute bottom-12 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-2 flex space-x-1 z-10">
              {commonEmojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReactionClick(emoji)}
                  className={classNames(
                    message.reactions?.some(r => r.emoji === emoji && r.userId === currentUser.uid)
                      ? "bg-blue-200 dark:bg-blue-700"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700",
                    "p-1 rounded transition-colors"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </li>
    </>
  );
}
