import { Skeleton, type SkeletonProps } from "primereact/skeleton";

export function SkeletonSimplesSeplag({ height = "35px", ...props }: Readonly<SkeletonProps>) {
  return <Skeleton height={height} className="mb-2" {...props} />;
}
