export default function UserLayout({ user, onlineUsersId, unreadCount, lastMessage }) {
  return (
    <div className="relative flex items-center justify-between w-full">
      <div className="flex items-center flex-1 min-w-0">
        <div className="relative">
          <img className="w-10 h-10 rounded-full" src={user?.photoURL} alt="" />
          {onlineUsersId?.includes(user?.uid) ? (
            <span className="bottom-0 right-0 absolute w-3 h-3 bg-green-500 dark:bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
          ) : (
            <span className="bottom-0 right-0 absolute w-3 h-3 bg-gray-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
          )}
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="block font-medium text-gray-900 dark:text-white truncate">
              {user?.displayName}
            </span>
          </div>
          {lastMessage && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {lastMessage.sender === user?.uid ? "" : "You: "}
              {lastMessage.message}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end ml-2">
        {unreadCount > 0 && (
          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
    </div>
  );
}

