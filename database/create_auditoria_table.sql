-- Script para crear tabla de Auditoria para SkillSwap
-- Fecha: 27 de mayo de 2025
USE SkillSwapDB;
GO

-- Crear tabla Auditoria si no existe
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Auditoria')
BEGIN
    CREATE TABLE Auditoria (
        AuditoriaID INT PRIMARY KEY IDENTITY(1,1),
        TipoOperacion NVARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
        NombreTabla NVARCHAR(50) NOT NULL,
        RegistroID INT,
        DatosAnteriores NVARCHAR(MAX),
        DatosNuevos NVARCHAR(MAX),
        UsuarioID INT,
        FechaOperacion DATETIME DEFAULT GETDATE(),
        DireccionIP NVARCHAR(45),
        UserAgent NVARCHAR(255)
    );
    PRINT '✅ Tabla Auditoria creada exitosamente';
END
ELSE
BEGIN
    PRINT '- Tabla Auditoria ya existe';
END

-- Verificar la estructura de la tabla
PRINT '';
PRINT 'Estructura de la tabla Auditoria:';
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Auditoria'
ORDER BY ORDINAL_POSITION;

PRINT '';
PRINT '🎉 Setup de auditoría completado!';
