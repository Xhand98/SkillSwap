-- USUARIOS
create table Usuarios
(
    UsuarioID         int identity primary key,
    NombreUsuario     nvarchar(50) not null unique,
    PrimerNombre      nvarchar(50) not null,
    SegundoNombre     nvarchar(50),
    PrimerApellido    nvarchar(50) not null,
    SegundoApellido   nvarchar(50),
    CorreoElectronico nvarchar(100) not null unique,
    CiudadTrabajo     nvarchar(50) not null,
    HashContrasena    nvarchar(256) not null,
    FechaCreacion     datetime     default getdate(),
    Rol               nvarchar(10) default 'user' check ([Rol] = 'admin' OR [Rol] = 'user'),
    FechaNacimiento   nvarchar(50),
    isBanned          bit default 0 not null
)
go
create index idx_NombreUsuario on Usuarios (NombreUsuario)
go
create index idx_CorreoElectronico on Usuarios (CorreoElectronico)
go
create index CiudadTrabajo on Usuarios (CiudadTrabajo)
go

-- HABILIDADES
create table Habilidades
(
    HabilidadID     int identity
        primary key,
    NombreHabilidad nvarchar(100) not null,
    Categoria       nvarchar(50)
        constraint CK_Categoria
            check ([Categoria] = 'Otros' OR [Categoria] = 'Ciencia' OR [Categoria] = 'Educación' OR
                   [Categoria] = 'Negocios' OR [Categoria] = 'Cocina' OR [Categoria] = 'Deportes' OR
                   [Categoria] = 'Idiomas' OR [Categoria] = 'Artes' OR [Categoria] = 'Tecnología' OR
                   [Categoria] = 'Refrigeración' OR [Categoria] = 'Electricidad' OR [Categoria] = 'Gastronomia' OR
                   [Categoria] = 'Contabilidad' OR [Categoria] = 'Informática'),
    Descripcion     nvarchar(max)
)
go

create index idx_NombreHabilidad
    on Habilidades (NombreHabilidad)
go


-- USUARIOS_HABILIDADES

create table UsuariosHabilidades
(
    UsuarioHabilidadID int identity primary key,
    UsuarioID          int references Usuarios,
    HabilidadID        int references Habilidades,
    TipoHabilidad      nvarchar(10) check ([TipoHabilidad] = 'Busca' OR [TipoHabilidad] = 'Ofrece'),
    NivelProficiencia  nvarchar(20)
)
go
create index idx_UsuarioID on UsuariosHabilidades (UsuarioID)
go
create index idx_HabilidadID on UsuariosHabilidades (HabilidadID)
go

-- EMPAJERAMINETOS
create table Emparejamientos
(
    EmparejamientoID     int identity primary key,
    Usuario1ID           int references Usuarios,
    Usuario2ID           int references Usuarios,
    Habilidad1ID         int references Habilidades,
    Habilidad2ID         int references Habilidades,
    EstadoEmparejamiento nvarchar(20) default 'Pendiente',
    FechaCreacion        datetime     default getdate()
)
go
create index idx_Usuario1ID on Emparejamientos (Usuario1ID)
go
create index idx_Usuario2ID on Emparejamientos (Usuario2ID)
go
create index idx_Habilidad1ID on Emparejamientos (Habilidad1ID)
go
create index idx_Habilidad2ID on Emparejamientos (Habilidad2ID)
go


-- POSTS
create table Posts
(
    PostID      int identity primary key,
    UsuarioID   int references Usuarios,
    TipoPost    nvarchar(20),
    HabilidadID int references Habilidades,
    Descripcion nvarchar(max),
    CreatedAt   datetime default getdate(),
    UpdatedAt   datetime default getdate()
)
go
create index idx_UsuarioID_Posts on Posts (UsuarioID)
go

-- Notificaciones
create table Notificaciones
(
    NotificacionID int identity primary key,
    UsuarioID      int           not null constraint FK_Notificaciones_Usuarios references Usuarios,
    Tipo           nvarchar(50)  not null,
    Titulo         nvarchar(100) not null,
    Contenido      nvarchar(500) not null,
    ReferenciaID   int,
    FechaCreacion  datetime default getdate(),
    Leida          bit      default 0,
    FechaLectura   datetime
)
go
create index idx_notificaciones_usuario on Notificaciones (UsuarioID)
go
create index idx_notificaciones_tipo on Notificaciones (Tipo)
go
