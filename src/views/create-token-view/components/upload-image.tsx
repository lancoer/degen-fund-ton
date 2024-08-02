'use client';
import React, { useRef, useState } from 'react';
import { Camera } from 'lucide-react';

import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { uploadImageToIPFS } from '@/lib/utils';
import { useTonConnectUI } from '@tonconnect/ui-react';

interface UploadImageProps {
  setUrl: (url: string) => void;
}

const UploadImage: React.FC<UploadImageProps> = ({ setUrl }) => {
  const [tonConnectUI] = useTonConnectUI();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const { toast } = useToast();
  const pinataJWT = process.env.NEXT_PUBLIC_VITE_PINATA_KEY;

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
    e.stopPropagation();
    if (isLoading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      try {
        const localUrl = URL.createObjectURL(file);
        // setImageUrl(localUrl);
        setFileName(file.name);

        const cid = await uploadImageToIPFS(file);
        const url = `https://ipfs.io/ipfs/${cid}`;
        setUrl(url);
        toast({ title: 'Success', description: 'Image uploaded successfully' });
      } catch (error: any) {
        toast({
          title: 'Image upload failed',
          description: error.message,
          variant: 'destructive',
        });
      }
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative">
      <div
        className="w-full h-10 rounded overflow-hidden cursor-pointer mx-auto border border-input-border shadow-sm flex items-center px-2"
        onClick={handleImageClick}
      >
        <button type="button" onClick={handleImageClick} className="p-1 pl-2 pr-2 text-white text-sm rounded bg-[#1d1d22] hover:bg-[#28282d]">
          Choose file
        </button>
        {fileName && <span className="ml-2 text-sm">{fileName}</span>}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <Spinner size={8} className="text-white" />
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
    </div>
  );
};

export default UploadImage;
