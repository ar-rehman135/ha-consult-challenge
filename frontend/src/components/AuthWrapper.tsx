'use client'
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token && pathname !== "/") {
      router.replace("/");
    } else if (token && pathname !== "/stock") {
        router.replace("/stock");
      setIsChecking(false);
    } else {
      setIsChecking(false);
    }
  }, [router, pathname]);

  if (isChecking) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return <>{children}</>;
}
