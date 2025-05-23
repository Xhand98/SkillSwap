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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { AuthService } from "@/lib/AuthService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UsersIcon,
  ActivityIcon,
  MessageSquareIcon,
  CheckCircleIcon,
  BellIcon,
  UserX,
  UserCheck,
  Award,
  PlusCircle,
  ShieldCheck,
  ShieldX,
  DatabaseIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface User {
  id: number;
  nombre_usuario: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  correo_electronico: string;
  ciudad_trabajo: string;
  rol: string;
  created_at: string;
}

interface Ability {
  id: number;
  name: string;
  description?: string;
}

interface Stats {
  total_users: number;
  total_posts: number;
  total_matches: number;
  new_users_today: number;
}

export default function AdminDashboard() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    total_users: 0,
    total_posts: 0,
    total_matches: 0,
    new_users_today: 0,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<
    "ban" | "unban" | "makeAdmin" | "removeAdmin"
  >("ban");
  const [newAbility, setNewAbility] = useState({
    name: "",
    description: "",
    category: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Verificar si el usuario actual es administrador
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.rol !== "admin") {
        // Redirigir si no es admin
        window.location.href = "/feed";
        toast({
          title: "Acceso denegado",
          description:
            "No tienes permisos para acceder al panel de administración",
          variant: "destructive",
        });
      }
    }
  }, [isAuthenticated, user]);

  // Cargar usuarios y estadísticas
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || user?.rol !== "admin") return;

      setLoading(true);
      try {
        // Cargar usuarios
        const usersResponse = await fetch("http://localhost:8000/users/");
        if (usersResponse.ok) {
          const data = await usersResponse.json();
          setUsers(data.users || []);
          setStats((prevStats) => ({
            ...prevStats,
            total_users: data.total_users || 0,
          }));
        }

        // Cargar habilidades
        const abilitiesResponse = await fetch(
          "http://localhost:8000/abilities/"
        );
        if (abilitiesResponse.ok) {
          const data = await abilitiesResponse.json();
          setAbilities(data.abilities || []);
        }

        // Cargar posts
        const postsResponse = await fetch(
          "http://localhost:8000/posts/?page=1&pageSize=1"
        );
        if (postsResponse.ok) {
          const data = await postsResponse.json();
          setStats((prevStats) => ({
            ...prevStats,
            total_posts: data.total_posts || 0,
          }));
        }

        // Cargar matches
        const matchesResponse = await fetch("http://localhost:8000/matches/");
        if (matchesResponse.ok) {
          const data = await matchesResponse.json();
          setStats((prevStats) => ({
            ...prevStats,
            total_matches: data.total_matches || 0,
            new_users_today: Math.floor(Math.random() * 10), // Simulado por ahora
          }));
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del panel",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user]);

  // Función para banear/desbanear usuario (cambiar rol)
  const handleUserRoleChange = async (userId: number, newRole: string) => {
    try {
      const response = await fetch(`http://localhost:8000/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          rol: newRole,
        }),
      });

      if (response.ok) {
        setUsers(
          users.map((u) => (u.id === userId ? { ...u, rol: newRole } : u))
        );

        toast({
          title: "Éxito",
          description: `Usuario ${
            newRole === "banned"
              ? "baneado"
              : newRole === "admin"
              ? "convertido a administrador"
              : "actualizado"
          } correctamente`,
        });
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error actualizando usuario:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario",
        variant: "destructive",
      });
    }
  };
  // Función para crear nueva habilidad
  const handleCreateAbility = async () => {
    if (!newAbility.name || !newAbility.category) {
      toast({
        title: "Error",
        description: "El nombre y la categoría son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/abilities/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          name: newAbility.name,
          category: newAbility.category,
          description: newAbility.description || "",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAbilities([...abilities, data]);
        setNewAbility({ name: "", description: "", category: "" });

        toast({
          title: "Éxito",
          description: "Habilidad creada correctamente",
        });
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error creando habilidad:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la habilidad",
        variant: "destructive",
      });
    }
  };

  // Filtrar usuarios según término de búsqueda
  const filteredUsers = users.filter(
    (user) =>
      user.nombre_usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.correo_electronico
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      `${user.primer_nombre} ${user.primer_apellido}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

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
              No tienes permisos para acceder al panel de administración.
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
      {" "}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Text as="h1" size="heading-3" className="font-bold mb-2">
            Panel de Administración
          </Text>
          <Text className="text-muted-foreground">
            Gestiona usuarios, habilidades y monitorea la plataforma
          </Text>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/admin/audit")}
            className="flex items-center gap-2"
          >
            <DatabaseIcon className="w-4 h-4" /> Auditoría BD
          </Button>
          <Badge variant="outline" className="text-sm bg-primary/10 px-3 py-1">
            <ShieldCheck className="w-4 h-4 mr-1" /> Admin
          </Badge>
        </div>
      </div>
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usuarios Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <UsersIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <Text as="h2" size="heading-3" className="font-bold">
                {loading ? "..." : stats.total_users}
              </Text>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Publicaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <MessageSquareIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <Text as="h2" size="heading-3" className="font-bold">
                {loading ? "..." : stats.total_posts}
              </Text>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircleIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <Text as="h2" size="heading-3" className="font-bold">
                {loading ? "..." : stats.total_matches}
              </Text>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nuevos Usuarios Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BellIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <Text as="h2" size="heading-3" className="font-bold">
                {loading ? "..." : stats.new_users_today}
              </Text>
            </div>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="abilities">Habilidades</TabsTrigger>
        </TabsList>

        {/* Pestaña de usuarios */}
        <TabsContent value="users">
          <div className="mb-4">
            <Input
              placeholder="Buscar por nombre, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Cargando usuarios...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>@{user.nombre_usuario}</TableCell>
                      <TableCell>
                        {user.primer_nombre} {user.primer_apellido}
                      </TableCell>
                      <TableCell>{user.correo_electronico}</TableCell>
                      <TableCell>{user.ciudad_trabajo}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.rol === "admin"
                              ? "default"
                              : user.rol === "banned"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {user.rol}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {user.rol === "banned" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center"
                              onClick={() => {
                                setSelectedUser(user);
                                setDialogAction("unban");
                                setIsDialogOpen(true);
                              }}
                            >
                              <UserCheck className="h-4 w-4 mr-1" /> Desbanear
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center text-destructive border-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setSelectedUser(user);
                                setDialogAction("ban");
                                setIsDialogOpen(true);
                              }}
                              disabled={user.rol === "admin"}
                            >
                              <UserX className="h-4 w-4 mr-1" /> Banear
                            </Button>
                          )}

                          {user.rol !== "admin" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center"
                              onClick={() => {
                                setSelectedUser(user);
                                setDialogAction("makeAdmin");
                                setIsDialogOpen(true);
                              }}
                            >
                              <ShieldCheck className="h-4 w-4 mr-1" /> Hacer
                              Admin
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center"
                              onClick={() => {
                                setSelectedUser(user);
                                setDialogAction("removeAdmin");
                                setIsDialogOpen(true);
                              }}
                              disabled={
                                user.id === AuthService.getCurrentUser()?.id
                              }
                            >
                              <ShieldX className="h-4 w-4 mr-1" /> Quitar Admin
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Pestaña de habilidades */}
        <TabsContent value="abilities">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Crear Nueva Habilidad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ability-name">
                        Nombre de la Habilidad
                      </Label>
                      <Input
                        id="ability-name"
                        value={newAbility.name}
                        onChange={(e) =>
                          setNewAbility({ ...newAbility, name: e.target.value })
                        }
                        placeholder="Ej: Programación en React"
                      />
                    </div>{" "}
                    <div className="space-y-2">
                      <Label htmlFor="ability-category">Categoría</Label>
                      <select
                        id="ability-category"
                        value={newAbility.category}
                        onChange={(e) =>
                          setNewAbility({
                            ...newAbility,
                            category: e.target.value,
                          })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="" disabled>
                          Selecciona una categoría
                        </option>
                        <option value="Tecnología">Tecnología</option>
                        <option value="Artes">Artes</option>
                        <option value="Idiomas">Idiomas</option>
                        <option value="Deportes">Deportes</option>
                        <option value="Cocina">Cocina</option>
                        <option value="Negocios">Negocios</option>
                        <option value="Educación">Educación</option>
                        <option value="Ciencia">Ciencia</option>
                        <option value="Otros">Otros</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ability-desc">
                        Descripción (opcional)
                      </Label>
                      <Input
                        id="ability-desc"
                        value={newAbility.description}
                        onChange={(e) =>
                          setNewAbility({
                            ...newAbility,
                            description: e.target.value,
                          })
                        }
                        placeholder="Breve descripción de la habilidad"
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleCreateAbility}
                      disabled={!newAbility.name || !newAbility.category}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" /> Crear Habilidad
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Habilidades Disponibles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-4">
                      Cargando habilidades...
                    </div>
                  ) : abilities.length === 0 ? (
                    <div className="text-center py-4">
                      No hay habilidades disponibles
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {abilities.map((ability) => (
                        <div
                          key={ability.id}
                          className="flex items-center justify-between p-3 bg-secondary/50 rounded-md"
                        >
                          <div>
                            <p className="font-medium">{ability.name}</p>
                            {ability.description && (
                              <p className="text-sm text-muted-foreground">
                                {ability.description}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline">ID: {ability.id}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      {/* Diálogo de confirmación */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogAction === "ban"
                ? "¿Banear usuario?"
                : dialogAction === "unban"
                ? "¿Desbanear usuario?"
                : dialogAction === "makeAdmin"
                ? "¿Hacer administrador?"
                : "¿Quitar permisos de administrador?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAction === "ban"
                ? `¿Estás seguro de que quieres banear a ${selectedUser?.nombre_usuario}? El usuario no podrá acceder a su cuenta.`
                : dialogAction === "unban"
                ? `¿Estás seguro de que quieres desbanear a ${selectedUser?.nombre_usuario}? El usuario podrá volver a acceder a su cuenta.`
                : dialogAction === "makeAdmin"
                ? `¿Estás seguro de que quieres dar permisos de administrador a ${selectedUser?.nombre_usuario}?`
                : `¿Estás seguro de que quieres quitar los permisos de administrador a ${selectedUser?.nombre_usuario}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedUser) {
                  if (dialogAction === "ban") {
                    handleUserRoleChange(selectedUser.id, "banned");
                  } else if (dialogAction === "unban") {
                    handleUserRoleChange(selectedUser.id, "user");
                  } else if (dialogAction === "makeAdmin") {
                    handleUserRoleChange(selectedUser.id, "admin");
                  } else if (dialogAction === "removeAdmin") {
                    handleUserRoleChange(selectedUser.id, "user");
                  }
                }
                setIsDialogOpen(false);
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
