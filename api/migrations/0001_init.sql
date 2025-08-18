-- ===============================
-- Script de creación de base de datos
-- SkillSwapDB - PostgreSQL
-- ===============================

-- Nota: La creación de base de datos debe ejecutarse con un usuario con privilegios.
-- Aquí solo definimos el esquema; crea la DB por fuera si hace falta.

-- ===============================
-- Drop existing tables (recreate fresh)
-- ===============================

DROP TABLE IF EXISTS "Comentarios" CASCADE;
DROP TABLE IF EXISTS "Notificaciones" CASCADE;
DROP TABLE IF EXISTS "Posts" CASCADE;
DROP TABLE IF EXISTS "Matches" CASCADE;
DROP TABLE IF EXISTS "SolicitudesIntercambio" CASCADE;
DROP TABLE IF EXISTS "UsuariosHabilidades" CASCADE;
DROP TABLE IF EXISTS "Habilidades" CASCADE;
DROP TABLE IF EXISTS "Sessions" CASCADE;
DROP TABLE IF EXISTS "Usuarios" CASCADE;

-- ===============================
-- Tablas
-- ===============================

CREATE TABLE "Usuarios" (
    "UsuarioID" SERIAL PRIMARY KEY,
    "FechaCreacion" TIMESTAMP DEFAULT NOW(),
    "NombreUsuario" VARCHAR(50) NOT NULL UNIQUE,
    "PrimerNombre" VARCHAR(50) NOT NULL,
    "SegundoNombre" VARCHAR(50),
    "PrimerApellido" VARCHAR(50) NOT NULL,
    "SegundoApellido" VARCHAR(50),
    "CorreoElectronico" VARCHAR(100) NOT NULL UNIQUE,
    "CiudadTrabajo" VARCHAR(100) NOT NULL,
    "HashContrasena" VARCHAR(255) NOT NULL,
    "Rol" VARCHAR(20) DEFAULT 'user',
    "IsBanned" BOOLEAN DEFAULT FALSE,
    "FechaNacimiento" VARCHAR(20),
    "RolID" INT,
    "LinkedInLink" VARCHAR(255),
    "GithubLink" VARCHAR(255),
    "OwnWebsiteLink" VARCHAR(255)
);

CREATE TABLE "Habilidades" (
    "HabilidadID" SERIAL PRIMARY KEY,
    "NombreHabilidad" VARCHAR(100) NOT NULL UNIQUE,
    "Categoria" VARCHAR(100) NOT NULL,
    "Descripcion" TEXT NOT NULL
);

CREATE TABLE "UsuariosHabilidades" (
    "UsuarioHabilidadID" SERIAL PRIMARY KEY,
    "UsuarioID" INT NOT NULL,
    "HabilidadID" INT NOT NULL,
    "TipoHabilidad" VARCHAR(50) NOT NULL,
    "NivelProficiencia" VARCHAR(50),
    FOREIGN KEY ("UsuarioID") REFERENCES "Usuarios"("UsuarioID") ON DELETE CASCADE,
    FOREIGN KEY ("HabilidadID") REFERENCES "Habilidades"("HabilidadID") ON DELETE CASCADE
);

CREATE TABLE "SolicitudesIntercambio" (
    "IDSolicitud" SERIAL PRIMARY KEY,
    "IDUsuarioSolicitante" INT NOT NULL,
    "IDUsuarioReceptor" INT NOT NULL,
    "Estado" VARCHAR(20) DEFAULT 'pendiente',
    "FechaSolicitud" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("IDUsuarioSolicitante") REFERENCES "Usuarios"("UsuarioID") ON DELETE CASCADE,
    FOREIGN KEY ("IDUsuarioReceptor") REFERENCES "Usuarios"("UsuarioID") ON DELETE CASCADE
);

CREATE TABLE "Calificaciones" (
    "IDCalificacion" SERIAL PRIMARY KEY,
    "IDUsuario" INT NOT NULL,
    "Puntuacion" INT NOT NULL,
    "Comentario" TEXT,
    FOREIGN KEY ("IDUsuario") REFERENCES "Usuarios"("UsuarioID") ON DELETE CASCADE
);

-- Sessions table for user sessions
CREATE TABLE "Sessions" (
    "SessionID" SERIAL PRIMARY KEY,
    "UsuarioID" INT NOT NULL,
    "FechaInicio" TIMESTAMP DEFAULT NOW(),
    "FechaFin" TIMESTAMP,
    "Activa" BOOLEAN DEFAULT TRUE,
    FOREIGN KEY ("UsuarioID") REFERENCES "Usuarios"("UsuarioID") ON DELETE CASCADE
);

-- Posts table for user posts
CREATE TABLE "Posts" (
    "PostID" SERIAL PRIMARY KEY,
    "UsuarioID" INT NOT NULL,
    "Titulo" VARCHAR(255) NOT NULL,
    "Contenido" TEXT NOT NULL,
    "FechaCreacion" TIMESTAMP DEFAULT NOW(),
    "FechaActualizacion" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("UsuarioID") REFERENCES "Usuarios"("UsuarioID") ON DELETE CASCADE
);

-- Comments table for post comments
CREATE TABLE "Comentarios" (
    "ComentarioID" SERIAL PRIMARY KEY,
    "PostID" INT NOT NULL,
    "UsuarioID" INT NOT NULL,
    "Contenido" TEXT NOT NULL,
    "FechaCreacion" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("PostID") REFERENCES "Posts"("PostID") ON DELETE CASCADE,
    FOREIGN KEY ("UsuarioID") REFERENCES "Usuarios"("UsuarioID") ON DELETE CASCADE
);

-- Matches table
CREATE TABLE "Matches" (
    "MatchID" SERIAL PRIMARY KEY,
    "Usuario1ID" INT NOT NULL,
    "Usuario2ID" INT NOT NULL,
    "FechaMatch" TIMESTAMP DEFAULT NOW(),
    "Estado" VARCHAR(20) DEFAULT 'activo',
    FOREIGN KEY ("Usuario1ID") REFERENCES "Usuarios"("UsuarioID") ON DELETE CASCADE,
    FOREIGN KEY ("Usuario2ID") REFERENCES "Usuarios"("UsuarioID") ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE "Notificaciones" (
    "NotificacionID" SERIAL PRIMARY KEY,
    "UsuarioID" INT NOT NULL,
    "Titulo" VARCHAR(255) NOT NULL,
    "Mensaje" TEXT NOT NULL,
    "FechaCreacion" TIMESTAMP DEFAULT NOW(),
    "Leida" BOOLEAN DEFAULT FALSE,
    FOREIGN KEY ("UsuarioID") REFERENCES "Usuarios"("UsuarioID") ON DELETE CASCADE
);

-- ===============================
-- Vistas
-- ===============================

CREATE OR REPLACE VIEW vw_solicitudes_pendientes AS
SELECT s."IDSolicitud", u1."NombreUsuario" AS "Solicitante", u2."NombreUsuario" AS "Receptor",
       s."Estado", s."FechaSolicitud"
FROM "SolicitudesIntercambio" s
JOIN "Usuarios" u1 ON s."IDUsuarioSolicitante" = u1."UsuarioID"
JOIN "Usuarios" u2 ON s."IDUsuarioReceptor" = u2."UsuarioID"
WHERE s."Estado" = 'pendiente';

-- ===============================
-- Permissions - Grant all privileges to postgres user
-- ===============================

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;
