import Description from "./_components/Description";
import HeroSection from "./_components/Hero";
import LOCALE from "@/locales/home.json";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <Description imageSrc={LOCALE.SECTION1.IMAGE_SRC} />
    </main>
  );
}
