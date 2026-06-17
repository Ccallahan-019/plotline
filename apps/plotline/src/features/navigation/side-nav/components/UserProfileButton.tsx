"use client";

import { UserButton, useUser } from "@clerk/nextjs";

import { Skeleton } from "@/components/ui/skeleton";
import { ShowIf } from "@/components/utils/ShowIf";

export function UserProfileButton() {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return <UserProfileSkeleton />;
  }

  return (
    <div className="flex items-center gap-2">
      <UserButton fallback={<UserButtonSkeleton />} userProfileMode="modal" />
      <ShowIf condition={!!user}>
        <span className="text-sm font-medium">{user?.fullName}</span>
      </ShowIf>
    </div>
  );
}

const UserProfileSkeleton = () => {
  return (
    <div className="flex items-center gap-2">
      <UserButtonSkeleton />
      <Skeleton className="h-4 w-28" />
    </div>
  );
};

const UserButtonSkeleton = () => {
  return <Skeleton className="h-7 w-7 rounded-full" />;
};
