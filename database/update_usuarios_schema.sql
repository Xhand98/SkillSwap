-- Script para actualizar la tabla Usuarios con los nuevos campos
-- Fecha: 27 de mayo de 2025
-- Descripción: Agregar campos de redes sociales, fecha_nacimiento y RolID

USE SkillSwapDB;
GO

-- Verificar si la tabla Usuarios existe
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Usuarios')
BEGIN
    PRINT 'ERROR: La tabla Usuarios no existe. Ejecutar scripts.sql primero.';
    RETURN;
END

PRINT 'Iniciando actualización del esquema de la tabla Usuarios...';

-- Agregar campo FechaNacimiento si no existe
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Usuarios' AND COLUMN_NAME = 'FechaNacimiento')
BEGIN
    ALTER TABLE Usuarios ADD FechaNacimiento NVARCHAR(50);
    PRINT '✓ Campo FechaNacimiento agregado';
END
ELSE
BEGIN
    PRINT '- Campo FechaNacimiento ya existe';
END

-- Agregar campo RolID si no existe
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Usuarios' AND COLUMN_NAME = 'RolID')
BEGIN
    ALTER TABLE Usuarios ADD RolID INT;
    PRINT '✓ Campo RolID agregado';
END
ELSE
BEGIN
    PRINT '- Campo RolID ya existe';
END

-- Agregar campo LinkedInLink si no existe
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Usuarios' AND COLUMN_NAME = 'LinkedInLink')
BEGIN
    ALTER TABLE Usuarios ADD LinkedInLink NVARCHAR(255);
    PRINT '✓ Campo LinkedInLink agregado';
END
ELSE
BEGIN
    PRINT '- Campo LinkedInLink ya existe';
END

-- Agregar campo GithubLink si no existe
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Usuarios' AND COLUMN_NAME = 'GithubLink')
BEGIN
    ALTER TABLE Usuarios ADD GithubLink NVARCHAR(255);
    PRINT '✓ Campo GithubLink agregado';
END
ELSE
BEGIN
    PRINT '- Campo GithubLink ya existe';
END

-- Agregar campo OwnWebsiteLink si no existe
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Usuarios' AND COLUMN_NAME = 'OwnWebsiteLink')
BEGIN
    ALTER TABLE Usuarios ADD OwnWebsiteLink NVARCHAR(255);
    PRINT '✓ Campo OwnWebsiteLink agregado';
END
ELSE
BEGIN
    PRINT '- Campo OwnWebsiteLink ya existe';
END

-- Agregar campo IsBanned si no existe
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Usuarios' AND COLUMN_NAME = 'IsBanned')
BEGIN
    ALTER TABLE Usuarios ADD IsBanned BIT DEFAULT 0 NOT NULL;
    PRINT '✓ Campo IsBanned agregado';
END
ELSE
BEGIN
    PRINT '- Campo IsBanned ya existe';
END

-- Crear tabla Roles si no existe (para la FK de RolID)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Roles')
BEGIN
    CREATE TABLE Roles (
        RolID INT PRIMARY KEY IDENTITY(1,1),
        NombreRol NVARCHAR(50) NOT NULL UNIQUE,
        Descripcion NVARCHAR(255),
        Activo BIT DEFAULT 1,
        FechaCreacion DATETIME DEFAULT GETDATE()
    );

    -- Insertar roles básicos
    INSERT INTO Roles (NombreRol, Descripcion) VALUES
    ('SuperAdmin', 'Acceso completo al sistema'),
    ('Admin', 'Administrador con permisos limitados'),
    ('Moderador', 'Puede moderar contenido'),
    ('Usuario', 'Usuario estándar'),
    ('UsuarioNuevo', 'Usuario recién registrado con permisos limitados');

    PRINT '✓ Tabla Roles creada con roles básicos';
END
ELSE
BEGIN
    PRINT '- Tabla Roles ya existe';
END

-- Agregar constraint FK para RolID si no existe
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_NAME = 'FK_Usuarios_Roles')
BEGIN
    -- Solo agregar FK si RolID existe y Roles existe
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Usuarios' AND COLUMN_NAME = 'RolID')
       AND EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Roles')
    BEGIN
        ALTER TABLE Usuarios ADD CONSTRAINT FK_Usuarios_Roles FOREIGN KEY (RolID) REFERENCES Roles(RolID);
        PRINT '✓ Constraint FK_Usuarios_Roles agregada';
    END
END
ELSE
BEGIN
    PRINT '- Constraint FK_Usuarios_Roles ya existe';
END

-- Verificar los campos agregados
PRINT '';
PRINT 'Verificación final de la estructura de la tabla Usuarios:';
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Usuarios'
AND COLUMN_NAME IN ('FechaNacimiento', 'RolID', 'LinkedInLink', 'GithubLink', 'OwnWebsiteLink', 'IsBanned')
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT '🎉 Actualización del esquema completada exitosamente!';
PRINT '';
PRINT 'Campos agregados/verificados:';
PRINT '- FechaNacimiento: Para fecha de nacimiento del usuario';
PRINT '- RolID: Para referencia a la tabla Roles';
PRINT '- LinkedInLink: Para enlace de LinkedIn';
PRINT '- GithubLink: Para enlace de GitHub';
PRINT '- OwnWebsiteLink: Para sitio web personal';
PRINT '- IsBanned: Para control de usuarios baneados';
