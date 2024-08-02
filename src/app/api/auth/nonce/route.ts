// TODO: implement actual nonce generation

export async function GET() {
  const nonce = [...Array(1)]
    .map(() => Math.random().toFixed(8).replace(".", ""))
    .join("");

  return Response.json({ nonce });
}
