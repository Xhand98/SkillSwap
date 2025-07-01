export interface TestimonialCardProps {
  id: number;
  name: string;
  title: string;
  testimonial: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  id,
  name,
  title,
  testimonial,
}) => (
  <div
    className="bg-gray-50 border border-gray-200 rounded-xl shadow-md p-6 max-w-md w-full"
    key={id}
  >
    <p className="text-gray-700 italic mb-4">{testimonial}</p>
    <div className="flex items-center gap-3">
      <div className="bg-purple-200 rounded-full w-10 h-10 flex items-center justify-center font-bold text-purple-700">
        {name[0].toUpperCase()}
      </div>
      <div className="flex flex-col">
        <span className="font-semibold text-gray-900">{name}</span>
        <span className="font-normal text-gray-600  text-s">{title}</span>
      </div>
    </div>
  </div>
);

export default TestimonialCard;
