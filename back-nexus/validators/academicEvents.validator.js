// validators/academicEvents.validator.js
import { z } from "zod";

export const createAcademicEventSchema = z.object({
  period_id: z.number().int().positive().optional().nullable(),
  event_type: z.string().min(1, "Event type is required"),
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(2000).optional().nullable(),
  start_date: z.string({ required_error: "Start date is required" }),
  end_date: z.string().optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  is_active: z.boolean().default(true),
});

export const updateAcademicEventSchema = createAcademicEventSchema.partial();