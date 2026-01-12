interface UpdateLocationBody {
  country: string | null;
}

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

  const body = await readBody<UpdateLocationBody>(event);

  try {
    const response = await $fetch<{ success: boolean; message: string; locationCountry?: string }>(
      `${RUNTIME_CONFIG.apiUrl}/manage/memos/${chain}/${id}/location`,
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
    if (error.statusCode === 403) {
      throw createError({
        statusCode: 403,
        message: "Only the memo creator can update location restriction",
      });
    }
    if (error.statusCode === 404) {
      throw createError({
        statusCode: 404,
        message: "Memo not found",
      });
    }

    console.error("Error updating location restriction:", error);
    throw createError({
      statusCode: 500,
      message: `Failed to update location restriction: ${error.message || "Unknown error"}`,
    });
  }
});
