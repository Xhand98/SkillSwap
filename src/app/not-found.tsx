import { Container } from "@/components/container";
import { Text } from "@/components/text";
import locale from "@/locales/not-found.json";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <Container className="flex items-center justify-center min-h-screen">
      <div className="relative flex flex-col items-center max-w-2xl mx-auto text-center space-y-8">
        <Text as={"h1"} align="center" size="heading-6">
          {locale.TITLE}
        </Text>
        <Text className="max-w-[60ch]" size="paragraph-lg" align="center">
          {locale.DESCRIPTION}
        </Text>
        <img
          className="absolute -top-16 right-0 rotate-12 w-24 h-24 object-contain"
          src={locale.IMAGE.SRC}
          alt={locale.IMAGE.ALT}
        />
        <img
          className="absolute -bottom-16 left-0 -rotate-12 w-24 h-24 object-contain"
          src={locale.IMAGE.SRC}
          alt={locale.IMAGE.ALT}
        />
        <div className="flex justify-center gap-4 pt-4">
          <Button asChild className="min-w-[200px]">
            <Link href="/">{locale.GO_HOME}</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
