import { supabase, supabaseAdmin } from "../lib/supabase.js";
import { AppError } from "../utils/error.js";

export const authController = {
  register: async (c) => {
    const { email, password, role, name } = c.req.valid("json");

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    });
    if (error) throw new AppError(error.message, 400);

    return c.json({ id: data.user.id, email: data.user.email, role }, 201);
  },
  login: async (c) => {
    const { email, password } = c.req.valid("json");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new AppError(error.message, 401);

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    if (profileError) throw new AppError("Profil tidak ditemukan", 500);

    return c.json(
      {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: profile.role, // DIUBAH
        },
      },
      200,
    );
  },
  refresh: async (c) => {
    const { refresh_token } = c.req.valid("json");

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });
    if (error) throw new AppError(error.message, 401);

    return c.json(
      {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
      200,
    );
  },
};
