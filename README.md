# 🚀 SkillSwap - Plataforma de Intercambio de Habilidades

**SkillSwap** es una plataforma moderna de intercambio de habilidades que conecta a personas para aprender y enseñar diferentes competencias a través de sesiones colaborativas.

![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Go](https://img.shields.io/badge/Go-1.21-00ADD8?style=flat-square&logo=go)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-010101?style=flat-square&logo=socket.io)
![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-CC2927?style=flat-square&logo=microsoft-sql-server)

## ✨ Características Principales

### 🎯 **Core Features**
- **Sistema de Matching**: Algoritmo inteligente para conectar usuarios con habilidades complementarias
- **Mensajería en Tiempo Real**: Chat instantáneo con Socket.IO y WebSockets
- **Gestión de Sesiones**: Programación y seguimiento de intercambios de habilidades
- **Sistema de Notificaciones**: Alertas en tiempo real para matches y actividades
- **Autenticación Segura**: JWT con middleware de protección de rutas

### 🧪 **Modo Preview**
- **Datos de Demostración**: Funciona sin backend para desarrollo y demos
- **Intercambio Fácil**: Toggle entre datos mock y API real
- **Desarrollo Ágil**: Frontend independiente para desarrollo rápido

### 🎨 **UI/UX Moderna**
- **Diseño Responsivo**: Optimizado para desktop y móvil
- **Tema Oscuro/Claro**: Soporte completo para ambos temas
- **Componentes Reutilizables**: Arquitectura modular con shadcn/ui
- **Animaciones Fluidas**: Transiciones suaves y micro-interacciones

## 🏗️ Arquitectura del Sistema

### **Frontend** (Next.js 15)
```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── (home)/            # Página principal
│   ├── matches/           # Sistema de matching
│   ├── messages/          # Chat y mensajería
│   ├── dashboard/         # Panel de usuario
│   └── skills/            # Gestión de habilidades
├── components/            # Componentes reutilizables
│   ├── ui/               # Primitivos de UI (shadcn)
│   ├── auth/             # Componentes de autenticación
│   └── Chat/             # Sistema de chat
├── lib/                  # Utilidades y configuración
│   ├── api-client.ts     # Cliente API con modo preview
│   ├── AuthContext.tsx   # Contexto de autenticación
│   └── utils.ts          # Funciones auxiliares
└── hooks/                # React Hooks personalizados
```

### **Backend** (Go)
```
api/
├── handlers/             # Controladores HTTP
│   ├── auth-handler.go   # Autenticación
│   ├── user-handler.go   # Gestión de usuarios
│   ├── matches-handler.go # Sistema de matching
│   └── messages-handler.go # Mensajería
├── models/               # Modelos de datos
├── middleware/           # Middleware HTTP
├── config/              # Configuración de BD
└── routes/              # Definición de rutas
```

### **Base de Datos** (SQL Server)
- **Usuarios**: Perfiles, autenticación, preferencias
- **Habilidades**: Catálogo de competencias por categorías
- **Matches**: Conexiones entre usuarios
- **Mensajes**: Historial de conversaciones
- **Sesiones**: Programación de intercambios
- **Auditoría**: Logs de actividad del sistema

## 🚀 Inicio Rápido

### Prerequisitos
- **Node.js** 18.0+ 
- **Go** 1.21+
- **SQL Server** 2019+ o **SQL Server Express**
- **Git**

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/skillswap.git
cd skillswap
```

### 2. Configuración del Frontend
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.development.example .env.development
```

### 3. Configuración del Backend
```bash
cd api
go mod download

# Configurar base de datos
cp .env.example .env
# Editar .env con tus credenciales de SQL Server
```

### 4. Base de Datos
```bash
# Ejecutar scripts de creación
sqlcmd -S localhost -d master -i database/scripts.sql
sqlcmd -S localhost -d SkillSwapDB -i database/update_usuarios_schema.sql
```

### 5. Ejecutar Aplicación

#### Modo Preview (Solo Frontend)
```bash
# Activar modo preview
.\toggle-preview.ps1 -Preview

# Iniciar frontend
npm run dev
```
🌐 **Aplicación**: http://localhost:3000

#### Modo Completo (Frontend + Backend)
```bash
# Terminal 1: Backend
cd api
go run .

# Terminal 2: Frontend (modo real)
.\toggle-preview.ps1 -Real
npm run dev
```
🌐 **Frontend**: http://localhost:3000  
🔌 **Backend**: http://localhost:8000

## 🧪 Modo Preview

SkillSwap incluye un **Modo Preview** único que permite ejecutar la aplicación completa sin backend:

```bash
# Activar modo preview
.\toggle-preview.ps1 -Preview

# Ver estado actual
.\toggle-preview.ps1 -Status

# Volver a API real
.\toggle-preview.ps1 -Real
```

### Características del Modo Preview:
- ✅ **Datos de demostración** predefinidos
- ✅ **Sin dependencias** de backend o BD
- ✅ **Indicadores visuales** del modo activo
- ✅ **Desarrollo ágil** del frontend
- ✅ **Demos instantáneas** para presentaciones

📖 **Documentación completa**: [PREVIEW_MODE_README.md](./PREVIEW_MODE_README.md)

## 🛠️ Scripts Disponibles

### Frontend
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run start        # Servidor de producción
npm run lint         # Linting con ESLint
npm run type-check   # Verificación de tipos
```

### Backend
```bash
go run .            # Ejecutar servidor
go build -o api.exe # Compilar binario
go test ./...       # Ejecutar tests
```

### Utilidades
```bash
.\toggle-preview.ps1    # Cambiar modo preview/real
.\demo-preview-mode.ps1 # Demostración del sistema
.\deploy.ps1           # Despliegue automatizado
```

## 🌟 Funcionalidades Destacadas

### 🔄 **Sistema de Matching Inteligente**
- Algoritmo que conecta usuarios con habilidades complementarias
- Filtros por categoría, nivel y ubicación
- Sugerencias personalizadas basadas en historial

### 💬 **Chat en Tiempo Real**
- Mensajería instantánea con Socket.IO
- Indicadores de typing y estado online
- Historial persistente de conversaciones
- Notificaciones push para nuevos mensajes

### 📅 **Gestión de Sesiones**
- Programación de intercambios de habilidades
- Sistema de confirmación bilateral
- Recordatorios automáticos
- Evaluación post-sesión

### 🔐 **Seguridad Robusta**
- Autenticación JWT con refresh tokens
- Middleware de protección de rutas
- Validación de datos en frontend y backend
- Logs de auditoría completos

### 📊 **Analytics y Reportes**
- Dashboard con métricas de usuario
- Estadísticas de matches y sesiones
- Reportes de actividad y engagement
- Métricas de cancelación y satisfacción

## 🎨 Stack Tecnológico

### **Frontend**
- **Framework**: Next.js 15.3.2 (App Router)
- **Lenguaje**: TypeScript 5.0
- **Estilos**: Tailwind CSS + shadcn/ui
- **Estado**: React Context + Custom Hooks
- **Comunicación**: Socket.IO Client
- **Validación**: Zod + React Hook Form

### **Backend**
- **Lenguaje**: Go 1.21
- **Framework**: Net/HTTP nativo
- **ORM**: GORM v2
- **Autenticación**: JWT-Go
- **WebSockets**: Socket.IO Go
- **Validación**: Go Validator

### **Base de Datos**
- **SGBD**: Microsoft SQL Server 2022
- **Migraciones**: Scripts SQL manuales
- **Índices**: Optimización para consultas frecuentes
- **Auditoría**: Tabla de logs de actividad

### **DevOps**
- **Contenerización**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoreo**: Logs estructurados
- **Despliegue**: Scripts PowerShell automatizados

## 📁 Estructura del Proyecto

```
skillswap/
├── 📁 src/                    # Código fuente frontend
│   ├── 📁 app/               # Páginas y layouts (App Router)
│   ├── 📁 components/        # Componentes reutilizables
│   ├── 📁 lib/              # Utilidades y configuración
│   ├── 📁 hooks/            # React Hooks personalizados
│   └── 📁 types/            # Definiciones TypeScript
├── 📁 api/                   # Backend en Go
│   ├── 📁 handlers/         # Controladores HTTP
│   ├── 📁 models/           # Modelos de datos
│   ├── 📁 config/           # Configuración
│   └── 📁 middleware/       # Middleware HTTP
├── 📁 database/             # Scripts SQL
├── 📁 docs/                 # Documentación técnica
├── 📄 README.md             # Este archivo
├── 📄 PREVIEW_MODE_README.md # Documentación modo preview
└── 📄 package.json          # Dependencias Node.js
```

## 🚀 Despliegue

### Desarrollo Local
```bash
# Modo completo con base de datos
.\deploy.ps1 -Development

# Solo frontend (modo preview)
.\toggle-preview.ps1 -Preview && npm run dev
```

### Producción
```bash
# Build y despliegue completo
.\deploy.ps1 -Production

# O manualmente:
npm run build
go build -o api.exe ./api
```

### Docker (Próximamente)
```bash
docker-compose up -d
```

## 🤝 Contribución

### Proceso de Desarrollo
1. **Fork** del repositorio
2. **Crear rama** feature: `git checkout -b feature/nueva-funcionalidad`
3. **Desarrollar** con modo preview para frontend
4. **Probar** con backend real
5. **Commit** siguiendo convenciones
6. **Push** y crear **Pull Request**

### Estándares de Código
- **Frontend**: ESLint + Prettier + TypeScript strict
- **Backend**: Go fmt + Go vet + Go modules
- **Commits**: Conventional Commits
- **Testing**: Jest (Frontend) + Testing (Go)

### Rama Principal
Para hacer merge a main:
```bash
# Verificar rama actual
git branch

# Cambiar a main y actualizar
git checkout main
git pull origin main

# Hacer merge de tu rama
git merge feature/tu-rama

# Push a main
git push origin main
```

## 📋 Roadmap

### 🔥 **Próximas Funcionalidades**
- [ ] **Sistema de Reputación**: Ratings y reviews de usuarios
- [ ] **Pagos Integrados**: Monetización opcional de sesiones premium
- [ ] **Video Llamadas**: Integración con WebRTC para sesiones remotas
- [ ] **IA Recommendations**: ML para mejores sugerencias de matches
- [ ] **Mobile App**: React Native para iOS/Android

### 🔧 **Mejoras Técnicas**
- [ ] **Testing Completo**: Unit + Integration + E2E tests
- [ ] **Docker Containerization**: Despliegue con contenedores
- [ ] **CI/CD Pipeline**: Automatización completa
- [ ] **Performance Monitoring**: APM y métricas detalladas
- [ ] **Caching Redis**: Optimización de consultas frecuentes

## 📞 Soporte

### 📚 **Documentación**
- **README Principal**: Este archivo
- **Modo Preview**: [PREVIEW_MODE_README.md](./PREVIEW_MODE_README.md)
- **API Docs**: [docs/api-documentation.md](./docs/)
- **Deployment**: [DEPLOY_README.md](./DEPLOY_README.md)

### 🐛 **Reportar Issues**
1. Verificar en **Issues** existentes
2. Usar **plantillas** de issue
3. Incluir **logs** y **pasos** para reproducir
4. Especificar **versión** y **entorno**

### 💬 **Contacto**
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: desarrollo@skillswap.com

---

## 📜 Licencia

Este proyecto está licenciado bajo la **MIT License** - ver el archivo [LICENSE](LICENSE) para detalles.

---

## 🙏 Agradecimientos

- **Next.js Team** por el excelente framework
- **shadcn/ui** por los componentes de UI
- **Go Community** por las librerías robustas
- **Socket.IO** por la comunicación en tiempo real
- **Vercel** por el hosting y deployment

---

**¡Construido con ❤️ por el equipo de SkillSwap!**

> 💡 **¿Primera vez?** Ejecuta `.\demo-preview-mode.ps1` para una demostración completa del sistema.
