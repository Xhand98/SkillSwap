import { Container } from "@/components/container";
import FeedCard from "./_components/FeedCard";
import { Text } from "@/components/text";
import locale from "@/locales/feed-data.json";

export default function FeedPage() {
  return (
    <Container>
      <div className="py-16">
        <Text as={"h1"} size="heading-4" className="mb-6">
          Feed de Habilidades
        </Text>
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> */}
        <div>
          {locale.POSTS.map((e, i) => (
            <FeedCard
              key={i}
              title={e.TITLE}
              description={e.DESCRIPTION}
              tags={e.TAGS}
              author={e.AUTHOR}
            />
          ))}
        </div>
      </div>
    </Container>
  );
}
