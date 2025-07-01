// Componente optimizado para la sección de comentarios con lazy loading
import React, { Suspense, lazy } from "react";
import LoadingSpinner from "./LoadingSpinner";

// Lazy loading de componentes pesados
const CommentsList = lazy(() =>
  import("./CommentsList").then((module) => ({ default: module.CommentsList }))
);

interface CommentsProps {
  postId: number;
  initialCommentsCount?: number;
}

const CommentsSection: React.FC<CommentsProps> = ({
  postId,
  initialCommentsCount = 0,
}) => {
  return (
    <div className="comments-section">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Comentarios {initialCommentsCount > 0 && `(${initialCommentsCount})`}
        </h2>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        }
      >
        <CommentsList postId={postId} />
      </Suspense>
    </div>
  );
};

export default CommentsSection;
