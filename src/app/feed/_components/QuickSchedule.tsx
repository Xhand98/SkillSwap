"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { API_CONFIG } from "@/lib/api-config";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface QuickScheduleProps {
  postId: number;
  userId: number;
  postAuthor: string;
}

export function QuickSchedule({
  postId,
  userId,
  postAuthor,
}: QuickScheduleProps) {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("12:00");
  const [location, setLocation] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verificar si ya existe un match antes de permitir agendar
  const checkMatchExists = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Acceso denegado",
        description: "Necesitas iniciar sesión primero",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Verificar si ya existe un match entre los usuarios
      const response = await fetch(
        `${API_CONFIG.API_URL}/matches/check?user1=${user.id}&user2=${userId}`
      );
      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        toast({
          title: "Error",
          description: "Respuesta inesperada del servidor al verificar match.",
          variant: "destructive",
        });
        return false;
      }

      if (!data.exists) {
        // Si no existe match, ofrecer crear uno
        const confirm = window.confirm(
          `Aún no tienes un match con ${postAuthor}. ¿Deseas crear uno para poder agendar una sesión?`
        );

        if (confirm) {
          // Crear el match
          const createResponse = await fetch(`${API_CONFIG.API_URL}/matches/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            body: JSON.stringify({
              user1_id: user.id,
              user2_id: userId,
              status: "pending",
            }),
          });

          if (createResponse.ok) {
            toast({
              title: "¡Match creado!",
              description: `Ahora puedes agendar sesiones con ${postAuthor}`,
            });
            return true;
          } else {
            toast({
              title: "Error",
              description: "No se pudo crear el match",
              variant: "destructive",
            });
            return false;
          }
        } else {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error verificando match:", error);
      toast({
        title: "Error",
        description: "No se pudo verificar si existe un match",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleOpenChange = async (open: boolean) => {
    if (open) {
      const matchExists = await checkMatchExists();
      if (matchExists) {
        setIsOpen(true);
      }
    } else {
      setIsOpen(false);
    }
  };

  const handleScheduleSession = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para agendar una sesión",
        variant: "destructive",
      });
      return;
    }

    if (!date) {
      toast({
        title: "Error",
        description: "Debes seleccionar una fecha",
        variant: "destructive",
      });
      return;
    }

    if (!location) {
      toast({
        title: "Error",
        description: "Debes indicar una ubicación",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Formatear la fecha y hora
      const sessionDateTime = new Date(date);
      const [hours, minutes] = time.split(":").map(Number);
      sessionDateTime.setHours(hours, minutes);

      // Obtener el ID del match (asumiendo que existe un endpoint para verificarlo)
      const matchResponse = await fetch(
        `${API_CONFIG.API_URL}/matches/check?user1=${user?.id}&user2=${userId}`
      );
      let matchData;
      try {
        matchData = await matchResponse.json();
      } catch (jsonErr) {
        toast({
          title: "Error",
          description: "Respuesta inesperada del servidor al buscar el match.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (!matchData.match_id) {
        throw new Error("No se encontró el ID del match");
      }

      const response = await fetch(`${API_CONFIG.API_URL}/sessions/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          match_id: matchData.match_id,
          date_time: sessionDateTime.toISOString(),
          location: location,
          notes: `Sesión agendada desde publicación: ${postId}`,
          status: "scheduled",
        }),
      });

      if (response.ok) {
        toast({
          title: "¡Sesión agendada!",
          description: `Tu sesión con ${postAuthor} ha sido programada correctamente`,
        });
        setIsOpen(false);
        // Resetear el formulario
        setDate(undefined);
        setTime("12:00");
        setLocation("");
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error agendando sesión:", error);
      toast({
        title: "Error",
        description: "No se pudo agendar la sesión",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 text-gray-500 hover:text-violet-500 hover:bg-violet-500/10"
        >
          <CalendarIcon size={18} />
          <span className="text-xs">Agendar Sesión</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agendar Sesión con {postAuthor}</DialogTitle>
          <DialogDescription>
            Programa un encuentro para intercambiar conocimientos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? (
                    format(date, "PPP", { locale: es })
                  ) : (
                    <span>Selecciona una fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Hora</Label>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación / Plataforma</Label>
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej: Café, Biblioteca, Zoom, Google Meet..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleScheduleSession}
            disabled={isSubmitting || !date || !location}
          >
            {isSubmitting ? "Agendando..." : "Confirmar Sesión"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
