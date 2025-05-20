CREATE DATABASE SkillSwapDB;
GO
USE SkillSwapDB;
GO
-- Tabla de usuarios
CREATE TABLE Usuarios (
                          UsuarioID INT PRIMARY KEY IDENTITY(1,1),
                          NombreUsuario NVARCHAR(50) UNIQUE NOT NULL,
                          PrimerNombre NVARCHAR(50) NOT NULL,
                          SegundoNombre NVARCHAR(50),
                          PrimerApellido NVARCHAR(50) NOT NULL,
                          SegundoApellido NVARCHAR(50),
                          CorreoElectronico NVARCHAR(100) UNIQUE NOT NULL,
                          CiudadTrabajo NVARCHAR(50) NOT NULL,
                          HashContrasena NVARCHAR(256) NOT NULL,
                          Rol NVARCHAR(10) CHECK (Rol IN ('user', 'admin')) DEFAULT 'user',
                          FechaCreacion DATETIME DEFAULT GETDATE()
);
CREATE INDEX idx_NombreUsuario ON Usuarios(NombreUsuario);
CREATE INDEX idx_CorreoElectronico ON Usuarios(CorreoElectronico);
CREATE INDEX CiudadTrabajo ON Usuarios(CiudadTrabajo);

-- Tabla Habilidades
CREATE TABLE Habilidades (
                             HabilidadID INT PRIMARY KEY IDENTITY(1,1),
                             NombreHabilidad NVARCHAR(100) NOT NULL,
                             Categoria NVARCHAR(50) CHECK (Categoria IN ('Informática', 'Contabilidad', 'Gastronomia', 'Electricidad', 'Refrigeración')),
                             Descripcion NVARCHAR(MAX)
);
CREATE INDEX idx_NombreHabilidad ON Habilidades(NombreHabilidad);

-- Tabla interseccion usuario <=> habilidades
CREATE TABLE UsuariosHabilidades (
                                     UsuarioHabilidadID INT PRIMARY KEY IDENTITY(1,1),
                                     UsuarioID INT FOREIGN KEY REFERENCES Usuarios(UsuarioID),
                                     HabilidadID INT FOREIGN KEY REFERENCES Habilidades(HabilidadID),
                                     TipoHabilidad NVARCHAR(10) CHECK (TipoHabilidad IN ('Ofrece', 'Busca')),
                                     NivelProficiencia NVARCHAR(20)
);
CREATE INDEX idx_UsuarioID ON UsuariosHabilidades(UsuarioID);
CREATE INDEX idx_HabilidadID ON UsuariosHabilidades(HabilidadID);


