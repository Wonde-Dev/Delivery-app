// Configure backend API endpoint
// Defaults to local backend on port 5001, but can be overridden with EXPO_PUBLIC_API_URL
const rawApiUrl = process.env.EXPO_PUBLIC_API_URL;

export const API_URL =
  rawApiUrl && !rawApiUrl.includes("clerk.accounts.dev")
    ? rawApiUrl.replace(/\/$/, "")
    : "http://localhost:5001/api";
