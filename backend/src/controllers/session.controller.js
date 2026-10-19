import { supabaseAdmin } from "../lib/supabase.js";
import { presignDownloadUrl } from "../lib/s3.js";
import { AppError } from "../utils/error.js";

// downloadUrl dibuat presigned dengan Content-Disposition: attachment supaya
// <a download> browser bekerja (atribut -dynamic diabaikan untuk URL
// cross-origin tanpa header itu). vod.url tetap URL publik biasa untuk Watch.
const toSession = async (row, totalSessions, coach) => {
  let vod = null;
  if (row.vod_url) {
    const rawDownload = row.vod_download_url ?? row.vod_url;
    const file = decodeURIComponent(
      (rawDownload.split("?")[0].split("/").pop() ?? "recording.mp4").replace(/^[0-9a-f-]{36}-/i, ""),
    );
    vod = { url: row.vod_url, downloadUrl: await presignDownloadUrl(rawDownload, file) };
  }

  return {
    id: row.id,
    orderId: row.order_id,
    sessionNumber: row.session_number,
    totalSessions,
    scheduledAt: row.scheduled_at,
    scheduledEnd: row.scheduled_end,
    meetingLink: row.meeting_link,
    status: row.status,
    vod,
    completedAt: row.completed_at,
    ...(coach ? { coach } : {}),
  };
};

export const sessionController = {
  list: async (c) => {
    const user = c.get("user");
    if (!user?.id) throw new AppError("Unauthorized", 401);

    let role = user.role;
    if (!role) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      role = profile?.role;
    }
    if (role !== "player" && role !== "coach")
      throw new AppError("Forbidden", 403);

    const { orderId } = c.req.valid("query");
    const ownerColumn = role === "player" ? "player_id" : "coach_id";

    // 1. Orders milik user (sumber totalSessions + kepemilikan).
    let ordersQuery = supabaseAdmin
      .from("orders")
      .select("id, session_count, coach_id")
      .eq(ownerColumn, user.id);
    // Coaches never see unpaid orders (same rule as GET /orders), so their sessions must not
    // leak either: otherwise the schedule joins a session to an order it cannot find.
    if (role === "coach") ordersQuery = ordersQuery.neq("status", "pending_payment");
    if (orderId) ordersQuery = ordersQuery.eq("id", orderId);
    const { data: orders, error: ordersError } = await ordersQuery;
    if (ordersError) throw new AppError(ordersError.message, 500);
    if (orderId && (!orders || orders.length === 0))
      throw new AppError("Order tidak ditemukan", 404);
    if (!orders || orders.length === 0) return c.json([], 200);

    const byOrderId = new Map(orders.map((o) => [o.id, o]));

    // 2. Sessions via FK sessions.order_id -> orders.id.
    const { data: rows, error: sessionsError } = await supabaseAdmin
      .from("sessions")
      .select(
        "id, order_id, session_number, scheduled_at, scheduled_end, status, meeting_link, vod_url, vod_download_url, completed_at",
      )
      .in("order_id", [...byOrderId.keys()])
      .order("session_number", { ascending: true });
    if (sessionsError) throw new AppError(sessionsError.message, 500);

    // 3. Info coach untuk sisi player (s.coach.name dipakai PlayerDashboard/Sessions/Vods).
    let coaches = new Map();
    if (role === "player") {
      const coachIds = [
        ...new Set(orders.map((o) => o.coach_id).filter(Boolean)),
      ];
      if (coachIds.length) {
        const [{ data: profiles }, { data: coachProfiles }] = await Promise.all(
          [
            supabaseAdmin
              .from("profiles")
              .select("id, name")
              .in("id", coachIds),
            supabaseAdmin
              .from("coach_profiles")
              .select("id, avatar_url")
              .in("id", coachIds),
          ],
        );
        const avatars = new Map(
          (coachProfiles ?? []).map((cp) => [cp.id, cp.avatar_url]),
        );
        coaches = new Map(
          (profiles ?? []).map((p) => [
            p.id,
            { id: p.id, name: p.name, avatar: avatars.get(p.id) ?? null },
          ]),
        );
      }
    }

    const data = await Promise.all(
      (rows ?? []).map(async (row) => {
        const order = byOrderId.get(row.order_id);
        const coach =
          role === "player"
            ? (coaches.get(order?.coach_id) ?? {
                id: order?.coach_id,
                name: "Coach",
                avatar: null,
              })
            : undefined;
        return toSession(row, order?.session_count ?? 3, coach);
      }),
    );
    return c.json(data, 200);
  },
  completedSession: async (c) => {
    const user = c.get("user");
    if (!user?.id) throw new AppError("Unauthorized", 401);

    const { id } = c.req.valid("param");

    const { data: session, error } = await supabaseAdmin
      .from("sessions")
      .select("order_id, scheduled_at, scheduled_end, status, google_event_id")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new AppError(error.message, 500);
    if (!session) throw new AppError("Session tidak ditemukan", 404);

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("player_id, coach_id, session_count")
      .eq("id", session.order_id)
      .maybeSingle();

    if (orderError) throw new AppError(orderError.message, 500);
    if (!order) throw new AppError("Order tidak ditemukan", 404);
    if (order.player_id !== user.id && order.coach_id !== user.id)
      throw new AppError("Session bukan milik user ini", 403);

    if (session.status === "completed")
      throw new AppError("Session sudah ditandai sebagai completed", 400);
    if (!session.scheduled_at || !session.google_event_id)
      throw new AppError("Session belum dijadwalkan", 400);
    if (!session.scheduled_end || new Date(session.scheduled_end) > new Date())
      throw new AppError("Session belum selesai", 400);

    const { data: updatedSession, error: updateError } = await supabaseAdmin
      .from("sessions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (updateError) throw new AppError(updateError.message, 500);
    if (!updatedSession) throw new AppError("Session tidak ditemukan", 404);

    return c.json(await toSession(updatedSession, order.session_count ?? 3), 200);
  },
  saveRecording: async (c) => {
    const user = c.get("user");
    if (!user?.id) throw new AppError("Unauthorized", 401);

    const { id } = c.req.valid("param");
    const { url } = c.req.valid("json");

    const { data: session, error } = await supabaseAdmin
      .from("sessions")
      .select("order_id, status")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new AppError(error.message, 500);
    if (!session) throw new AppError("Session tidak ditemukan", 404);
    if (session.status !== "completed")
      throw new AppError("Rekaman hanya bisa ditambahkan ke session yang sudah completed", 400);

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("coach_id, session_count")
      .eq("id", session.order_id)
      .maybeSingle();

    if (orderError) throw new AppError(orderError.message, 500);
    if (!order) throw new AppError("Order tidak ditemukan", 404);
    if (order.coach_id !== user.id)
      throw new AppError("Session bukan milik coach ini", 403);

    const { data: updatedSession, error: updateError } = await supabaseAdmin
      .from("sessions")
      .update({ vod_url: url, vod_download_url: url })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (updateError) throw new AppError(updateError.message, 500);
    if (!updatedSession) throw new AppError("Session tidak ditemukan", 404);

    return c.json(await toSession(updatedSession, order.session_count ?? 3), 200);
  },
};
