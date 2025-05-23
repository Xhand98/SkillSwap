"use client";

import { Container } from "@/components/container";
import { Text } from "@/components/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SkillSwapFull from "@/icons/logoFull";
import locale from "@/locales/userAuth.json";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/AuthService";
import { useAuth } from "@/lib/AuthContext";
import useCurrentUserId from "@/hooks/useCurrentUserId";

export default function Login() {
  const router = useRouter();
  const {
    login: authLogin,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();
  const currentUserId = useCurrentUserId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redireccionar si el usuario ya está autenticado
  useEffect(() => {
    if (isAuthenticated && currentUserId) {
      console.log("Usuario ya autenticado con ID:", currentUserId);
      const redirectTo = localStorage.getItem("redirectAfterLogin") || "/feed";
      localStorage.removeItem("redirectAfterLogin"); // Limpiar después de usar
      router.push(redirectTo);
    }
  }, [isAuthenticated, currentUserId, router]);

  // Efectos para manejar parámetros de URL
  useEffect(() => {
    // Verificar si viene de registro exitoso
    const urlParams = new URLSearchParams(window.location.search);
    const registered = urlParams.get("registered");
    const prefilledEmail = urlParams.get("email");

    if (registered === "true") {
      setSuccessMessage(
        "¡Registro exitoso! Ahora puedes iniciar sesión con tus credenciales."
      );

      // Prellenar el email si viene del registro
      if (prefilledEmail) {
        setEmail(prefilledEmail);
      }
    }
  }, []);

  return (
    <Container className="flex min-h-[calc(100vh-140px)] items-center justify-center mt-8">
      <div className="w-full flex flex-col justify-center items-center max-w-md space-y-6 rounded-xl border p-8 shadow-sm border-zinc-400">
        <SkillSwapFull size={270} className="-ml-10 -my-4" />
        <Text as="h1" size="heading-3" className="text-center">
          Iniciar sesión
        </Text>

        {successMessage && (
          <div className="w-full p-3 bg-green-50 border border-green-200 rounded text-green-700 flex items-center gap-2">
            <span className="text-sm">{successMessage}</span>
          </div>
        )}

        <div className="w-full space-y-4">
          {locale.login.INPUTS.map((input, i) => (
            <div key={i} className="w-full flex flex-col space-y-1">
              <Label htmlFor={input.TYPE}>{input.LABEL}</Label>
              <div className="relative">
                <Input
                  value={input.TYPE === "email" ? email : password}
                  onChange={(e) =>
                    input.TYPE === "email"
                      ? setEmail(e.target.value)
                      : setPassword(e.target.value)
                  }
                  type={
                    input.TYPE === "password"
                      ? showPassword
                        ? "text"
                        : "password"
                      : input.TYPE
                  }
                  id={input.TYPE}
                  placeholder={input.PLACEHOLDER}
                />
                {input.TYPE === "password" && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {showPassword ? (
                        <motion.div
                          key="eye"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Eye className="h-5 w-5" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="eye-off"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <EyeOff className="h-5 w-5" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="w-full p-3 bg-red-50 border border-red-200 rounded text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <Button
          onClick={async () => {
            if (!email || !password) {
              setError("Por favor, completa todos los campos");
              return;
            }

            try {
              setLoading(true);
              setError(null);
              setSuccessMessage(null);

              // Usar el contexto de autenticación para login
              try {
                await authLogin(email, password);
              } catch (authError) {
                // Intentar con el AuthService directo como fallback
                const response = await AuthService.login({ email, password });
                if (response && response.user && response.user.id) {
                  // Asegurarse de que el ID del usuario se guarde correctamente
                  AuthService.setCurrentUserId(response.user.id);
                }
              }

              // El useEffect con isAuthenticated y currentUserId manejará la redirección
              // después del login exitoso, pero por si acaso:
              const redirectTo =
                localStorage.getItem("redirectAfterLogin") || "/feed";
              localStorage.removeItem("redirectAfterLogin"); // Limpiar después de usar
              router.push(redirectTo);
            } catch (err) {
              console.error("Error de inicio de sesión:", err);
              setError(
                "Credenciales incorrectas. Por favor, verifica tu email y contraseña."
              );
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          type="button"
          className="w-full"
        >
          {loading ? "Iniciando sesión..." : "Entrar"}
        </Button>

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
