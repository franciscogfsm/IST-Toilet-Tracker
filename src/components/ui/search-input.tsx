import { Search } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string; // container class
  inputClassName?: string; // input element class override
  iconClassName?: string; // search icon class override
}

export function SearchInput({
  className,
  inputClassName,
  iconClassName,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        className={cn(
          "pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground z-10",
          iconClassName
        )}
      />
      <Input
        className={cn(
          // previous defaults moved here so they can be overridden
          "relative z-0 h-12 sm:h-14 pl-12 rounded-full bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/60 text-base sm:text-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400",
          inputClassName
        )}
        {...props}
      />
    </div>
  );
}
