"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "./SessionContextProvider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { showSuccess, showError } from "@/utils/toast";
import { User as UserIcon, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input"; // Added missing import

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  onAvatarChange: (newUrl: string | null) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ currentAvatarUrl, onAvatarChange }) => {
  const { user } = useSession();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAvatarUrl(currentAvatarUrl);
  }, [currentAvatarUrl]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      showError("You must be logged in to upload an avatar.");
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Delete old avatar if it exists
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('avatars').remove([`${user.id}/${oldPath}`]);
        }
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const newAvatarUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: newAvatarUrl, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(newAvatarUrl);
      onAvatarChange(newAvatarUrl);
      showSuccess("Avatar uploaded successfully!");
    } catch (error: any) {
      console.error("Error uploading avatar:", error.message);
      showError("Failed to upload avatar: " + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear the file input
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user || !avatarUrl) return;

    setUploading(true);
    try {
      const oldPath = avatarUrl.split('/').pop();
      if (oldPath) {
        const { error: removeError } = await supabase.storage.from('avatars').remove([`${user.id}/${oldPath}`]);
        if (removeError) {
          throw removeError;
        }
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(null);
      onAvatarChange(null);
      showSuccess("Avatar removed successfully!");
    } catch (error: any) {
      console.error("Error removing avatar:", error.message);
      showError("Failed to remove avatar: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatarUrl || undefined} alt="User Avatar" />
        <AvatarFallback>
          <UserIcon className="h-12 w-12 text-gray-500" />
        </AvatarFallback>
      </Avatar>
      <div className="flex space-x-2">
        <Input
          type="file"
          id="avatar-upload"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
          ref={fileInputRef}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center"
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : "Upload Avatar"}
        </Button>
        {avatarUrl && (
          <Button
            variant="destructive"
            onClick={handleRemoveAvatar}
            disabled={uploading}
            className="flex items-center"
          >
            <X className="mr-2 h-4 w-4" />
            Remove Avatar
          </Button>
        )}
      </div>
    </div>
  );
};

export default AvatarUpload;