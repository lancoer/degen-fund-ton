// CopyButton.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface CopyButtonProps {
  value: string;
  className?: string;
  children?: React.ReactNode;
  asChild?: boolean;
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "link"
    | "ghost"
    | "outline"
    | null
    | undefined;
  label?: string;
  copiedLabel?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  value,
  className,
  children,
  asChild,
  size,
  variant,
  label = "Copy",
  copiedLabel = "Copied",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (asChild) {
    return <div onClick={handleCopy}>{children}</div>;
  }

  if (children) {
    return (
      <Button onClick={handleCopy} className={cn(className, "p-2")}>
        {children}
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant={variant}
      className={className}
      onClick={handleCopy}
    >
      {copied ? copiedLabel : label}
    </Button>
  );
};

export default CopyButton;
