import { Container } from "@/components/container";
import { Text } from "@/components/text";
import { Input } from "@heroui/react";

export default function Login() {
  return (
    <Container
      className="flex min-h-screen mt-16 text-purple-600 items-center "
      size="5xl"
    >
      <Text as={"h1"} size="heading-4" className="max-w-screen">
        Iniciar sesión
      </Text>
      <Text as={"p"} size="paragraph-xl" className="max-w-fit mt-6">
        Inicia sesión para acceder a tu cuenta.
      </Text>
      <div className="flex items-center justify-center content-center gap-40 mt-10 pt-20 min-w-screen ">
        <Input className="max-w-xs" label="Email" type="email" />
      </div>
      <Text as={"p"} size="paragraph-xl" className="max-w-fit mt-6">
        No tienes una cuenta? <a href="/register">Registrate</a>
      </Text>
    </Container>
  );
}
