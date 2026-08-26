import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().trim().min(1, "Account name is required"),
  csmUserId: z.string().trim().optional(),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const updateUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  role: z.enum(["ADMIN", "MEMBER"]),
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

export const taxonomyCreateKraSchema = z.object({
  name: z.string().trim().min(1, "KRA name is required"),
});

export const taxonomyCreateKpiSchema = z.object({
  kraId: z.string().min(1),
  name: z.string().trim().min(1, "KPI name is required"),
});

export const shareTokenCreateSchema = z.object({
  label: z.string().trim().optional(),
});

export const csatLinkCreateSchema = z.object({
  accountId: z.string().min(1, "Select an account"),
  questionTexts: z
    .array(z.string().trim().min(1))
    .min(1, "Add at least one question"),
});

export const csatAnswerSchema = z.object({
  questionId: z.string().min(1),
  score: z.coerce.number().int().min(1, "Select a rating").max(5, "Select a rating"),
});

export const csatResponseSchema = z.object({
  answers: z.array(csatAnswerSchema).min(1, "Answer at least one question"),
  comment: z.string().trim().max(1000, "Keep comments under 1000 characters").optional(),
  respondentName: z.string().trim().max(200, "Keep name under 200 characters").optional(),
});

export const csatResponseEditSchema = z.object({
  responseId: z.string().min(1),
  respondentName: z.string().trim().max(200, "Keep name under 200 characters").optional(),
  comment: z.string().trim().max(1000, "Keep comments under 1000 characters").optional(),
  answers: z
    .array(
      z.object({
        answerId: z.string().min(1),
        score: z.coerce.number().int().min(1, "Select a rating").max(5, "Select a rating"),
      })
    )
    .min(1),
});

export const csatTemplateCreateSchema = z.object({
  name: z.string().trim().min(1, "Template name is required"),
});

export const csatTemplateQuestionCreateSchema = z.object({
  templateId: z.string().min(1),
  text: z.string().trim().min(1, "Question text is required"),
});

export const csatTemplateQuestionRenameSchema = z.object({
  id: z.string().min(1),
  text: z.string().trim().min(1, "Question text is required"),
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
