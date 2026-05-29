import "server-only";

import { z } from "zod";
import type { PrismaClient } from "@prisma/client";

import {
  AddRealEstateSchema,
  applyAddRealEstate,
} from "./addRealEstate";
import {
  AddFinancialAccountSchema,
  applyAddFinancialAccount,
} from "./addFinancialAccount";
import { AddPersonSchema, applyAddPerson } from "./addPerson";
import {
  FlagHeirsPropertyRiskSchema,
  applyFlagHeirsPropertyRisk,
} from "./flagHeirsPropertyRisk";
import {
  ConfirmChapterCompleteSchema,
  applyConfirmChapterComplete,
} from "./confirmChapterComplete";
import { DeferChapterSchema, applyDeferChapter } from "./deferChapter";
import {
  UpdateAssetFieldSchema,
  applyUpdateAssetField,
} from "./updateAssetField";

export const toolSchemas = {
  add_real_estate: AddRealEstateSchema,
  add_financial_account: AddFinancialAccountSchema,
  add_person: AddPersonSchema,
  flag_heirs_property_risk: FlagHeirsPropertyRiskSchema,
  confirm_chapter_complete: ConfirmChapterCompleteSchema,
  defer_chapter: DeferChapterSchema,
  update_asset_field: UpdateAssetFieldSchema,
} as const;

export type ToolName = keyof typeof toolSchemas;

export type ToolCall = {
  [K in ToolName]: { name: K; args: z.infer<(typeof toolSchemas)[K]> };
}[ToolName];

export type ToolResult =
  | { ok: true; name: ToolName; data: unknown }
  | { ok: false; name: ToolName; error: string };

type ApplyContext = {
  prisma: PrismaClient;
  userId: string;
  stateCode: string;
};

export async function validateAndApply(
  call: { name: string; args: unknown },
  ctx: ApplyContext,
): Promise<ToolResult> {
  const name = call.name as ToolName;
  const schema = toolSchemas[name];
  if (!schema) {
    return { ok: false, name: name, error: `Unknown tool: ${call.name}` };
  }

  const parsed = schema.safeParse(call.args);
  if (!parsed.success) {
    return {
      ok: false,
      name,
      error: parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; "),
    };
  }

  try {
    switch (name) {
      case "add_real_estate": {
        const data = await applyAddRealEstate(
          ctx.prisma,
          ctx.userId,
          ctx.stateCode,
          parsed.data as z.infer<typeof AddRealEstateSchema>,
        );
        return { ok: true, name, data };
      }
      case "add_financial_account": {
        const data = await applyAddFinancialAccount(
          ctx.prisma,
          ctx.userId,
          ctx.stateCode,
          parsed.data as z.infer<typeof AddFinancialAccountSchema>,
        );
        return { ok: true, name, data };
      }
      case "add_person": {
        const data = await applyAddPerson(
          ctx.prisma,
          ctx.userId,
          ctx.stateCode,
          parsed.data as z.infer<typeof AddPersonSchema>,
        );
        return { ok: true, name, data };
      }
      case "flag_heirs_property_risk": {
        const data = await applyFlagHeirsPropertyRisk(
          ctx.prisma,
          ctx.userId,
          parsed.data as z.infer<typeof FlagHeirsPropertyRiskSchema>,
        );
        return { ok: true, name, data };
      }
      case "confirm_chapter_complete": {
        const data = await applyConfirmChapterComplete(
          ctx.prisma,
          ctx.userId,
          parsed.data as z.infer<typeof ConfirmChapterCompleteSchema>,
        );
        return { ok: true, name, data };
      }
      case "defer_chapter": {
        const data = await applyDeferChapter(
          ctx.prisma,
          ctx.userId,
          parsed.data as z.infer<typeof DeferChapterSchema>,
        );
        return { ok: true, name, data };
      }
      case "update_asset_field": {
        const data = await applyUpdateAssetField(
          ctx.prisma,
          ctx.userId,
          parsed.data as z.infer<typeof UpdateAssetFieldSchema>,
        );
        return { ok: true, name, data };
      }
    }
  } catch (e) {
    return {
      ok: false,
      name,
      error: e instanceof Error ? e.message : "Apply failed",
    };
  }
}
