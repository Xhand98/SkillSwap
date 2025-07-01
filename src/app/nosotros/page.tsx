import React from "react";
import { Phone } from "lucide-react";

const AboutUsPage: React.FC = () => {
  const title = "Sobre nosotros";
  const subtitle =
    "En SkillSwap creemos que todos tienen algo valioso que enseñar y algo nuevo que aprender.";

  return (
    <div className="bg-gray-900 text-white">
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex items-center justify-between py-3">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-6 h-6 bg-purple-600 rounded-sm mr-2"></div>
              <span className="font-bold text-xl">SkillSwap</span>
            </div>

            <div className="flex items-center space-x-8">
              <a href="#" className="text-gray-100 hover:text-white">
                Inicio
              </a>
              <a href="#" className="text-purple-400 hover:text-purple-300">
                Feed
              </a>
              <a href="#" className="text-gray-100 hover:text-white">
                Matches
              </a>
              <a href="#" className="text-gray-100 hover:text-white">
                Calendario
              </a>
              <a href="#" className="text-gray-100 hover:text-white">
                Mensajes
              </a>
            </div>

            <div className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-purple-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              <a href="#" className="text-purple-400 hover:text-purple-300">
                Mi Cuenta
              </a>
            </div>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-purple-900 bg-clip-text text-transparent">
            {title}
          </h2>
          <div className="w-24 h-1 bg-purple-500 mx-auto mb-8 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-lg font-medium">{subtitle}</p>

            <p className="text-gray-300">
              Desde 2012, nuestra misión ha sido conectar personas para el
              intercambio justo de habilidades, sin necesidad de dinero.
            </p>

            <div className="bg-gray-800 p-6 rounded-lg border border-purple-500/30">
              <p className="font-medium mb-4">
                Creamos una comunidad global donde programadores enseñan a
                músicos, chefs a diseñadores, y todos aprenden de todos. Porque
                el conocimiento se comparte, no se vende.
              </p>
              <p className="text-purple-300 font-medium">
                Aprender es crecer. Y nosotros estamos aquí para acompañarte en
                cada paso del camino.
              </p>
            </div>

            <div className="pt-4">
              <button className="bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-900 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl">
                Únete a la comunidad
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <div className="w-64 h-96 bg-gray-800 rounded-3xl relative overflow-hidden border-8 border-gray-700 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col">
                  <div className="h-12 bg-purple-600 flex items-center px-4">
                    <div className="w-6 h-6 bg-white rounded-full"></div>
                    <div className="ml-2 w-20 h-3 bg-white rounded-full"></div>
                  </div>

                  <div className="flex-1 p-4">
                    <div className="flex justify-center mb-6">
                      <div className="w-12 h-12 rounded-full bg-purple-400 mr-2"></div>
                      <div className="w-12 h-12 rounded-full bg-blue-400"></div>
                    </div>

                    <div className="space-y-3">
                      <div className="h-4 bg-gray-400 rounded-full w-3/4"></div>
                      <div className="h-4 bg-gray-400 rounded-full w-1/2"></div>
                      <div className="h-16 bg-purple-100 rounded-lg mt-4"></div>
                      <div className="h-16 bg-blue-100 rounded-lg"></div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                  <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
                </div>
                <div className="absolute top-4 left-0 w-1 h-6 bg-gray-700 rounded-r-lg"></div>
              </div>

              <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-purple-500 opacity-80"></div>
              <div className="absolute -bottom-2 -left-6 w-12 h-12 rounded-full bg-blue-500 opacity-70"></div>
              <div className="absolute top-1/4 -right-8 w-6 h-6 rounded-full bg-purple-300 opacity-60"></div>
            </div>
          </div>
        </div>

        <footer className="mt-24 pt-12 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12">
            <div>
              <div className="flex items-center mb-5">
                <div className="w-8 h-8 bg-purple-600 rounded-md mr-2"></div>
                <span className="font-bold text-xl">SkillSwap</span>
              </div>
              <p className="text-gray-400 text-sm">
                Plataforma de intercambio de habilidades sin fronteras
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-5 text-lg">Shop</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-purple-300 cursor-pointer">
                  Explorar
                </li>
                <li className="hover:text-purple-300 cursor-pointer">
                  Categorías
                </li>
                <li className="hover:text-purple-300 cursor-pointer">
                  Populares
                </li>
                <li className="hover:text-purple-300 cursor-pointer">
                  Destacados
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-5 text-lg">Acerca</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-purple-300 cursor-pointer">
                  Nuestra historia
                </li>
                <li className="hover:text-purple-300 cursor-pointer">Misión</li>
                <li className="hover:text-purple-300 cursor-pointer">
                  Carreras
                </li>
                <li className="hover:text-purple-300 cursor-pointer">
                  Newsletter
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-5 text-lg">Soporte</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-purple-300 cursor-pointer">
                  Ayuda & soporte
                </li>
                <li className="hover:text-purple-300 cursor-pointer">FAQ</li>
                <li className="hover:text-purple-300 cursor-pointer">
                  Recursos
                </li>
                <li className="hover:text-purple-300 cursor-pointer">
                  Soporte premium
                </li>
              </ul>
            </div>
          </div>
          <div className="py-4 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gray-800 rounded-full mr-2 flex items-center justify-center">
                <span className="text-white font-bold">N</span>
              </div>
              <span className="text-gray-400 text-sm">
                SkillSwap 2025 • Todos los derechos reservados
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <a href="#" className="text-white hover:text-gray-300">
                <svg
                  fill="currentColor"
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
                </svg>
              </a>
              <a href="#" className="text-white hover:text-gray-300">
                <svg
                  fill="currentColor"
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm3.75-12.29a.76.76 0 1 1-.75.75.75.75 0 0 1 .75-.75zM12 7a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8.33A3.33 3.33 0 1 1 15.33 12 3.33 3.33 0 0 1 12 15.33z" />
                </svg>
              </a>
              <a href="#" className="text-white hover:text-gray-300">
                <svg
                  fill="currentColor"
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                </svg>
              </a>
            </div>
          </div>{" "}
        </footer>
      </div>
    </div>
  );
};

export default AboutUsPage;
