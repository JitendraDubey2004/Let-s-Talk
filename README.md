# Let's Talk

A modern, feature-rich real-time chat application built with React, Node.js, Firebase, and MongoDB. Engage in seamless conversations with advanced messaging features, real-time notifications, and intuitive UI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D14-brightgreen)
![React Version](https://img.shields.io/badge/react-%3E%3D18-blue)

## ✨ Features

### Phase 1: Core UX Improvements
- **Typing Indicators** - See when users are typing in real-time
- **Message Status** - Track message delivery (sent → delivered → read)
- **Unread Badges** - Quick view of unread message counts
- **Smart Timestamps** - Intelligent time formatting (today/yesterday/date)

### Phase 2: Message Reactions
- **Emoji Reactions** - React to messages with 6 common emojis
- **Reaction Counter** - See how many users reacted with each emoji
- **Interactive Picker** - Hover to reveal reaction options

### Phase 3: Advanced Messaging
- **Edit Messages** - Modify sent messages with edit history
- **Delete Messages** - Remove messages permanently
- **Search Messages** - Full-text search across conversations
- **Pin Messages** - Pin important messages to top of chat
- **Message Menu** - Quick access to actions via hover menu

### Authentication & Profiles
- **Firebase Auth** - Secure email/password authentication
- **Profile Management** - Update display name and avatar
- **Random Avatars** - Auto-generated user avatars
- **Online Status** - See who's online in real-time

### Core Features
- **Real-time Messaging** - Instant message delivery via Socket.io
- **One-on-One Chats** - Direct messaging with other users
- **Dark Mode** - Built-in dark/light theme toggle
- **Responsive Design** - Works perfectly on desktop and mobile
- **Search Users** - Find and start conversations with other users
- **Emoji Picker** - Integrated emoji support in messages

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Tailwind CSS** - Utility-first styling
- **Socket.io Client** - Real-time communication
- **Firebase Auth v9** - Authentication
- **Axios** - HTTP client
- **Heroicons** - Icon library
- **Emoji Picker React** - Emoji selection

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Socket.io** - Real-time events
- **MongoDB** - NoSQL database with Mongoose ODM
- **Firebase Admin** - Backend authentication

## 📋 Prerequisites

- Node.js (v14+)
- MongoDB Atlas account (or local MongoDB)
- Firebase project
- npm or yarn

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd lets-talk
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 3. Install Backend Dependencies
```bash
cd ../server
npm install
```

### 4. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Generate a private key from Project Settings → Service Accounts
4. Save as `server/config/serviceAccountKey.json`
5. Copy your Firebase config to `frontend/.env`

### 5. Environment Variables

**Frontend (.env)**
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

**Backend (.env)**
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

## 🎯 Getting Started

### Start Backend
```bash
cd server
npm start
```
Server runs on `http://localhost:5000`

### Start Frontend
```bash
cd frontend
npm start
```
Application runs on `http://localhost:3000`

## 📁 Project Structure

```
lets-talk/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── accounts/     # Login, Register, Profile
│   │   │   ├── chat/         # Chat, Messages, Reactions
│   │   │   └── layouts/      # Header, ThemeToggler
│   │   ├── services/         # API calls & Socket setup
│   │   ├── contexts/         # Auth context
│   │   ├── config/           # Firebase config
│   │   └── utils/            # Helpers & utilities
│   └── package.json
│
├── server/
│   ├── models/               # MongoDB schemas
│   ├── controllers/          # Business logic
│   ├── routes/               # API routes
│   ├── middlewares/          # Auth & verification
│   ├── config/               # Database config
│   ├── index.js              # Express app & Socket.io
│   └── package.json
│
└── README.md
```

## 🔑 Key Components

### Frontend
- **ChatRoom** - Main messaging interface
- **Message** - Individual message with reactions/edit/delete
- **ChatForm** - Message input with emoji picker
- **AllUsers** - Chat list with unread badges
- **SearchMessages** - Search modal
- **PinnedMessages** - Pinned messages bar

### Backend
- **ChatMessage** - Message schema with reactions, status, edit history
- **ChatRoom** - Room schema with members, pinned messages
- **User** - User management endpoints
- **Socket Handlers** - Real-time events for typing, reactions, messages

## 🔄 Real-time Features

### Socket Events Emitted
- `addUser` - User comes online
- `sendMessage` - Send message
- `typing` - User is typing
- `addReaction` - React to message
- `removeReaction` - Remove reaction
- `messageEdited` - Message was edited
- `messageDeleted` - Message was deleted

### Socket Events Listened
- `getUsers` - Online users list
- `getMessage` - Incoming message
- `typing` - User typing notification
- `reactionAdded` - Reaction added to message
- `reactionRemoved` - Reaction removed
- `messageUpdated` - Message edited
- `messageRemoved` - Message deleted

## 🎨 UI/UX Features

### Hover Interactions
- Message hover reveals action menu (edit/pin/delete)
- Emoji reaction picker appears on hover
- Three-dot menu for quick actions

### Theme Support
- Light and dark modes
- Persistent theme preference
- Smooth transitions

### Responsive Design
- Mobile-optimized chat interface
- Adaptive layouts
- Touch-friendly buttons

## 📝 Usage Guide

### Starting a Conversation
1. Click on a user in "Other Users" section
2. New chat room opens
3. Start typing and send messages

### Editing Messages
1. Hover over your message
2. Click menu (⋮) → "✏️ Edit"
3. Modify text and click Save
4. All users see "(edited)" indicator

### Reacting to Messages
1. Hover over any message
2. Click emoji button (😊)
3. Select emoji from picker
4. Reaction count displays below message

### Searching Messages
1. Click search icon (🔍) in chat header
2. Enter search term
3. View results with timestamps
4. Click to navigate to message

### Pinning Messages
1. Hover over message
2. Click menu (⋮) → "📌 Pin"
3. Pinned messages appear in top bar
4. Click to view or unpin

## 🐛 Troubleshooting

### Connection Issues
- Ensure both backend and frontend are running
- Check MongoDB connection string
- Verify Firebase credentials

### Real-time Not Working
- Clear browser cache and reload
- Check Socket.io connection on Network tab
- Verify CORS settings in server

### Messages Not Sending
- Check Firebase token expiry
- Verify user authentication
- Check backend console for errors

## 📊 API Endpoints

### Messages
- `POST /api/message` - Create message
- `GET /api/message/:chatRoomId` - Get messages
- `PUT /api/message/read` - Mark as read
- `PUT /api/message/edit` - Edit message
- `DELETE /api/message/delete` - Delete message
- `GET /api/message/search/:chatRoomId/:query` - Search
- `POST /api/message/reaction` - Add reaction
- `DELETE /api/message/reaction` - Remove reaction

### Chat Rooms
- `POST /api/room` - Create room
- `GET /api/room/:userId` - Get user's rooms
- `PUT /api/room/:chatRoomId` - Update room
- `POST /api/room/pin` - Pin message
- `POST /api/room/unpin` - Unpin message
- `POST /api/room/mute` - Mute room
- `POST /api/room/unmute` - Unmute room

### Users
- `POST /api/user/register` - Register user
- `GET /api/user` - Get all users
- `GET /api/user/:userId` - Get user details

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy 'build' folder
```

### Backend (Heroku/Railway)
```bash
cd server
git push heroku main
```

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 💡 Future Enhancements

- [ ] Group chats
- [ ] Voice/Video calling
- [ ] File sharing
- [ ] Message encryption
- [ ] User blocking
- [ ] Read receipts
- [ ] Message forwarding
- [ ] Scheduled messages
- [ ] Backup & restore
- [ ] Analytics dashboard

## 📧 Contact

For questions or support, please open an issue on GitHub.

## 🙏 Acknowledgments

- Firebase for authentication
- MongoDB for data storage
- Socket.io for real-time communication
- React community for amazing tools
- Tailwind CSS for beautiful styling

---

**Made with ❤️ for seamless conversations**
