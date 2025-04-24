import React from "react";
import locale from "@/locales/home.json";
import { Button } from "@heroui/button";
import Link from "next/link";

export interface DescriptionProps {
  /** Illustration source (URL or import) */
  imageSrc: string;
  /** Alt text for illustration */
  imageAlt?: string;
  /** Click handler for start button */
  onStart?: () => void;
}

const Description: React.FC<DescriptionProps> = ({}) => (
  <section className="bg-white py-16 px-4">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      {/* Illustration */}
      <div className="flex justify-center">
        <img
          src={locale.SECTION2.IMAGE.SRC}
          alt={locale.SECTION2.IMAGE.ALT}
          className="w-full h-auto max-w-sm rounded-2xl shadow-lg"
        />
      </div>

      {/* Text & CTA */}
      <div className="text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-extrabold text-purple-600 mb-4">
          {locale.SECTION2.TITLE}
        </h2>
        <p className="text-lg text-gray-700 mb-6 leading-relaxed">
          {locale.SECTION2.DESCRIPTION}
        </p>
        <Button
          as={Link}
          className={
            "inline-flex w-50 h-12 items-center bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:bg-purple-700 transition-colors"
          }
          key={3}
          href={"/register"}
        >
          {" "}
          Empezar Ahora!
        </Button>
      </div>
    </div>
  </section>
);

export default Description;
