type PreSignJwtPayload = {
  sub: string;
};

type JwtPayload = {
  sub: string;
  iat: number;
  exp: number;
};

interface JwtDecoded {
  value: string;
  decodedPayload: JwtPayload;
}
