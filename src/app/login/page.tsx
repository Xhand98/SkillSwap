"use client";

import { Container } from "@/components/container";
import { Text } from "@/components/text";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Container className="flex min-h-[calc(100vh-140px)] items-center justify-center py-8">
      <div className="w-full max-w-md space-y-6 rounded-lg border p-8 shadow-sm">
        <Text as="h1" size="heading-4" className="text-center">
          Iniciar sesión
        </Text>
        <Input />

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
