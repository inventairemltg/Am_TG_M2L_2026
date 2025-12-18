"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "./SessionContextProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";
import AvatarUpload from "./AvatarUpload"; // Import AvatarUpload

const profileFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfileForm: React.FC = () => {
  const { user } = useSession();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("first_name, last_name, avatar_url") // Select avatar_url
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          showError("Failed to load profile.");
        } else if (data) {
          form.reset({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
          });
          setAvatarUrl(data.avatar_url); // Set avatar URL
        }
      }
    };
    fetchProfile();
  }, [user, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) {
      showError("You must be logged in to update your profile.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: values.first_name,
        last_name: values.last_name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
      showError("Failed to update profile.");
    } else {
      showSuccess("Profile updated successfully!");
    }
  };

  const handleAvatarChange = (newUrl: string | null) => {
    setAvatarUrl(newUrl);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <AvatarUpload currentAvatarUrl={avatarUrl} onAvatarChange={handleAvatarChange} />
      <div>
        <Label htmlFor="first_name">First Name</Label>
        <Input
          id="first_name"
          {...form.register("first_name")}
          className="mt-1"
        />
        {form.formState.errors.first_name && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.first_name.message}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="last_name">Last Name</Label>
        <Input
          id="last_name"
          {...form.register("last_name")}
          className="mt-1"
        />
        {form.formState.errors.last_name && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.last_name.message}
          </p>
        )}
      </div>
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
};

export default ProfileForm;