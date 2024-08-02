import { pinataJWT } from '@/lib/constants';

export const uploadImageToIPFS = async (file: File): Promise<string> => {
  if (!file || typeof file !== 'object' || !file['stream']) {
    throw new Error('No file found');
  }

  const formData = new FormData();
  formData.append('file', file);

  const pinataMetadata = JSON.stringify({
    name: file.name,
  });
  formData.append('pinataMetadata', pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 0,
  });
  formData.append('pinataOptions', pinataOptions);

  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${pinataJWT}`,
    },
  });

  if (!res.ok) {
    throw new Error('Upload to IPFS failed, Pina API down');
  }

  return ((await res.json()) as any).IpfsHash;

  // try {
  //   return await fetch("https://api.pixlab.io/store", {
  //     method: "POST",
  //     body: pixlabFormData,
  //   });
  // } catch (error) {
  //   console.error("Pixlab API is down");
  // }

  // try {

  //   const pixlabFormData = new FormData();
  //   pixlabFormData.append("file", file);
  //   pixlabFormData.append("key", pixlabApiKey);

  //   const [pinataRes, pixlabRes] = await Promise.all([
  //     (async () => {
  //       return await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
  //         method: "POST",
  //         body: formData,
  //         headers: {
  //           Authorization: `Bearer ${pinataJWT}`,
  //         },
  //       });
  //     })(),
  //     (async () => {
  //       try {
  //         return await fetch("https://api.pixlab.io/store", {
  //           method: "POST",
  //           body: pixlabFormData,
  //         });
  //       } catch (error) {
  //         console.error("Pixlab API is down");
  //       }
  //     })(),
  //   ]);

  //   if (!pinataRes.ok) {
  //     throw new Error("Upload to IPFS failed, Pina API down");
  //   }

  //   const data = (await pinataRes.json()) as any;
  //   const ipfsHash = data.IpfsHash;
  //   const ipfsImageUri = `https://ipfs.io/ipfs/${ipfsHash}`;

  //   if (pixlabRes?.ok) {
  //     const reply = (await pixlabRes.json()) as any;
  //     pixlabFormData.append("comment", ipfsHash);

  //     const resp2 = await fetch(
  //       `https://api.pixlab.io/nsfw?img=${reply.link}&key=${pixlabApiKey}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     if (resp2.ok) {
  //       const data = (await resp2.json()) as any;
  //       const nsfwScore = data.score;
  //       if (nsfwScore > 0.5) {
  //         return NextResponse.json(
  //           { status: "error", message: "Nsfw content detected" },
  //           { status: 500 }
  //         );
  //       }
  //     }
  //   } else {
  //     console.warn("Pixlab API is down");
  //   }

  //   return NextResponse.json({ status: "success", url: ipfsImageUri });
  // } catch (error: any) {
  //   console.error("Upload failed", error);
  //   return NextResponse.json(
  //     { status: "error", message: error.message },
  //     { status: 500 }
  //   );
  // }

  // const data = (await res.json()) as any;
  // if (data.status === "error") {
  //   throw new Error(data.message);
  // }

  // if (!res.ok) {
  //   throw new Error("Upload failed, Server error");
  // }
};
