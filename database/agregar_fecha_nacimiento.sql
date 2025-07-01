-- Script rápido para agregar solo los campos de redes sociales y fecha de nacimiento
-- Usar si solo necesitas estos campos específicos

USE SkillSwapDB;
GO

-- Agregar fecha de nacimiento
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Usuarios' AND COLUMN_NAME = 'FechaNacimiento')
BEGIN
    ALTER TABLE Usuarios ADD FechaNacimiento NVARCHAR(50);
    PRINT 'Campo FechaNacimiento agregado';
END

-- Agregar enlaces sociales
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Usuarios' AND COLUMN_NAME = 'LinkedInLink')
BEGIN
    ALTER TABLE Usuarios ADD LinkedInLink NVARCHAR(255);
    PRINT 'Campo LinkedInLink agregado';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Usuarios' AND COLUMN_NAME = 'GithubLink')
BEGIN
    ALTER TABLE Usuarios ADD GithubLink NVARCHAR(255);
    PRINT 'Campo GithubLink agregado';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Usuarios' AND COLUMN_NAME = 'OwnWebsiteLink')
BEGIN
    ALTER TABLE Usuarios ADD OwnWebsiteLink NVARCHAR(255);
    PRINT 'Campo OwnWebsiteLink agregado';
END

PRINT 'Campos de redes sociales y fecha de nacimiento agregados correctamente';
