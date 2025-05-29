"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
import { API_CONFIG } from "@/lib/api-config";
import { useAuth } from "@/lib/AuthContext";
import { Save, ArrowLeft, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui";

interface UserProfile {
  id: number;
  nombre_usuario: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  correo_electronico: string;
  ciudad_trabajo: string;
  fecha_nacimiento?: string;
  telefono?: string;
  biografia?: string;
  linkedin_link?: string;
  github_link?: string;
  website_link?: string;
}

export default function EditProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre_usuario: "",
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    correo_electronico: "",
    ciudad_trabajo: "",
    fecha_nacimiento: "",
    telefono: "",
    biografia: "",
    linkedin_link: "",
    github_link: "",
    website_link: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_CONFIG.API_URL}/users/${user.id}`);

        if (!response.ok) {
          throw new Error(`Error al cargar perfil: ${response.status}`);
        }

        const profileData = await response.json();
        setProfile(profileData); // Rellenar el formulario con los datos actuales
        setFormData({
          nombre_usuario: profileData.nombre_usuario || "",
          primer_nombre: profileData.primer_nombre || "",
          segundo_nombre: profileData.segundo_nombre || "",
          primer_apellido: profileData.primer_apellido || "",
          segundo_apellido: profileData.segundo_apellido || "",
          correo_electronico: profileData.correo_electronico || "",
          ciudad_trabajo: profileData.ciudad_trabajo || "",
          fecha_nacimiento: profileData.fecha_nacimiento || "",
          telefono: profileData.telefono || "",
          biografia: profileData.biografia || "",
          linkedin_link: profileData.linkedin_link || "",
          github_link: profileData.github_link || "",
          website_link: profileData.website_link || "",
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, router, toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`${API_CONFIG.API_URL}/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error al actualizar perfil: ${response.status} - ${errorText}`
        );
      }

      toast({
        title: "Éxito",
        description: "Perfil actualizado correctamente",
      });

      // Redirigir al perfil del usuario
      router.push(`/profiles/${user.id}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="p-8 text-center">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
          <p className="text-gray-400 mt-4">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="p-8 text-center bg-gray-900 rounded-lg">
          <User size={48} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-300 mb-2">
            Error al cargar perfil
          </h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Editar Perfil</h1>
          <p className="text-gray-400">Actualiza tu información personal</p>
        </div>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nombres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primer_nombre">Primer Nombre *</Label>
              <Input
                id="primer_nombre"
                value={formData.primer_nombre}
                onChange={(e) =>
                  handleInputChange("primer_nombre", e.target.value)
                }
                placeholder="Tu primer nombre"
                className="bg-gray-800 border-gray-700"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="segundo_nombre">Segundo Nombre</Label>
              <Input
                id="segundo_nombre"
                value={formData.segundo_nombre}
                onChange={(e) =>
                  handleInputChange("segundo_nombre", e.target.value)
                }
                placeholder="Tu segundo nombre (opcional)"
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>
          {/* Apellidos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primer_apellido">Primer Apellido *</Label>
              <Input
                id="primer_apellido"
                value={formData.primer_apellido}
                onChange={(e) =>
                  handleInputChange("primer_apellido", e.target.value)
                }
                placeholder="Tu primer apellido"
                className="bg-gray-800 border-gray-700"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="segundo_apellido">Segundo Apellido</Label>
              <Input
                id="segundo_apellido"
                value={formData.segundo_apellido}
                onChange={(e) =>
                  handleInputChange("segundo_apellido", e.target.value)
                }
                placeholder="Tu segundo apellido (opcional)"
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>
          {/* Información de contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre_usuario">Nombre de Usuario *</Label>
              <Input
                id="nombre_usuario"
                value={formData.nombre_usuario}
                onChange={(e) =>
                  handleInputChange("nombre_usuario", e.target.value)
                }
                placeholder="Tu nombre de usuario"
                className="bg-gray-800 border-gray-700"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correo_electronico">Email *</Label>
              <Input
                id="correo_electronico"
                type="email"
                value={formData.correo_electronico}
                onChange={(e) =>
                  handleInputChange("correo_electronico", e.target.value)
                }
                placeholder="tu@email.com"
                className="bg-gray-800 border-gray-700"
                required
              />
            </div>
          </div>
          {/* Ubicación y teléfono */}{" "}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ciudad_trabajo">Ciudad de Trabajo</Label>
              <Input
                id="ciudad_trabajo"
                value={formData.ciudad_trabajo}
                onChange={(e) =>
                  handleInputChange("ciudad_trabajo", e.target.value)
                }
                placeholder="Tu ciudad"
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
              <Input
                id="fecha_nacimiento"
                type="date"
                value={formData.fecha_nacimiento}
                onChange={(e) =>
                  handleInputChange("fecha_nacimiento", e.target.value)
                }
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleInputChange("telefono", e.target.value)}
                placeholder="Tu número de teléfono"
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>
          {/* Biografía */}
          <div className="space-y-2">
            <Label htmlFor="biografia">Biografía</Label>
            <Textarea
              id="biografia"
              value={formData.biografia}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleInputChange("biografia", e.target.value)
              }
              placeholder="Cuéntanos un poco sobre ti..."
              className="bg-gray-800 border-gray-700 min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              {formData.biografia.length}/500 caracteres
            </p>
          </div>
          {/* Enlaces sociales */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">
              Enlaces (Opcional)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {" "}
              <div className="space-y-2">
                <Label htmlFor="linkedin_link">LinkedIn</Label>
                <Input
                  id="linkedin_link"
                  value={formData.linkedin_link}
                  onChange={(e) =>
                    handleInputChange("linkedin_link", e.target.value)
                  }
                  placeholder="https://linkedin.com/in/tuperfil"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github_link">GitHub</Label>
                <Input
                  id="github_link"
                  value={formData.github_link}
                  onChange={(e) =>
                    handleInputChange("github_link", e.target.value)
                  }
                  placeholder="https://github.com/tuusuario"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website_link">Sitio Web</Label>
              <Input
                id="website_link"
                value={formData.website_link}
                onChange={(e) =>
                  handleInputChange("website_link", e.target.value)
                }
                placeholder="https://tusitio.com"
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>
          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                saving ||
                !formData.primer_nombre ||
                !formData.primer_apellido ||
                !formData.nombre_usuario ||
                !formData.correo_electronico
              }
              className="bg-primary hover:bg-primary/90"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
