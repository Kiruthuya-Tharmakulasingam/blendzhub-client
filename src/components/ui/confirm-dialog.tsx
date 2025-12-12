"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";

export type ConfirmDialogVariant = "default" | "destructive" | "warning" | "success" | "info";

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  showCancel?: boolean;
}

interface ConfirmDialogContextType {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
  alert: (options: Omit<ConfirmDialogOptions, "showCancel">) => Promise<void>;
}

const ConfirmDialogContext = React.createContext<ConfirmDialogContextType | null>(null);

export function useConfirmDialog() {
  const context = React.useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error("useConfirmDialog must be used within ConfirmDialogProvider");
  }
  return context;
}

interface ConfirmDialogState extends ConfirmDialogOptions {
  isOpen: boolean;
  resolve: ((value: boolean) => void) | null;
}

const variantConfig = {
  default: {
    icon: Info,
    iconClass: "text-primary",
    confirmButtonVariant: "default" as const,
  },
  destructive: {
    icon: XCircle,
    iconClass: "text-destructive",
    confirmButtonVariant: "destructive" as const,
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-warning",
    confirmButtonVariant: "default" as const,
  },
  success: {
    icon: CheckCircle,
    iconClass: "text-green-500",
    confirmButtonVariant: "default" as const,
  },
  info: {
    icon: Info,
    iconClass: "text-blue-500",
    confirmButtonVariant: "default" as const,
  },
};

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ConfirmDialogState>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "default",
    showCancel: true,
    resolve: null,
  });

  const confirm = React.useCallback((options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        variant: options.variant || "default",
        showCancel: options.showCancel !== false,
        resolve,
      });
    });
  }, []);

  const alert = React.useCallback((options: Omit<ConfirmDialogOptions, "showCancel">): Promise<void> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || "OK",
        cancelText: "Cancel",
        variant: options.variant || "info",
        showCancel: false,
        resolve: () => resolve(),
      });
    });
  }, []);

  const handleConfirm = () => {
    state.resolve?.(true);
    setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  };

  const handleCancel = () => {
    state.resolve?.(false);
    setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  };

  const config = variantConfig[state.variant || "default"];
  const Icon = config.icon;

  return (
    <ConfirmDialogContext.Provider value={{ confirm, alert }}>
      {children}
      <Dialog open={state.isOpen} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-full bg-muted ${config.iconClass}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1 space-y-2">
                <DialogTitle className="text-lg">{state.title}</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {state.message}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-2">
            {state.showCancel && (
              <Button variant="outline" onClick={handleCancel}>
                {state.cancelText}
              </Button>
            )}
            <Button variant={config.confirmButtonVariant} onClick={handleConfirm}>
              {state.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmDialogContext.Provider>
  );
}
