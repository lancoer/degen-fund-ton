// Comment.tsx
import React from "react";
import { CommentDto } from "@/lib/data/dtos";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getUserPfp } from "@/lib/utils/shared";
import { Separator } from "@/components/ui/separator";
import { timeAgo } from "@/lib/utils/get-time-ago";
import Link from "next/link";

interface CommentProps {
  comment: CommentDto;
  isLast: boolean;
}

const Comment = ({ comment, isLast }: CommentProps) => {
  return (
    <div className="px-4 mt-6 rounded-lg shadow-md">
      <Link
        href={`/profile/${comment.user.wallet}`}
        className="flex items-center"
      >
        <div className="flex items-center mb-2 gap-2">
          <Avatar className="h-7 w-7 rounded-full">
            <AvatarImage
              src={getUserPfp(comment.user)}
              alt={comment.user.username}
              className="rounded-full"
            />
          </Avatar>
          <span className="bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-pink-400 border border-pink-400">
            {comment.user.username}
          </span>
          <span className="text-xs text-muted">
            {timeAgo(comment.createdAt)} ago
          </span>
        </div>
      </Link>
      <div className="mb-2 text- text-sm">{comment.content}</div>
      <div className="text-sm text-muted flex flex-row gap-2"></div>
      {!isLast && <Separator className="w-full my-2" />}
    </div>
  );
};

export default Comment;
