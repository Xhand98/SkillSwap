"use client";

import { Container } from "@/components/container";
import { Text } from "@/components/text";
import locale from "@/locales/error-page.json";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

function ErrorPage() {
  const router = useRouter();
  return (
    <Container className="flex-center">
      <div className="relative flex flex-col flex-center gap-6 py-10">
        <Text as={"h1"} align="center" size="heading-6">
          {locale.TITLE}
        </Text>
      </div>
      <div className="flex justify-center gap-4">
        <Button asChild className="min-w-[200px]">
          <Link href="/">{locale.GO_HOME}</Link>
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            router.back();
          }}
        >
          {locale.GO_BACk}
        </Button>
      </div>
    </Container>
  );
}

export default ErrorPage;
