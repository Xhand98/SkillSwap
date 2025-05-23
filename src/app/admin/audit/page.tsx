"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/text";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShieldCheck,
  ShieldX,
  DatabaseIcon,
  RefreshCcw,
  Filter,
  Clock,
  AlertCircle,
  Search,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface AuditRecord {
  id: number;
  event_time: string;
  server_principal_name: string;
  database_name: string;
  object_name: string;
  statement: string;
  action_id: string;
  succeeded: boolean;
  session_id: number;
  application_name: string;
  host_name: string;
  client_ip: string;
  file_name: string;
}

export default function AuditPage() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSucceeded, setFilterSucceeded] = useState<string | null>(null);
  const [filterAction, setFilterAction] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Verificar si el usuario actual es administrador
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.rol !== "admin") {
        // Redirigir si no es admin
        window.location.href = "/feed";
        toast({
          title: "Acceso denegado",
          description: "No tienes permisos para acceder al panel de auditoría",
          variant: "destructive",
        });
      }
    }
  }, [isAuthenticated, user, toast]);

  // Cargar registros de auditoría
  useEffect(() => {
    const fetchAuditData = async () => {
      if (!isAuthenticated || user?.rol !== "admin") return;

      setLoading(true);
      try {
        // Construir los parámetros de consulta
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("pageSize", pageSize.toString());

        if (searchTerm) {
          params.append("search", searchTerm);
        }

        if (filterSucceeded !== null) {
          params.append("succeeded", filterSucceeded);
        }

        if (filterAction) {
          params.append("actionId", filterAction);
        }

        if (startDate) {
          params.append("startDate", startDate.toISOString());
        }

        if (endDate) {
          params.append("endDate", endDate.toISOString());
        }

        const response = await fetch(
          `http://localhost:8000/audit?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setAuditRecords(data.records || []);
          setTotalRecords(data.total || 0);
        } else {
          console.error(
            "Error al cargar registros de auditoría:",
            response.statusText
          );
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Error cargando datos de auditoría:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los registros de auditoría",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAuditData();
  }, [
    isAuthenticated,
    user,
    page,
    pageSize,
    searchTerm,
    filterSucceeded,
    filterAction,
    startDate,
    endDate,
    toast,
  ]);

  const handleSearch = () => {
    setPage(1); // Reset a la primera página al buscar
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterSucceeded(null);
    setFilterAction(null);
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(1);
  };

  const getActionDisplay = (actionId: string) => {
    const actionMap: Record<string, { label: string; color: string }> = {
      SCHEMA_OBJECT_ACCESS_EVENT: {
        label: "Acceso a Objeto",
        color: "bg-blue-100 text-blue-800",
      },
      DATABASE_OBJECT_CHANGE_EVENT: {
        label: "Cambio en BD",
        color: "bg-amber-100 text-amber-800",
      },
      DATABASE_PERMISSION_CHANGE_EVENT: {
        label: "Cambio Permisos",
        color: "bg-purple-100 text-purple-800",
      },
      FAILED_LOGIN_EVENT: {
        label: "Login Fallido",
        color: "bg-red-100 text-red-800",
      },
      LOGIN_EVENT: { label: "Login", color: "bg-green-100 text-green-800" },
      LOGOUT_EVENT: { label: "Logout", color: "bg-gray-100 text-gray-800" },
      USER_CHANGE_PASSWORD_EVENT: {
        label: "Cambio Contraseña",
        color: "bg-indigo-100 text-indigo-800",
      },
      BATCH_COMPLETED_EVENT: {
        label: "Batch Completado",
        color: "bg-teal-100 text-teal-800",
      },
      BATCH_STARTED_EVENT: {
        label: "Batch Iniciado",
        color: "bg-cyan-100 text-cyan-800",
      },
    };

    return (
      actionMap[actionId] || {
        label: actionId,
        color: "bg-gray-100 text-gray-800",
      }
    );
  };

  // Calcular el número total de páginas
  const totalPages = Math.ceil(totalRecords / pageSize);

  if (!isAuthenticated || (user && user.rol !== "admin")) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-500">
              <ShieldX className="mx-auto mb-2 h-12 w-12" />
              Acceso Restringido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">
              No tienes permisos para acceder al panel de auditoría.
            </p>
            <Button
              className="w-full"
              onClick={() => (window.location.href = "/feed")}
            >
              Volver al Feed
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-16">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Text as="h1" size="heading-3" className="font-bold mb-2">
            Auditoría de Base de Datos
          </Text>
          <Text className="text-muted-foreground">
            Visualiza y analiza los registros de actividad en la base de datos
          </Text>
        </div>
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/admin/dashboard")}
          className="flex items-center gap-2"
        >
          <ShieldCheck className="h-4 w-4" />
          Volver al Panel
        </Button>
      </div>

      {/* Filtros de búsqueda */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search" className="mb-2 block">
                Buscar
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Usuario, acción, objeto..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="filter-succeeded" className="mb-2 block">
                Estado
              </Label>
              <Select
                value={filterSucceeded === null ? "" : filterSucceeded}
                onValueChange={(value) =>
                  setFilterSucceeded(value === "" ? null : value)
                }
              >
                <SelectTrigger id="filter-succeeded">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los estados</SelectItem>
                  <SelectItem value="true">Exitosos</SelectItem>
                  <SelectItem value="false">Fallidos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="filter-action" className="mb-2 block">
                Tipo de Acción
              </Label>
              <Select
                value={filterAction || ""}
                onValueChange={(value) =>
                  setFilterAction(value === "" ? null : value)
                }
              >
                <SelectTrigger id="filter-action">
                  <SelectValue placeholder="Todas las acciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las acciones</SelectItem>
                  <SelectItem value="SCHEMA_OBJECT_ACCESS_EVENT">
                    Acceso a Objeto
                  </SelectItem>
                  <SelectItem value="DATABASE_OBJECT_CHANGE_EVENT">
                    Cambio en BD
                  </SelectItem>
                  <SelectItem value="LOGIN_EVENT">Login</SelectItem>
                  <SelectItem value="LOGOUT_EVENT">Logout</SelectItem>
                  <SelectItem value="FAILED_LOGIN_EVENT">
                    Login Fallido
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-row gap-2 items-end">
              <div className="flex-1">
                <Popover>
                  <Label className="mb-2 block">Fecha Inicio</Label>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, "dd/MM/yyyy", { locale: es })
                      ) : (
                        <span>Seleccionar</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1">
                <Popover>
                  <Label className="mb-2 block">Fecha Fin</Label>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {endDate ? (
                        format(endDate, "dd/MM/yyyy", { locale: es })
                      ) : (
                        <span>Seleccionar</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleClearFilters}>
              Limpiar Filtros
            </Button>
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de registros */}
      <Card>
        <CardContent className="pt-6">
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Objeto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>IP Cliente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      <div className="flex justify-center">
                        <RefreshCcw className="h-5 w-5 animate-spin" />
                      </div>
                      <p className="mt-2">Cargando registros de auditoría...</p>
                    </TableCell>
                  </TableRow>
                ) : auditRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p>
                        No se encontraron registros con los filtros aplicados
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  auditRecords.map((record, i) => {
                    const action = getActionDisplay(record.action_id);
                    return (
                      <TableRow key={i} className="group">
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>
                              {new Date(record.event_time).toLocaleString(
                                "es-ES"
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{record.server_principal_name}</TableCell>
                        <TableCell>
                          <Badge className={action.color + " font-normal"}>
                            {action.label}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className="max-w-xs truncate"
                          title={record.object_name}
                        >
                          {record.object_name || "-"}
                        </TableCell>
                        <TableCell>
                          {record.succeeded ? (
                            <Badge
                              variant="outline"
                              className="bg-green-100 text-green-800 border-green-200"
                            >
                              Exitoso
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-red-100 text-red-800 border-red-200"
                            >
                              Fallido
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{record.client_ip || "N/A"}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Mostrando{" "}
              {auditRecords.length > 0 ? (page - 1) * pageSize + 1 : 0} -{" "}
              {Math.min(page * pageSize, totalRecords)} de {totalRecords}{" "}
              registros
            </div>

            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(1)}
                disabled={page === 1 || loading}
              >
                Primera
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
              >
                Siguiente
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages || loading}
              >
                Última
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Registros por página:
              </span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1); // Reset a la primera página al cambiar tamaño
                }}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
