import { z } from 'zod'
import { MOODS } from '@/lib/moods'

const moodValues = Object.keys(MOODS)

export const loginSchema = z.object({
  password: z.string().min(1, 'Please enter your password.'),
})

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(4, 'New password must be at least 4 characters.'),
  confirm: z.string().min(1, 'Please confirm your new password.'),
}).refine((data) => data.newPassword === data.confirm, {
  message: 'New passwords do not match.',
  path: ['confirm'],
})

export const entrySchema = z.object({
  content: z.string().min(1, 'Please write something in your entry.'),
  mood: z.enum(['', ...moodValues]).optional().default(''),
})

export const goalSchema = z.object({
  title: z.string().min(1, 'Goal title is required.'),
  category: z.enum(['weekly', 'monthly', 'yearly']),
  deadline: z.string().optional().default(''),
})

export const GOAL_CATEGORIES = ['weekly', 'monthly', 'yearly']

export const aiKeySchema = z.object({
  apiKey: z.string()
    .min(1, 'API key is required.')
    .refine((val) => val.startsWith('sk-'), {
      message: 'API key should start with "sk-".',
    }),
})