CREATE TABLE Posts (
         PostID INT PRIMARY KEY IDENTITY(1,1),
         UsuarioID INT FOREIGN KEY REFERENCES Usuarios(UsuarioID),
         TipoPost NVARCHAR(20) CHECK (TipoPost IN ('Ofrece', 'Busca')),
         HabilidadID INT FOREIGN KEY REFERENCES Habilidades(HabilidadID),
         Descripcion NVARCHAR(MAX),
         CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Inserts for Posts
INSERT INTO Posts (UsuarioID, TipoPost, HabilidadID, Descripcion) VALUES
--(1, 'Ofrece', 1, 'Ofrezco mis habilidades avanzadas en desarrollo web frontend.'),
--(2, 'Busca', 5, 'Busco ayuda con instalaciones eléctricas residenciales.'),
--(3, 'Ofrece', 8, 'Ofrezco diseño gráfico avanzado para proyectos creativos.'),
--(4, 'Busca', 7, 'Busco mentoría en análisis de datos con Python.'),
--(5, 'Ofrece', 3, 'Ofrezco servicios avanzados en contabilidad financiera.'),
--(6, 'Busca', 9, 'Busco colaboración en marketing digital.'),
(7, 'Ofrece', 10, 'Ofrezco fotografía de retrato profesional para eventos.'),
(8, 'Busca', 6, 'Busco reparación de aires acondicionados para mi hogar.');
CREATE INDEX idx_UsuarioID_Posts ON Posts(UsuarioID);

CREATE VIEW vw_PostFullInfo AS
    SELECT
        p.PostID,
        u.NombreUsuario,
        h.NombreHabilidad,
        p.TipoPost,
        p.Descripcion,
        p.CreatedAt,
        p.UpdatedAt
    FROM Posts p
                JOIN Usuarios u ON p.UsuarioID = u.UsuarioID
                JOIN Habilidades h ON p.HabilidadID = h.HabilidadID;


-- Modifica tu vista para incluir UsuarioID
CREATE OR ALTER VIEW vw_PostFullInfo AS -- Usa CREATE OR ALTER si tu SGBD lo soporta, o DROP y CREATE
SELECT
    p.PostID,
    u.UsuarioID, -- <--- AÑADIR ESTO
    u.NombreUsuario,
    h.HabilidadID, -- <--- AÑADIR ESTO (si lo necesitas para filtrar o mostrar)
    h.NombreHabilidad,
    p.TipoPost,
    p.Descripcion,
    p.CreatedAt, -- Asegúrate que estos nombres coincidan con tu tabla Posts
    p.UpdatedAt  -- Asegúrate que estos nombres coincidan con tu tabla Posts
FROM Posts p
         JOIN Usuarios u ON p.UsuarioID = u.UsuarioID
         JOIN Habilidades h ON p.HabilidadID = h.HabilidadID;
-- Tabla empajeramiento
CREATE TABLE Emparejamientos (
                                 EmparejamientoID INT PRIMARY KEY IDENTITY(1,1),
                                 Usuario1ID INT FOREIGN KEY REFERENCES Usuarios(UsuarioID),
                                 Usuario2ID INT FOREIGN KEY REFERENCES Usuarios(UsuarioID),
                                 Habilidad1ID INT FOREIGN KEY REFERENCES Habilidades(HabilidadID),
                                 Habilidad2ID INT FOREIGN KEY REFERENCES Habilidades(HabilidadID),
                                 EstadoEmparejamiento NVARCHAR(20) DEFAULT 'Pendiente',
                                 FechaCreacion DATETIME DEFAULT GETDATE()
);
CREATE INDEX idx_Usuario1ID ON Emparejamientos(Usuario1ID);
CREATE INDEX idx_Usuario2ID ON Emparejamientos(Usuario2ID);
CREATE INDEX idx_Habilidad1ID ON Emparejamientos(Habilidad1ID);
CREATE INDEX idx_Habilidad2ID ON Emparejamientos(Habilidad2ID);

-- Tabla reseñas
CREATE TABLE Resenas (
                         ResenaID INT PRIMARY KEY IDENTITY(1,1),
                         EmparejamientoID INT FOREIGN KEY REFERENCES Emparejamientos(EmparejamientoID),
                         RevisorID INT FOREIGN KEY REFERENCES Usuarios(UsuarioID),
                         UsuarioRevisadoID INT FOREIGN KEY REFERENCES Usuarios(UsuarioID),
                         Calificacion INT CHECK (Calificacion BETWEEN 1 AND 5),
                         Comentario NVARCHAR(MAX),
                         FechaCreacion DATETIME DEFAULT GETDATE()
);
CREATE INDEX idx_EmparejamientoID ON Resenas(EmparejamientoID);
CREATE INDEX idx_RevisorID ON Resenas(RevisorID);
CREATE INDEX idx_UsuarioRevisadoID ON Resenas(UsuarioRevisadoID);

-- Tabla programacion de intercambio (fecha de entrega)
CREATE TABLE Programacion (
                              ProgramacionID INT PRIMARY KEY IDENTITY(1,1),
                              EmparejamientoID INT FOREIGN KEY REFERENCES Emparejamientos(EmparejamientoID),
                              FechaSesion DATETIME NOT NULL,
                              DuracionMinutos INT,
                              Estado NVARCHAR(20) DEFAULT 'Programada'
);
CREATE INDEX idx_EmparejamientoID_Programacion ON Programacion(EmparejamientoID);

-- Tabla de Auditoria (log)
CREATE TABLE Auditoria (
                           AuditoriaID INT PRIMARY KEY IDENTITY(1,1),
                           UsuarioID INT FOREIGN KEY REFERENCES Usuarios(UsuarioID),
                           Accion NVARCHAR(50),
                           TablaAfectada NVARCHAR(50),
                           FechaHora DATETIME DEFAULT GETDATE(),
                           DireccionIP NVARCHAR(50),
                           Detalles NVARCHAR(255)
);

-- VIEWS

CREATE VIEW vw_EmparejamientosActivos AS
SELECT
    e.EmparejamientoID,
    u1.NombreUsuario AS Usuario1,
    u2.NombreUsuario AS Usuario2,
    h1.NombreHabilidad AS HabilidadOfrecida,
    h2.NombreHabilidad AS HabilidadBuscada,
    e.EstadoEmparejamiento,
    e.FechaCreacion
FROM Emparejamientos e
         JOIN Usuarios u1 ON e.Usuario1ID = u1.UsuarioID
         JOIN Usuarios u2 ON e.Usuario2ID = u2.UsuarioID
         JOIN Habilidades h1 ON e.Habilidad1ID = h1.HabilidadID
         JOIN Habilidades h2 ON e.Habilidad2ID = h2.HabilidadID
WHERE e.EstadoEmparejamiento = 'Activo';


-- Vista: Ver los posts de usuarios ofreciendo habilidades
CREATE VIEW vw_PostsOfertas AS
SELECT
    u.UsuarioID,
    u.NombreUsuario,
    h.NombreHabilidad,
    p.TipoPost,
    p.Descripcion,
    p.Fecha
FROM Usuarios u
         JOIN UsuariosHabilidades p ON u.UsuarioID = p.UsuarioID
            JOIN Habilidades h ON p.HabilidadID = h.HabilidadID
WHERE p.TipoHabilidad = 'Ofrece';



-- Vista: Usuarios y sus habilidades ofrecidas
CREATE VIEW vw_UsuariosOfertas AS
SELECT
    u.NombreUsuario,
    h.NombreHabilidad
FROM Usuarios u
         JOIN UsuariosHabilidades uh ON u.UsuarioID = uh.UsuarioID
         JOIN Habilidades h ON uh.HabilidadID = h.HabilidadID
WHERE uh.TipoHabilidad = 'Ofrece';
GO

-- Vista: Detalles de emparejamientos activos
CREATE VIEW vw_EmparejamientosActivosDetallados AS
SELECT
    e.EmparejamientoID,
    u1.NombreUsuario AS Usuario1,
    u2.NombreUsuario AS Usuario2,
    h1.NombreHabilidad AS HabilidadOfrecida,
    h2.NombreHabilidad AS HabilidadBuscada
FROM Emparejamientos e
         JOIN Usuarios u1 ON e.Usuario1ID = u1.UsuarioID
         JOIN Usuarios u2 ON e.Usuario2ID = u2.UsuarioID
         JOIN Habilidades h1 ON e.Habilidad1ID = h1.HabilidadID
         JOIN Habilidades h2 ON e.Habilidad2ID = h2.HabilidadID
WHERE e.EstadoEmparejamiento = 'Activo';
GO

CREATE VIEW vw_Administrators AS
SELECT UsuarioID, NombreUsuario, CorreoElectronico, FechaCreacion
FROM Usuarios
WHERE Rol = 'admin';

-- STORAGED PROCEADURES
-- Procedimiento: Actualizar perfil de usuario con verificación de unicidad
CREATE PROCEDURE sp_ActualizarPerfilUsuario
    @UsuarioID INT,
    @NombreUsuario NVARCHAR(50),
    @CorreoElectronico NVARCHAR(100)
AS
BEGIN
    -- Verificar si el nombre de usuario ya está en uso por otro usuario
    IF EXISTS (SELECT 1 FROM Usuarios WHERE NombreUsuario = @NombreUsuario AND UsuarioID != @UsuarioID)
        BEGIN
            RAISERROR('El nombre de usuario ya está en uso.', 16, 1);
            RETURN;
        END

    -- Verificar si el correo electrónico ya está en uso por otro usuario
    IF EXISTS (SELECT 1 FROM Usuarios WHERE CorreoElectronico = @CorreoElectronico AND UsuarioID != @UsuarioID)
        BEGIN
            RAISERROR('El correo electrónico ya está en uso.', 16, 1);
            RETURN;
        END

    -- Actualizar el perfil del usuario
    UPDATE Usuarios
    SET NombreUsuario = @NombreUsuario,
        CorreoElectronico = @CorreoElectronico
    WHERE UsuarioID = @UsuarioID;
END;
GO

-- Procedimiento: Agregar una nueva habilidad con verificación de duplicados
CREATE PROCEDURE sp_AgregarHabilidad
    @NombreHabilidad NVARCHAR(100),
    @Categoria NVARCHAR(50),
    @Descripcion NVARCHAR(MAX)
AS
BEGIN
    -- Verificar si la habilidad ya existe
    IF EXISTS (SELECT 1 FROM Habilidades WHERE NombreHabilidad = @NombreHabilidad)
        BEGIN
            RAISERROR('La habilidad ya existe.', 16, 1);
            RETURN;
        END

    -- Insertar la nueva habilidad
    INSERT INTO Habilidades (NombreHabilidad, Categoria, Descripcion)
    VALUES (@NombreHabilidad, @Categoria, @Descripcion);
END;
GO

-- Procedimiento: Cancelar una sesión programada
CREATE PROCEDURE sp_CancelarSesion
@ProgramacionID INT
AS
BEGIN
    -- Actualizar el estado de la sesión a 'Cancelada'
    UPDATE Programacion
    SET Estado = 'Cancelada'
    WHERE ProgramacionID = @ProgramacionID;
END;
GO

CREATE PROCEDURE sp_CrearEmparejamiento
    @Usuario1ID INT,
    @Usuario2ID INT,
    @Habilidad1ID INT,
    @Habilidad2ID INT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM Usuarios WHERE UsuarioID = @Usuario1ID)
        AND EXISTS (SELECT 1 FROM Usuarios WHERE UsuarioID = @Usuario2ID)
        AND EXISTS (SELECT 1 FROM Habilidades WHERE HabilidadID = @Habilidad1ID)
        AND EXISTS (SELECT 1 FROM Habilidades WHERE HabilidadID = @Habilidad2ID)
        BEGIN
            INSERT INTO Emparejamientos (Usuario1ID, Usuario2ID, Habilidad1ID, Habilidad2ID, EstadoEmparejamiento)
            VALUES (@Usuario1ID, @Usuario2ID, @Habilidad1ID, @Habilidad2ID, 'Pendiente');
        END
    ELSE
        BEGIN
            RAISERROR('One or more IDs do not exist.', 16, 1);
        END
