-- Inserts para la tabla Usuarios
INSERT INTO Usuarios (UserName, FirstName, MiddleName, LastName, SecondLastName, Email, WorkCity, PasswordHash, Role) VALUES
('anarod', 'Ana', 'Isabel', 'Rodriguez', 'Garcia', 'ana.rodriguez@example.com', 'Madrid', 'hash1', 'user'),
('carlosR', 'Carlos', NULL, 'Ruiz', 'Lopez', 'carlos.ruiz@example.com', 'Barcelona', 'hash2', 'user'),
('lauraM', 'Laura', 'Sofia', 'Martin', 'Sanchez', 'laura.martin@example.com', 'Valencia', 'hash3', 'admin'),
('pedroJ', 'Pedro', 'Jose', 'Jimenez', 'Gonzalez', 'pedro.jimenez@example.com', 'Sevilla', 'hash4', 'user'),
('sofiaMo', 'Sofia', 'Carmen', 'Moreno', 'Fernandez', 'sofia.moreno@example.com', 'Zaragoza', 'hash5', 'user'),
('elenaV', 'Elena', 'Maria', 'Vidal', 'Ruiz', 'elena.vidal@example.com', 'Bilbao', 'hash6', 'user'),
('javierG', 'Javier', NULL, 'Gomez', 'Santos', 'javier.gomez@example.com', 'Málaga', 'hash7', 'user'),
('carmenD', 'Carmen', NULL, 'Diaz', 'Perez', 'carmen.diaz@example.com', 'Murcia', 'hash8', 'admin'),
('adrianMo', 'Adrian', 'Luis', 'Moreno', 'Jimenez', 'adrian.moreno@example.com', 'Palma', 'hash9', 'user'),
('isabelN', 'Isabel', 'Clara', 'Navarro', 'García', 'isabel.navarro@example.com', 'Las Palmas', 'hash10', 'user'),
('sergioR', 'Sergio', 'Miguel', 'Ramos', 'Blanco', 'sergio.ramos@example.com', 'Alicante', 'hash11', 'user'),
('nataliaO', 'Natalia', 'Eva', 'Ortega', 'Sanz', 'natalia.ortega@example.com', 'Córdoba', 'hash12', 'user'),
('davidI', 'David', 'José', 'Iglesias', 'Nuñez', 'david.iglesias@example.com', 'Valladolid', 'hash13', 'user'),
('beatrizA', 'Beatriz', 'Ana', 'Alonso', 'Gallego', 'beatriz.alonso@example.com', 'Vigo', 'hash14', 'user'),
('robertoF', 'Roberto', 'Carlos', 'Flores', 'Castillo', 'roberto.flores@example.com', 'Gijón', 'hash15', 'user'),
('monicaP', 'Monica', 'Sofia', 'Pascual', 'Rey', 'monica.pascual@example.com', 'Hospitalet', 'hash16', 'user'),
('danielH', 'Daniel', 'Alberto', 'Herrera', 'Cruz', 'daniel.herrera@example.com', 'Vitoria', 'hash17', 'user'),
('luciaV', 'Lucia', 'Isabel', 'Vicente', 'Bravo', 'lucia.vicente@example.com', 'Granada', 'hash18', 'user'),
('oscarG', 'Oscar', 'Manuel', 'Guerrero', 'Molina', 'oscar.guerrero@example.com', 'Elche', 'hash19', 'user'),
('raquelDo', 'Raquel', 'Patricia', 'Dominguez', 'Leon', 'raquel.dominguez@example.com', 'A Coruña', 'hash20', 'user');

