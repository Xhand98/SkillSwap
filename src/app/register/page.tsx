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
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  // Estado para los campos del formulario
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  // Estados para términos y condiciones
  const [terms, setTerms] = useState({
    service: false,
    privacy: false,
    marketing: false,
  });

  // Estados para errores de validación
  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    passwordMatch: false,
    passwordLength: false,
    terms: false,
  });

  // Manejar cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validaciones en tiempo real
    if (name === "password" || name === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        passwordMatch:
          name === "password"
            ? value !== formData.confirmPassword
            : value !== formData.password,
        passwordLength: name === "password" && value.length < 8,
      }));
    }

    if (name === "email") {
      setErrors((prev) => ({
        ...prev,
        email: !value.includes("@") || !value.includes("."),
      }));
    }

    if (name === "firstName" || name === "lastName") {
      setErrors((prev) => ({
        ...prev,
        [name]: value.trim() === "",
      }));
    }
  };

  // Alternar visibilidad de contraseña
  const togglePasswordVisibility = (field: "password" | "confirmPassword") => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Validar y enviar el formulario
  const handleSubmit = () => {
    const newErrors = {
      firstName: formData.firstName.trim() === "",
      lastName: formData.lastName.trim() === "",
      email: !formData.email.includes("@") || !formData.email.includes("."),
      passwordMatch: formData.password !== formData.confirmPassword,
      passwordLength: formData.password.length < 8,
      terms: !terms.service || !terms.privacy,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      return;
    }

    router.push("/login");

    console.log("Registro exitoso", {
      ...formData,
      acceptsMarketing: terms.marketing,
    });
    // Aquí iría la lógica para enviar los datos al servidor
  };

  // Verificar si todos los campos son válidos
  const allFieldsValid =
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    !errors.firstName &&
    !errors.lastName &&
    !errors.email &&
    !errors.passwordMatch &&
    !errors.passwordLength &&
    terms.service &&
    terms.privacy;

  return (
    <Container className="flex min-h-[calc(100vh-140px)] items-center justify-center mt-8">
      <div className="w-full flex flex-col justify-center items-center max-w-md space-y-6 rounded-xl border p-8 shadow-sm border-zinc-400">
        <SkillSwapFull size={270} className="-ml-10 -my-4" />
        <Text as="h1" size="heading-3" className="text-center">
          Registro
        </Text>

        <div className="w-full space-y-4">
          {/* Mapear los inputs del JSON */}
          {locale.register.INPUTS.map((input, index) => (
            <div key={index} className="w-full flex flex-col space-y-1">
              <Label htmlFor={input.LABEL.replace(/\s+/g, "-").toLowerCase()}>
                {input.LABEL}
              </Label>
              {input.TYPE === "password" ? (
                <div className="relative">
                  <Input
                    name={
                      input.LABEL === "Contraseña"
                        ? "password"
                        : "confirmPassword"
                    }
                    value={
                      input.LABEL === "Contraseña"
                        ? formData.password
                        : formData.confirmPassword
                    }
                    onChange={handleChange}
                    type={showPassword.password ? "text" : "password"}
                    id={input.LABEL.replace(/\s+/g, "-").toLowerCase()}
                    placeholder={input.PLACEHOLDER}
                    className={
                      (input.LABEL === "Contraseña" && errors.passwordLength) ||
                      (input.LABEL === "Confirmar Contraseña" &&
                        errors.passwordMatch)
                        ? "border-red-500"
                        : ""
                    }
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("password")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {showPassword.password ? (
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
                </div>
              ) : (
                <Input
                  name={
                    input.LABEL === "Primer Nombre"
                      ? "firstName"
                      : input.LABEL === "Primer Apellido"
                      ? "lastName"
                      : input.LABEL === "Correo Electrónico"
                      ? "email"
                      : ""
                  }
                  value={
                    input.LABEL === "Primer Nombre"
                      ? formData.firstName
                      : input.LABEL === "Primer Apellido"
                      ? formData.lastName
                      : input.LABEL === "Correo Electrónico"
                      ? formData.email
                      : ""
                  }
                  onChange={handleChange}
                  type={input.TYPE}
                  id={input.LABEL.replace(/\s+/g, "-").toLowerCase()}
                  placeholder={input.PLACEHOLDER}
                  className={
                    (input.LABEL === "Primer Nombre" && errors.firstName) ||
                    (input.LABEL === "Primer Apellido" && errors.lastName) ||
                    (input.LABEL === "Correo Electrónico" && errors.email)
                      ? "border-red-500"
                      : ""
                  }
                />
              )}
              {input.LABEL === "Primer Nombre" && errors.firstName && (
                <p className="text-sm text-red-500">Este campo es requerido</p>
              )}
              {input.LABEL === "Primer Apellido" && errors.lastName && (
                <p className="text-sm text-red-500">Este campo es requerido</p>
              )}
              {input.LABEL === "Correo Electrónico" && errors.email && (
                <p className="text-sm text-red-500">Ingresa un correo válido</p>
              )}
              {input.LABEL === "Contraseña" && errors.passwordLength && (
                <p className="text-sm text-red-500">
                  Mínimo 8 caracteres requeridos
                </p>
              )}
            </div>
          ))}

          {/* Campo adicional para confirmar contraseña (no en el JSON) */}
          <div className="w-full flex flex-col space-y-1">
            <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
            <div className="relative">
              <Input
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                type={showPassword.confirmPassword ? "text" : "password"}
                id="confirm-password"
                placeholder="Confirma tu contraseña"
                className={errors.passwordMatch ? "border-red-500" : ""}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirmPassword")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {showPassword.confirmPassword ? (
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
            </div>
            {errors.passwordMatch && (
              <p className="text-sm text-red-500">
                Las contraseñas no coinciden
              </p>
            )}
          </div>

          {/* Términos y Condiciones */}
          <div className="space-y-3 pt-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms-service"
                checked={terms.service}
                onCheckedChange={() =>
                  setTerms({ ...terms, service: !terms.service })
                }
                className="mt-0.5"
              />
              <label
                htmlFor="terms-service"
                className="text-sm font-medium leading-snug cursor-pointer"
              >
                <span className="text-primary font-bold mr-1">*</span>
                <span>Acepto los </span>
                <a
                  href="/terms"
                  target="_blank"
                  className="text-primary underline hover:text-primary/80 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Términos de Servicio
                </a>
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="privacy-policy"
                checked={terms.privacy}
                onCheckedChange={() =>
                  setTerms({ ...terms, privacy: !terms.privacy })
                }
                className="mt-0.5"
              />
              <label
                htmlFor="privacy-policy"
                className="text-sm font-medium leading-snug cursor-pointer"
              >
                <span className="text-primary font-bold mr-1">*</span>
                <span>Acepto la </span>
                <a
                  href="/privacy"
                  target="_blank"
                  className="text-primary underline hover:text-primary/80 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Política de Privacidad
                </a>
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="marketing-communications"
                checked={terms.marketing}
                onCheckedChange={() =>
                  setTerms({ ...terms, marketing: !terms.marketing })
                }
                className="mt-0.5"
              />
              <label
                htmlFor="marketing-communications"
                className="text-sm font-medium leading-snug cursor-pointer text-muted-foreground"
              >
                Deseo recibir comunicaciones de marketing (opcional)
              </label>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!allFieldsValid}
          className="w-full bg-[#5f21db] hover:bg-purple-700 text-white"
        >
          Registrarse
        </Button>

        <Text as="p" className="text-center">
          ¿Ya tienes cuenta?{" "}
          <a
            href="/login"
            className="text-primary underline hover:text-primary/80"
          >
            Inicia sesión
          </a>
        </Text>
      </div>
    </Container>
  );
}