END;
GO

-- TRIGGERS


CREATE TRIGGER tr_ActualizarEstadoEmparejamiento
    ON Programacion
    AFTER INSERT
    AS
BEGIN
    UPDATE Emparejamientos
    SET EstadoEmparejamiento = 'Programado'
    FROM Emparejamientos e
             JOIN inserted i ON e.EmparejamientoID = i.EmparejamientoID
    WHERE i.Estado = 'Programada';

    DECLARE @UsuarioID INT;
    DECLARE @DireccionIP NVARCHAR(50) = CONVERT(NVARCHAR(50), CONNECTIONPROPERTY('client_net_address'));
    SELECT @UsuarioID = UsuarioID FROM Usuarios WHERE NombreUsuario = SUSER_SNAME();

    INSERT INTO Auditoria (UsuarioID, Accion, TablaAfectada, FechaHora, DireccionIP)
    VALUES (@UsuarioID, 'INSERT', 'Programacion', GETDATE(), @DireccionIP);
END;

    -- Disparador: Actualizar estado del emparejamiento al completar una sesión
    CREATE TRIGGER tr_ActualizarEstadoSesion
        ON Programacion
        AFTER UPDATE
        AS
    BEGIN
        IF UPDATE(Estado)
            BEGIN
                DECLARE @EmparejamientoID INT;
                DECLARE @Estado NVARCHAR(20);
                SELECT @EmparejamientoID = EmparejamientoID, @Estado = Estado FROM inserted;

                IF @Estado = 'Completada'
                    BEGIN
                        UPDATE Emparejamientos
                        SET EstadoEmparejamiento = 'Completado'
                        WHERE EmparejamientoID = @EmparejamientoID;
                    END
            END
    END;
