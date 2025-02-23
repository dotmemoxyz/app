import type { MemoDTO, ReservationDTO } from "~/types/memo";

const RUNTIME_CONFIG = useRuntimeConfig();

type Reservations = {
  poap: MemoDTO;
  reservations: ReservationDTO[];
};

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const [rawData, err] = await $fetch<Reservations>(`${RUNTIME_CONFIG.apiUrl}/poaps/${query.code}/reservation`)
    .then((r) => [r, null] as const)
    .catch((r) => [null, r] as const);

  if (err) {
    throw createError({ statusMessage: "An unknown error has occoured" });
  }

  if (!rawData) {
    throw createError({
      statusCode: 404,
      statusMessage: "Memo not found",
    });
  }

  return { count: rawData?.reservations.length };
});
