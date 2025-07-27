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
      <div className="bg-gray-800 bg-opacity-90 rounded-lg p-8 max-w-md w-full mx-4 border-2 border-gray-600 min-h-[500px]">
        <div className="text-center">
          <h2 className="text-3xl mt-6 font-bold text-white mb-8">
            🎉 Puzzle Complete!
          </h2>

          <div className="mb-8">
            <p className="text-gray-300 text-xl mb-4">
              Difficulty:{" "}
              <span className="text-xl font-semibold text-white">{difficulty}</span>
            </p>
            <p className="text-gray-300 text-xl mb-2">
              Time:{" "}
              <span className="font-bold text-blue-400 text-2xl">
                {formatTime(elapsedTime)}
              </span>
            </p>
          </div>

          {submitStatus === "success" ? (
            <div className="mb-4">
              <div className="text-green-400 text-lg font-semibold mb-2">
                ✅ Score saved successfully!
              </div>
              <p className="text-gray-300">
                Your time has been added to the leaderboard.
              </p>
            </div>
          ) : submitStatus === "error" ? (
            <div className="mb-4">
              <div className="text-red-400 text-lg font-semibold mb-2">
                ❌ Error saving score
              </div>
              <p className="text-gray-300">Please try again.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mb-8">
              <div className="mb-4">
                <label
                  htmlFor="playerName"
                  className="block text-gray-300 text-md font-medium mb-3"
                >
                  Enter your name for the leaderboard:
                </label>
                <input
                  type="text"
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                  maxLength={20}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!playerName.trim() || isSubmitting}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Saving..." : "Save Score"}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
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
              className="text-gray-400 hover:text-gray-200 text-lg px-4 disabled:opacity-50"
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
