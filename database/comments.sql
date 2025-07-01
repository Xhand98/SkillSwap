-- Tabla de Comentarios para el sistema de foro de SkillSwap
-- Permite comentarios en posts con soporte para respuestas anidadas

-- COMENTARIOS
CREATE TABLE Comentarios
(
    ComentarioID    INT IDENTITY PRIMARY KEY,
    PostID          INT NOT NULL REFERENCES Posts(PostID) ON DELETE CASCADE,
    UsuarioID       INT NOT NULL REFERENCES Usuarios(UsuarioID) ON DELETE CASCADE,
    ComentarioPadreID INT NULL REFERENCES Comentarios(ComentarioID),
    Contenido       NVARCHAR(MAX) NOT NULL,
    CreatedAt       DATETIME DEFAULT GETDATE(),
    UpdatedAt       DATETIME DEFAULT GETDATE(),
    Activo          BIT DEFAULT 1,

    -- Índices para mejorar performance
    INDEX idx_comentarios_post (PostID),
    INDEX idx_comentarios_usuario (UsuarioID),
    INDEX idx_comentarios_padre (ComentarioPadreID),
    INDEX idx_comentarios_fecha (CreatedAt DESC)
);
GO

-- Tabla para likes/votos en comentarios
CREATE TABLE ComentarioLikes
(
    LikeID      INT IDENTITY PRIMARY KEY,
    ComentarioID INT NOT NULL REFERENCES Comentarios(ComentarioID) ON DELETE CASCADE,
    UsuarioID   INT NOT NULL REFERENCES Usuarios(UsuarioID) ON DELETE CASCADE,
    TipoVoto    NVARCHAR(10) NOT NULL CHECK (TipoVoto IN ('like', 'dislike')),
    CreatedAt   DATETIME DEFAULT GETDATE(),

    -- Un usuario solo puede votar una vez por comentario
    UNIQUE (ComentarioID, UsuarioID),

    -- Índices
    INDEX idx_comentario_likes_comentario (ComentarioID),
    INDEX idx_comentario_likes_usuario (UsuarioID)
);
GO

-- Vista para obtener comentarios con información completa
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

-- Trigger para actualizar UpdatedAt automáticamente
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

-- Procedimiento para obtener comentarios de un post con estructura jerárquica
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

-- Procedimiento para obtener respuestas de un comentario
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

-- Añadir permisos para comentarios en la tabla de permisos existente
INSERT INTO Permisos (NombrePermiso, Descripcion, Recurso, Accion) VALUES
('comentarios.crear', 'Crear comentarios en posts', 'comentarios', 'crear'),
('comentarios.leer', 'Ver comentarios', 'comentarios', 'leer'),
('comentarios.actualizar', 'Editar comentarios propios', 'comentarios', 'actualizar'),
('comentarios.eliminar', 'Eliminar comentarios propios', 'comentarios', 'eliminar'),
('comentarios.moderar', 'Moderar comentarios de otros', 'comentarios', 'moderar'),
('comentarios.votar', 'Votar en comentarios', 'comentarios', 'votar');
GO

-- Asignar permisos de comentarios a roles existentes
-- SuperAdmin: todos los permisos
INSERT INTO RolesPermisos (RolID, PermisoID)
SELECT 1, PermisoID FROM Permisos WHERE NombrePermiso LIKE 'comentarios.%';

-- Admin: todos excepto moderar
INSERT INTO RolesPermisos (RolID, PermisoID)
SELECT 2, PermisoID FROM Permisos WHERE NombrePermiso LIKE 'comentarios.%';

-- Moderador: leer, moderar, votar
INSERT INTO RolesPermisos (RolID, PermisoID)
SELECT 3, PermisoID FROM Permisos
WHERE NombrePermiso IN ('comentarios.leer', 'comentarios.moderar', 'comentarios.votar');

-- Usuario: crear, leer, actualizar, eliminar (propios), votar
INSERT INTO RolesPermisos (RolID, PermisoID)
SELECT 4, PermisoID FROM Permisos
WHERE NombrePermiso IN ('comentarios.crear', 'comentarios.leer', 'comentarios.actualizar', 'comentarios.eliminar', 'comentarios.votar');

-- Usuario Nuevo: solo leer
INSERT INTO RolesPermisos (RolID, PermisoID)
SELECT 5, PermisoID FROM Permisos
WHERE NombrePermiso = 'comentarios.leer';
GO
