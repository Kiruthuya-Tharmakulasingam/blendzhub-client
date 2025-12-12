import Link from "next/link";
import { Button } from "@/components/ui/button";
import GoBackButton from "@/components/GoBackButton";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans home-theme">
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-lg mx-auto">
          {/* Large 404 Text with Theme Colors */}
          <div className="relative">
            <h1 className="text-[10rem] font-black text-primary/10 select-none leading-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-4xl font-bold text-primary tracking-tight">
                Page Not Found
              </h2>
            </div>
          </div>
          
          {/* Message */}
          <div className="space-y-4 px-4">
            <p className="text-lg text-muted-foreground">
              Oops! The page you are looking for seems to have wandered off. 
              It might have been moved, deleted, or never existed.
            </p>
            <p className="text-sm text-muted-foreground/80">
              If you typed the URL manually, please double-check the spelling.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button 
              asChild 
              size="lg" 
              className="min-w-[140px] bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/">
                Go to Home
              </Link>
            </Button>
            
            <GoBackButton />
          </div>
        </div>
      </main>
    </div>
  );
}