-- Inserts para la tabla Habilidades
INSERT INTO Habilidades (NombreHabilidad, Categoria, Descripcion) VALUES
('Desarrollo Web Frontend', 'Informática', 'Creación de interfaces de usuario interactivas y responsivas.'),
('Desarrollo Web Backend', 'Informática', 'Desarrollo de la lógica del servidor y APIs.'),
('Contabilidad Financiera', 'Contabilidad', 'Gestión y análisis de registros financieros.'),
('Cocina Internacional', 'Gastronomia', 'Preparación de platos de diversas culturas.'),
('Instalaciones Eléctricas', 'Electricidad', 'Diseño e implementación de sistemas eléctricos.'),
('Reparación de Aires Acondicionados', 'Refrigeración', 'Mantenimiento y reparación de sistemas de climatización.'),
('Análisis de Datos con Python', 'Informática', 'Uso de Python para la manipulación y análisis de datos.'),
('Diseño Gráfico', 'Informática', 'Creación de elementos visuales para comunicación.'),
('Marketing Digital', 'Marketing', 'Estrategias de marketing online, SEO, SEM y redes sociales.'),
('Desarrollo de Aplicaciones Móviles', 'Informática', 'Creación de aplicaciones para iOS y Android.'),
('Arquitectura Cloud', 'Informática', 'Diseño y gestión de infraestructura en la nube.'),
('Fotografía Profesional', 'Artes Visuales', 'Captura y edición de imágenes de alta calidad.'),
('Redacción Creativa', 'Marketing', 'Creación de contenido original y persuasivo.'),
('Edición de Video', 'Artes Visuales', 'Montaje y postproducción de material audiovisual.'),
('Consultoría de Negocios', 'Gestión', 'Asesoramiento estratégico para empresas.'),
('Enseñanza de Idiomas (Inglés)', 'Idiomas', 'Clases y tutorías de inglés para todos los niveles.'),
('Gestión de Proyectos Ágiles', 'Informática', 'Liderazgo de proyectos utilizando metodologías ágiles.'),
('Soporte Técnico IT', 'Informática', 'Resolución de problemas técnicos de hardware y software.'),
('Carpintería Fina', 'Artes Visuales', 'Creación y restauración de muebles de madera.'),
('Jardinería y Paisajismo', 'Gestión', 'Diseño y mantenimiento de espacios verdes.');

-- Inserts para la tabla UsuariosHabilidades
-- (UsuarioID, HabilidadID, TipoHabilidad, NivelProficiencia)
INSERT INTO UsuariosHabilidades (UsuarioID, HabilidadID, TipoHabilidad, NivelProficiencia) VALUES
(1, 1, 'Ofrece', 'Avanzado'), (1, 7, 'Busca', 'Intermedio'),
(2, 2, 'Ofrece', 'Experto'), (2, 8, 'Busca', 'Principiante'),
(3, 8, 'Ofrece', 'Avanzado'), (3, 1, 'Busca', 'Intermedio'),
(4, 7, 'Ofrece', 'Experto'), (4, 3, 'Busca', 'Principiante'),
(5, 4, 'Ofrece', 'Avanzado'), (5, 5, 'Busca', 'Intermedio'),
(6, 9, 'Ofrece', 'Experto'), (6, 13, 'Busca', 'Intermedio'),
(7, 10, 'Ofrece', 'Avanzado'), (7, 14, 'Busca', 'Principiante'),
(8, 11, 'Ofrece', 'Experto'), (8, 15, 'Busca', 'Intermedio'),
(9, 12, 'Ofrece', 'Avanzado'), (9, 16, 'Busca', 'Principiante'),
(10, 13, 'Ofrece', 'Experto'), (10, 17, 'Busca', 'Intermedio'),
(11, 14, 'Ofrece', 'Avanzado'), (11, 18, 'Busca', 'Principiante'),
(12, 15, 'Ofrece', 'Experto'), (12, 19, 'Busca', 'Intermedio'),
(13, 16, 'Ofrece', 'Avanzado'), (13, 20, 'Busca', 'Principiante'),
(14, 17, 'Ofrece', 'Experto'), (14, 1, 'Busca', 'Intermedio'),
(15, 18, 'Ofrece', 'Avanzado'), (15, 2, 'Busca', 'Principiante'),
(16, 19, 'Ofrece', 'Experto'), (16, 3, 'Busca', 'Intermedio'),
(17, 20, 'Ofrece', 'Avanzado'), (17, 4, 'Busca', 'Principiante'),
(18, 1, 'Ofrece', 'Experto'), (18, 5, 'Busca', 'Intermedio'),
(19, 2, 'Ofrece', 'Avanzado'), (19, 6, 'Busca', 'Principiante'),
(20, 3, 'Ofrece', 'Experto'), (20, 7, 'Busca', 'Intermedio');

