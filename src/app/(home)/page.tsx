import Description from "./_components/Description";
import HeroSection from "./_components/Hero";
import HowItWorks from "./_components/HowItWorks/HowItWorks";
import Testimonials from "./_components/Testimonials";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <Description />
      <HowItWorks />
      <Testimonials />
    </main>
  );
}
