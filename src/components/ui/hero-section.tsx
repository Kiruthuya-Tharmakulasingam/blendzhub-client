import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface HeroSectionProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: string | React.ReactNode;
  subtitle?: string;
  description?: string;
  actions?: React.ReactNode;
  image?: {
    src: string;
    alt: string;
  };
  background?: "gradient" | "solid" | "image";
}

function HeroSection({
  className,
  title,
  subtitle,
  description,
  actions,
  image,
  background = "gradient",
  ...props
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        "relative px-8 sm:px-16 border-b overflow-hidden flex items-center",
        background === "gradient"
          ? "bg-gradient-to-br from-background via-surface to-muted py-20"
          : background === "image" && image
          ? "bg-background h-[70vh] min-h-[500px] py-20" // Reduced height for image background
          : "bg-surface py-20",
        className
      )}
      {...props}
    >
      {background === "image" && image ? (
        <div className="absolute inset-0 z-0">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            sizes="100vw"
            quality={90}
            loading="lazy"
          />
          {/* Subtle dark overlay (45%) for better text readability */}
          <div className="absolute inset-0 bg-black/45 z-10" />
        </div>
      ) : (
        <>
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage: "url('/background-pattern.svg')",
              backgroundRepeat: "repeat",
              backgroundSize: "300px 300px",
            }}
          />
          {background === "image" && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
          )}
        </>
      )}

      {/* Center content both horizontally and vertically when using background image */}
      <div
        className={cn(
          "max-w-7xl mx-auto relative z-20 w-full",
          background === "image"
            ? "flex flex-col justify-center"
            : "grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        )}
      >
        <div
          className={cn(
            "flex flex-col gap-6",
            background === "image" &&
              "text-center items-center mx-auto max-w-3xl"
          )}
        >
          {subtitle && (
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {subtitle}
            </p>
          )}
          <h1 className={cn(
            "text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight",
            background === "image" ? "text-white" : "text-foreground"
          )}>
            {title}
          </h1>
          {description && (
            <p className={cn(
              "text-lg md:text-xl max-w-lg",
              background === "image" ? "text-white/90" : "text-muted-foreground"
            )}>
              {description}
            </p>
          )}
          {actions && (
            <div
              className={cn(
                "flex flex-wrap gap-4 mt-4",
                background === "image" && "justify-center"
              )}
            >
              {actions}
            </div>
          )}
        </div>
        {/* Only show image element when not using background image */}
        {image && background !== "image" && (
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                if (target.parentElement) {
                  target.parentElement.className =
                    "relative h-[400px] bg-gradient-to-br from-muted to-muted/50 rounded-2xl overflow-hidden flex items-center justify-center shadow-xl";
                  target.parentElement.innerHTML =
                    '<div class="text-muted-foreground text-xl">' +
                    image.alt +
                    "</div>";
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        )}
      </div>
    </section>
  );
}

export { HeroSection };
