USE [VoluLinkLocal];
GO

-- Crear la especifiacion de la auditoria
CREATE DATABASE AUDIT SPECIFICATION [Audit-20250523-102628] -- A la auditoria Audit-20250523-102628 (NOMBRE DE AUDITORIA)
FOR SERVER AUDIT [Auditoria] -- NOMBRE DE ESPECIFICACION
ADD (SELECT, INSERT, UPDATE, DELETE ON dbo.Users BY public),
ADD (SELECT, INSERT, UPDATE, DELETE ON dbo.Volunteers BY public),
ADD (SELECT, INSERT, UPDATE, DELETE ON dbo.Organizations BY public),
ADD (SELECT, INSERT, UPDATE, DELETE ON dbo.Categories BY public),
ADD (SELECT, INSERT, UPDATE, DELETE ON dbo.Projects BY public),
ADD (SELECT, INSERT, UPDATE, DELETE ON dbo.Skills BY public),
ADD (SELECT, INSERT, UPDATE, DELETE ON dbo.VolunteerSkills BY public),
ADD (SELECT, INSERT, UPDATE, DELETE ON dbo.VolunteerInterests BY public),
ADD (SELECT, INSERT, UPDATE, DELETE ON dbo.ProjectSkills BY public),
ADD (SELECT, INSERT, UPDATE, DELETE ON dbo.Applications BY public),
ADD (SELECT, INSERT, UPDATE, DELETE ON dbo.Participations BY public),
ADD (SELECT, INSERT, UPDATE, DELETE ON dbo.HourLogs BY public),
ADD (SELECT, INSERT, UPDATE, DELETE ON dbo.Evaluations BY public),
ADD (SELECT, INSERT, UPDATE, DELETE ON dbo.ProjectReviews BY public),
ADD (SELECT, INSERT, UPDATE, DELETE ON dbo.Notifications BY public),
ADD (SELECT, INSERT, UPDATE, DELETE ON dbo.NotificationSettings BY public),
ADD (SELECT, INSERT, UPDATE, DELETE ON dbo.Events BY public),
ADD (SELECT, INSERT, UPDATE, DELETE ON dbo.EventAttendees BY public),
ADD (SELECT, INSERT, UPDATE, DELETE ON dbo.UserChangeLogs BY public),
ADD (SELECT, INSERT, UPDATE, DELETE ON dbo.AuditLog BY public)
WITH (STATE = ON);



CREATE VIEW vw_AuditoriaVoluLink
AS
SELECT
    event_time,
    server_principal_name,
    database_name,
    object_name,
    statement,
    action_id,
    succeeded,
    session_id,
    application_name,
    host_name,
    client_ip,
    file_name
FROM sys.fn_get_audit_file(
        'C:\Users\HP\Desktop\auditoria\*.sqlaudit',  -- Ajusta esta ruta al lugar donde están tus logs
        DEFAULT,
        DEFAULT
     );

select * from vw_AuditoriaVoluLink;