-- Inserts para la tabla Posts
-- (UsuarioID, TipoPost, HabilidadID, Descripcion)
INSERT INTO Posts (UsuarioID, TipoPost, HabilidadID, Descripcion) VALUES
(1, 'Ofrece', 1, 'Desarrollador Frontend con 5 años de experiencia en React y Vue.'),
(2, 'Busca', 8, 'Necesito diseñador gráfico para logo de startup tecnológica.'),
(3, 'Ofrece', 8, 'Diseño gráfico creativo y moderno. Portfolio disponible.'),
(4, 'Busca', 3, 'Busco asesor contable para pequeña empresa en crecimiento.'),
(5, 'Ofrece', 4, 'Clases de cocina italiana y mediterránea a domicilio.'),
(6, 'Ofrece', 9, 'Especialista en SEO y SEM para mejorar tu ranking.'),
(7, 'Busca', 14, 'Necesito editor de video para canal de YouTube sobre viajes.'),
(8, 'Ofrece', 11, 'Arquitecto Cloud certificado en AWS y Azure. Soluciones escalables.'),
(9, 'Busca', 16, 'Busco profesor de inglés para clases de conversación.'),
(10, 'Ofrece', 13, 'Redacción de artículos y contenido web optimizado para SEO.'),
(11, 'Ofrece', 14, 'Edición profesional de videos para bodas y eventos.'),
(12, 'Busca', 19, 'Necesito carpintero para muebles a medida.'),
(13, 'Ofrece', 16, 'Clases particulares de inglés, todos los niveles, online o presencial.'),
(14, 'Busca', 1, 'Busco desarrollador frontend para proyecto personal con Angular.'),
(15, 'Ofrece', 18, 'Soporte técnico IT para empresas y particulares. Rápido y eficiente.'),
(16, 'Ofrece', 19, 'Diseño y fabricación de muebles únicos en madera noble.'),
(17, 'Busca', 4, 'Busco chef para evento privado de 20 personas.'),
(18, 'Ofrece', 1, 'Desarrollo de aplicaciones web completas (Fullstack).'),
(19, 'Busca', 6, 'Necesito técnico de aire acondicionado urgente para local comercial.'),
(20, 'Ofrece', 3, 'Asesoría financiera y contable para autónomos y PYMES.');

-- Inserts para la tabla Emparejamientos
-- (Usuario1ID, Usuario2ID, Habilidad1ID, Habilidad2ID, EstadoEmparejamiento)
INSERT INTO Emparejamientos (Usuario1ID, Usuario2ID, Habilidad1ID, Habilidad2ID, EstadoEmparejamiento) VALUES
(1, 2, 1, 8, 'Pendiente'), (3, 4, 8, 3, 'Aceptado'),
(5, 6, 4, 9, 'Completado'), (7, 8, 10, 11, 'Pendiente'),
(9, 10, 12, 13, 'Rechazado'), (11, 12, 14, 15, 'Aceptado'),
(13, 14, 16, 1, 'Pendiente'), (15, 16, 18, 19, 'Completado'),
(17, 18, 20, 1, 'Pendiente'), (19, 20, 2, 3, 'Aceptado'),
(1, 3, 1, 8, 'Pendiente'), (2, 4, 2, 3, 'Completado'),
(5, 7, 4, 10, 'Pendiente'), (6, 8, 9, 11, 'Aceptado'),
(9, 11, 12, 14, 'Rechazado'), (10, 12, 13, 15, 'Pendiente'),
(13, 15, 16, 18, 'Completado'), (14, 16, 17, 19, 'Pendiente'),
(17, 19, 20, 2, 'Aceptado'), (18, 20, 1, 3, 'Pendiente');

