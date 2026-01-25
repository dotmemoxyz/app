import type { TiersData } from "~/types/memo";

type UpdateTiersBody =
  | {
      enabled: true;
      distributionMode: string;
      tiers: Array<{ name: string; weight: number; image?: string }>;
    }
  | { enabled: false };

export default defineEventHandler(async (event) => {
  const RUNTIME_CONFIG = useRuntimeConfig();
  const { id, chain } = getRouterParams(event);
  const token = getCookie(event, "account-token");

  if (!token) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized access",
    });
  }

  const body = await readBody<UpdateTiersBody>(event);

  try {
    const response = await $fetch<{ success: boolean; message: string; tiers?: TiersData | null }>(
      `${RUNTIME_CONFIG.apiUrl}/manage/memos/${chain}/${id}/tiers`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body,
      },
    );

    return response;
  } catch (error: any) {
    if (error.statusCode === 409) {
      throw createError({
        statusCode: 409,
        message: "Rarity tiers cannot be modified after claims have been made",
      });
    }
    if (error.statusCode === 403) {
      throw createError({
        statusCode: 403,
        message: "Only the memo creator can update tiers",
      });
    }
    if (error.statusCode === 404) {
      throw createError({
        statusCode: 404,
        message: "Memo not found",
      });
    }

    console.error("Error updating tiers:", error);
    throw createError({
      statusCode: 500,
      message: `Failed to update tiers: ${error.message || "Unknown error"}`,
    });
  }
});
