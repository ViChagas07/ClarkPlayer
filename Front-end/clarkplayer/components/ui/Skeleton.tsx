"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  /** Set rounded-full for circular avatars */
  circle?: boolean;
}

export function Skeleton({ className, width, height, circle }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton", circle && "rounded-full", className)}
      style={{
        width: width ?? "100%",
        height: height ?? "1rem",
        minHeight: height ?? "1rem",
      }}
      aria-hidden="true"
    />
  );
}

export function TrackCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-2 rounded-xl bg-bg-tertiary">
      <Skeleton width={48} height={48} className="rounded-lg flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton height={14} width="70%" />
        <Skeleton height={12} width="40%" />
      </div>
      <Skeleton height={12} width={40} />
    </div>
  );
}

export function AlbumCardSkeleton() {
  return (
    <div className="rounded-xl bg-bg-tertiary p-3 space-y-3">
      <Skeleton width="100%" height={0} className="aspect-square rounded-xl" />
      <div className="space-y-2">
        <Skeleton height={14} width="80%" />
        <Skeleton height={12} width="50%" />
      </div>
    </div>
  );
}

export function TrackListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <Skeleton width={24} height={24} className="flex-shrink-0" />
      <Skeleton height={14} className="flex-1" />
      <Skeleton height={12} width={48} className="flex-shrink-0" />
    </div>
  );
}