GO

-- Disparador: Registrar cambios en perfiles de usuario en la tabla de auditoría
CREATE TRIGGER tr_AuditarCambiosPerfil
    ON Usuarios
    AFTER UPDATE
    AS
BEGIN
    DECLARE @UsuarioID INT;
    DECLARE @Accion NVARCHAR(50) = 'UPDATE';
    DECLARE @TablaAfectada NVARCHAR(50) = 'Usuarios';
    DECLARE @DireccionIP NVARCHAR(50) = CONVERT(NVARCHAR(50), CONNECTIONPROPERTY('client_net_address'));

    SELECT @UsuarioID = UsuarioID FROM inserted;

    INSERT INTO Auditoria (UsuarioID, Accion, TablaAfectada, FechaHora, DireccionIP)
    VALUES (@UsuarioID, @Accion, @TablaAfectada, GETDATE(), @DireccionIP);
END;
GO

-- ALERTAS

-- Alerta para alta utilización de CPU
EXEC msdb.dbo.sp_add_alert
     @name = N'Alta Utilización de CPU',
     @message_id = 0,
     @severity = 0,
     @enabled = 1,
     @delay_between_responses = 300, -- 5 minutos entre notificaciones
     @notification_message = N'El uso de CPU supera el 80% durante 5 minutos. Revisar inmediatamente.',
     @include_event_description_in = 1,
     @performance_condition = N'SQLServer:Resource Pool Stats|CPU usage %|default|>|80';

