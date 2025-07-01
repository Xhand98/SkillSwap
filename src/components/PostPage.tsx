// Ejemplo de uso del sistema de comentarios en una página de post
import React from "react";
import { CommentsList } from "@/components/CommentsList";

interface PostPageProps {
  postId: number;
  post: {
    post_id: number;
    nombre_habilidad: string;
    descripcion: string;
    nombre_usuario: string;
    created_at: string;
  };
}

export const PostPage: React.FC<PostPageProps> = ({ postId, post }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Información del post */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {post.nombre_habilidad}
        </h1>

        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          <span>Por: {post.nombre_usuario}</span>
          <span>•</span>
          <span>{new Date(post.created_at).toLocaleDateString("es-ES")}</span>
        </div>

        <p className="text-gray-800 leading-relaxed">{post.descripcion}</p>
      </div>

      {/* Sección de comentarios */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Comentarios
        </h2>

        <CommentsList postId={postId} />
      </div>
    </div>
  );
};
