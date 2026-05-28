import "server-only";

import { z } from "zod";
import type { PrismaClient } from "@prisma/client";

export const AddPersonSchema = z.object({
  full_name: z.string().min(1).max(200),
  relationship: z.string().min(1).max(100).optional(),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "yyyy-mm-dd")
    .nullable()
    .optional(),
});

export type AddPersonInput = z.infer<typeof AddPersonSchema>;

export async function applyAddPerson(
  prisma: PrismaClient,
  userId: string,
  stateCode: string,
  args: AddPersonInput,
) {
  const created = await prisma.beneficiary.create({
    data: {
      userId,
      type: "person",
      fullName: args.full_name,
      relationship: args.relationship ?? null,
      dateOfBirth: args.date_of_birth ? new Date(args.date_of_birth) : null,
      stateCode,
    },
  });

  return created;
}
