import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ReferrerDto } from "@/lib/data/dtos";
import { getUserPfp } from "@/lib/utils/shared";
import { token } from "@coral-xyz/anchor/dist/cjs/utils";
import { Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Props {
  referrer: ReferrerDto;
  place: number;
}

const medalUrl = [
  "/assets/medal1.png",
  "/assets/medal2.png",
  "/assets/medal3.png",
];

const PodiumCard = ({ referrer, place }: Props) => {
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
      <Link
        href={`/profile/${referrer.user.wallet}`}
        className="flex gap-2 flex-row"
      >
        <Avatar className="h-6 w-6 rounded-full bg-slate-100">
          <AvatarImage src={getUserPfp(referrer.user)} alt="avatar" />
        </Avatar>
        <span className="text-xl font-bold">{referrer.user.username}</span>
      </Link>
      <div className="flex flex-row gap-2 mt-4">
        <div className="flex bg-secondary gap-1 p-2 items-center rounded-md">
          <Users className="h-5 w-5" />
          <span className="font-semibold">{referrer.numReferrals}</span>
        </div>
        <div className="flex bg-secondary gap-1 p-2 items-center rounded-md">
          <Image
            src="/assets/sol.png"
            alt="SOL"
            className="w-6 h-6"
            height={24}
            width={24}
          />
          <span className="font-semibold">{referrer.solEarned}</span>
        </div>
      </div>
    </div>
  );
};

export default PodiumCard;
