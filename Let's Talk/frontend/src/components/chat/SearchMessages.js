import { useState } from "react";
import { searchMessages } from "../../services/ChatService";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function SearchMessages({ chatRoomId, onSearchResults, isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim() === "") {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const searchResults = await searchMessages(chatRoomId, query);
    setResults(searchResults || []);
    onSearchResults?.(searchResults);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Search Messages</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search for messages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        <div className="max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <ul className="space-y-3">
              {results.map((message, index) => (
                <li
                  key={index}
                  className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
                >
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {message.sender}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white mb-1">{message.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(message.createdAt).toLocaleDateString()} at {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                {query === "" ? "Enter a search term" : "No messages found"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
