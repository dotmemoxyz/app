export default defineEventHandler(async (event) => {
  const nonce = crypto.randomUUID();
  setCookie(event, "siws-nonce", nonce, {
    // path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  }); //{ maxAge: 60 * 60 * 24 * 7 }

  return nonce;
});
