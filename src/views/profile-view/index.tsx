"use client";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TokenDto, UserDto } from "@/lib/data/dtos";
import { getUserPfp } from "@/lib/utils/shared";
import { TokenCard } from "../home-view/components/token-card";
import useAuthStore from "@/store/use-auth-store";
import EditProfile from "@/components/edit-profile";
import { useState } from "react";

interface ProfileViewProps {
  tradedTokens: TokenDto[];
  createdTokens: TokenDto[];
  user?: UserDto;
  balances?: Record<string, number>;
  referralCount: number;
}

const ProfileView = ({
  tradedTokens,
  createdTokens,
  user,
  balances,
  referralCount,
}: ProfileViewProps) => {
  const { user: loggedInUser } = useAuthStore();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("owned");

  if (!user) {
    return (
      <div className="w-full flex flex-col items-center p-6">
        <h2 className="text-2xl font-bold mb-4">User not found</h2>
        <p className="text-center text-gray-600">
          The requested user profile is not available.
        </p>
      </div>
    );
  }

  const renderTokens = () => {
    const tokens = activeTab === "owned" ? tradedTokens : createdTokens;

    if (tokens.length === 0) {
      return (
        <div className="w-full flex justify-center mt-4">
          <p className="text-center text-gray-600">
            {activeTab === "owned"
              ? "No owned tokens found."
              : "No created tokens found."}
          </p>
        </div>
      );
    }

    return (
      <div
        className="w-full gap-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
        }}
      >
        {tokens.map((token, index) => (
          <TokenCard
            key={index}
            token={token}
            balance={balances && balances[token.address]}
            index={index}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center p-6">
      <Avatar className="w-24 h-24 mb-4">
        <AvatarImage alt={user.username} src={getUserPfp(user)} />
        <AvatarFallback>{user.username?.charAt(0)}</AvatarFallback>
      </Avatar>
      <h2 className="text-2xl font-bold mb-2">{user.username}</h2>
      <p className="text-center text-gray-600 mb-4">{user.bio}</p>
      <div className="flex gap-4 mb-6">
        <div className="flex flex-col items-center">
          <span className="text-lg font-semibold">{tradedTokens.length}</span>
          <span className="text-sm text-gray-600">Tokens Owned</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-semibold">{createdTokens.length}</span>
          <span className="text-sm text-gray-600">Tokens Created</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-semibold">{referralCount}</span>
          <span className="text-sm text-gray-600">Referral Count</span>
        </div>
      </div>
      {user.wallet === loggedInUser?.wallet && (
        <>
          <EditProfile open={profileModalOpen} setOpen={setProfileModalOpen} />

          <Button className="mb-6" onClick={() => setProfileModalOpen(true)}>
            Edit Profile
          </Button>
        </>
      )}

      <Tabs defaultValue="owned" className="mb-4">
        <TabsList>
          <TabsTrigger
            value="owned"
            onClick={() => setActiveTab("owned")}
            className={activeTab === "owned" ? "active" : ""}
          >
            Tokens Owned
          </TabsTrigger>
          <TabsTrigger
            value="created"
            onClick={() => setActiveTab("created")}
            className={activeTab === "created" ? "active" : ""}
          >
            Tokens Created
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {renderTokens()}
    </div>
  );
};

export default ProfileView;
