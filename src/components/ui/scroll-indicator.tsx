import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollIndicatorProps {
  className?: string;
}

export function ScrollIndicator({ className }: ScrollIndicatorProps) {
  return (
    <div className={cn("flex justify-center animate-bounce", className)}>
      <ChevronDown className="h-4 w-4 text-white/70" />
    </div>
  );
}