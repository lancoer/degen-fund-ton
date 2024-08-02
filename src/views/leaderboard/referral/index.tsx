import { ReferrerDto } from "@/lib/data/dtos";
import React from "react";
import PodiumCard from "./components/podium-card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { getUserPfp } from "@/lib/utils/shared";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import Image from "next/image";

interface Props {
  topReferrers: ReferrerDto[];
}

const ReferralLeaderboard = ({ topReferrers }: Props) => {
  const podium = topReferrers.slice(0, 3);
  const rest = topReferrers.slice(3);

  return (
    <div className="flex justify-center mt-12 md:mt-0">
      <div className="max-w-3xl">
        <Tabs defaultValue="referral" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="referral">Top Referrals</TabsTrigger>
            <Link href="/leaderboard/projects" passHref>
              <TabsTrigger value="projects">Top Projects</TabsTrigger>
            </Link>
            <TabsTrigger disabled value="developer">
              Top Developers
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <h2 className="font-semibold text-lg mt-6">Referral Leaderboard</h2>
        <div className="flex flex-col md:flex-row justify-between gap-4 mt-6">
          {podium.map((referrer, i) => (
            <PodiumCard key={i} referrer={referrer} place={i + 1} />
          ))}
        </div>

        <div className="border rounded-md mt-6 w-full">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Place</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Referrals</TableHead>
                <TableHead className="text-right">SOL Earned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rest.map((referrer, i) => (
                <TableRow key={i}>
                  <TableCell>{i + 4}</TableCell>
                  <TableCell>
                    <Link
                      href={`/profile/${referrer.user.wallet}`}
                      className="flex items-center gap-2"
                    >
                      <Avatar className="h-6 w-6 rounded-full bg-slate-100">
                        <AvatarImage
                          src={getUserPfp(referrer.user)}
                          alt="avatar"
                        />
                      </Avatar>
                      <span className="font-semibold">
                        {referrer.user.username}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    {referrer.numReferrals}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Image
                        src="/assets/sol.png"
                        alt="SOL"
                        className="w-4 h-4"
                        height={16}
                        width={16}
                      />
                      <span className="font-semibold">
                        {referrer.solEarned}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ReferralLeaderboard;
