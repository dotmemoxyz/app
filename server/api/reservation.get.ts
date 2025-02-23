import type { MemoDTO, ReservationDTO } from "~/types/memo";

const RUNTIME_CONFIG = useRuntimeConfig();

type Reservation = {
  poap: MemoDTO;
  reservation: ReservationDTO;
};

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const [rawData, err] = await $fetch<Reservation>(
    `${RUNTIME_CONFIG.apiUrl}/poaps/${query.code}/reservation/${query.reservation}`,
  )
    .then((r) => [r, null] as const)
    .catch((r) => [null, r] as const);

  if (err) {
    throw createError("An unknown error has occoured");
  }

  if (!rawData) {
    throw createError("Not found");
  }

  return rawData?.reservation;
});
