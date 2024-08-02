export const getWalletFromJwt = (jwt?: JwtDecoded) => jwt?.decodedPayload?.sub;
