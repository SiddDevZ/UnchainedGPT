import { cn } from "@/lib/utils";

const AnimatedShinyText = ({ children, className, shimmerWidth = 100 }) => {
  return (
    <p
      style={{
        "--shiny-width": `${shimmerWidth}px`,
      }}
      className={cn(
        "mx-auto max-w-md text-neutral-600/70 dark:text-neutral-400/70 dark:hover:text-neutral-400/85",
        "animate-shiny-text bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--shiny-width)_100%]",
        "bg-gradient-to-r from-transparent via-black/80 via-50% to-transparent dark:via-white/80",
        "relative overflow-hidden", // Added overflow-hidden
        className
      )}
    >
      {children}
    </p>
  );
};

export default AnimatedShinyText;