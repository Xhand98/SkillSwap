-- filepath: database/comments_migration_fixed.sql
-- Migración corregida para el sistema de comentarios de SkillSwap

-- Verificar si la tabla Comentarios existe y tiene la estructura correcta
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Comentarios') AND name = 'ComentarioPadreID')
BEGIN
    -- Si no tiene la columna padre, agregarla
    ALTER TABLE Comentarios ADD ComentarioPadreID INT NULL;
    ALTER TABLE Comentarios ADD CONSTRAINT FK_Comentarios_Padre
        FOREIGN KEY (ComentarioPadreID) REFERENCES Comentarios(ComentarioID);
END
GO

-- Crear tabla ComentarioLikes si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ComentarioLikes' AND xtype='U')
BEGIN
    CREATE TABLE ComentarioLikes
    (
        LikeID      INT IDENTITY PRIMARY KEY,
        ComentarioID INT NOT NULL,
        UsuarioID   INT NOT NULL,
        TipoVoto    NVARCHAR(10) NOT NULL CHECK (TipoVoto IN ('like', 'dislike')),
        CreatedAt   DATETIME DEFAULT GETDATE(),

        -- Un usuario solo puede votar una vez por comentario
        UNIQUE (ComentarioID, UsuarioID),

        -- Índices
        INDEX idx_comentario_likes_comentario (ComentarioID),
        INDEX idx_comentario_likes_usuario (UsuarioID)
    );

    -- Añadir las foreign keys después de crear la tabla
    ALTER TABLE ComentarioLikes ADD CONSTRAINT FK_ComentarioLikes_Comentario
        FOREIGN KEY (ComentarioID) REFERENCES Comentarios(ComentarioID) ON DELETE CASCADE;

    ALTER TABLE ComentarioLikes ADD CONSTRAINT FK_ComentarioLikes_Usuario
        FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID) ON DELETE NO ACTION;
END
GO

-- Crear vista para obtener comentarios con información completa
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_ComentariosCompletos')
    DROP VIEW vw_ComentariosCompletos;
GO

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
GO

-- Crear trigger para actualizar UpdatedAt automáticamente
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'tr_ComentariosUpdateDate')
    DROP TRIGGER tr_ComentariosUpdateDate;
GO

CREATE TRIGGER tr_ComentariosUpdateDate
ON Comentarios
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Comentarios
    SET UpdatedAt = GETDATE()
    FROM Comentarios c
    INNER JOIN inserted i ON c.ComentarioID = i.ComentarioID;
END;
GO

-- Crear procedimiento para obtener comentarios de un post
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_ObtenerComentariosPost')
    DROP PROCEDURE sp_ObtenerComentariosPost;
GO

CREATE PROCEDURE sp_ObtenerComentariosPost
    @PostID INT,
    @Page INT = 1,
    @PageSize INT = 20
AS
BEGIN
    DECLARE @Offset INT = (@Page - 1) * @PageSize;

    -- Obtener comentarios principales (sin padre)
    SELECT
        c.ComentarioID,
        c.PostID,
        c.UsuarioID,
        c.ComentarioPadreID,
        c.Contenido,
        c.CreatedAt,
        c.UpdatedAt,
        c.NombreUsuario,
        c.PrimerNombre,
        c.Apellido,
        c.TotalLikes,
        c.TotalDislikes,
        c.TotalRespuestas
    FROM vw_ComentariosCompletos c
    WHERE c.PostID = @PostID
      AND c.ComentarioPadreID IS NULL
    ORDER BY c.CreatedAt ASC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;

    -- Obtener total de comentarios principales
    SELECT COUNT(*) as TotalComentarios
    FROM Comentarios
    WHERE PostID = @PostID
      AND ComentarioPadreID IS NULL
      AND Activo = 1;
END;
GO

-- Crear procedimiento para obtener respuestas de un comentario
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_ObtenerRespuestasComentario')
    DROP PROCEDURE sp_ObtenerRespuestasComentario;
GO

CREATE PROCEDURE sp_ObtenerRespuestasComentario
    @ComentarioPadreID INT,
    @Page INT = 1,
    @PageSize INT = 10
AS
BEGIN
    DECLARE @Offset INT = (@Page - 1) * @PageSize;

    SELECT
        c.ComentarioID,
        c.PostID,
        c.UsuarioID,
        c.ComentarioPadreID,
        c.Contenido,
        c.CreatedAt,
        c.UpdatedAt,
        c.NombreUsuario,
        c.PrimerNombre,
        c.Apellido,
        c.TotalLikes,
        c.TotalDislikes,
        c.TotalRespuestas
    FROM vw_ComentariosCompletos c
    WHERE c.ComentarioPadreID = @ComentarioPadreID
    ORDER BY c.CreatedAt ASC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;
GO

-- Verificar la estructura final
SELECT 'Tabla Comentarios' as Objeto, COUNT(*) as Existe FROM sys.tables WHERE name = 'Comentarios'
UNION ALL
SELECT 'Tabla ComentarioLikes' as Objeto, COUNT(*) as Existe FROM sys.tables WHERE name = 'ComentarioLikes'
UNION ALL
SELECT 'Vista vw_ComentariosCompletos' as Objeto, COUNT(*) as Existe FROM sys.views WHERE name = 'vw_ComentariosCompletos'
UNION ALL
SELECT 'Procedure sp_ObtenerComentariosPost' as Objeto, COUNT(*) as Existe FROM sys.procedures WHERE name = 'sp_ObtenerComentariosPost'
UNION ALL
SELECT 'Procedure sp_ObtenerRespuestasComentario' as Objeto, COUNT(*) as Existe FROM sys.procedures WHERE name = 'sp_ObtenerRespuestasComentario';
