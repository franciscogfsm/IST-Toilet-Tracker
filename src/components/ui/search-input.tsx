import { Search } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
    <motion.div
      className={cn("relative", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.4 }}
      >
        <Search
          className={cn(
            "pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground z-10 transition-all duration-300",
            iconClassName
          )}
        />
      </motion.div>
      <Input
        className={cn(
          // previous defaults moved here so they can be overridden
          "relative z-0 h-12 sm:h-14 pl-12 rounded-full bg-white/80 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-700/60 text-base sm:text-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 hover:shadow-md focus:shadow-lg",
          inputClassName
        )}
        {...props}
      />
    </motion.div>
  );
}
