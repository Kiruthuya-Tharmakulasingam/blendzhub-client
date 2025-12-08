import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const statusBadgeVariants = cva(
  "",
  {
    variants: {
      status: {
        pending: "bg-pending text-pending-foreground",
        accepted: "bg-accepted text-accepted-foreground",
        approved: "bg-approved text-approved-foreground",
        rejected: "bg-rejected text-rejected-foreground",
        cancelled: "bg-cancelled text-cancelled-foreground",
        "in-progress": "bg-info text-info-foreground",
        completed: "bg-success text-success-foreground",
        active: "bg-active text-active-foreground",
        inactive: "bg-inactive text-inactive-foreground",
        "no-show": "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      status: "pending",
    },
  }
)

export interface StatusBadgeProps
  extends React.ComponentProps<typeof Badge>,
    VariantProps<typeof statusBadgeVariants> {
  status:
    | "pending"
    | "accepted"
    | "approved"
    | "rejected"
    | "cancelled"
    | "in-progress"
    | "completed"
    | "active"
    | "inactive"
    | "no-show"
}

function StatusBadge({
  className,
  status,
  ...props
}: StatusBadgeProps) {
  const statusLabels: Record<StatusBadgeProps["status"], string> = {
    pending: "Pending",
    accepted: "Accepted",
    approved: "Approved",
    rejected: "Rejected",
    cancelled: "Cancelled",
    "in-progress": "In Progress",
    completed: "Completed",
    active: "Active",
    inactive: "Inactive",
    "no-show": "No Show",
  }

  return (
    <Badge
      className={cn(statusBadgeVariants({ status }), className)}
      {...props}
    >
      {statusLabels[status]}
    </Badge>
  )
}

export { StatusBadge, statusBadgeVariants }

