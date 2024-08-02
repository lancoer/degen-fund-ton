"use client";
import { CommentDto, TokenDto } from "@/lib/data/dtos";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { TextareaFooter } from "@/components/ui/textarea-footer";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { LoadingButton } from "@/components/ui/loading-button";
import useAuthStore from "@/store/use-auth-store";

// Define the form schema using Zod
const schema = z.object({
  comment: z.string().min(1, "Comment is required").max(60),
});

type FormData = z.infer<typeof schema>;

interface PostCommentProps {
  token: TokenDto;
  addAtStart: (comment: CommentDto) => void;
}

const PostComment = ({ token, addAtStart }: PostCommentProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    if (!user) {
      toast({
        title: "Failed to add comment",
        description: "You must be logged in to comment",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    try {
      // Send the comment data to the API route
      const response = await fetch(`/api/comments/${token.address}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Comment added successfully
        form.reset();
        form.setValue("comment", "");
        addAtStart({
          user: user!,
          tokenAddress: token.address,
          content: data.comment,
          replyCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        // Handle error response
        const errorData = (await response.json()) as any;
        toast({
          title: "Failed to add comment",
          description: errorData.message || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full p-4 bg-card rounded-b-lg"
      >
        <FormField
          name="comment"
          control={form.control}
          render={({ field }) => (
            <FormItem className="">
              <FormControl>
                <TextareaFooter
                  {...field}
                  placeholder="Write your comment..."
                  onKeyDown={handleKeyDown}
                  rows={2}
                  footer={
                    <div className="flex w-full justify-end">
                      <LoadingButton
                        size="sm"
                        type="submit"
                        loading={isLoading}
                      >
                        Submit
                      </LoadingButton>
                    </div>
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default PostComment;
