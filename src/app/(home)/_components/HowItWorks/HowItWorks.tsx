import { cn } from "@/lib/utils";
import FeatureCard from "./FeaturesCard";

export default function HowItWorks() {
  return (
    <section className="bg-[#1a1a1a] py-16" id="como-funciona">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-extrabold text-[#5f21db] mb-12">
          ¿Cómo funciona SkillSwap?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <FeatureCard
            title="1. Crea tu perfil"
            text="Comparte tus habilidades y lo que quieres aprender."
            cardEmoji="👤"
          />
          <FeatureCard
            cardEmoji="🔍"
            title="2. Encuentra coincidencias"
            text="Conecta con personas que complementen tus intereses."
          />
          <FeatureCard
            cardEmoji="🔄"
            title="3. Intercambia conocimientos"
            text="Organiza sesiones para enseñar y aprender mutuamente"
          />
          <FeatureCard
            cardEmoji="🌟"
            title="4. Evalúa y mejora"
            text="Deja reseñas y sigue explorando nuevas habilidades."
          />
        </div>
      </div>
    </section>
  );
}
