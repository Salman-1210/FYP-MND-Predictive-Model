// MND_frontend/lib/api.js
const API_URL = "http://127.0.0.1:8000";

export const getExercises = async (bodyPart) => {
  try {
    const res = await fetch(`${API_URL}/api/get-exercises/${bodyPart}`);
    if (!res.ok) throw new Error("API call failed");
    return await res.json();
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return [];
  }
};