const RUNTIME_CONFIG = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const { code, email } = await readBody(event);

  const [data, err] = await $fetch(`${RUNTIME_CONFIG.apiUrl}/poaps/${code}/reservation`, {
    method: "POST",
    body: {
      email,
    },
  })
    .then((r) => [r, null])
    .catch((r) => [null, r]);

  if (!err) {
    return data;
  }

  console.error(err);

  if (err?.response?.status === 401) {
    const [_verificationData, verificationErr] = await $fetch(`${RUNTIME_CONFIG.apiUrl}/verifications`, {
      method: "POST",
      body: {
        email,
      },
    })
      .then((r) => [r, null])
      .catch((r) => [null, r]);

    if (!verificationErr) {
      throw createError({ statusMessage: "E-mail not verified, check your inbox" });
    }

    throw createError({ statusMessage: verificationErr.data });
  }

  throw createError({ statusMessage: err.data });
});
