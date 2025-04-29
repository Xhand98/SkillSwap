import { Container } from "@/components/container";
import { Text } from "@/components/text";

export default function FeedPage() {
  return (
    <Container>
      <div className="py-16">
        <Text as={"h1"} size="heading-4" className="mb-6">
          Feed de Habilidades
        </Text>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example feed items - replace with real data */}
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="aspect-video bg-gray-100" />
              <div className="p-4 space-y-2">
                <Text
                  as={"h3"}
                  size="heading-6"
                  className="font-extrabold text-white"
                >
                  Habilidad #{item}
                </Text>
                <Text size="paragraph-sm" className="text-gray-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore.
                </Text>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                  <span>Usuario #{item}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
