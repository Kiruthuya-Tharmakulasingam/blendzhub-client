"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OwnerDashboardRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/dashboard/owner");
  }, [router]);
  
  return null;
}

