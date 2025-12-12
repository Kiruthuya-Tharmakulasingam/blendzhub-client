"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function GoBackButton() {
  const router = useRouter();
  
  return (
    <Button 
      variant="outline" 
      size="lg" 
      onClick={() => router.back()}
      className="min-w-[140px] border-primary/20 hover:bg-primary/5 hover:text-primary"
    >
      Go Back
    </Button>
  );
}
