import { ReferrerDto, TokenDto } from "@/lib/data/dtos";
import React from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { parseIpfsUrl } from "@/lib/utils/ipfs";
import PodiumCard from "./components/podium-card";

interface Props {
  topTokens: TokenDto[];
}

const ProjectsLeaderboard = ({ topTokens }: Props) => {
  const podium = topTokens.slice(0, 3);
  const rest = topTokens.slice(3);

  return (
    <div className="flex justify-center mt-12 md:mt-0">
      <div className="max-w-3xl">
        <Tabs defaultValue="projects" className="w-[400px]">
          <TabsList>
            <Link href="/leaderboard/referral" passHref>
              <TabsTrigger value="referral">Top Referrals</TabsTrigger>
            </Link>
            <TabsTrigger value="projects">Top Projects</TabsTrigger>
            <TabsTrigger disabled value="developer">
              Top Developers
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <h2 className="font-semibold text-lg mt-6">Projects Leaderboard</h2>
        <div className="flex flex-col md:flex-row justify-between gap-4 mt-6">
          {podium.map((token, i) => (
            <PodiumCard key={i} token={token} place={i + 1} />
          ))}
        </div>

        <div className="border rounded-md mt-6 w-full">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead className="text-right">ATH</TableHead>
                <TableHead className="text-right">Current</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rest.map((token, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Link
                      href={`/launch/${token.address}`}
                      className="flex items-center gap-2"
                    >
                      <Avatar className="h-6 w-6 rounded-full bg-slate-100">
                        <AvatarImage
                          src={parseIpfsUrl(token.imageUri)}
                          alt="avatar"
                        />
                      </Avatar>
                      <span className="font-semibold">{token.name}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    {token.athMultiplier}X
                  </TableCell>
                  <TableCell className="text-right">
                    {token.currentMultiplier
                      ? (token.currentMultiplier / 1000).toFixed(3)
                      : "--"}
                    X
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

export default ProjectsLeaderboard;
