import * as React from "react";
import { cn } from "@/lib/cn";
import { Separator } from "./separator";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  footer: React.ReactNode;
}

const TextareaFooter = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const autoResize = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + 24 + "px";
      }
    };

    React.useEffect(() => {
      autoResize();
    }, []);

    React.useEffect(() => {
      autoResize();
    }, [props.value]);

    return (
      <div
        className={cn(
          "flex flex-col space-y-2 min-h-[60px] w-full rounded-md border border-input-border bg-input px-3 py-2 pt-6 text-sm shadow-sm disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        <textarea
          className="bg-transparent w-full resize-none  placeholder:text-muted-foreground focus-visible:outline-none "
          ref={(el) => {
            (textareaRef as any).current = el;
            if (typeof ref === "function") {
              ref(el);
            } else if (ref) {
              ref.current = el;
            }
          }}
          {...props}
          style={{ overflow: "hidden" }}
          onInput={autoResize}
        />
        <Separator />
        {props.footer}
      </div>
    );
  }
);

TextareaFooter.displayName = "TextareaFooter";
export { TextareaFooter };
