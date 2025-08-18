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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { API_CONFIG } from "@/lib/api-config";
import { Card, CardContent } from "@/components/ui/card";

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
      let url = `${API_CONFIG.API_URL}/posts/?page=${page}&pageSize=${pageSize}`; // Añadir filtros a la URL si están presentes
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
      <div className="bg-[#1a1a1a] text-white min-h-screen pt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[1fr,2fr] lg:grid-cols-[1fr,2fr,1fr] px-4 gap-4">
          {/* Feed principal */}
          <main className="border-x border-gray-800 min-h-screen col-span-1 md:col-span-2 lg:col-span-3">
            <header className="sticky top-0 bg-[#0a0a0a] supports-[backdrop-filter]:bg-[#0a0a0a] backdrop-blur-md p-4 border-b border-gray-800 z-10">
              <div className="flex justify-between items-center">
                <Text as="h1" size="heading-3" className="font-bold">
                  Feed de Habilidades
                </Text>
                <div className="flex items-center gap-3">
                  <PageSizeSelector
                    pageSize={pageSize}
                    onPageSizeChange={(size) => setPageSize(size)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-700"
                    onClick={() => fetchPosts(currentPage)}
                    aria-label="Refrescar publicaciones"
                  >
                    Refrescar
                  </Button>
                </div>
              </div>
            </header>
            {/* Componente para crear nuevos posts */}
            <CreatePost
              onPostCreated={() => {
                fetchPosts(1);
              }}
            />
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
              <div className="space-y-4 p-4" aria-live="polite">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-xl border border-gray-800 bg-neutral-900 p-4"
                  >
                    <div className="h-4 w-32 bg-gray-800 rounded mb-3" />
                    <div className="h-6 w-3/4 bg-gray-800 rounded mb-2" />
                    <div className="h-4 w-2/3 bg-gray-800 rounded mb-2" />
                    <div className="h-4 w-1/2 bg-gray-800 rounded" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-4">
                <Card className="border-red-900/40 bg-red-950/30">
                  <CardContent className="pt-6 text-center">
                    <Text className="text-red-400 font-semibold">
                      {error}
                    </Text>
                    <Text className="text-gray-400 mt-1" size="paragraph-sm">
                      Intenta refrescar o ajustar los filtros.
                    </Text>
                  </CardContent>
                </Card>
              </div>
            ) : posts.length === 0 ? (
              <div className="p-4">
                <Card className="bg-neutral-900 border-gray-800">
                  <CardContent className="py-10 text-center">
                    <Text size="heading-4" className="text-gray-300 mb-2">
                      No hay publicaciones disponibles
                    </Text>
                    <Text className="text-gray-500" size="paragraph-sm">
                      Crea una nueva publicación o cambia los filtros.
                    </Text>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="p-2 sm:p-4">
                {posts.map((post) => (
                  <FeedCard
                    id={post.id_usuario}
                    postId={post.post_id}
                    key={post.post_id}
                    title={
                      post.tipo_post === "Ofrece"
                        ? `Ofrezco: ${post.nombre_habilidad}`
                        : `Busco: ${post.nombre_habilidad}`
                    }
                    description={post.descripcion}
                    tags={[post.nombre_habilidad]}
                    author={post.nombre_usuario}
                    createdAt={post.created_at}
                    skillName={post.nombre_habilidad}
                    onPostDeleted={() => fetchPosts(currentPage)}
                  />
                ))}
                {/* Paginación */}
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => fetchPosts(page)}
                    className=""
                  />
                  {/* Resumen de paginación */}
                </div>
              </div>
            )}
          </main>
        </div>
                  <div className="text-gray-500 text-center text-sm pb-4 mt-2">
                    Mostrando {posts.length} de {totalPosts} publicaciones (página {currentPage} de {totalPages})
                  </div>
      </div>
    </ProtectedRoute>
  );
}
