-- Crear la tabla para las sesiones
CREATE TABLE IF NOT EXISTS Sesiones (
    SesionID INT AUTO_INCREMENT PRIMARY KEY,
    EmparejamientoID INT NOT NULL,
    FechaHora DATETIME NOT NULL,
    Ubicacion VARCHAR(255) NOT NULL,
    Notas VARCHAR(500),
    Estado VARCHAR(50) NOT NULL DEFAULT 'scheduled', -- scheduled, completed, cancelled
    FechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FechaActualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (EmparejamientoID) REFERENCES Emparejamientos(EmparejamientoID)
);

-- Crear índice para mejorar las búsquedas por match
CREATE INDEX idx_sesiones_emparejamiento ON Sesiones(EmparejamientoID);

-- Crear vista para obtener información de sesiones con detalles de usuarios
CREATE OR REPLACE VIEW VistaSessionesDetalladas AS
SELECT
    s.SesionID,
    s.EmparejamientoID,
    s.FechaHora,
    s.Ubicacion,
    s.Notas,
    s.Estado,
    m.Usuario1ID,
    m.Usuario2ID,
    u1.Nombre AS NombreUsuario1,
    u1.Apellido AS ApellidoUsuario1,
    u2.Nombre AS NombreUsuario2,
    u2.Apellido AS ApellidoUsuario2,
    h1.NombreHabilidad AS Habilidad1,
    h2.NombreHabilidad AS Habilidad2
FROM
    Sesiones s
JOIN
    Emparejamientos m ON s.EmparejamientoID = m.EmparejamientoID
JOIN
    Usuarios u1 ON m.Usuario1ID = u1.UsuarioID
JOIN
    Usuarios u2 ON m.Usuario2ID = u2.UsuarioID
LEFT JOIN
    Habilidades h1 ON m.Habilidad1ID = h1.HabilidadID
LEFT JOIN
    Habilidades h2 ON m.Habilidad2ID = h2.HabilidadID;

-- Añadir trigger para auditoría
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_sesiones_insert
AFTER INSERT ON Sesiones FOR EACH ROW
BEGIN
    INSERT INTO Auditorias (TablaAfectada, IDRegistro, Accion, DatosAnteriores, DatosNuevos, FechaHora, UsuarioID)
    VALUES ('Sesiones', NEW.SesionID, 'INSERT', NULL, JSON_OBJECT(
        'EmparejamientoID', NEW.EmparejamientoID,
        'FechaHora', NEW.FechaHora,
        'Ubicacion', NEW.Ubicacion,
        'Notas', NEW.Notas,
        'Estado', NEW.Estado
    ), NOW(), NULL);
END //

CREATE TRIGGER IF NOT EXISTS after_sesiones_update
AFTER UPDATE ON Sesiones FOR EACH ROW
BEGIN
    INSERT INTO Auditorias (TablaAfectada, IDRegistro, Accion, DatosAnteriores, DatosNuevos, FechaHora, UsuarioID)
    VALUES ('Sesiones', NEW.SesionID, 'UPDATE', JSON_OBJECT(
        'EmparejamientoID', OLD.EmparejamientoID,
        'FechaHora', OLD.FechaHora,
        'Ubicacion', OLD.Ubicacion,
        'Notas', OLD.Notas,
        'Estado', OLD.Estado
    ), JSON_OBJECT(
        'EmparejamientoID', NEW.EmparejamientoID,
        'FechaHora', NEW.FechaHora,
        'Ubicacion', NEW.Ubicacion,
        'Notas', NEW.Notas,
        'Estado', NEW.Estado
    ), NOW(), NULL);
END //

CREATE TRIGGER IF NOT EXISTS after_sesiones_delete
AFTER DELETE ON Sesiones FOR EACH ROW
BEGIN
    INSERT INTO Auditorias (TablaAfectada, IDRegistro, Accion, DatosAnteriores, DatosNuevos, FechaHora, UsuarioID)
    VALUES ('Sesiones', OLD.SesionID, 'DELETE', JSON_OBJECT(
        'EmparejamientoID', OLD.EmparejamientoID,
        'FechaHora', OLD.FechaHora,
        'Ubicacion', OLD.Ubicacion,
        'Notas', OLD.Notas,
        'Estado', OLD.Estado
    ), NULL, NOW(), NULL);
END //
DELIMITER ;
