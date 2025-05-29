CREATE VIEW vw_ComentariosCompletos AS
SELECT
    c.ComentarioID,
    c.PostID,
    c.UsuarioID,
    c.ComentarioPadreID,
    c.Contenido,
    c.CreatedAt,
    c.UpdatedAt,
    c.Activo,
    u.NombreUsuario,
    u.PrimerNombre,
    u.Apellido,
    u.CorreoElectronico,
    -- Conteo de likes y dislikes
    ISNULL(likes.total_likes, 0) AS TotalLikes,
    ISNULL(dislikes.total_dislikes, 0) AS TotalDislikes,
    -- Conteo de respuestas
    ISNULL(respuestas.total_respuestas, 0) AS TotalRespuestas
FROM Comentarios c
JOIN Usuarios u ON c.UsuarioID = u.UsuarioID
LEFT JOIN (
    SELECT ComentarioID, COUNT(*) as total_likes
    FROM ComentarioLikes
    WHERE TipoVoto = 'like'
    GROUP BY ComentarioID
) likes ON c.ComentarioID = likes.ComentarioID
LEFT JOIN (
    SELECT ComentarioID, COUNT(*) as total_dislikes
    FROM ComentarioLikes
    WHERE TipoVoto = 'dislike'
    GROUP BY ComentarioID
) dislikes ON c.ComentarioID = dislikes.ComentarioID
LEFT JOIN (
    SELECT ComentarioPadreID, COUNT(*) as total_respuestas
    FROM Comentarios
    WHERE ComentarioPadreID IS NOT NULL AND Activo = 1
    GROUP BY ComentarioPadreID
) respuestas ON c.ComentarioID = respuestas.ComentarioPadreID
WHERE c.Activo = 1;
