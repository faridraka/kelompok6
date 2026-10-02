import { createClient } from '@supabase/supabase-js'

import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } from '../config/env.js'

const options = { auth: { persistSession: false, autoRefreshToken: false } }

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  options
)

export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  options
)
