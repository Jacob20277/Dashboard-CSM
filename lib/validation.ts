import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().trim().min(1, "Account name is required"),
});

export const bulkCreateAccountsSchema = z.object({
  namesBlob: z.string().trim().min(1, "Paste at least one account name"),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const activityLogSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    accountId: z.string().min(1, "Select an account"),
    activityDate: z.string().min(1, "Select a date"),
    durationMinutes: z.coerce.number().int().positive("Duration must be greater than 0"),
    notes: z.string().trim().min(1, "Notes are required"),
    kpiIds: z.array(z.string()).default([]),
    noKpiFit: z.boolean().default(false),
  })
  .refine((data) => data.kpiIds.length > 0 || data.noKpiFit, {
    message: "Select at least one KPI, or mark as not fitting any KPI",
    path: ["kpiIds"],
  });

export const taxonomyRenameSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Name is required"),
});

export const shareTokenCreateSchema = z.object({
  label: z.string().trim().optional(),
});

export const changePasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
