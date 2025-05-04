import { Container } from "@/components/container";
import { Text } from "@/components/text";
import { Input } from "@heroui/react";

export default function Login() {
  return (
    <Container className="flex min-h-[calc(100vh-140px)] items-center justify-center py-8">
      <div className="w-full max-w-md space-y-6 rounded-lg border p-8 shadow-sm">
        <Text as="h1" size="heading-4" className="text-center">
          Iniciar sesión
        </Text>

        <Input
          label="Email"
          type="email"
          fullWidth
          className="[&>input]:bg-background"
        />

        <Text as="p" className="text-center">
          ¿No tienes cuenta?{" "}
          <a href="/register" className="text-primary underline">
            Regístrate
          </a>
        </Text>
      </div>
    </Container>
  );
}
