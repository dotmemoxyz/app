const RUNTIME_CONFIG = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const [_data, err] = await $fetch(`${RUNTIME_CONFIG.apiUrl}/verifications/${query.verification_id}`, {
    method: "POST",
  })
    .then((r) => [r, null] as const)
    .catch((r) => [null, r] as const);

  if (err) {
    return sendRedirect(event, `${RUNTIME_CONFIG.app.baseURL}?action=verify_email_error`, 302);
  }

  return sendRedirect(event, `${RUNTIME_CONFIG.app.baseURL}?action=verify_email`, 302);
});
