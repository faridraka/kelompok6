// lib/google.ts
import { google } from "googleapis";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } from "../config/env.js";

const auth = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET
);
auth.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

export const googleCalendar = google.calendar({ version: "v3", auth });
