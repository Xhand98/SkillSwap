"use client";

import { Container } from "@/components/container";
import { Text } from "@/components/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SkillSwapFull from "@/icons/logoFull";
import locale from "@/locales/userAuth.json";
import { Checkbox } from "@/components/ui/checkbox";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  return (
    <Container className="flex min-h-[calc(100vh-140px)] items-center justify-center mt-8">
      <div className="w-full flex flex-col justify-center items-center max-w-md space-y-6 rounded-xl border p-8 shadow-sm border-zinc-400">
        <SkillSwapFull size={270} className="-ml-10 -my-4" />
        <Text as="h1" size="heading-3" className="text-center">
          Iniciar sesión
        </Text>

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

          <div className="items-top flex space-x-2 pt-4">
            <Checkbox
              id="terms1"
              checked={termsAccepted}
              onCheckedChange={() => setTermsAccepted(!termsAccepted)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="terms1"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Aceptar terminos y condiciones
              </label>
              <p className="text-sm text-muted-foreground">
                Aceptas nuestros Terminos de Servicio y Politica de Privacidad.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => {
            termsAccepted === true
              ? console.log("Sesion iniciada")
              : alert("Debes aceptar los terminos y condiciones");
          }}
          disabled={!termsAccepted}
          type="button"
          className="w-full"
        >
          Entrar
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
