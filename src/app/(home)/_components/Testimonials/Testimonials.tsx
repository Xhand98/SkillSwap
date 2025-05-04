import locale from "@/locales/testimonials.json";
import TestimonialCard from "./TestCard";

export default function Testimonials() {
  return (
    <main>
      <section className="bg-white py-16 px-4">
        <div className="max-w-max mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl text-center font-extrabold text-purple-600 mb-4 w-screen">
              {locale.page.title}
            </h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed w-screen text-center">
              {locale.page.description}
            </p>
          </div>
        </div>
        <div className="mt-10 flex justify-center gap-10 flex-wrap">
          {locale.testimonials.map((e, index) => (
            <TestimonialCard
              key={index}
              id={index}
              name={e.name}
              title={e.title}
              testimonial={e.testimonial}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
