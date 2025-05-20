// Card component styled like a bsky/twitter post
import { Heart, MessageSquare, Repeat2, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeedCardProps {
  title: string;
  description: string;
  tags?: string[];
  author: string;
  authorAvatarUrl?: string;
  timestamp?: string;
}

export default function FeedCard({
  title,
  description,
  tags = [],
  author,
  authorAvatarUrl,
  timestamp,
}: FeedCardProps) {
  // Función simple para formatear fecha
  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSeconds < 60) return `${diffSeconds}s`;
      if (diffMinutes < 60) return `${diffMinutes}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;

      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  // Obtener las iniciales del autor para el avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  return (
    <div className="p-4 hover:bg-neutral-900 transition-colors border-b border-gray-200">
      <div className="flex space-x-3">
        {/* Avatar */}
        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
          {authorAvatarUrl ? (
            <img
              src={authorAvatarUrl}
              alt={author}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium">{getInitials(author)}</span>
          )}
        </div>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          {/* Encabezado: autor y timestamp */}
          <div className="flex items-center text-sm">
            <span className="font-bold hover:underline cursor-pointer">
              {author}
            </span>
            <span className="text-gray-500 mx-1">·</span>
            <span className="text-gray-500 text-sm hover:underline cursor-pointer">
              {timestamp ? formatTimeAgo(timestamp) : "10h"}
            </span>
          </div>

          {/* Título de la habilidad */}
          <h3 className="font-bold text-base mt-0.5">{title}</h3>

          {/* Descripción */}
          <p className="text-gray-400 mt-0.5 text-sm">{description}</p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-800 text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Acciones (me gusta, comentar, retweet, compartir) */}
          <div className="mt-3 flex justify-between max-w-md">
            <button className="group flex items-center text-gray-500">
              <div className="p-1.5 rounded-full group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                <MessageSquare className="h-4 w-4" />
              </div>
              <span className="text-xs ml-0.5 group-hover:text-blue-500">
                12
              </span>
            </button>
            <button className="group flex items-center text-gray-500">
              <div className="p-1.5 rounded-full group-hover:bg-green-50 group-hover:text-green-500 transition-colors">
                <Repeat2 className="h-4 w-4" />
              </div>
              <span className="text-xs ml-0.5 group-hover:text-green-500">
                4
              </span>
            </button>
            <button className="group flex items-center text-gray-500">
              <div className="p-1.5 rounded-full group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                <Heart className="h-4 w-4" />
              </div>
              <span className="text-xs ml-0.5 group-hover:text-red-500">
                24
              </span>
            </button>
            <button className="group flex items-center text-gray-500">
              <div className="p-1.5 rounded-full group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                <Share className="h-4 w-4" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
