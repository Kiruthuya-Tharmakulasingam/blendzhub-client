"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NotFound from "@/app/not-found";

function Hash404Logic({ children }: { children: React.ReactNode }) {
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (!hash) {
        // Reset if no hash
        setIsNotFound(false);
        return;
      }

      // Remove the '#' to get the ID
      const id = hash.substring(1);
      if (!id) {
        setIsNotFound(false);
        return;
      }

      // Check if element exists immediately
      const element = document.getElementById(id);
      
      if (!element) {
        // Double check after delays to allow for async rendering and client-side hydration
        let retryCount = 0;
        const maxRetries = 3;
        const retryDelays = [100, 300, 500]; // Progressive delays
        
        const retryCheck = () => {
          const retryElement = document.getElementById(id);
          if (retryElement) {
            // Element found, reset state
            setIsNotFound(false);
          } else {
            retryCount++;
            if (retryCount < maxRetries) {
              // Try again with next delay
              setTimeout(retryCheck, retryDelays[retryCount]);
            } else {
              // All retries exhausted, show 404
              console.warn(`Hash target #${id} not found after ${maxRetries} attempts, showing 404`);
              setIsNotFound(true);
            }
          }
        };
        
        setTimeout(retryCheck, retryDelays[0]);
      } else {
        // Element exists, ensure we're not in 404 state
        setIsNotFound(false);
      }
    };

    // Check on mount and hash change
    checkHash();
    window.addEventListener("hashchange", checkHash);

    return () => {
      window.removeEventListener("hashchange", checkHash);
    };
  }, []);

  if (isNotFound) {
    return <NotFound />;
  }

  return <>{children}</>;
}

function Hash404HandlerInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Create a unique key based on the current route to force a remount
  // and reset state when the route changes
  const key = `${pathname}?${searchParams?.toString()}`;

  return <Hash404Logic key={key}>{children}</Hash404Logic>;
}

export default function Hash404Handler({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<>{children}</>}>
      <Hash404HandlerInner>{children}</Hash404HandlerInner>
    </Suspense>
  );
}
