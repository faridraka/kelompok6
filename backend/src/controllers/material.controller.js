import { supabaseAdmin } from "../lib/supabase.js";
import { AppError } from "../utils/error.js";

const toMaterial = (row) => ({
  id: row.id,
  coachId: row.coach_id,
  type: row.type,
  title: row.title,
  tagline: row.tagline ?? null,
  description: row.description ?? null,
  thumbnailUrl: row.thumbnail_url ?? null,
  link: row.link,
  createdAt: row.created_at ?? null,
});

const resolveRole = async (user) => {
  if (user.role) return user.role;
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return profile?.role;
};

export const materialController = {
  // POST /materials — body JSON. Hanya coach (requireRole di route).
  create: async (c) => {
    const user = c.get("user");
    if (!user?.id) throw new AppError("Unauthorized", 401);

    const { type, title, tagline, description, thumbnailUrl, link } = c.req.valid("json");

    const { data, error } = await supabaseAdmin
      .from("materials")
      .insert({
        coach_id: user.id,
        type,
        title,
        tagline: tagline ?? null,
        description: description ?? null,
        thumbnail_url: thumbnailUrl ?? null,
        link,
      })
      .select()
      .maybeSingle();

    if (error) throw new AppError(error.message, 500);
    if (!data) throw new AppError("Gagal membuat material", 500);

    return c.json(toMaterial(data), 201);
  },
  // GET /materials — player: semua materials; coach: miliknya saja.
  list: async (c) => {
    const user = c.get("user");
    if (!user?.id) throw new AppError("Unauthorized", 401);

    const role = await resolveRole(user);
    if (role !== "player" && role !== "coach") throw new AppError("Forbidden", 403);

    const { type } = c.req.valid("query");

    let query = supabaseAdmin
      .from("materials")
      .select("id, coach_id, type, title, tagline, description, thumbnail_url, link, created_at")
      .order("created_at", { ascending: false });
    if (role === "coach") query = query.eq("coach_id", user.id);
    if (type) query = query.eq("type", type);

    const { data, error } = await query;
    if (error) throw new AppError(error.message, 500);

    return c.json((data ?? []).map(toMaterial), 200);
  },
};
