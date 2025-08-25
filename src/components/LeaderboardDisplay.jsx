import React, { useState, useEffect } from "react";
import { getLeaderboard } from "../utils/leaderboard.js";

const LeaderboardDisplay = ({ isOpen, onClose }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState("Easy");
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const difficulties = ["Easy", "Medium", "Difficult"];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const loadLeaderboard = async (difficulty) => {
    setLoading(true);
    setError("");

    try {
      const result = await getLeaderboard(difficulty, 20);
      console.log('Leaderboard data returned:', result.data);
      if (result.success) {
        setLeaderboardData(result.data);
      } else {
        setError("Failed to load leaderboard");
        console.error("Error loading leaderboard:", result.error);
      }
    } catch (error) {
      setError("Failed to load leaderboard");
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard(selectedDifficulty);
    }
  }, [isOpen, selectedDifficulty]);

  const handleDifficultyChange = (difficulty) => {
    setSelectedDifficulty(difficulty);
  };

  const handleRefresh = () => {
    loadLeaderboard(selectedDifficulty);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">🏆 Leaderboard</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Difficulty Tabs */}
          <div className="flex gap-2 mb-6">
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => handleDifficultyChange(diff)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  selectedDifficulty === diff
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Top 20 - {selectedDifficulty}
            </h3>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 text-sm"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Loading leaderboard...</div>
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">
                  No entries yet for {selectedDifficulty}
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  Complete a puzzle to see your time here!
                </div>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left font-semibold text-gray-700 border-b">
                      Rank
                    </th>
                    <th className="p-3 text-left font-semibold text-gray-700 border-b">
                      Player
                    </th>
                    <th className="p-3 text-left font-semibold text-gray-700 border-b">
                      Time
                    </th>
                    <th className="p-3 text-left font-semibold text-gray-700 border-b">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className={`border-b hover:bg-gray-50 ${
                        index < 3 ? "bg-yellow-50" : ""
                      }`}
                    >
                      <td className="p-3">
                        <span
                          className={`font-bold ${
                            index === 0
                              ? "text-yellow-600"
                              : index === 1
                              ? "text-gray-500"
                              : index === 2
                              ? "text-orange-600"
                              : "text-gray-700"
                          }`}
                        >
                          {index === 0
                            ? "🥇"
                            : index === 1
                            ? "🥈"
                            : index === 2
                            ? "🥉"
                            : ""}{" "}
                          {index + 1}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-gray-800">
                        {entry.player_name}
                      </td>
                      <td className="p-3 font-mono text-lg font-bold text-blue-600">
                        {formatTime(entry.time_taken)}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {formatDate(entry.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Times are sorted from fastest to slowest
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardDisplay;
