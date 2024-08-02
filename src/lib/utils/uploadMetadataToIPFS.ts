import { pinataJWT } from '@/lib/constants';

export const uploadMetadataToIPFS = async (metadata: string, pinataMetadata: { name: string }): Promise<string> => {
  const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${pinataJWT}`,
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata,
      pinataOptions: {
        cidVersion: 1,
      },
    }),
  });

  if (!res.ok) {
    throw new Error('Upload to IPFS failed, Pina API down');
  }

  return ((await res.json()) as any).IpfsHash;
};
