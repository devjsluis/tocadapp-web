"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";

export const NavbarLanding = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkToken = () => {
      const token = Cookies.get("token");
      if (!!token !== isLoggedIn) {
        setIsLoggedIn(!!token);
      }
    };

    checkToken();
  }, [isLoggedIn]);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (pathname === "/") {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", `/#${id}`);
      }
    }
  };

  return (
    <nav className="flex justify-between bg-black w-full fixed top-0 left-0 text-white font-bold px-5 py-4 border-b-6 border-b-purple-700 z-50 backdrop-blur-md">
      <section className="flex gap-x-4 items-center">
        <Link href="/" className="flex items-center gap-x-4">
          <Image alt="Logotipo" src="/logotipo.png" width={40} height={40} />
          <h1 className="text-2xl">Tocadapp</h1>
        </Link>
      </section>

      <ul className="flex items-center gap-x-6">
        <li className="hidden md:block">
          <Link
            href="/#inicio"
            onClick={(e) => handleScroll(e, "inicio")}
            className="cursor-pointer hover:text-purple-400 transition-colors"
          >
            Inicio
          </Link>
        </li>
        <li className="hidden md:block">
          <Link
            href="/#caracteristicas"
            onClick={(e) => handleScroll(e, "caracteristicas")}
            className="cursor-pointer hover:text-purple-400 transition-colors"
          >
            Características
          </Link>
        </li>
        <li className="hidden md:block">
          <Link
            href="/#precios"
            onClick={(e) => handleScroll(e, "precios")}
            className="cursor-pointer hover:text-purple-400 transition-colors"
          >
            Precios
          </Link>
        </li>
        <li className="hidden md:block">
          <Link
            href="/#contacto"
            onClick={(e) => handleScroll(e, "contacto")}
            className="cursor-pointer hover:text-purple-400 transition-colors"
          >
            Contacto
          </Link>
        </li>

        {isLoggedIn ? (
          <Link href="/dashboard">
            <Button
              type="button"
              className="bg-purple-700 text-white rounded-md px-5 py-5 cursor-pointer hover:bg-purple-800 font-bold flex gap-2"
            >
              Ir al Dashboard
            </Button>
          </Link>
        ) : (
          <Button
            onClick={() => router.push("/login")}
            type="button"
            className="bg-purple-700 text-white rounded-md px-5 py-5 cursor-pointer hover:bg-purple-800 font-bold"
          >
            Iniciar sesión
          </Button>
        )}
      </ul>
    </nav>
  );
};
