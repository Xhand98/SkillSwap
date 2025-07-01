import React from "react";

interface CommentStatsProps {
  totalComments: number;
  totalLikes: number;
  totalDislikes: number;
  mostActiveUser?: string;
  averageLength?: number;
}

const CommentStats: React.FC<CommentStatsProps> = ({
  totalComments,
  totalLikes,
  totalDislikes,
  mostActiveUser,
  averageLength,
}) => {
  const engagementRate =
    totalComments > 0 ? (totalLikes + totalDislikes) / totalComments : 0;
  const positivityRate =
    totalLikes + totalDislikes > 0
      ? (totalLikes / (totalLikes + totalDislikes)) * 100
      : 0;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <svg
          className="w-5 h-5 mr-2 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
          />
        </svg>
        Estadísticas de Comentarios
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total de comentarios */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-blue-600">
                {totalComments}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.627 2.707-3.227V6.741c0-1.6-1.123-2.994-2.707-3.227A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.514C3.373 3.747 2.25 5.14 2.25 6.741v6.018z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Total de likes */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Likes</p>
              <p className="text-2xl font-bold text-green-600">{totalLikes}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600">👍</span>
            </div>
          </div>
        </div>

        {/* Total de dislikes */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Dislikes</p>
              <p className="text-2xl font-bold text-red-600">{totalDislikes}</p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600">👎</span>
            </div>
          </div>
        </div>

        {/* Tasa de engagement */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Engagement</p>
              <p className="text-2xl font-bold text-purple-600">
                {engagementRate.toFixed(1)}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        {positivityRate > 0 && (
          <div className="bg-white p-3 rounded border">
            <span className="text-gray-600">Tasa de positividad:</span>
            <span
              className={`ml-2 font-semibold ${
                positivityRate >= 70
                  ? "text-green-600"
                  : positivityRate >= 50
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {positivityRate.toFixed(1)}%
            </span>
          </div>
        )}

        {mostActiveUser && (
          <div className="bg-white p-3 rounded border">
            <span className="text-gray-600">Usuario más activo:</span>
            <span className="ml-2 font-semibold text-blue-600">
              @{mostActiveUser}
            </span>
          </div>
        )}

        {averageLength && (
          <div className="bg-white p-3 rounded border">
            <span className="text-gray-600">Longitud promedio:</span>
            <span className="ml-2 font-semibold text-indigo-600">
              {Math.round(averageLength)} caracteres
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentStats;
