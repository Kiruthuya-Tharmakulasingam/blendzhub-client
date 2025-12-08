"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CustomerDashboardRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/dashboard/customer");
  }, [router]);
  
  return null;
}

