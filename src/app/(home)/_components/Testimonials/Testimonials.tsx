import locale from "@/locales/testimonials.json";

export default function Testimonials() {
  return (
    <main>
      <section className="bg-white py-16 px-4">
        <div className="max-w-max mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl text-center font-extrabold text-purple-600 mb-4 w-screen">
              {locale.page.title}
            </h2>
            <p className="text-lg text-gr ay-700 mb-6 leading-relaxed w-screen text-center">
              {locale.page.description}
            </p>
          </div>
        </div>
        <div className="mt-10 flex justify-center gap-10 flex-wrap">
          {locale.testimonials.map((elemento) => (
            <div
              className="bg-gray-50 border border-gray-200 rounded-xl shadow-md p-6 max-w-md w-full"
              key={elemento.id}
            >
              <p className="text-gray-700 italic mb-4">
                {elemento.testimonial}
              </p>
              <div className="flex items-center gap-3">
                <div className="bg-purple-200 rounded-full w-10 h-10 flex items-center justify-center font-bold text-purple-700">
                  {elemento.name[0].toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900">
                    {elemento.name}
                  </span>
                  <span className="font-normal text-gray-600  text-s">
                    {elemento.title}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
