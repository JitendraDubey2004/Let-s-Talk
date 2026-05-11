import { useState, useEffect, useRef } from "react";

import { getMessagesOfChatRoom, sendMessage, markMessagesAsRead } from "../../services/ChatService";

import Message from "./Message";
import Contact from "./Contact";
import ChatForm from "./ChatForm";
import SearchMessages from "./SearchMessages";
import PinnedMessages from "./PinnedMessages";

export default function ChatRoom({ currentChat, currentUser, socket, onMessageSent }) {
  const [messages, setMessages] = useState([]);
  const [incomingMessage, setIncomingMessage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [pinnedMessageIds, setPinnedMessageIds] = useState(currentChat?.pinnedMessages || []);

  const scrollRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      const res = await getMessagesOfChatRoom(currentChat._id);
      setMessages(res);

      // Mark messages as read when chat is opened
      await markMessagesAsRead(currentChat._id, currentUser.uid);
    };

    fetchData();
  }, [currentChat._id, currentUser.uid]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    socket.current?.on("getMessage", (data) => {
      if (data.chatRoomId === currentChat._id) {
        setIncomingMessage({
          sender: data.senderId,
          message: data.message,
          createdAt: new Date().toISOString()
        });
      }
    });
  }, [socket, currentChat._id]);

  useEffect(() => {
    socket.current?.on("typing", (data) => {
      if (data.chatRoomId === currentChat._id && data.senderId !== currentUser.uid) {
        setIsTyping(data.isTyping);
        setTypingUser(data.senderId);
      }
    });
  }, [socket, currentChat._id, currentUser.uid]);

  useEffect(() => {
    socket.current?.on("reactionAdded", (data) => {
      if (data.chatRoomId === currentChat._id) {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg._id === data.messageId
              ? {
                  ...msg,
                  reactions: [
                    ...(msg.reactions || []),
                    {
                      emoji: data.emoji,
                      userId: data.userId,
                      userName: data.userName,
                      createdAt: new Date()
                    }
                  ]
                }
              : msg
          )
        );
      }
    });

    socket.current?.on("reactionRemoved", (data) => {
      if (data.chatRoomId === currentChat._id) {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg._id === data.messageId
              ? {
                  ...msg,
                  reactions: (msg.reactions || []).filter(
                    r => !(r.emoji === data.emoji && r.userId === data.userId)
                  )
                }
              : msg
          )
        );
      }
    });

    socket.current?.on("messageUpdated", (data) => {
      if (data.chatRoomId === currentChat._id) {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg._id === data.messageId
              ? {
                  ...msg,
                  message: data.newMessage,
                  isEdited: data.isEdited,
                  editedAt: data.editedAt
                }
              : msg
          )
        );
      }
    });

    socket.current?.on("messageRemoved", (data) => {
      if (data.chatRoomId === currentChat._id) {
        setMessages(prevMessages =>
          prevMessages.filter(msg => msg._id !== data.messageId)
        );
      }
    });
  }, [socket, currentChat._id]);

  useEffect(() => {
    incomingMessage && setMessages((prev) => [...prev, incomingMessage]);
  }, [incomingMessage]);

  const handleFormSubmit = async (message) => {
    const receiverId = currentChat.members.find(
      (member) => member !== currentUser.uid
    );

    socket.current.emit("sendMessage", {
      chatRoomId: currentChat._id,
      senderId: currentUser.uid,
      receiverId: receiverId,
      message: message,
    });

    const messageBody = {
      chatRoomId: currentChat._id,
      sender: currentUser.uid,
      message: message,
    };
    const res = await sendMessage(messageBody);
    setMessages([...messages, res]);

    if (onMessageSent) {
      onMessageSent(currentChat._id, message);
    }
  };

  return (
    <div className="lg:col-span-2 lg:block">
      <div className="w-full">
        <div className="p-3 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700 flex items-center justify-between">
          <Contact chatRoom={currentChat} currentUser={currentUser} />
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            title="Search messages"
          >
            🔍
          </button>
        </div>

        <PinnedMessages
          pinnedMessageIds={pinnedMessageIds}
          messages={messages}
          currentUser={currentUser}
          onUnpin={(messageId) => {
            setPinnedMessageIds(pinnedMessageIds.filter(id => id !== messageId));
          }}
        />

        <div className="relative w-full p-6 overflow-y-auto h-[30rem] bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
          <ul className="space-y-2">
            {messages.map((message, index) => (
              <div key={index} ref={scrollRef}>
                <Message
                  message={message}
                  self={currentUser.uid}
                  currentUser={currentUser}
                  socket={socket.current}
                  chatRoomId={currentChat._id}
                  isPinned={pinnedMessageIds?.includes(message._id)}
                  onMessageUpdate={(messageId, newText) => {
                    setMessages(prevMessages =>
                      prevMessages.map(msg =>
                        msg._id === messageId ? { ...msg, message: newText, isEdited: true } : msg
                      )
                    );
                  }}
                  onMessageDelete={(messageId) => {
                    setMessages(prevMessages => prevMessages.filter(msg => msg._id !== messageId));
                  }}
                  onPinMessage={(messageId, isPinned) => {
                    if (isPinned) {
                      setPinnedMessageIds([...pinnedMessageIds, messageId]);
                    } else {
                      setPinnedMessageIds(pinnedMessageIds.filter(id => id !== messageId));
                    }
                  }}
                />
              </div>
            ))}
          </ul>
        </div>

        {isTyping && (
          <div className="px-6 py-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span>Someone is typing...</span>
            </div>
          </div>
        )}

        <ChatForm
          handleFormSubmit={handleFormSubmit}
          socket={socket.current}
          currentChat={currentChat}
          currentUser={currentUser}
        />

        <SearchMessages
          chatRoomId={currentChat._id}
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      </div>
    </div>
  );
}
