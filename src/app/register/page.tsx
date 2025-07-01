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
import { AuthService, RegisterData } from "@/lib/AuthService";
import { useAuth } from "@/lib/AuthContext";
import useCurrentUserId from "@/hooks/useCurrentUserId";

export default function Register() {
  const router = useRouter();
  const {
    register: authRegister,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();
  const currentUserId = useCurrentUserId();

  // Redireccionar si el usuario ya está autenticado
  useEffect(() => {
    if (isAuthenticated && currentUserId) {
      console.log("Usuario ya autenticado con ID:", currentUserId);
      router.push("/feed");
    }
  }, [isAuthenticated, currentUserId, router]);

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

  // Estado para mensajes de API y carga
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Manejar cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Actualizar el estado del formulario
    const updatedFormData = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedFormData);

    // Validaciones en tiempo real
    if (name === "password" || name === "confirmPassword") {
      const otherField = name === "password" ? "confirmPassword" : "password";
      const otherValue =
        updatedFormData[otherField as keyof typeof updatedFormData];

      setErrors((prev) => ({
        ...prev,
        passwordMatch: value !== otherValue && otherValue !== "",
        passwordLength:
          name === "password"
            ? value.length > 0 && value.length < 8
            : prev.passwordLength,
      }));
    }

    if (name === "email") {
      // Expresión regular simple para validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setErrors((prev) => ({
        ...prev,
        email: !emailRegex.test(value),
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
  const handleSubmit = async () => {
    // Limpiar errores anteriores
    setApiError(null);

    // Validación con regex para email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const newErrors = {
      firstName: formData.firstName.trim() === "",
      lastName: formData.lastName.trim() === "",
      email: !emailRegex.test(formData.email.trim()),
      passwordMatch: formData.password !== formData.confirmPassword,
      passwordLength: formData.password.length < 8,
      terms: !terms.service || !terms.privacy,
    };

    setErrors(newErrors);

    // Mostrar error específico si hay algún problema de validación
    if (Object.values(newErrors).some((error) => error)) {
      if (newErrors.firstName || newErrors.lastName) {
        setApiError(
          "Por favor, completa todos los campos de nombre y apellido."
        );
      } else if (newErrors.email) {
        setApiError(
          "Por favor, introduce una dirección de correo electrónico válida."
        );
      } else if (newErrors.passwordMatch) {
        setApiError("Las contraseñas no coinciden.");
      } else if (newErrors.passwordLength) {
        setApiError("La contraseña debe tener al menos 8 caracteres.");
      } else if (newErrors.terms) {
        setApiError(
          "Debes aceptar los términos de servicio y la política de privacidad."
        );
      }
      return;
    }

    try {
      setLoading(true);
      console.log("Iniciando registro de usuario...");

      // Preparar datos para la API
      const userData: RegisterData = {
        nombre_usuario:
          formData.email.split("@")[0] + Math.floor(Math.random() * 1000), // Generar un nombre de usuario único
        primer_nombre: formData.firstName,
        primer_apellido: formData.lastName,
        correo_electronico: formData.email,
        ciudad_trabajo: "No especificada", // Campo requerido
        hash_contrasena: formData.password,
      };

      console.log("Datos a enviar a la API:", JSON.stringify(userData));

      // Usar el contexto de autenticación para el registro
      try {
        // Registrar usuario mediante el servicio directo para obtener la respuesta completa
        const user = await AuthService.register(userData);

        if (user && user.id) {
          console.log("Registro exitoso, usuario ID:", user.id);

          // Almacenar el ID del usuario para futuras referencias
          AuthService.setCurrentUserId(user.id);

          // Opcional: Iniciar sesión automáticamente después del registro
          try {
            await authRegister(userData);
          } catch (loginError) {
            console.warn(
              "No se pudo iniciar sesión automáticamente después del registro:",
              loginError
            );
          }

          // Registro exitoso, redirigir al login o directamente al feed
          router.push(
            "/login?registered=true&email=" +
              encodeURIComponent(userData.correo_electronico)
          );
        }
      } catch (error: any) {
        throw error; // Propagar el error para manejo uniforme
      }
    } catch (error: any) {
      console.error("Error de registro:", error);

      // Mejorar el mensaje de error para ser más específico
      if (error.message && error.message.includes("correo_electronico")) {
        setApiError(
          "Este correo electrónico ya está en uso. Por favor, utiliza otro."
        );
      } else if (error.message && error.message.includes("NombreUsuario")) {
        setApiError(
          "Este nombre de usuario ya está en uso. Se generará uno diferente automáticamente."
        );
      } else {
        setApiError(
          error.message ||
            "Error al registrar usuario. Por favor, inténtalo nuevamente."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Verificar si todos los campos son válidos
  const allFieldsValid =
    // Verificar que todos los campos tengan contenido
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.password.trim() !== "" &&
    formData.confirmPassword.trim() !== "" &&
    // Verificar que no haya errores de validación
    !errors.firstName &&
    !errors.lastName &&
    !errors.email &&
    !errors.passwordMatch &&
    !errors.passwordLength &&
    // Verificar aceptación de términos obligatorios
    terms.service &&
    terms.privacy &&
    // Verificar que las contraseñas coinciden
    formData.password === formData.confirmPassword &&
    // Verificar longitud mínima de contraseña
    formData.password.length >= 8;

  // Añadir console.log para depuración
  console.log("Estado del formulario:", {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    password: formData.password.length > 0 ? "Presente" : "No presente",
    confirmPassword:
      formData.confirmPassword.length > 0 ? "Presente" : "No presente",
    passwordMatch: formData.password === formData.confirmPassword,
    passwordLength: formData.password.length >= 8,
    errors,
    terms,
    allFieldsValid,
  });
  // Debug de los campos que vienen del archivo JSON
  console.log(
    "Campos del JSON:",
    locale.register.INPUTS.map((input) => input.LABEL)
  );

  return (
    <Container className="flex min-h-[calc(100vh-140px)] items-center justify-center mt-8">
      <div className="w-full flex flex-col justify-center items-center max-w-md space-y-6 rounded-xl border p-8 shadow-sm border-zinc-400">
        <SkillSwapFull className="-ml-10 -my-4" />
        <Text as="h1" size="heading-3" className="text-center">
          Registro
        </Text>

        {apiError && (
          <div className="w-full p-3 bg-red-50 border border-red-200 rounded text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{apiError}</span>
          </div>
        )}

        <div className="w-full space-y-4">
          {/* Debug - Mostrar todos los campos del JSON */}
          <div className="hidden">
            {JSON.stringify(locale.register.INPUTS.map((inp) => inp.LABEL))}
          </div>

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
                        : input.LABEL === "Confirmar Contraseña"
                        ? "confirmPassword"
                        : "unknown"
                    }
                    value={
                      input.LABEL === "Contraseña"
                        ? formData.password
                        : input.LABEL === "Confirmar Contraseña"
                        ? formData.confirmPassword
                        : ""
                    }
                    data-test-field={input.LABEL} /* Atributo para debugging */
                    onChange={handleChange}
                    type={
                      input.LABEL === "Contraseña"
                        ? showPassword.password
                          ? "text"
                          : "password"
                        : showPassword.confirmPassword
                        ? "text"
                        : "password"
                    }
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
                    onClick={() =>
                      togglePasswordVisibility(
                        input.LABEL === "Contraseña"
                          ? "password"
                          : input.LABEL === "Confirmar Contraseña"
                          ? "confirmPassword"
                          : "password"
                      )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {(
                        input.LABEL === "Contraseña"
                          ? showPassword.password
                          : input.LABEL === "Confirmar Contraseña"
                          ? showPassword.confirmPassword
                          : false
                      ) ? (
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
                      : "email"
                  }
                  value={
                    input.LABEL === "Primer Nombre"
                      ? formData.firstName
                      : input.LABEL === "Primer Apellido"
                      ? formData.lastName
                      : formData.email
                  }
                  onChange={handleChange}
                  type={input.TYPE}
                  id={input.LABEL.replace(/\s+/g, "-").toLowerCase()}
                  placeholder={input.PLACEHOLDER}
                  className={
                    (input.LABEL === "Primer Nombre" && errors.firstName) ||
                    (input.LABEL === "Primer Apellido" && errors.lastName) ||
                    (input.LABEL === "Correo electrónico" && errors.email)
                      ? "border-red-500"
                      : ""
                  }
                />
              )}
              {(input.LABEL === "Correo Electrónico" ||
                input.LABEL === "Correo electrónico") &&
                errors.email && (
                  <p className="text-sm text-red-500">
                    Introduce un correo electrónico válido
                  </p>
                )}
              {input.LABEL === "Contraseña" && errors.passwordLength && (
                <p className="text-sm text-red-500">
                  La contraseña debe tener al menos 8 caracteres
                </p>
              )}
              {input.LABEL === "Confirmar Contraseña" &&
                errors.passwordMatch && (
                  <p className="text-sm text-red-500">
                    Las contraseñas no coinciden
                  </p>
                )}
            </div>
          ))}

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

        <div className="w-full">
          <Button
            onClick={handleSubmit}
            disabled={!allFieldsValid || loading}
            className="w-full bg-[#5f21db] hover:bg-purple-700 text-white"
            title={
              !allFieldsValid ? "Complete todos los campos requeridos" : ""
            }
          >
            {loading ? "Registrando..." : "Registrarse"}
          </Button>

          {!allFieldsValid && (
            <p className="text-sm text-amber-600 mt-2 text-center">
              Complete todos los campos requeridos y acepte los términos para
              continuar
            </p>
          )}

          {/* Componente de depuración - Quitar después de resolver el problema */}
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
            <p className="font-bold">Estado de validación:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>Nombre: {formData.firstName.trim() !== "" ? "✓" : "✗"}</li>
              <li>Apellido: {formData.lastName.trim() !== "" ? "✓" : "✗"}</li>
              <li>
                Email:{" "}
                {formData.email.trim() !== "" && !errors.email ? "✓" : "✗"}
              </li>
              <li>
                Contraseña:{" "}
                {formData.password.trim() !== "" && !errors.passwordLength
                  ? "✓"
                  : "✗"}
              </li>
              <li>
                Confirmar: {formData.confirmPassword.trim() !== "" ? "✓" : "✗"}
              </li>
              <li>
                Contraseñas coinciden: {!errors.passwordMatch ? "✓" : "✗"}
              </li>
              <li>
                Términos aceptados: {terms.service && terms.privacy ? "✓" : "✗"}
              </li>
              <li className="font-bold">
                Estado final: {allFieldsValid ? "VÁLIDO ✓" : "INVÁLIDO ✗"}
              </li>
            </ul>
          </div>
        </div>

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
      <Text as={"p"} size="paragraph-xl" className="max-w-fit mt-6">
        No tienes una cuenta? <a href="/register">Registrate</a>
      </Text>
    </Container>
  );
}
