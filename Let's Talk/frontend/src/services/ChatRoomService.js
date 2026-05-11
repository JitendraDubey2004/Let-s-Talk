import axios from "axios";
import auth from "../config/firebase";

const baseURL = "http://localhost:5000/api";

const getUserToken = async () => {
  const user = auth.currentUser;
  const token = user && (await user.getIdToken());
  return token;
};

const createHeader = async () => {
  const token = await getUserToken();

  const payloadHeader = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  return payloadHeader;
};

export const updateChatRoom = async (chatRoomId, updateData) => {
  const header = await createHeader();

  try {
    const res = await axios.put(`${baseURL}/room/${chatRoomId}`, updateData, header);
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const muteChatRoom = async (chatRoomId, userId) => {
  const header = await createHeader();

  try {
    const res = await axios.post(`${baseURL}/room/mute`, { chatRoomId, userId }, header);
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const unmuteChatRoom = async (chatRoomId, userId) => {
  const header = await createHeader();

  try {
    const res = await axios.post(`${baseURL}/room/unmute`, { chatRoomId, userId }, header);
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const pinMessage = async (chatRoomId, messageId) => {
  const header = await createHeader();

  try {
    const res = await axios.post(`${baseURL}/room/pin`, { chatRoomId, messageId }, header);
    return res.data;
  } catch (e) {
    console.error(e);
  }
};

export const unpinMessage = async (chatRoomId, messageId) => {
  const header = await createHeader();

  try {
    const res = await axios.post(`${baseURL}/room/unpin`, { chatRoomId, messageId }, header);
    return res.data;
  } catch (e) {
    console.error(e);
  }
};
