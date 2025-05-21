"use client";

import { Container } from "@/components/container";
import FeedCard from "./_components/FeedCard";
import CreatePost from "./_components/CreatePost";
import { PageSizeSelector } from "./_components/PageSizeSelector";
import { FilterOptions } from "./_components/FilterOptions";
import { Text } from "@/components/text";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
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
  post_id: number;
  nombre_usuario: string;
  nombre_habilidad: string;
  tipo_post: string;
  descripcion: string;
  created_at: string;
  updated_at: string;
}

export default function FeedPage() {
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
  }>({
    type: null,
    searchTerm: null,
  });
  const fetchPosts = async (page: number = 1) => {
    setLoading(true);
    try {
      let url = `http://localhost:8000/posts/?page=${page}&pageSize=${pageSize}`;

      // Añadir filtros a la URL si están presentes
      if (filters.type) {
        url += `&tipo=${filters.type}`;
      }
      if (filters.searchTerm) {
        url += `&search=${encodeURIComponent(filters.searchTerm)}`;
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
    <div className="bg-neutral-950 text-white min-h-screen pt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[1fr,2fr] lg:grid-cols-[1fr,2fr,1fr]">
        {/* Sidebar izquierdo - Navegación */}
        <aside className="hidden md:flex flex-col gap-2 p-4 sticky top-0 h-screen">
          <div className="p-2 rounded-full hover:bg-gray-900 w-fit">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="w-8 h-8 text-primary fill-current"
            >
              <g>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.13l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </g>
            </svg>
          </div>

          <Button
            variant="ghost"
            className="justify-start gap-4 text-xl hover:bg-gray-900 rounded-full py-6"
          >
            <Home size={24} />
            <span className="hidden lg:inline">Inicio</span>
          </Button>

          <Button
            variant="ghost"
            className="justify-start gap-4 text-xl hover:bg-gray-900 rounded-full py-6"
          >
            <Search size={24} />
            <span className="hidden lg:inline">Explorar</span>
          </Button>

          <Button
            variant="ghost"
            className="justify-start gap-4 text-xl hover:bg-gray-900 rounded-full py-6"
          >
            <Bell size={24} />
            <span className="hidden lg:inline">Notificaciones</span>
          </Button>

          <Button
            variant="ghost"
            className="justify-start gap-4 text-xl hover:bg-gray-900 rounded-full py-6"
          >
            <MessageCircle size={24} />
            <span className="hidden lg:inline">Mensajes</span>
          </Button>

          <Button
            variant="ghost"
            className="justify-start gap-4 text-xl hover:bg-gray-900 rounded-full py-6"
          >
            <Bookmark size={24} />
            <span className="hidden lg:inline">Guardados</span>
          </Button>

          <Button
            variant="ghost"
            className="justify-start gap-4 text-xl hover:bg-gray-900 rounded-full py-6"
          >
            <User size={24} />
            <span className="hidden lg:inline">Perfil</span>
          </Button>

          <Button
            variant="default"
            className="rounded-full mt-4 py-6 bg-primary hover:bg-primary/90"
          >
            <span className="hidden lg:inline">Publicar</span>
            <PenSquare className="lg:hidden" size={24} />
          </Button>
        </aside>

        {/* Feed principal */}
        <main className="border-x border-gray-800 min-h-screen">
          {" "}
          <header className="sticky top-0 bg-neutral-900 backdrop-blur-md p-4 border-b border-gray-800 z-10">
            <div className="flex justify-between items-center">
              <Text as="h1" size="heading-4" className="font-bold">
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
          />
          {/* Opciones de filtrado */}
          <FilterOptions
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
              {posts.map((post) => (
                <FeedCard
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
        <aside className="hidden lg:block p-4 sticky top-0 h-screen">
          <div className="bg-gray-900 rounded-xl p-4 mb-4">
            <Text as="h2" size="heading-5" className="mb-4 font-bold">
              ¿Qué habilidad buscas?
            </Text>
            <div className="bg-black rounded-full p-3 flex items-center gap-2 border border-gray-800 focus-within:border-primary">
              <Search size={18} className="text-gray-500" />
              <input
                type="text"
                placeholder="Buscar habilidades..."
                className="bg-transparent border-none focus:outline-none text-white w-full"
              />
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-4">
            <Text as="h2" size="heading-5" className="mb-4 font-bold">
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
  );
}
