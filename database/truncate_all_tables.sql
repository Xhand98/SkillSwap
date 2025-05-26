-- Script para hacer TRUNCATE de todas las tablas en orden correcto
-- Respetando las restricciones de claves foráneas

-- IMPORTANTE: Ejecutar este script eliminará TODOS los datos de la base de datos
-- Usar con precaución

USE SkillSwapDB;
GO

-- Deshabilitar las restricciones de claves foráneas temporalmente
EXEC sp_msforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all"
GO

-- 1. Tablas que dependen de otras (orden de mayor a menor dependencia)

-- Auditoria (depende de Usuarios)
TRUNCATE TABLE Auditoria;
PRINT 'Tabla Auditoria truncated';

-- Notificaciones (depende de Usuarios)
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Notificaciones')
BEGIN
    TRUNCATE TABLE Notificaciones;
    PRINT 'Tabla Notificaciones truncated';
END

-- Resenas (depende de Emparejamientos y Usuarios)
TRUNCATE TABLE Resenas;
PRINT 'Tabla Resenas truncated';

-- Programacion (depende de Emparejamientos)
TRUNCATE TABLE Programacion;
PRINT 'Tabla Programacion truncated';

-- Sesiones (depende de Emparejamientos)
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Sesiones')
BEGIN
    TRUNCATE TABLE Sesiones;
    PRINT 'Tabla Sesiones truncated';
END

-- Posts (depende de Usuarios y Habilidades)
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Posts')
BEGIN
    TRUNCATE TABLE Posts;
    PRINT 'Tabla Posts truncated';
END

-- Emparejamientos (depende de Usuarios y Habilidades)
TRUNCATE TABLE Emparejamientos;
PRINT 'Tabla Emparejamientos truncated';

-- UsuariosHabilidades (depende de Usuarios y Habilidades)
TRUNCATE TABLE UsuariosHabilidades;
PRINT 'Tabla UsuariosHabilidades truncated';

-- 2. Tablas base (sin dependencias o con menos dependencias)

-- Usuarios (tabla principal de usuarios)
TRUNCATE TABLE Usuarios;
PRINT 'Tabla Usuarios truncated';

-- Habilidades (tabla principal de habilidades)
TRUNCATE TABLE Habilidades;
PRINT 'Tabla Habilidades truncated';

-- Rehabilitar las restricciones de claves foráneas
EXEC sp_msforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all"
GO

-- Resetear los contadores de IDENTITY para todas las tablas
DBCC CHECKIDENT ('Usuarios', RESEED, 0);
DBCC CHECKIDENT ('Habilidades', RESEED, 0);
DBCC CHECKIDENT ('UsuariosHabilidades', RESEED, 0);
DBCC CHECKIDENT ('Emparejamientos', RESEED, 0);
DBCC CHECKIDENT ('Resenas', RESEED, 0);
DBCC CHECKIDENT ('Programacion', RESEED, 0);
DBCC CHECKIDENT ('Auditoria', RESEED, 0);

-- Resetear contadores para tablas que pueden existir
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Notificaciones')
    DBCC CHECKIDENT ('Notificaciones', RESEED, 0);

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Sesiones')
    DBCC CHECKIDENT ('Sesiones', RESEED, 0);

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Posts')
    DBCC CHECKIDENT ('Posts', RESEED, 0);

PRINT 'TRUNCATE COMPLETO: Todas las tablas han sido limpiadas y los contadores IDENTITY reseteados';
PRINT 'ADVERTENCIA: Todos los datos han sido eliminados de la base de datos';

GO
