"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { FaTelegram, FaTwitter } from "react-icons/fa";
import {
  Grip,
  Rocket,
  Medal,
  Gift,
  Bot,
  FileText,
  Menu,
  X,
  Trophy,
} from "lucide-react";
import { Navbar } from "../navbar";
import { Footer } from "../footer";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";
import { cn } from "@/lib/cn";

const sideBarData = [
  {
    title: "Board",
    path: "/",
    icon: <Grip className="w-6 h-6" size={28} />,
  },
  {
    title: "Create Token",
    path: "/create",
    icon: <Rocket className="w-6 h-6" size={28} />,
  },

  {
    title: "Referral Program",
    path: "/referral",
    icon: <Gift className="w-6 h-6" size={28} />,
  },
  {
    title: "Leaderboard",
    path: "/leaderboard/referral",
    icon: <Trophy className="w-6 h-6" size={28} />,
  },
  // {
  //   title: "Telegram Bot",
  //   path: "https://t.me/degen_fund_buy_track_bot",
  //   icon: <Bot className="w-6 h-6" size={28} />,
  //   newTab: true,
  // },
  {
    title: "Docs",
    path: "https://docs.degen.fund",
    icon: <FileText className="w-6 h-6" size={28} />,
    newTab: true,
  },
];

const socialLinksData = [
  {
    title: "Twitter",
    path: "https://twitter.com/degendotfund",
    icon: <FaTwitter className="w-6 h-6" size={28} />,
  },
  {
    title: "Telegram",
    path: "https://t.me/degendotfund",
    icon: <FaTelegram className="w-6 h-6" size={28} />,
  },
];

interface NavItemProps {
  item: {
    title: string;
    path: string;
    icon: React.ReactNode;
  };
  isExpanded: boolean;
  newTab?: boolean;
  onItemClick: () => void;
}

const NavItem = ({ item, isExpanded, newTab, onItemClick }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = item.path === pathname;
  const searchParams = useSearchParams();

  return (
    <Link
      key={item.title}
      href={item.path}
      target={newTab ? "_blank" : "_self"}
      rel={newTab ? "noopener noreferrer" : ""}
      className={`flex pl-5 py-4 gap-5 ${
        isActive ? "text-primary" : "text-white hover:text-primary"
      }`}
      onClick={onItemClick}
    >
      {React.cloneElement(item.icon as React.ReactElement, {
        className: cn(
          isActive ? "text-primary" : "",
          "w-6 h-6 transition-all duration-200"
        ),
        size: 28,
      })}
      <span
        className={`transition-all duration-200 font-semibold ${
          isExpanded
            ? "w-48 text-ellipsis whitespace-nowrap opacity-[1]"
            : "w-0 overflow-hidden text-ellipsis whitespace-nowrap opacity-0"
        }`}
      >
        {item.title}
      </span>
    </Link>
  );
};

export const SideBar = ({ children }: { children: React.ReactNode }) => {
  const [isExpanded, setExpanded] = useState(false);
  const [isMobileVisible, setMobileVisible] = useState(false);

  const closeMobileMenu = () => {
    setMobileVisible(false);
    setExpanded(false);
  };

  return (
    <div className="flex">
      <button
        className="md:hidden z-20 p-1 m-2 mt-3 absolute top-0 left-0"
        onClick={() => setMobileVisible(!isMobileVisible)}
      >
        <Menu color="white" size={28} />
      </button>

      <div
        className={`py-5 fixed justify-between flex-col z-20 h-full transition-all duration-200 bg-[#111116] border-r border-[#28282d] ${
          isMobileVisible || isExpanded ? "flex" : "hidden"
        } md:flex`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <div>
          {isMobileVisible && (
            <button
              className="p-2 m-2 mt-3 top-0 left-0 absolute text-xl"
              onClick={closeMobileMenu}
            >
              <X size={20} color="white" />
            </button>
          )}
          <Link href="/">
            <div
              className={
                isMobileVisible
                  ? "flex items-center pl-10"
                  : "flex items-center pl-5"
              }
            >
              <Image
                className="pr-4"
                src="/assets/logo.png"
                width={50}
                height={50}
                alt="logo.png"
              />
              <span
                className={`transition-all duration-200 text-nowrap ${
                  isExpanded || isMobileVisible
                    ? "text-xl font-bold text-primary w-48 opacity-1"
                    : "text-xl font-bold text-primary w-0 overflow-hidden opacity-0"
                }`}
              >
                Degen Fund
              </span>
            </div>
          </Link>
          <div className="flex mt-12 flex-col">
            {sideBarData.map((navItem) => (
              <NavItem
                key={navItem.title}
                item={navItem}
                isExpanded={isExpanded || isMobileVisible}
                newTab={navItem.newTab}
                onItemClick={closeMobileMenu}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col border-t pt-4">
          {socialLinksData.map((socialLink) => (
            <NavItem
              key={socialLink.title}
              newTab={true}
              item={socialLink}
              isExpanded={isExpanded || isMobileVisible}
              onItemClick={closeMobileMenu}
            />
          ))}
        </div>
      </div>
      <div
        className="flex ml-0 md:ml-[4.5rem] flex-col min-h-screen w-full mx-auto"
        onClick={() => setMobileVisible(false)}
      >
        {children}
      </div>
    </div>
  );
};
