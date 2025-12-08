import * as React from "react"
import { cn } from "@/lib/utils"

export interface HeroSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: string | React.ReactNode
  subtitle?: string
  description?: string
  actions?: React.ReactNode
  image?: {
    src: string
    alt: string
  }
  background?: "gradient" | "solid"
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
        "relative py-20 px-8 sm:px-16 border-b overflow-hidden",
        background === "gradient"
          ? "bg-gradient-to-br from-background via-surface to-muted"
          : "bg-surface",
        className
      )}
      {...props}
    >
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: "url('/background-pattern.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "300px 300px"
        }}
      />
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="flex flex-col gap-6">
          {subtitle && (
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {subtitle}
            </p>
          )}
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-muted-foreground max-w-lg">
              {description}
            </p>
          )}
          {actions && <div className="flex flex-wrap gap-4 mt-4">{actions}</div>}
        </div>
        {image && (
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = "none"
                if (target.parentElement) {
                  target.parentElement.className =
                    "relative h-[400px] bg-gradient-to-br from-muted to-muted/50 rounded-2xl overflow-hidden flex items-center justify-center shadow-xl"
                  target.parentElement.innerHTML =
                    '<div class="text-muted-foreground text-xl">' +
                    image.alt +
                    "</div>"
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        )}
      </div>
    </section>
  )
}

export { HeroSection }

