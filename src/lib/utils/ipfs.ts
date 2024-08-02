export const parseIpfsUrl = (url: string) => {
  const cid = url.split("ipfs://")[1];
  const cidAlt = url.split("https://ipfs.io/ipfs/")[1];

  return `https://degen-ipfs.xastrobunny.workers.dev/image/${cid || cidAlt}`;
};
