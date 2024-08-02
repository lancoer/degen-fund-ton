/* eslint-disable @next/next/no-img-element */
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { TokenDto } from "@/lib/data/dtos";
import { parseIpfsUrl } from "@/lib/utils/ipfs";
import { token } from "@coral-xyz/anchor/dist/cjs/utils";
import Image from "next/image";
import Link from "next/link";

interface Props {
  token: TokenDto;
  place: number;
}

const medalUrl = [
  "/assets/medal1.png",
  "/assets/medal2.png",
  "/assets/medal3.png",
];

const PodiumCard = ({ token, place }: Props) => {
  return (
    <div className="bg-card w-full p-4 rounded-lg relative min-w-[246px]">
      <div className="absolute top-2 right-1">
        <Image
          src={medalUrl[place - 1]}
          alt=""
          className="w-12 h-12"
          height={48}
          width={48}
        />
      </div>
      <Link href={`/launch/${token.address}`} className="flex gap-2 flex-row">
        <Avatar className="h-6 w-6 rounded-full bg-slate-100">
          <AvatarImage src={parseIpfsUrl(token.imageUri)} alt="avatar" />
        </Avatar>
        <span className="text-xl font-bold">{token.name}</span>
      </Link>
      <div className="flex flex-row gap-2 mt-4">
        <div className="flex bg-secondary gap-1 p-2 items-center rounded-md">
          <span className="font-semibold text-green-600">
            {token.athMultiplier}X
          </span>
        </div>
      </div>
    </div>
  );
};

export default PodiumCard;