-- Asociar la alerta al operador
EXEC msdb.dbo.sp_add_notification
     @alert_name = N'Alta Utilización de CPU',
     @operator_name = N'AdminDBA',
     @notification_method = 1;

-- Alerta para alta utilización de memoria
EXEC msdb.dbo.sp_add_alert
     @name = N'Alta Utilización de Memoria',
     @message_id = 0,
     @severity = 0,
     @enabled = 1,
     @delay_between_responses = 300, -- 5 minutos entre notificaciones
     @notification_message = N'El uso de memoria supera el 80%. Revisar inmediatamente.',
     @include_event_description_in = 1,
     @performance_condition = N'SQLServer:Memory Manager|Target Server Memory (KB)|_Total|>|80'; -- Ajustar según el umbral de memoria

-- Asociar la alerta al operador
EXEC msdb.dbo.sp_add_notification
     @alert_name = N'Alta Utilización de Memoria',
     @operator_name = N'AdminDBA',
     @notification_method = 1;

-- Alerta por espacio en disco
EXEC msdb.dbo.sp_add_alert @name=N'Low Disk Space',
     @message_id=0,
     @severity=17,
     @enabled=1,
     @delay_between_responses=300,
     @notification_message=N'Disk space is below 20%.';

-- Monitoreo:
-- Query para ver las querys mas lentas
SELECT TOP 10
    qs.execution_count,
    qs.total_elapsed_time,
    SUBSTRING(st.text, (qs.statement_start_offset/2)+1,
              ((qs.statement_end_offset - qs.statement_start_offset)/2)+1) AS query_text
FROM sys.dm_exec_query_stats qs
         CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) st
ORDER BY qs.total_elapsed_time DESC;

-- Alters

-- Se me olvido lo de roles de usuario jj
ALTER TABLE Usuarios
    ADD Rol NVARCHAR(10) CHECK (Rol IN ('user', 'admin')) DEFAULT 'user';

ALTER TRIGGER tr_AuditarCambiosPerfil
    ON Usuarios
    AFTER UPDATE
    AS
    BEGIN
        DECLARE @UsuarioID INT;
        DECLARE @Rol NVARCHAR(10);
        DECLARE @Accion NVARCHAR(50) = 'UPDATE';
        DECLARE @TablaAfectada NVARCHAR(50) = 'Usuarios';
        DECLARE @DireccionIP NVARCHAR(50) = CONVERT(NVARCHAR(50), CONNECTIONPROPERTY('client_net_address'));

        SELECT @UsuarioID = UsuarioID, @Rol = Rol FROM inserted;

        INSERT INTO Auditoria (UsuarioID, Accion, TablaAfectada, FechaHora, DireccionIP, Detalles)
        VALUES (@UsuarioID, @Accion, @TablaAfectada, GETDATE(), @DireccionIP, 'Role: ' + @Rol);
    END;