-- Inserts para la tabla Resenas
-- (EmparejamientoID, RevisorID, UsuarioRevisadoID, Calificacion, Comentario)
-- Asumiendo que los EmparejamientoID 3, 8, 10, 12, 15, 17, 19 están 'Completado' o 'Aceptado' y pueden tener reseñas
INSERT INTO Resenas (EmparejamientoID, RevisorID, UsuarioRevisadoID, Calificacion, Comentario) VALUES
(3, 5, 6, 5, 'Excelente colaboración, muy profesional y creativo.'),
(3, 6, 5, 4, 'Buen trabajo, cumplió con las expectativas.'),
(8, 15, 16, 5, 'Servicio impecable y muy amable. Recomendado!'),
(8, 16, 15, 5, 'Gran profesional, solucionó mi problema rápidamente.'),
(10, 19, 20, 4, 'Muy satisfecho con el resultado del emparejamiento.'),
(10, 20, 19, 5, 'Comunicación fluida y trabajo de calidad.'),
(12, 2, 4, 3, 'Podría mejorar en la comunicación, pero el trabajo final fue bueno.'),
(12, 4, 2, 4, 'Conocimientos sólidos, aunque un poco lento en la entrega.'),
(15, 13, 15, 5, '¡Fantástico! Superó mis expectativas.'),
(15, 15, 13, 5, 'Un placer trabajar con esta persona.'),
(17, 17, 19, 4, 'Buen servicio, lo recomiendo.'),
(17, 19, 17, 4, 'Correcto y profesional.'),
(1, 1, 2, 5, 'Muy buen trato, aunque no se concretó.'), -- Reseña sobre un emparejamiento pendiente
(2, 3, 4, 4, 'Respuesta rápida y profesional.'), -- Reseña sobre un emparejamiento aceptado
(4, 7, 8, 5, 'Parece muy competente.'),
(5, 9, 10, 2, 'No respondió a mis mensajes.'),
(6, 11, 12, 4, 'Interesante propuesta.'),
(7, 13, 14, 5, 'Muy profesional en el contacto inicial.'),
(9, 17, 18, 3, 'No estoy seguro de si es lo que busco.'),
(11, 1, 3, 4, 'Buena comunicación.');


-- Inserts para la tabla Programacion
-- (EmparejamientoID, FechaSesion, DuracionMinutos, Estado)
-- Asumiendo que los EmparejamientoID 2, 6, 11, 14, 16, 18, 20 están 'Aceptado' y pueden programarse
INSERT INTO Programacion (EmparejamientoID, FechaSesion, DuracionMinutos, Estado) VALUES
(2, DATEADD(day, 7, GETDATE()), 60, 'Programada'),
(2, DATEADD(day, 10, GETDATE()), 90, 'Completada'), -- Sesión completada del mismo emparejamiento
(6, DATEADD(day, 14, GETDATE()), 120, 'Programada'),
(6, DATEADD(day, 1, GETDATE()), 45, 'Cancelada'), -- Sesión cancelada
(11, DATEADD(day, 21, GETDATE()), 60, 'Programada'),
(14, DATEADD(day, 28, GETDATE()), 90, 'Programada'),
(16, DATEADD(day, 3, GETDATE()), 75, 'Completada'),
(18, DATEADD(day, 5, GETDATE()), 60, 'Programada'),
(20, DATEADD(day, 12, GETDATE()), 120, 'Programada'),
(3, DATEADD(day, 2, GETDATE()), 60, 'Completada'), -- EmparejamientoID 3 (Completado)
(8, DATEADD(day, 4, GETDATE()), 90, 'Completada'), -- EmparejamientoID 8 (Completado)
(10, DATEADD(day, 6, GETDATE()), 45, 'Completada'), -- EmparejamientoID 10 (Completado)
(12, DATEADD(day, 8, GETDATE()), 120, 'Completada'), -- EmparejamientoID 12 (Completado)
(15, DATEADD(day, 9, GETDATE()), 60, 'Completada'), -- EmparejamientoID 15 (Completado)
(17, DATEADD(day, 11, GETDATE()), 75, 'Completada'), -- EmparejamientoID 17 (Completado)
(19, DATEADD(day, 13, GETDATE()), 90, 'Completada'), -- EmparejamientoID 19 (Completado)
(1, DATEADD(day, 15, GETDATE()), 30, 'Programada'), -- EmparejamientoID 1 (Pendiente)
(4, DATEADD(day, 16, GETDATE()), 60, 'Programada'), -- EmparejamientoID 4 (Pendiente)
(5, DATEADD(day, 17, GETDATE()), 90, 'Cancelada'), -- EmparejamientoID 5 (Pendiente)
(7, DATEADD(day, 18, GETDATE()), 45, 'Programada'); -- EmparejamientoID 7 (Pendiente)

