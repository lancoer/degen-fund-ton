import { Copy } from "lucide-react";
import { cn } from "@/lib/cn";
import { SquareArrowOutUpRight } from "lucide-react";

const getExplorerUrl = (path: string) => `https://solscan.io/${path}`;

export function ExplorerLink({
  path,
  label,
  clipLabel,
  className,
  textClassName,
}: {
  path: string;
  label: string;
  clipLabel?: boolean;
  className?: string;
  textClassName?: string;
}) {
  return (
    <div className={cn("flex items-center", className)}>
      <a
        href={getExplorerUrl(path)}
        target="_blank"
        rel="noopener noreferrer"
        className={`${textClassName} link font-mono text-sm text-primary font-semibold hover:underline`}
      >
        <div className="flex items-center gap-1">
          <span>
            {clipLabel ? `${label.slice(0, 6)}...${label.slice(-5)}` : label}
          </span>
          <SquareArrowOutUpRight size={14} />
        </div>
      </a>
      {/* <CopyButton
        className=""
        value={path.split("/") ? path.split("/")[1] : ""}
      >
        <Copy size={14} />
      </CopyButton> */}
    </div>
  );
}
