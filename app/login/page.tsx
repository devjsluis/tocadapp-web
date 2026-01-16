"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const redirectToHome = () => {
    router.push("/");
  };
  return <Button onClick={redirectToHome}>Ir a Inicio</Button>;
}
