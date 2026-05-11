import { useEffect, useRef, useState } from "react";

import {
  getAllUsers,
  getChatRooms,
  initiateSocketConnection,
} from "../../services/ChatService";
import { sampleUsers } from "../../data/sampleUsers";
import { useAuth } from "../../contexts/AuthContext";

import ChatRoom from "../chat/ChatRoom";
import Welcome from "../chat/Welcome";
import AllUsers from "../chat/AllUsers";
import SearchUsers from "../chat/SearchUsers";

export default function ChatLayout() {
  const [users, SetUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});

  const [currentChat, setCurrentChat] = useState();
  const [onlineUsersId, setonlineUsersId] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isContact, setIsContact] = useState(false);

  const socket = useRef();

  const { currentUser } = useAuth();

  useEffect(() => {
    const getSocket = async () => {
      const res = await initiateSocketConnection();
      socket.current = res;
      socket.current.emit("addUser", currentUser.uid);
      socket.current.on("getUsers", (users) => {
        const userId = users.map((u) => u[0]);
        setonlineUsersId(userId);
      });

      // Listen for new messages to update unread counts and last message
      socket.current.on("getMessage", (data) => {
        // Update unread count
        setUnreadCounts(prev => ({
          ...prev,
          [data.chatRoomId]: (prev[data.chatRoomId] || 0) + 1
        }));

        // Update last message in chat list
        setChatRooms(prevRooms => 
          prevRooms.map(room => 
            room._id === data.chatRoomId 
              ? { ...room, lastMessage: { message: data.message, sender: data.senderId, createdAt: new Date() } }
              : room
          )
        );
      });
    };

    getSocket();
  }, [currentUser.uid]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getChatRooms(currentUser.uid);
      setChatRooms(res);
    };

    fetchData();
  }, [currentUser.uid]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllUsers();
      const fetchedUsers = Array.isArray(res) ? res : [];
      const filteredUsers = fetchedUsers.filter(
        (user) => user.uid !== currentUser.uid
      );

      SetUsers(filteredUsers.length > 0 ? filteredUsers : sampleUsers);
    };

    fetchData();
  }, [currentUser.uid]);

  useEffect(() => {
    setFilteredUsers(users);
    setFilteredRooms(chatRooms);
  }, [users, chatRooms]);

  useEffect(() => {
    if (isContact) {
      setFilteredUsers([]);
    } else {
      setFilteredRooms([]);
    }
  }, [isContact]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
    // Clear unread count for this chat
    setUnreadCounts(prev => ({
      ...prev,
      [chat._id]: 0
    }));
  };

  const handleMessageSent = (chatRoomId, message) => {
    setChatRooms(prevRooms => 
      prevRooms.map(room => 
        room._id === chatRoomId 
          ? { ...room, lastMessage: { message, sender: currentUser.uid, createdAt: new Date() } }
          : room
      )
    );
  };

  const updateUnreadCount = (chatRoomId, count) => {
    setUnreadCounts(prev => ({
      ...prev,
      [chatRoomId]: count
    }));
  };

  const handleSearch = (newSearchQuery) => {
    setSearchQuery(newSearchQuery);

    const searchedUsers = users.filter((user) => {
      return user.displayName
        .toLowerCase()
        .includes(newSearchQuery.toLowerCase());
    });

    const searchedUsersId = searchedUsers.map((u) => u.uid);

    // If there are initial contacts
    if (chatRooms.length !== 0) {
      chatRooms.forEach((chatRoom) => {
        // Check if searched user is a contact or not.
        const isUserContact = chatRoom.members.some(
          (e) => e !== currentUser.uid && searchedUsersId.includes(e)
        );
        setIsContact(isUserContact);

        isUserContact
          ? setFilteredRooms([chatRoom])
          : setFilteredUsers(searchedUsers);
      });
    } else {
      setFilteredUsers(searchedUsers);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="min-w-full bg-white border-x border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700 rounded lg:grid lg:grid-cols-3">
        <div className="bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-700 lg:col-span-1">
          <SearchUsers handleSearch={handleSearch} />

          <AllUsers
            users={searchQuery !== "" ? filteredUsers : users}
            chatRooms={searchQuery !== "" ? filteredRooms : chatRooms}
            setChatRooms={setChatRooms}
            onlineUsersId={onlineUsersId}
            currentUser={currentUser}
            unreadCounts={unreadCounts}
            changeChat={handleChatChange}
          />
        </div>

        {currentChat ? (
          <ChatRoom
            currentChat={currentChat}
            currentUser={currentUser}
            socket={socket}
            onMessageSent={handleMessageSent}
          />
        ) : (
          <Welcome />
        )}
      </div>
    </div>
  );
}
