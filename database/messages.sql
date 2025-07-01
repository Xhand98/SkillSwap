-- Script para crear las tablas del sistema de mensajería
-- SkillSwap - Sistema de Mensajería

USE [SkillSwapDB];
GO

-- Tabla de Conversaciones
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Conversations' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[Conversations] (
        [ID] INT IDENTITY(1,1) PRIMARY KEY,
        [User1ID] INT NOT NULL,
        [User2ID] INT NOT NULL,
        [MatchID] INT NULL,
        [Title] NVARCHAR(255) NULL,
        [LastMessageAt] DATETIME NULL,
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [DeletedAt] DATETIME NULL,

        -- Constraints
        CONSTRAINT [FK_Conversations_User1] FOREIGN KEY ([User1ID])
            REFERENCES [dbo].[Usuarios]([UsuarioID]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Conversations_User2] FOREIGN KEY ([User2ID])
            REFERENCES [dbo].[Usuarios]([UsuarioID]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Conversations_Match] FOREIGN KEY ([MatchID])
            REFERENCES [dbo].[Emparejamientos]([EmparejamientoID]) ON DELETE SET NULL,
        CONSTRAINT [CK_Conversations_DifferentUsers] CHECK ([User1ID] != [User2ID])
    );

    -- Índices
    CREATE INDEX [IX_Conversations_User1ID] ON [dbo].[Conversations] ([User1ID]);
    CREATE INDEX [IX_Conversations_User2ID] ON [dbo].[Conversations] ([User2ID]);
    CREATE INDEX [IX_Conversations_MatchID] ON [dbo].[Conversations] ([MatchID]);
    CREATE INDEX [IX_Conversations_DeletedAt] ON [dbo].[Conversations] ([DeletedAt]);
    CREATE INDEX [IX_Conversations_LastMessageAt] ON [dbo].[Conversations] ([LastMessageAt] DESC);

    -- Índice único para evitar conversaciones duplicadas
    CREATE UNIQUE INDEX [IX_Conversations_Users_Unique] ON [dbo].[Conversations]
    ([User1ID], [User2ID]) WHERE [DeletedAt] IS NULL;

    PRINT 'Tabla Conversations creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla Conversations ya existe.';
END
GO

-- Tabla de Mensajes
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Messages' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[Messages] (
        [ID] INT IDENTITY(1,1) PRIMARY KEY,
        [ConversationID] INT NOT NULL,
        [SenderID] INT NOT NULL,
        [Content] NTEXT NOT NULL,
        [MessageType] NVARCHAR(50) NOT NULL DEFAULT 'text',
        [IsRead] BIT NOT NULL DEFAULT 0,
        [ReadAt] DATETIME NULL,
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [DeletedAt] DATETIME NULL,

        -- Constraints
        CONSTRAINT [FK_Messages_Conversation] FOREIGN KEY ([ConversationID])
            REFERENCES [dbo].[Conversations]([ID]) ON DELETE CASCADE,
        CONSTRAINT [FK_Messages_Sender] FOREIGN KEY ([SenderID])
            REFERENCES [dbo].[Usuarios]([UsuarioID]) ON DELETE NO ACTION,
        CONSTRAINT [CK_Messages_MessageType] CHECK ([MessageType] IN ('text', 'image', 'file'))
    );

    -- Índices
    CREATE INDEX [IX_Messages_ConversationID] ON [dbo].[Messages] ([ConversationID]);
    CREATE INDEX [IX_Messages_SenderID] ON [dbo].[Messages] ([SenderID]);
    CREATE INDEX [IX_Messages_CreatedAt] ON [dbo].[Messages] ([CreatedAt] DESC);
    CREATE INDEX [IX_Messages_DeletedAt] ON [dbo].[Messages] ([DeletedAt]);
    CREATE INDEX [IX_Messages_IsRead] ON [dbo].[Messages] ([IsRead]);
    CREATE INDEX [IX_Messages_ConversationID_CreatedAt] ON [dbo].[Messages] ([ConversationID], [CreatedAt] DESC);

    PRINT 'Tabla Messages creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla Messages ya existe.';
END
GO

-- Tabla de Participantes de Conversación
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ConversationParticipants' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[ConversationParticipants] (
        [ID] INT IDENTITY(1,1) PRIMARY KEY,
        [ConversationID] INT NOT NULL,
        [UserID] INT NOT NULL,
        [LastReadAt] DATETIME NULL,
        [NotificationsEnabled] BIT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [DeletedAt] DATETIME NULL,

        -- Constraints
        CONSTRAINT [FK_ConversationParticipants_Conversation] FOREIGN KEY ([ConversationID])
            REFERENCES [dbo].[Conversations]([ID]) ON DELETE CASCADE,
        CONSTRAINT [FK_ConversationParticipants_User] FOREIGN KEY ([UserID])
            REFERENCES [dbo].[Usuarios]([UsuarioID]) ON DELETE CASCADE
    );

    -- Índices
    CREATE INDEX [IX_ConversationParticipants_ConversationID] ON [dbo].[ConversationParticipants] ([ConversationID]);
    CREATE INDEX [IX_ConversationParticipants_UserID] ON [dbo].[ConversationParticipants] ([UserID]);
    CREATE INDEX [IX_ConversationParticipants_DeletedAt] ON [dbo].[ConversationParticipants] ([DeletedAt]);

    -- Índice único para evitar participantes duplicados
    CREATE UNIQUE INDEX [IX_ConversationParticipants_Unique] ON [dbo].[ConversationParticipants]
    ([ConversationID], [UserID]) WHERE [DeletedAt] IS NULL;

    PRINT 'Tabla ConversationParticipants creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla ConversationParticipants ya existe.';
