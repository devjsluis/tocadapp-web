export const NavbarLanding = () => {
  return (
    <main className="flex justify-between bg-black min-w-dvw absolute top-0 text-white font-bold px-5 py-6 border-b-6 border-b-purple-700">
      <section className="flex gap-x-6 items-center">
        <div className="w-8 h-8 bg-purple-700 transform rotate-45 flex items-center justify-center relative">
          <div className="absolute w-0 h-0 border-t-8 border-b-8 border-l-12 border-t-transparent border-b-transparent border-l-black right-1/2 -translate-x-1/2"></div>
        </div>
        <h1 className="text-2xl">Tocadapp</h1>
      </section>
      <ul className="flex items-center gap-x-6">
        <li className="cursor-pointer">Características</li>
        <li className="cursor-pointer">Precios</li>
        <li className="cursor-pointer">Contacto</li>
        <li className="bg-purple-700 text-white rounded-md px-6 py-2 cursor-pointer">
          Regístrate
        </li>
      </ul>
    </main>
  );
};
