import React, { useState, useEffect } from "react";
import { addLeaderboardEntry } from "../utils/leaderboard.js";

const GameCompletionModal = ({
  isOpen,
  onClose,
  elapsedTime,
  difficulty,
  onScoreSaved,
}) => {
  const [playerName, setPlayerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(""); // 'success', 'error', or ''

  const formatTime = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    setIsSubmitting(true);
    setSubmitStatus("");

    try {
      const timeInSeconds = Math.floor(elapsedTime / 1000);
      const result = await addLeaderboardEntry(
        playerName.trim(),
        difficulty,
        timeInSeconds
      );

      if (result.success) {
        setSubmitStatus("success");
        if (onScoreSaved) {
          onScoreSaved(result.data[0]);
        }
        // Auto-close after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Error saving score:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setPlayerName("");
      setSubmitStatus("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🎉 Puzzle Complete!
          </h2>

          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              Difficulty: <span className="font-semibold">{difficulty}</span>
            </p>
            <p className="text-gray-600 mb-4">
              Time:{" "}
              <span className="font-bold text-blue-600 text-xl">
                {formatTime(elapsedTime)}
              </span>
            </p>
          </div>

          {submitStatus === "success" ? (
            <div className="mb-4">
              <div className="text-green-600 text-lg font-semibold mb-2">
                ✅ Score saved successfully!
              </div>
              <p className="text-gray-600">
                Your time has been added to the leaderboard.
              </p>
            </div>
          ) : submitStatus === "error" ? (
            <div className="mb-4">
              <div className="text-red-600 text-lg font-semibold mb-2">
                ❌ Error saving score
              </div>
              <p className="text-gray-600">Please try again.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="mb-4">
                <label
                  htmlFor="playerName"
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  Enter your name for the leaderboard:
                </label>
                <input
                  type="text"
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={20}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!playerName.trim() || isSubmitting}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Saving..." : "Save Score"}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
                >
                  Skip
                </button>
              </div>
            </form>
          )}

          {submitStatus !== "success" && (
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-500 hover:text-gray-700 text-sm disabled:opacity-50"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameCompletionModal;