-- Inserts para la tabla Auditoria
-- (UsuarioID, Accion, TablaAfectada, DireccionIP, Detalles)
INSERT INTO Auditoria (UsuarioID, Accion, TablaAfectada, DireccionIP, Detalles) VALUES
(1, 'LOGIN_SUCCESS', 'Usuarios', '192.168.1.10', 'Usuario anarod inició sesión'),
(3, 'UPDATE_PROFILE', 'Usuarios', '10.0.0.5', 'Admin lauraM actualizó su correo'),
(2, 'CREATE_POST', 'Posts', '172.16.0.88', 'Usuario carlosR creó un nuevo post'),
(4, 'SEARCH_SKILL', 'Habilidades', '192.168.1.12', 'Usuario pedroJ buscó "Contabilidad"'),
(1, 'LOGOUT', 'Usuarios', '192.168.1.10', 'Usuario anarod cerró sesión'),
(3, 'VIEW_ADMIN_PANEL', 'N/A', '10.0.0.5', 'Admin lauraM accedió al panel de admin'),
(5, 'CREATE_MATCH_REQUEST', 'Emparejamientos', '203.0.113.45', 'Usuario sofiaMo solicitó emparejamiento'),
(6, 'UPDATE_POST', 'Posts', '198.51.100.2', 'Usuario elenaV actualizó su post ID 6'),
(8, 'CANCEL_SESSION', 'Programacion', '10.0.0.15', 'Admin carmenD canceló sesión ID 4'),
(7, 'ADD_REVIEW', 'Resenas', '172.16.0.90', 'Usuario javierG añadió reseña al emparejamiento ID 2'),
(10, 'LOGIN_FAILURE', 'Usuarios', '192.168.3.33', 'Intento fallido de login para isabelN'),
(11, 'CHANGE_PASSWORD', 'Usuarios', '10.1.1.1', 'Usuario sergioR cambió su contraseña'),
(13, 'DELETE_POST', 'Posts', '172.17.5.5', 'Usuario davidI eliminó post ID 10'),
(15, 'ACCEPT_MATCH', 'Emparejamientos', '192.168.10.20', 'Usuario robertoF aceptó emparejamiento ID 6'),
(18, 'SCHEDULE_SESSION', 'Programacion', '10.5.5.50', 'Usuario luciaV programó sesión para emparejamiento ID 18'),
(20, 'VIEW_PROFILE', 'Usuarios', '172.18.0.100', 'Usuario raquelDo vio perfil de anarod'),
(3, 'CREATE_USER', 'Usuarios', '10.0.0.5', 'Admin lauraM creó nuevo usuario testUser'),
(1, 'UPDATE_SKILL_USER', 'UsuariosHabilidades', '192.168.1.10', 'Usuario anarod actualizó su habilidad de Frontend'),
(2, 'VIEW_POST_DETAILS', 'Posts', '172.16.0.88', 'Usuario carlosR vio detalles del post ID 1'),
(4, 'SEND_MESSAGE', 'N/A', '192.168.1.12', 'Usuario pedroJ envió mensaje a sofiaMo');
