import { z } from "zod";
import { Status } from "@prisma/client";

export const createCompanySchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  city: z.string().optional(),
  instagram: z.string().optional(),
  website: z.string().optional(),
});

export const updateCompanySchema = z.object({
  status: z.nativeEnum(Status).optional(),
  notes: z.string().optional(),
});
