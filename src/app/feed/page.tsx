"use client";

import { Container } from "@/components/container";
import FeedCard from "./_components/FeedCard";
import { Text } from "@/components/text";
import { useEffect, useState } from "react";
import {
  Home,
  MessageCircle,
  User,
  Bell,
  Search,
  PenSquare,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import locale from "@/locales/feed-elements.json";

interface ApiPost {
  post_id: number;
  nombre_habilidad: string;
  descripcion: string;
  nombre_usuario: string;
  tipo_post: string;
  author_avatar_url?: string;
  created_at?: string;
}

interface PaginatedApiResponse {
  posts: ApiPost[];
  total_posts: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:8000/posts?page=${currentPage}&pageSize=10`
        );
        if (!response.ok) {
          throw new Error(
            `Error al obtener los posts: ${response.status} ${response.statusText}`
          );
        }
        const data: PaginatedApiResponse = await response.json();
        setPosts(data.posts);
        setTotalPages(data.total_pages);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Ocurrió un error desconocido.");
        }
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - halfPagesToShow);
      let endPage = Math.min(totalPages, currentPage + halfPagesToShow);

      if (currentPage <= halfPagesToShow) {
        endPage = maxPagesToShow;
      } else if (currentPage + halfPagesToShow >= totalPages) {
        startPage = totalPages - maxPagesToShow + 1;
      }

      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) {
          pageNumbers.push("...");
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pageNumbers.push("...");
        }
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  if (isLoading) {
    return (
      <Container>
        <div className="py-16 text-center">
          <div className="animate-pulse flex justify-center">
            <div className="h-10 w-10 bg-blue-200 rounded-full"></div>
          </div>
          <Text className="mt-4">Cargando feed...</Text>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="py-16 text-center text-red-500">
          <Text>Error: {error}</Text>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="max-w-6xl mx-auto pt-6">
        {/* Layout similar a Bluesky/Twitter */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-0 md:gap-6">
          {/* Sidebar izquierdo - Navegación principal */}
          <div className="hidden md:block md:col-span-1 lg:col-span-2 pt-4">
            <div className="sticky top-4 space-y-6">
              {" "}
              {/* Logo o nombre de la app */}
              <div className="px-4 mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center mr-2">
                    <span className="text-white text-lg font-bold">S</span>
                  </div>
                  <Text
                    as={"h1"}
                    size="heading-3"
                    className="font-bold text-2xl"
                  >
                    SkillSwap
                  </Text>
                </div>
              </div>
              {/* Navegación principal */}
              <nav className="space-y-1">
                {locale.NAV.ELEMENTS.map((e, i) => (
                  <Button
                    className="w-full justify-start text-base font-medium px-4 py-3 text-gray-200 hover:bg-slate-800 rounded-full"
                    variant="ghost"
                    key={i}
                  >
                    {/*TODO: Logica para display icon basado en element.Icon*/}
                    {e.Text}
                  </Button>
                ))}
              </nav>{" "}
              {/* Botón de publicar */}
              <div className="px-4">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full py-3 font-bold">
                  <PenSquare className="mr-2 h-5 w-5 lg:hidden" />
                  <span className="hidden lg:inline">Publicar</span>
                  <span className="lg:hidden">+</span>
                </Button>
              </div>
            </div>
          </div>{" "}
          {/* Feed principal - sección central */}
          <div className="col-span-1 md:col-span-3 lg:col-span-3 border-x border-gray-200 min-h-screen">
            {/* Encabezado del feed */}
            <div className="sticky top-0 z-10 bg-neutral-800 backdrop-blur-sm border-b border-gray-200">
              <div className="px-4 py-3 flex justify-between items-center">
                <Text as={"h2"} size="heading-4" className="font-bold text-xl">
                  Feed
                </Text>
                <Button className="rounded-full p-2" variant="ghost">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>
            {/* Mensaje de no hay publicaciones */}
            {posts.length === 0 && !isLoading && (
              <div className="text-center py-10 px-4 border-b border-gray-200">
                <Text className="text-gray-500">
                  No hay publicaciones disponibles en este momento.
                </Text>
              </div>
            )}{" "}
            {/* Lista de posts estilo Twitter/Bluesky */}
            <div>
              {posts.map((post) => (
                <div key={post.post_id}>
                  <FeedCard
                    title={post.nombre_habilidad}
                    description={post.descripcion}
                    tags={[post.nombre_habilidad, post.tipo_post].filter(
                      Boolean
                    )}
                    author={post.nombre_usuario}
                    authorAvatarUrl={
                      post.author_avatar_url ||
                      `https://i.pravatar.cc/150?u=${post.nombre_usuario}`
                    } // Usamos un avatar aleatorio si no hay uno real
                    timestamp={post.created_at || new Date().toISOString()} // Usamos la fecha actual si no hay timestamp
                  />
                </div>
              ))}
            </div>
            {/* Paginación */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 py-4 px-8 flex flex-row gap-10 ">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50 mr-5"
                            : "cursor-pointer mr-5"
                        }
                      />
                    </PaginationItem>

                    {getPageNumbers().map((page, index) => (
                      <PaginationItem key={index}>
                        {typeof page === "number" ? (
                          <PaginationLink
                            isActive={page === currentPage}
                            onClick={() => handlePageChange(page)}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        ) : (
                          <PaginationEllipsis />
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none  ml-5 opacity-50"
                            : "cursor-pointer  ml-5"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>{" "}
          {/* Sidebar derecho - Tendencias, sugerencias, etc. */}
          <div className="hidden lg:block lg:col-span-2 pt-4">
            <div className="sticky top-4 space-y-4">
              {/* Buscador */}
              <div className="bg-white rounded-full border border-gray-200 p-3 mx-4">
                <div className="flex items-center">
                  <Search className="h-5 w-5 text-gray-500 mr-2" />
                  <input
                    type="text"
                    placeholder="Buscar habilidades"
                    className="bg-transparent outline-none w-full text-sm"
                  />
                </div>
              </div>

              {/* Tarjeta de tendencias */}
              <div className="bg-neutral-800 rounded-xl  p-4 pr-10 mx-4 w-80">
                <Text
                  as={"h3"}
                  size="heading-5"
                  className="font-bold text-purple-700 mb-3 text-2xl"
                >
                  Habilidades destacadas
                </Text>
                <div className="space-y-3">
                  {[
                    "React",
                    "Python",
                    "Diseño UX",
                    "Marketing Digital",
                    "Inglés",
                  ].map((trend, i) => (
                    <div
                      key={i}
                      className="cursor-pointer hover:bg-gray-700 p-2 rounded"
                    >
                      <div className="text-sm font-medium">{trend}</div>
                      <div className="text-xs text-gray-500">
                        {Math.floor(Math.random() * 500) + 100} publicaciones
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tarjeta de sugerencias de usuarios */}
              <div className="bg-neutral-800 rounded-xl p-4 mx-4 w-80">
                <Text
                  as={"h3"}
                  size="heading-5"
                  className="font-bold text-purple-700 mb-3 text-2xl"
                >
                  Usuarios sugeridos
                </Text>
                <div className="space-y-3">
                  {[
                    "María López",
                    "Juan García",
                    "Patricia Rodríguez",
                    "Carlos Martínez",
                  ].map((user, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-700 p-2 rounded"
                    >
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-200 mr-2 flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {user
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{user}</div>
                          <div className="text-xs text-gray-500">
                            @{user.split(" ")[0].toLowerCase()}
                          </div>
                        </div>
                      </div>
                      <Button
                        className="text-xs bg-black text-white rounded-full py-1 px-3 hover:bg-gray-800"
                        size="sm"
                      >
                        Seguir
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
