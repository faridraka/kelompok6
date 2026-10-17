import { z } from '@hono/zod-openapi'
import { LaneEnum } from './users.schema.js'

// Satu baris dompet: satu order = satu player terdaftar = satu transaksi.
export const TransactionSchema = z
  .object({
    id: z.string().uuid().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    playerName: z.string().openapi({ example: 'aslarant' }),
    lane: LaneEnum,
    date: z.string().nullable().openapi({ example: '2026-09-20T12:00:00+07:00' }),
    amount: z.number().int().min(0).openapi({ example: 400000 }),
    status: z.enum(['Available', 'Pending']).openapi({ example: 'Available' }),
  })
  .openapi('Transaction')

// Ringkasan dompet coach: saldo, total, jumlah player, dan daftar transaksi.
export const WalletResponseSchema = z
  .object({
    available: z.number().int().min(0).openapi({ example: 800000 }),
    pending: z.number().int().min(0).openapi({ example: 400000 }),
    totalEarned: z.number().int().min(0).openapi({ example: 1200000 }),
    players: z.number().int().min(0).openapi({ example: 3 }),
    transactions: z.array(TransactionSchema),
  })
  .openapi('Wallet')
