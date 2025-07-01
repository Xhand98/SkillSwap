"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, User, MessageCircle } from "lucide-react";

interface User {
  id: number;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  correo_electronico: string;
  nombre_usuario: string;
}

export default function NewConversationPage() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  // Función para obtener todos los usuarios
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8000/users");
      if (response.ok) {
        const data = await response.json();
        // Acceder al array 'users' de la respuesta
        const usersArray = data.users || [];
        const allUsers = usersArray.filter(
          (user: any) => user.id !== currentUserId
        );
        setUsers(allUsers);
        setFilteredUsers(allUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para crear una nueva conversación
  const createConversation = async (
    otherUserId: number,
    otherUserName: string
  ) => {
    if (!currentUserId || creating) return;

    setCreating(true);
    try {
      const response = await fetch("http://localhost:8000/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user1_id: currentUserId,
          user2_id: otherUserId,
          title: `Conversación con ${otherUserName}`,
        }),
      });

      if (response.ok) {
        const conversation = await response.json();
        router.push(`/messages/${conversation.id}`);
      } else {
        alert("Error al crear la conversación");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Error al crear la conversación");
    } finally {
      setCreating(false);
    }
  };

  // Función para filtrar usuarios
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          `${user.primer_nombre} ${user.primer_apellido}`
            .toLowerCase()
            .includes(term.toLowerCase()) ||
          user.correo_electronico.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId") || "1";
    setCurrentUserId(parseInt(userId));
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchUsers();
    }
  }, [currentUserId]);
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-3 p-2 rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Nueva Conversación
            </h1>
            <p className="text-sm text-muted-foreground">
              Selecciona un usuario para comenzar a chatear
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {" "}
          {/* Barra de búsqueda */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar usuarios por nombre o email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          {/* Lista de usuarios */}
          <div className="bg-card rounded-lg shadow-sm border border-border">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {users.length === 0 ? (
                  <>
                    <User className="h-12 w-12 mx-auto mb-4 text-muted" />
                    <p className="text-lg font-medium mb-2">
                      No hay usuarios disponibles
                    </p>
                    <p className="text-sm">
                      Vuelve más tarde para ver nuevos usuarios
                    </p>
                  </>
                ) : (
                  <>
                    <Search className="h-12 w-12 mx-auto mb-4 text-muted" />
                    <p className="text-lg font-medium mb-2">
                      No se encontraron usuarios
                    </p>
                    <p className="text-sm">
                      Intenta con otros términos de búsqueda
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {" "}
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() =>
                      createConversation(
                        user.id,
                        `${user.primer_nombre} ${user.primer_apellido}`
                      )
                    }
                    className="p-4 hover:bg-muted cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                          {user.primer_nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {user.primer_nombre} {user.primer_apellido}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.correo_electronico}
                          </p>
                        </div>
                      </div>{" "}
                      <MessageCircle className="h-5 w-5 text-muted" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {creating && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-card rounded-lg p-6 max-w-sm mx-4 border border-border">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-foreground">Creando conversación...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
