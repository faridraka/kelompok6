import { config } from 'dotenv'

config('.env')

export const {
  PORT,
  SERVER_URL,
  NODE_ENV,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY
} = process.env
