import { z } from '@hono/zod-openapi'

export const LaneEnum = z.enum(['gold', 'exp', 'mid', 'jungle', 'roam']).openapi({ example: 'mid' })

export const DayEnum = z
  .enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
  .openapi({ example: 'monday' })

// Availability shape: { monday: ['09:00'], ... sunday: [] }. Times are 'HH:00'.
export const CoachAvailabilitySchema = z
  .object({
    monday: z.array(z.string()).openapi({ example: ['09:00'] }),
    tuesday: z.array(z.string()).openapi({ example: [] }),
    wednesday: z.array(z.string()).openapi({ example: [] }),
    thursday: z.array(z.string()).openapi({ example: [] }),
    friday: z.array(z.string()).openapi({ example: [] }),
    saturday: z.array(z.string()).openapi({ example: [] }),
    sunday: z.array(z.string()).openapi({ example: [] }),
  })
  .openapi('CoachAvailability')

export const CoachMeSchema = z
  .object({
    id: z.string().uuid(),
    role: z.literal('coach'),
    name: z.string().openapi({ example: 'Coach Seemon' }),
    email: z.string().email().openapi({ example: 'coach@mail.com' }),
    avatar: z.string().nullable().openapi({ example: null }),
    peakRank: z.string().nullable().openapi({ example: 'Mythical Immortal' }),
    mainHero: z.string().nullable().openapi({ example: 'Ling' }),
    price: z.number().nullable().openapi({ example: 400000 }),
    bio: z.string().nullable().openapi({ example: 'Head Coach...' }),
    lanes: z.array(LaneEnum).openapi({ example: ['mid'] }),
    availability: CoachAvailabilitySchema,
  })
  .openapi('CoachMe')

export const PlayerMeSchema = z
  .object({
    id: z.string().uuid(),
    role: z.literal('player'),
    name: z.string().openapi({ example: 'Budi' }),
    email: z.string().email().openapi({ example: 'budi@mail.com' }),
    avatarUrl: z.null().openapi({ example: null }),
    bio: z.string().openapi({ example: '' }),
    timezone: z.literal('Asia/Jakarta'),
  })
  .openapi('PlayerMe')

export const MeResponse = z.union([CoachMeSchema, PlayerMeSchema]).openapi('Me')

// Coach PUT body. avatar is optional: undefined = leave unchanged, null = clear, url = set.
export const UpdateCoachMeBody = z
  .object({
    name: z.string().min(2).max(60).openapi({ example: 'Coach Seemon' }),
    peakRank: z.string().openapi({ example: 'Mythical Immortal' }),
    mainHero: z.string().openapi({ example: 'Ling' }),
    price: z.number().int().min(0).openapi({ example: 400000 }),
    bio: z.string().max(300).openapi({ example: 'Head Coach...' }),
    lanes: z.array(LaneEnum).min(1).openapi({ example: ['mid'] }),
    avatar: z.string().url().nullable().optional().openapi({ example: null }),
  })
  .openapi('UpdateCoachMeBody')

export const UpdatePlayerMeBody = z
  .object({
    name: z.string().min(2).max(60).openapi({ example: 'Budi' }),
  })
  .openapi('UpdatePlayerMeBody')

export const UpdateMeBody = z.union([UpdateCoachMeBody, UpdatePlayerMeBody]).openapi('UpdateMeBody')
