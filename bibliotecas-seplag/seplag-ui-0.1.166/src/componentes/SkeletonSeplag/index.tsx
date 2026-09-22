import { Skeleton, type SkeletonProps } from "primereact/skeleton";
import React from "react";

type Variant = "text" | "title" | "avatar" | "button" | "card" | "custom";

export interface SkeletonSeplagProps extends SkeletonProps {
  id?: string;
  variant?: Variant;
  lines?: number;
  gap?: string;
  containerClassName?: string;
  children?: React.ReactNode;
}

function SkeletonSeplagBase({
  id = "skeleton-seplag",
  variant = "text",
  lines = 1,
  gap = "0.5rem",
  className = "",
  containerClassName = "",
  width,
  height,
  size,
  borderRadius,
  children,
  ...rest
}: Readonly<SkeletonSeplagProps>) {
  const skeletonKeys = Array.from({ length: lines }, (_, i) => `skeleton-${lines}-${i}`);

  if (children) {
    return (
      <div id={id} data-testid={id} className={containerClassName}>
        {children}
      </div>
    );
  }

  const getPreset = (): SkeletonProps => {
    switch (variant) {
      case "title":
        return { height: height ?? "20px", width: width ?? "60%" };
      case "text":
        return { height: height ?? "14px", width: width ?? "100%" };
      case "avatar":
        return { shape: "circle", size: size ?? "2.5rem" };
      case "button":
        return {
          height: height ?? "32px",
          width: width ?? "100px",
          borderRadius: borderRadius ?? "6px",
        };
      case "card":
        return {
          height: height ?? "80px",
          borderRadius: borderRadius ?? "12px",
        };
      default:
        return {};
    }
  };

  const preset = getPreset();

  if (lines > 1) {
    return (
      <div
        id={id}
        data-testid={id}
        className={containerClassName}
        style={{ display: "flex", flexDirection: "column", gap }}
      >
        {skeletonKeys.map((key) => (
          <Skeleton
            key={key}
            data-testid={`${id}-${key}`}
            {...preset}
            {...rest}
            className={`mb-0 ${className}`.trim()}
          />
        ))}
      </div>
    );
  }

  return (
    <Skeleton
      id={id}
      data-testid={id}
      {...preset}
      {...rest}
      className={`mb-2 ${className}`.trim()}
    />
  );
}

const SkeletonSeplagItem = (props: SkeletonProps) => <Skeleton {...props} />;

type SkeletonSeplagComponent = {
  (props: Readonly<SkeletonSeplagProps>): React.JSX.Element;
  Item: (props: SkeletonProps) => React.JSX.Element;
};

export const SkeletonSeplag: SkeletonSeplagComponent = (props) => {
  return <SkeletonSeplagBase {...props} />;
};

SkeletonSeplag.Item = SkeletonSeplagItem;
