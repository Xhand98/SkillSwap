import React from "react";
import { Phone } from "lucide-react";

const AboutUsPage: React.FC = () => {
  const title = "Sobre nosotros";
  const subtitle =
    "En SkillSwap creemos que todos tienen algo valioso que enseñar y algo nuevo que aprender.";

  return (
    <div className="bg-[#1b1b1b] text-white">
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
      </div>
    </div>
  );
};

export default AboutUsPage;
