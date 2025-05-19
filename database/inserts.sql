-- Inserts para la tabla Usuarios
INSERT INTO Usuarios (NombreUsuario, PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido, CorreoElectronico, CiudadTrabajo, HashContrasena, Rol) VALUES
('devMaster', 'Ana', 'Isabel', 'García', 'Lopez', 'ana.garcia@example.com', 'Madrid', 'hashed_password_1', 'user'),
('codeNinja', 'Carlos', NULL, 'Martinez', NULL, 'carlos.martinez@example.com', 'Barcelona', 'hashed_password_2', 'user'),
('designGuru', 'Laura', NULL, 'Sanchez', NULL, 'laura.sanchez@example.com', 'Valencia', 'hashed_password_3', 'admin'),
('dataScientist', 'Pedro', 'Jose', 'Rodriguez', NULL, 'pedro.rodriguez@example.com', 'Sevilla', 'hashed_password_4', 'user'),
('projectManager', 'Sofia', NULL, 'Fernandez', NULL, 'sofia.fernandez@example.com', 'Madrid', 'hashed_password_5', 'user');

-- Inserts para la tabla Habilidades
INSERT INTO Habilidades (NombreHabilidad, Categoria, Descripcion) VALUES
('Desarrollo Web Frontend', 'Informática', 'Creación de interfaces de usuario interactivas y responsivas.'),
('Desarrollo Web Backend', 'Informática', 'Desarrollo de la lógica del servidor y APIs.'),
('Contabilidad Financiera', 'Contabilidad', 'Gestión y análisis de registros financieros.'),
('Cocina Internacional', 'Gastronomia', 'Preparación de platos de diversas culturas.'),
('Instalaciones Eléctricas Residenciales', 'Electricidad', 'Diseño e implementación de sistemas eléctricos en hogares.'),
('Reparación de Aires Acondicionados', 'Refrigeración', 'Mantenimiento y reparación de sistemas de climatización.'),
('Análisis de Datos con Python', 'Informática', 'Uso de Python para la manipulación y análisis de datos.'),
('Diseño Gráfico', 'Informática', 'Creación de elementos visuales para comunicación.');

-- Inserts para la tabla UsuariosHabilidades
-- Ana (UsuarioID: 1)
INSERT INTO UsuariosHabilidades (UsuarioID, HabilidadID, TipoHabilidad, NivelProficiencia) VALUES
(1, 1, 'Ofrece', 'Avanzado'),
(1, 7, 'Busca', 'Intermedio'),
(1, 4, 'Ofrece', 'Intermedio');

-- Carlos (UsuarioID: 2)
INSERT INTO UsuariosHabilidades (UsuarioID, HabilidadID, TipoHabilidad, NivelProficiencia) VALUES
(2, 2, 'Ofrece', 'Experto'),
(2, 8, 'Busca', 'Principiante'),
(2, 5, 'Busca', 'Principiante');

-- Laura (UsuarioID: 3)
INSERT INTO UsuariosHabilidades (UsuarioID, HabilidadID, TipoHabilidad, NivelProficiencia) VALUES
(3, 8, 'Ofrece', 'Avanzado'),
(3, 1, 'Busca', 'Intermedio');

-- Pedro (UsuarioID: 4)
INSERT INTO UsuariosHabilidades (UsuarioID, HabilidadID, TipoHabilidad, NivelProficiencia) VALUES
(4, 7, 'Ofrece', 'Experto'),
(4, 3, 'Busca', 'Principiante');

-- Sofia (UsuarioID: 5)
INSERT INTO UsuariosHabilidades (UsuarioID, HabilidadID, TipoHabilidad, NivelProficiencia) VALUES
(5, 3, 'Ofrece', 'Avanzado'),
(5, 4, 'Busca', 'Intermedio');

-- Inserts para la tabla Emparejamientos
INSERT INTO Emparejamientos (Usuario1ID, Usuario2ID, Habilidad1ID, Habilidad2ID, EstadoEmparejamiento) VALUES
(1, 2, 1, 2, 'Pendiente'), -- Ana (Frontend) con Carlos (Backend)
(3, 4, 8, 7, 'Pendiente'), -- Laura (Diseño Gráfico) con Pedro (Análisis de Datos)
(5, 1, 3, 4, 'Pendiente'), -- Sofia (Contabilidad) con Ana (Cocina Internacional)
(4, 2, 7, 2, 'Pendiente'); -- Pedro (Análisis de Datos) con Carlos (Backend)
