import * as React from "react"
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const alertBannerVariants = cva(
  "flex items-start gap-3 rounded-lg border p-4 transition-colors",
  {
    variants: {
      variant: {
        success: "bg-success/10 border-success/20 text-success-foreground",
        error: "bg-error/10 border-error/20 text-error-foreground",
        warning: "bg-warning/10 border-warning/20 text-warning-foreground",
        info: "bg-info/10 border-info/20 text-info-foreground",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

export interface AlertBannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertBannerVariants> {
  title?: string
  description?: string
  dismissible?: boolean
  onDismiss?: () => void
}

const variantIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

function AlertBanner({
  className,
  variant = "info",
  title,
  description,
  dismissible = false,
  onDismiss,
  children,
  ...props
}: AlertBannerProps) {
  const Icon = variantIcons[variant || "info"]

  return (
    <div className={cn(alertBannerVariants({ variant }), className)} {...props}>
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        {description && <p className="text-sm">{description}</p>}
        {children}
      </div>
      {dismissible && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export { AlertBanner, alertBannerVariants }

