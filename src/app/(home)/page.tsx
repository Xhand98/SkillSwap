import Description from "./_components/Description";
import HeroSection from "./_components/Hero";
import HowItWorks from "./_components/HowItWorks/HowItWorks";
import Testimonials from "./_components/Testimonials/Testimonials";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <Testimonials />
      <HowItWorks />
      <Description />
    </main>
  );
}
