"use client";

import React from "react";
import ProfileForm from "@/components/ProfileForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/components/SessionContextProvider";

const ProfilePage: React.FC = () => {
  const { user } = useSession();

  return (
    <div className="flex flex-col items-center text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-2xl space-y-6">
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                Manage your personal information and avatar.
              </p>
            </div>
            <ProfileForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;