"use client";
import { NavbarLanding } from "@/components/customized/NavbarLanding";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const redirectToHome = () => {
    router.push("/");
  };
  return (
    <>
      <NavbarLanding />
      <div className="flex justify-center items-center h-dvh w-dvw bg-black">
        <Button
          className="font-extrabold text-2xl"
          size={"xl"}
          onClick={redirectToHome}
        >
          Ir a Inicio
        </Button>
      </div>
    </>
  );
}
