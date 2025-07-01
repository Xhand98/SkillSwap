-- Crear tabla de notificaciones si no existe
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Notificaciones')
BEGIN
    CREATE TABLE Notificaciones (
        NotificacionID INT IDENTITY(1,1) PRIMARY KEY,
        UsuarioID INT NOT NULL,
        Tipo NVARCHAR(50) NOT NULL,
        Titulo NVARCHAR(100) NOT NULL,
        Contenido NVARCHAR(500) NOT NULL,
        ReferenciaID INT,
        FechaCreacion DATETIME DEFAULT GETDATE(),
        Leida BIT DEFAULT 0,
        FechaLectura DATETIME,
        CONSTRAINT FK_Notificaciones_Usuarios FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID)
    );

    -- Índices para mejorar el rendimiento
    CREATE INDEX idx_notificaciones_usuario ON Notificaciones(UsuarioID);
    CREATE INDEX idx_notificaciones_tipo ON Notificaciones(Tipo);
    CREATE INDEX idx_notificaciones_leida ON Notificaciones(Leida);

    PRINT 'Tabla Notificaciones creada correctamente';
END
ELSE
BEGIN
    PRINT 'La tabla Notificaciones ya existe';
END
