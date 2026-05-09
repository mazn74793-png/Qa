import React from 'react';
import { cn } from "@/src/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200/50", className)}
      {...props}
    />
  );
}

export function TeacherSkeleton() {
  return (
    <div className="bg-white rounded-[24px] md:rounded-[40px] p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center border border-slate-100 shadow-sm">
      <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-[24px] md:rounded-[32px] shrink-0" />
      <div className="text-right flex-grow w-full space-y-4">
        <Skeleton className="h-4 w-20 ml-auto" />
        <Skeleton className="h-8 w-48 ml-auto" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6 ml-auto" />
        </div>
        <div className="flex gap-3 justify-end pt-4">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function CourseSkeleton() {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm space-y-4">
      <Skeleton className="w-14 h-14 rounded-2xl" />
      <Skeleton className="h-6 w-3/4 ml-auto" />
      <Skeleton className="h-4 w-1/2 ml-auto" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl mt-4" />
    </div>
  );
}
