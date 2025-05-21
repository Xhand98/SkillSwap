"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/text";
import { Button } from "@/components/ui/button";
import { Calendar, MessageCircle, ThumbsUp, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Post {
  id: number;
  title: string;
  content: string;
  created_at: string;
  user_id: number;
  user?: {
    nombre_usuario: string;
    primer_nombre: string;
    primer_apellido: string;
  };
}

interface UserPostsProps {
  userId: string;
}

export default function UserPosts({ userId }: UserPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
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
        setPosts(data || []);
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

  if (posts.length === 0) {
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
      {posts.map((post) => (
        <Card key={post.id} className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${
                      post.user?.nombre_usuario || "user"
                    }`}
                  />
                  <AvatarFallback>
                    {post.user?.primer_nombre?.[0] || "U"}
                    {post.user?.primer_apellido?.[0] || "S"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg text-white">
                    {post.title}
                  </CardTitle>
                  <div className="flex items-center text-gray-400 mt-1 text-sm">
                    <Calendar size={14} className="mr-1" />
                    {new Date(post.created_at).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Text
              size="paragraph-base"
              className="text-gray-300 whitespace-pre-line"
            >
              {post.content}
            </Text>

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
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-primary"
                >
                  <MessageCircle size={18} className="mr-1" />
                  <span>Comentar</span>
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-primary"
              >
                <Share2 size={18} className="mr-1" />
                <span>Compartir</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
