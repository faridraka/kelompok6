import { config } from 'dotenv'

config('.env')

export const {
  PORT,
  SERVER_URL,
  NODE_ENV,
} = process.env
