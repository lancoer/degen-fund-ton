const toByteArray = (num: number): Uint8Array => {
  const bytes = [];
  while (num > 0n) {
    bytes.push(num & 0xff);
    num >>= 8;
  }
  return new Uint8Array(bytes.reverse());
};

const fromByteArray = (byteArray: Uint8Array): number => {
  let value = 0;
  for (let i = 0; i < byteArray.length; i++) {
    value = (value << 8) + byteArray[i];
  }
  return value;
};

export const idToUrl = (num: number): string => {
  const byteArray = toByteArray(num);
  let base64String = btoa(
    String.fromCharCode.apply(null, Array.from(byteArray))
  );
  return base64String
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

export const urlToId = (str: string): number => {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  let pad = base64.length % 4;
  if (pad) {
    if (pad === 1) {
      throw new Error("Invalid base64url string");
    }
    base64 += new Array(5 - pad).join("=");
  }
  let byteArray = new Uint8Array(
    atob(base64)
      .split("")
      .map((char) => char.charCodeAt(0))
  );
  return fromByteArray(byteArray);
};
