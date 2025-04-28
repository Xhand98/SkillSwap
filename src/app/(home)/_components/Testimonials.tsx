export default function Testimonials() {
  return (
    <main>
      <section className="bg-white py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex justify-center">
            <img
              src="/images/testimonials.png"
              alt="Testimonials"
              className="w-full h-auto max-w-sm rounded-2xl shadow-lg"
            />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold text-purple-600 mb-4">
              Testimonials
            </h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Hear what our users have to say about us.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
