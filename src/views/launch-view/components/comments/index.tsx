// CommentSection.tsx
import { CommentDto, TokenDto } from "@/lib/data/dtos";
import React, { useState } from "react";
import Comment from "./components/comment";
import PostComment from "./components/post-comment";

interface CommentSectionProps {
  token: TokenDto;
  comments: CommentDto[];
}

const CommentSection = ({ token, comments }: CommentSectionProps) => {
  const [commentsState, setCommentsState] = useState(comments);

  const addAtStart = (comment: CommentDto) => {
    setCommentsState([comment, ...commentsState]);
  };

  return (
    <div>
      <PostComment token={token} addAtStart={addAtStart} />
      {commentsState.length === 0 ? (
        <p className="text-sm text-muted px-2 py-6">No comments yet</p>
      ) : (
        commentsState.map((comment, idx) => (
          <Comment
            key={idx}
            comment={comment}
            isLast={idx === commentsState.length - 1}
          />
        ))
      )}
    </div>
  );
};

export default CommentSection;
