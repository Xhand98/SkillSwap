-- Script SEGURO para hacer TRUNCATE con backup opcional
-- Este script permite hacer backup antes de truncar

USE SkillSwapDB;
GO

-- OPCIÓN 1: Crear backup de datos importantes (opcional)
-- Descomenta las siguientes líneas si quieres hacer backup antes de truncar

/*
-- Backup de usuarios
SELECT * INTO Usuarios_Backup FROM Usuarios;
PRINT 'Backup de Usuarios creado';

-- Backup de habilidades
SELECT * INTO Habilidades_Backup FROM Habilidades;
PRINT 'Backup de Habilidades creado';

-- Backup de emparejamientos
SELECT * INTO Emparejamientos_Backup FROM Emparejamientos;
PRINT 'Backup de Emparejamientos creado';

-- Backup de posts (si existe)
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Posts')
BEGIN
    SELECT * INTO Posts_Backup FROM Posts;
    PRINT 'Backup de Posts creado';
END
*/

-- TRUNCATE SEGURO CON VERIFICACIÓN
PRINT 'INICIANDO PROCESO DE TRUNCATE...';
PRINT 'Este proceso eliminará TODOS los datos de la base de datos';
PRINT 'Presiona Ctrl+C ahora si no estás seguro';

-- Contar registros antes del truncate
DECLARE @TotalUsuarios INT, @TotalHabilidades INT, @TotalEmparejamientos INT, @TotalPosts INT;

SELECT @TotalUsuarios = COUNT(*) FROM Usuarios;
SELECT @TotalHabilidades = COUNT(*) FROM Habilidades;
SELECT @TotalEmparejamientos = COUNT(*) FROM Emparejamientos;

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Posts')
    SELECT @TotalPosts = COUNT(*) FROM Posts;
ELSE
    SET @TotalPosts = 0;

PRINT 'DATOS ACTUALES EN LA BASE DE DATOS:';
PRINT 'Usuarios: ' + CAST(@TotalUsuarios AS VARCHAR(10));
PRINT 'Habilidades: ' + CAST(@TotalHabilidades AS VARCHAR(10));
PRINT 'Emparejamientos: ' + CAST(@TotalEmparejamientos AS VARCHAR(10));
PRINT 'Posts: ' + CAST(@TotalPosts AS VARCHAR(10));
PRINT '';

-- Esperar 3 segundos antes de continuar
WAITFOR DELAY '00:00:03';

-- Deshabilitar restricciones de claves foráneas
EXEC sp_msforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all"
GO

BEGIN TRY
    BEGIN TRANSACTION;

    -- TRUNCATE en orden correcto

    -- Nivel 4: Tablas que dependen de múltiples tablas
    TRUNCATE TABLE Auditoria;
    PRINT '✓ Auditoria truncated';

    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Notificaciones')
    BEGIN
        TRUNCATE TABLE Notificaciones;
        PRINT '✓ Notificaciones truncated';
    END

    TRUNCATE TABLE Resenas;
    PRINT '✓ Resenas truncated';

    TRUNCATE TABLE Programacion;
    PRINT '✓ Programacion truncated';

    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Sesiones')
    BEGIN
        TRUNCATE TABLE Sesiones;
        PRINT '✓ Sesiones truncated';
    END

    -- Nivel 3: Posts (depende de Usuarios y Habilidades)
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Posts')
    BEGIN
        TRUNCATE TABLE Posts;
        PRINT '✓ Posts truncated';
    END

    -- Nivel 2: Tablas de relación
    TRUNCATE TABLE Emparejamientos;
    PRINT '✓ Emparejamientos truncated';

    TRUNCATE TABLE UsuariosHabilidades;
    PRINT '✓ UsuariosHabilidades truncated';

    -- Nivel 1: Tablas base
    TRUNCATE TABLE Usuarios;
    PRINT '✓ Usuarios truncated';

    TRUNCATE TABLE Habilidades;
    PRINT '✓ Habilidades truncated';

    COMMIT TRANSACTION;
    PRINT '';
    PRINT '✅ TRUNCATE COMPLETADO EXITOSAMENTE';

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT '';
    PRINT '❌ ERROR DURANTE EL TRUNCATE:';
    PRINT ERROR_MESSAGE();

    -- Rehabilitar restricciones en caso de error
    EXEC sp_msforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all"
    RETURN;
END CATCH

-- Rehabilitar restricciones de claves foráneas
EXEC sp_msforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all"
GO

-- Resetear contadores IDENTITY
PRINT '';
PRINT 'Reseteando contadores IDENTITY...';

DBCC CHECKIDENT ('Usuarios', RESEED, 0);
DBCC CHECKIDENT ('Habilidades', RESEED, 0);
DBCC CHECKIDENT ('UsuariosHabilidades', RESEED, 0);
DBCC CHECKIDENT ('Emparejamientos', RESEED, 0);
DBCC CHECKIDENT ('Resenas', RESEED, 0);
DBCC CHECKIDENT ('Programacion', RESEED, 0);
DBCC CHECKIDENT ('Auditoria', RESEED, 0);

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Notificaciones')
    DBCC CHECKIDENT ('Notificaciones', RESEED, 0);

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Sesiones')
    DBCC CHECKIDENT ('Sesiones', RESEED, 0);

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Posts')
    DBCC CHECKIDENT ('Posts', RESEED, 0);

PRINT '✅ Contadores IDENTITY reseteados';
PRINT '';
PRINT '🎉 PROCESO COMPLETO:';
PRINT '   - Todas las tablas han sido limpiadas';
PRINT '   - Contadores IDENTITY reseteados a 0';
PRINT '   - Restricciones de claves foráneas restauradas';
PRINT '';
PRINT '⚠️  ADVERTENCIA: Todos los datos han sido eliminados';

-- Verificar que las tablas están vacías
PRINT '';
PRINT 'VERIFICACIÓN FINAL:';
SELECT 'Usuarios' as Tabla, COUNT(*) as Registros FROM Usuarios
UNION ALL
SELECT 'Habilidades', COUNT(*) FROM Habilidades
UNION ALL
SELECT 'UsuariosHabilidades', COUNT(*) FROM UsuariosHabilidades
UNION ALL
SELECT 'Emparejamientos', COUNT(*) FROM Emparejamientos;

GO
