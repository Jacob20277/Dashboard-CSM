import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().trim().min(1, "Account name is required"),
  isStrategic: z.boolean().default(false),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const activityLogSchema = z.object({
  accountId: z.string().min(1, "Select an account"),
  activityDate: z.string().min(1, "Select a date"),
  durationMinutes: z.coerce.number().int().positive("Duration must be greater than 0"),
  notes: z.string().trim().optional(),
  kpiIds: z.array(z.string()).default([]),
});

export const taxonomyRenameSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Name is required"),
});

export const shareTokenCreateSchema = z.object({
  label: z.string().trim().optional(),
});
