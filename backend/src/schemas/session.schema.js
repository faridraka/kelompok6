import { z } from '@hono/zod-openapi'

export const SessionStatusSchema = z.enum(['scheduled', 'completed']).openapi({ example: 'scheduled' })

export const SessionVodSchema = z
  .object({
    url: z.string().openapi({ example: 'https://example.com/vod-1.mp4' }),
    downloadUrl: z.string().openapi({ example: 'https://example.com/vod-1.mp4' }),
  })
  .nullable()
  .openapi('SessionVod')

export const SessionCoachSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().openapi({ example: 'Coach Seemon' }),
    avatar: z.string().nullable().openapi({ example: null }),
  })
  .openapi('SessionCoach')

export const SessionSchema = z
  .object({
    id: z.string().uuid(),
    orderId: z.string().uuid(),
    sessionNumber: z.number().int().openapi({ example: 1 }),
    totalSessions: z.number().int().openapi({ example: 3 }),
    scheduledAt: z.string().nullable().openapi({ example: '2026-10-03T20:00:00+07:00' }),
    scheduledEnd: z.string().nullable().openapi({ example: '2026-10-03T21:00:00+07:00' }),
    meetingLink: z.string().nullable().openapi({ example: 'https://meet.google.com/abc-defg-hij' }),
    status: SessionStatusSchema,
    vod: SessionVodSchema,
    completedAt: z.string().nullable().openapi({ example: null }),
    coach: SessionCoachSchema.optional(),
  })
  .openapi('Session')

export const GetSessionsQuery = z.object({
  orderId: z.string().uuid().optional().openapi({
    param: { name: 'orderId', in: 'query' },
    example: 'dea8125a-cd7a-499c-adec-f89513d32e74',
    description: 'Opsional: filter sessions milik satu order. Order harus milik user yang login.',
  }),
})

export const CreateScheduleSessionParams = z.object({
  id: z.string().uuid().openapi({
    param: { name: 'id', in: 'path' },
    example: 'dea8125a-cd7a-499c-adec-f89513d32e74',
    description: 'ID session yang mau dijadwalkan.',
  }),
})

export const CreateScheduleSessionBody = z.object({
  scheduledAt: z.string().datetime({ offset: true }).openapi({
    example: '2026-10-03T20:00:00+07:00',
    description: 'Waktu mulai sesi (ISO 8601).',
  }),
  scheduledEnd: z.string().datetime({ offset: true }).openapi({
    example: '2026-10-03T21:00:00+07:00',
    description: 'Waktu selesai sesi (ISO 8601).',
  }),
})
