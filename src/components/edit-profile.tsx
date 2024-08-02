import React, { useState, useRef, useEffect } from "react";
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/ui/credenza";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getUserPfp } from "@/lib/utils/shared";
import useAuthStore from "@/store/use-auth-store";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "./ui/use-toast";
import Spinner from "@/components/ui/spinner";
import { uploadImageToIPFS } from "@/lib/utils";
import { LoadingButton } from "./ui/loading-button";
import { pinataGatewayToken, pinataGatewayUrl } from "@/lib/constants";

interface EditProfileProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const schema = z.object({
  username: z.string().min(3).max(12),
  bio: z.string().max(160).optional(),
  profileUrl: z.string().url().optional().or(z.string().max(0)),
});

type FormValues = z.infer<typeof schema>;

const EditProfile: React.FC<EditProfileProps> = ({ open, setOpen }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [lastFocusedInput, setLastFocusedInput] = useState<string | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setIsFormSubmitting(true);

      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Profile updated successfully
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        const { user } = response.json() as any;
        if (user) {
          setUser(user);
        }

        setOpen(false); // Close the modal
      } else {
        // Other errors
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating the profile",
        variant: "destructive",
      });
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleProfilePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setPreview(reader.result as string);

        try {
          setIsLoading(true);

          const cid = await uploadImageToIPFS(file);
          const profileUrl = `${pinataGatewayUrl}/ipfs/${cid}?pinataGatewayToken=${pinataGatewayToken}`;
          form.setValue("profileUrl", profileUrl);

          setIsLoading(false);
        } catch (error) {
          console.error("Upload failed", error);
          toast({
            title: "Error",
            description: "Image upload failed",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
      form.setValue("profileUrl", "");
    }
  };

  const handleAvatarClick = () => {
    if (isLoading) return;
    avatarRef.current?.click();
  };

  useEffect(() => {
    form.setValue("username", user?.username || "");
    form.setValue("profileUrl", user?.pfpUrl || "");
  }, [user, form]);

  return (
    <Credenza open={open} onOpenChange={setOpen}>
      <CredenzaContent className="sm:max-w-[425px] bg-[#1d1d22] rounded-xl shadow-xl p-0 focus:outline-none">
        <CredenzaHeader className="w-full h-[50px] flex justify-between bg-[#28282d] border-b">
          <CredenzaTitle className="text-[16px] font-semibold text-white p-3 ml-1">
            Edit Profile
          </CredenzaTitle>
        </CredenzaHeader>
        <CredenzaBody className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex items-center mb-4">
                <div className="text-white w-[25%] text-sm">Profile Photo</div>
                <div className="relative flex-1">
                  <Avatar
                    onClick={handleAvatarClick}
                    className="cursor-pointer"
                  >
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <Spinner size={4} className="text-white" />
                      </div>
                    )}
                    <AvatarImage
                      src={preview || getUserPfp(user)}
                      alt="avatar"
                      width={50}
                      height={50}
                    />
                    <AvatarFallback>
                      <span>No image</span>
                    </AvatarFallback>
                  </Avatar>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhoto}
                    className="hidden"
                    ref={avatarRef}
                  />
                </div>
              </div>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        autoFocus={lastFocusedInput === "username"}
                        type="text"
                        placeholder="Enter username"
                        {...field}
                        onFocus={() => setLastFocusedInput("username")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Input
                        autoFocus={lastFocusedInput === "bio"}
                        type="text"
                        placeholder="Enter bio"
                        {...field}
                        onFocus={() => setLastFocusedInput("bio")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end mb-4 mt-2">
                <span className="text-xs text-muted-foreground">
                  You can change your username once every day
                </span>
              </div>
              <CredenzaFooter>
                <LoadingButton
                  className="bg-primary hover:bg-[#c5688e] transition-colors"
                  onClick={form.handleSubmit(onSubmit)}
                  loading={isFormSubmitting}
                >
                  Save
                </LoadingButton>
              </CredenzaFooter>
            </form>
          </Form>
        </CredenzaBody>
      </CredenzaContent>
    </Credenza>
  );
};

export default EditProfile;
