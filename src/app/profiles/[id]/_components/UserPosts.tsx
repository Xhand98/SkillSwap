"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/text";
import { Button } from "@/components/ui/button";
import { Calendar, MessageCircle, ThumbsUp, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Post {
  id: number;
  nombre_habilidad: string;
  descripcion: string;
  created_at: string;
  nombre_usuario: string;
  tipo_post: string;
  updated_at: string;
}

interface UserPostsProps {
  userId: string;
}

interface ApiResponse {
  posts: Post[];
  total_posts: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export default function UserPosts({ userId }: UserPostsProps) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8000/users/${userId}/posts/`
        );

        if (!response.ok) {
          throw new Error(`Error al cargar publicaciones: ${response.status}`);
        }

        const data = await response.json();

        console.log("Post data:", data?.posts);
        setData(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserPosts();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="text-gray-400 mt-4">Cargando publicaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center bg-gray-900 rounded-lg">
        <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
        <p className="text-gray-300">{error}</p>
      </div>
    );
  }

  if (data?.posts.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-900 rounded-lg">
        <h3 className="text-xl text-gray-300 mb-2">No hay publicaciones</h3>
        <p className="text-gray-400">
          Este usuario aún no ha realizado ninguna publicación
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data?.posts.map((post, i) => (
        <Card key={i} className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${
                      post.nombre_usuario || "user"
                    }`}
                  />
                  <AvatarFallback>
                    {post.nombre_usuario[0] || "U"}
                    {post.nombre_usuario[1] || "S"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base text-white">
                    {post.nombre_habilidad}
                  </CardTitle>
                  <div className="flex items-center text-gray-400 mt-0 text-sm">
                    <Calendar size={14} />
                    <span className="ml-1">
                      {new Date(post.created_at).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="ml-14">{post.descripcion}</div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-800">
              <div className="flex space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-primary"
                >
                  <ThumbsUp size={18} className="mr-1" />
                  <span>Me gusta</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
