import { supabase } from "../lib/supabase.js";

// Test the connection and list available tables
export const testConnection = async () => {
  try {
    // First, let's try to list all tables to see what's available
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public");

    if (tablesError) {
      console.error("Error listing tables:", tablesError);
    } else {
      console.log("Available tables:", tables);
    }

    // Now try to access the leaderboard table
    const { data, error } = await supabase
      .from("leaderboard")
      .select("count")
      .limit(1);

    if (error) {
      console.error("Connection test failed:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return false;
    }

    console.log("Connection test successful");
    return true;
  } catch (error) {
    console.error("Connection test failed:", error);
    return false;
  }
};

// Add a new leaderboard entry
export const addLeaderboardEntry = async (
  playerName,
  difficulty,
  timeTaken
) => {
  try {
    const { data, error } = await supabase
      .from("leaderboard")
      .insert([
        {
          player_name: playerName,
          difficulty: difficulty.toLowerCase(),
          time_taken: timeTaken,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Error adding leaderboard entry:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return { success: false, error };
    }

    console.log("Leaderboard entry added successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error adding leaderboard entry:", error);
    return { success: false, error };
  }
};

// Get leaderboard entries for a specific difficulty
export const getLeaderboard = async (difficulty, limit = 20) => {
  try {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .eq("difficulty", difficulty.toLowerCase())
      .order("time_taken", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Error fetching leaderboard:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return { success: false, error };
  }
};