END
GO

-- Trigger para actualizar UpdatedAt en Conversations
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_Conversations_UpdatedAt')
BEGIN
    EXEC('
    CREATE TRIGGER [dbo].[TR_Conversations_UpdatedAt]
    ON [dbo].[Conversations]
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE [dbo].[Conversations]
        SET [UpdatedAt] = GETDATE()
        FROM [dbo].[Conversations] c
        INNER JOIN inserted i ON c.[ID] = i.[ID];
    END
    ');
    PRINT 'Trigger TR_Conversations_UpdatedAt creado exitosamente.';
END
ELSE
BEGIN
    PRINT 'El trigger TR_Conversations_UpdatedAt ya existe.';
END
GO

-- Trigger para actualizar UpdatedAt en Messages
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_Messages_UpdatedAt')
BEGIN
    EXEC('
    CREATE TRIGGER [dbo].[TR_Messages_UpdatedAt]
    ON [dbo].[Messages]
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE [dbo].[Messages]
        SET [UpdatedAt] = GETDATE()
        FROM [dbo].[Messages] m
        INNER JOIN inserted i ON m.[ID] = i.[ID];
    END
    ');
    PRINT 'Trigger TR_Messages_UpdatedAt creado exitosamente.';
END
ELSE
BEGIN
    PRINT 'El trigger TR_Messages_UpdatedAt ya existe.';
END
GO

-- Trigger para actualizar UpdatedAt en ConversationParticipants
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_ConversationParticipants_UpdatedAt')
BEGIN
    EXEC('
    CREATE TRIGGER [dbo].[TR_ConversationParticipants_UpdatedAt]
    ON [dbo].[ConversationParticipants]
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE [dbo].[ConversationParticipants]
        SET [UpdatedAt] = GETDATE()
        FROM [dbo].[ConversationParticipants] cp
        INNER JOIN inserted i ON cp.[ID] = i.[ID];
    END
    ');
    PRINT 'Trigger TR_ConversationParticipants_UpdatedAt creado exitosamente.';
END
ELSE
BEGIN
    PRINT 'El trigger TR_ConversationParticipants_UpdatedAt ya existe.';
END
GO

-- Trigger para actualizar LastMessageAt en Conversations cuando se inserta un mensaje
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_Messages_UpdateConversationLastMessage')
BEGIN
    EXEC('
    CREATE TRIGGER [dbo].[TR_Messages_UpdateConversationLastMessage]
    ON [dbo].[Messages]
    AFTER INSERT
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE [dbo].[Conversations]
        SET [LastMessageAt] = i.[CreatedAt]
        FROM [dbo].[Conversations] c
        INNER JOIN inserted i ON c.[ID] = i.[ConversationID];
    END
    ');
    PRINT 'Trigger TR_Messages_UpdateConversationLastMessage creado exitosamente.';
END
ELSE
BEGIN
    PRINT 'El trigger TR_Messages_UpdateConversationLastMessage ya existe.';
END
GO

-- Datos de prueba (opcional)
-- Insertar datos de ejemplo solo si las tablas están vacías
IF NOT EXISTS (SELECT 1 FROM [dbo].[Conversations])
BEGIN
    PRINT 'Insertando datos de prueba para el sistema de mensajería...';

    -- Crear una conversación de ejemplo entre usuarios existentes
    DECLARE @User1ID INT = (SELECT TOP 1 UsuarioID FROM Usuarios ORDER BY UsuarioID);
    DECLARE @User2ID INT = (SELECT TOP 1 UsuarioID FROM Usuarios WHERE UsuarioID != @User1ID ORDER BY UsuarioID);

    IF @User1ID IS NOT NULL AND @User2ID IS NOT NULL
    BEGIN
        -- Insertar conversación
        INSERT INTO [dbo].[Conversations] ([User1ID], [User2ID], [Title])
        VALUES (@User1ID, @User2ID, 'Conversación de ejemplo');

        DECLARE @ConversationID INT = SCOPE_IDENTITY();

        -- Insertar participantes
        INSERT INTO [dbo].[ConversationParticipants] ([ConversationID], [UserID])
        VALUES
            (@ConversationID, @User1ID),
            (@ConversationID, @User2ID);

        -- Insertar mensajes de ejemplo
        INSERT INTO [dbo].[Messages] ([ConversationID], [SenderID], [Content])
        VALUES
            (@ConversationID, @User1ID, '¡Hola! ¿Cómo estás?'),
            (@ConversationID, @User2ID, '¡Hola! Todo bien, ¿y tú?'),
            (@ConversationID, @User1ID, 'Muy bien, gracias por preguntar. ¿Te gustaría hacer un intercambio de habilidades?');

        PRINT 'Datos de prueba insertados exitosamente.';
    END
    ELSE
    BEGIN
        PRINT 'No se encontraron usuarios suficientes para crear datos de prueba.';
    END
END
ELSE
BEGIN
    PRINT 'Ya existen conversaciones. Saltando inserción de datos de prueba.';
END
GO

PRINT 'Script de migración de mensajería completado exitosamente.';
PRINT 'Tablas creadas: Conversations, Messages, ConversationParticipants';
PRINT 'Triggers creados para actualización automática de fechas';
PRINT '------------------------------------------------------------';
