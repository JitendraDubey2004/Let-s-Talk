import { useState } from "react";

export default function PinnedMessages({ pinnedMessageIds, messages, onUnpin, currentUser }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const pinnedMessages = messages.filter(msg => pinnedMessageIds?.includes(msg._id));

  if (!pinnedMessages || pinnedMessages.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-700">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 flex items-center justify-between text-sm font-semibold text-yellow-800 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
      >
        <div className="flex items-center space-x-2">
          <span>📌</span>
          <span>{pinnedMessages.length} pinned message{pinnedMessages.length !== 1 ? 's' : ''}</span>
        </div>
        <span className="text-lg">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className="border-t border-yellow-200 dark:border-yellow-700 max-h-48 overflow-y-auto">
          {pinnedMessages.map((message) => (
            <div
              key={message._id}
              className="px-4 py-3 border-b border-yellow-100 dark:border-yellow-800 last:border-b-0 flex items-start justify-between space-x-2"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">
                  {message.sender}
                </p>
                <p className="text-sm text-yellow-900 dark:text-yellow-100 truncate">
                  {message.message}
                </p>
              </div>
              {currentUser.uid === message.sender && (
                <button
                  onClick={() => onUnpin?.(message._id)}
                  className="text-xs px-2 py-1 bg-yellow-200 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-100 rounded hover:bg-yellow-300 dark:hover:bg-yellow-600 whitespace-nowrap"
                >
                  Unpin
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
