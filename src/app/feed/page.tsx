"use client";

import FeedCard from "./_components/FeedCard";
import CreatePost from "./_components/CreatePost";
import { PageSizeSelector } from "./_components/PageSizeSelector";
import { FilterOptions } from "./_components/FilterOptions";
import { Text } from "@/components/text";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import useCurrentUserId from "@/hooks/useCurrentUserId";
import {
  Home,
  Bell,
  Bookmark,
  MessageCircle,
  User,
  PenSquare,
  Search,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

interface Post {
  id_usuario: number;
  post_id: number;
  nombre_usuario: string;
  nombre_habilidad: string;
  tipo_post: string;
  descripcion: string;
  created_at: string;
  updated_at: string;
}

export default function FeedPage() {
  // Usar el hook para obtener el ID de usuario actual
  const currentUserId = useCurrentUserId();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [filters, setFilters] = useState<{
    type: string | null;
    searchTerm: string | null;
    userId: number | null; // Nuevo filtro por usuario
  }>({
    type: null,
    searchTerm: null,
    userId: null,
  }); // Log para depuración
  useEffect(() => {
    console.log("Feed - ID de usuario desde hook:", currentUserId);
  }, [currentUserId]);

  const fetchPosts = async (page: number = 1) => {
    setLoading(true);
    try {
      // Construir la URL base
      let url = `http://localhost:8000/posts/?page=${page}&pageSize=${pageSize}`; // Añadir filtros a la URL si están presentes
      if (filters.type) {
        url += `&tipo=${filters.type}`;
      }
      if (filters.searchTerm) {
        url += `&search=${encodeURIComponent(filters.searchTerm)}`;
      }

      // Filtrar por usuario si se solicita
      if (filters.userId) {
        console.log(`Filtrando posts para el usuario ID: ${filters.userId}`);
        url += `&usuario_id=${filters.userId}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setPosts(data.posts || []);
      setTotalPages(data.total_pages || 1);
      setCurrentPage(data.page || 1);
      setTotalPosts(data.total_posts || 0);
    } catch (err) {
      setError("Error al cargar los posts: " + (err as Error).message);
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, [pageSize, filters]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return `${diffSecs}s`;
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  return (
    <ProtectedRoute>
      <div className="bg-[#1a1a1a] text-white min-h-screen pt-16 min-w-max">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[1fr,2fr] lg:grid-cols-[1fr,2fr,1fr]">
          {/* Feed principal */}
          <main className="min-w-[60vw] border-x border-gray-800 min-h-screen">
            {" "}
            <header className="sticky top-0 bg-neutral-[#0a0a0a] backdrop-blur-md p-4 border-b border-gray-800 z-10">
              <div className="flex justify-between items-center">
                <Text as="h1" size="heading-3" className="font-bold">
                  Feed de Habilidades
                </Text>
                <PageSizeSelector
                  pageSize={pageSize}
                  onPageSizeChange={(size) => setPageSize(size)}
                />
              </div>
            </header>
            {/* Componente para crear nuevos posts */}
            <CreatePost
              onPostCreated={() => {
                fetchPosts(1);
              }}
            />{" "}
            {/* Opciones de filtrado */}
            <FilterOptions
              currentUserId={currentUserId}
              onFilterChange={(newFilters) => {
                setFilters(newFilters);
                // La paginación se resetea al aplicar filtros
                setCurrentPage(1);
              }}
            />
            {loading ? (
              <div className="flex flex-col justify-center items-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <Text className="text-gray-400">Cargando publicaciones...</Text>
              </div>
            ) : error ? (
              <div className="p-4 text-red-500 text-center">{error}</div>
            ) : posts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No hay publicaciones disponibles
              </div>
            ) : (
              <div>
                {" "}
                {posts.map((post) => (
                  <FeedCard
                    id={post.id_usuario}
                    postId={post.post_id}
                    key={post.post_id}
                    title={
                      post.tipo_post === "OFREZCO"
                        ? `Ofrezco: ${post.nombre_habilidad}`
                        : `Busco: ${post.nombre_habilidad}`
                    }
                    description={post.descripcion}
                    tags={[post.nombre_habilidad]}
                    author={post.nombre_usuario}
                    createdAt={formatTimeAgo(post.created_at)}
                    onPostDeleted={() => fetchPosts(currentPage)}
                  />
                ))}
                {/* Paginación */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => fetchPosts(page)}
                  className="mt-4"
                />
                {/* Resumen de paginación */}
                <div className="text-gray-500 text-center text-sm pb-4">
                  Mostrando {posts.length} de {totalPosts} publicaciones (página{" "}
                  {currentPage} de {totalPages})
                </div>
              </div>
            )}
          </main>

          {/* Sidebar derecho - Tendencias, etc */}
          <aside className="hidden lg:block p-4 min-w-[25rem] sticky top-0 h-screen">
            <div className="bg-gray-900 rounded-xl p-4">
              <Text as="h2" size="heading-3" className="mb-4 font-bold">
                Usuarios Destacados
              </Text>
              <div className="space-y-3">
                {["Hendrick", "Janiel", "Dylan", "Onielkis"].map((name, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${name}`}
                          alt={name}
                        />
                        <AvatarFallback>{name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <Text className="font-bold" size="paragraph-sm">
                          {name}
                        </Text>
                        <Text className="text-gray-500" size="paragraph-xs">
                          @{name.toLowerCase()}
                        </Text>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs"
                    >
                      Seguir
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </ProtectedRoute>
  );
}
