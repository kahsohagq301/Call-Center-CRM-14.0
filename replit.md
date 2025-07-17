# Call Center CRM System

## Overview

This is a comprehensive Call Center CRM System built with a modern full-stack architecture. The application is designed to manage call center operations, including user management, call tracking, lead management, reporting, and multi-role authentication. It features a React frontend with TypeScript, an Express.js backend, and PostgreSQL database with Drizzle ORM.

**Status**: Successfully migrated from Replit Agent to Replit environment (July 17, 2025)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and session management
- **Session Storage**: PostgreSQL sessions with connect-pg-simple
- **Password Security**: Node.js crypto module with scrypt hashing

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon serverless driver with WebSocket support

## Key Components

### Authentication System
- **Multi-role authentication**: Super Admin, CC Agent, CRO Agent
- **Session-based authentication** with secure password hashing
- **Password recovery** with code-based reset system
- **Protected routes** with role-based access control

### User Management
- **User roles**: Super Admin (full access), CC Agent (calls/leads), CRO Agent (received leads)
- **Profile management** with optional profile pictures and official numbers
- **Account activation/deactivation** capabilities

### Call Management
- **Call logging** with customer numbers and categories
- **Call categories**: Switched Off, Busy, No Answer, Not Interested, Interested
- **Auto-deletion** of calls after 24 hours
- **Call analytics** and reporting

### Lead Management
- **Lead creation** with customer details and biodata file uploads
- **Lead transfer** between CC Agents and CRO Agents
- **Lead tracking** with timestamps and status updates
- **File upload** support for biodata documents

### Reporting System
- **Daily reports** with online/offline call counts and lead metrics
- **Report analytics** with date-based filtering
- **Dashboard analytics** for each user role
- **Export capabilities** for data analysis

### File Upload System
- **Multer integration** for handling file uploads
- **File validation** with size and type restrictions
- **Secure file storage** in uploads directory

## Data Flow

### Authentication Flow
1. User submits credentials through login modal
2. Passport.js validates credentials against database
3. Session created and stored in PostgreSQL
4. Frontend receives user data and updates context
5. Protected routes check authentication status

### Call Processing Flow
1. CC Agent logs call with customer number
2. Call stored in database with auto-deletion timestamp
3. Agent can update call category (status)
4. Analytics updated in real-time
5. Expired calls automatically removed

### Lead Management Flow
1. CC Agent creates lead with customer details
2. Optional biodata file uploaded and stored
3. Lead can be transferred to CRO Agent
4. Transfer updates lead status and assigns to CRO Agent
5. CRO Agent receives lead in their dashboard

### Reporting Flow
1. Agents submit daily reports with call/lead counts
2. Reports stored with user association and timestamps
3. Analytics aggregated across all users
4. Dashboard displays real-time metrics
5. Super Admin can view system-wide analytics

## External Dependencies

### Frontend Dependencies
- **@radix-ui/react-**: Complete UI component library
- **@tanstack/react-query**: Server state management
- **@hookform/resolvers**: Form validation
- **class-variance-authority**: Component variant management
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight routing library

### Backend Dependencies
- **express**: Web framework
- **passport**: Authentication middleware
- **drizzle-orm**: TypeScript ORM
- **@neondatabase/serverless**: PostgreSQL driver
- **multer**: File upload handling
- **connect-pg-simple**: PostgreSQL session store
- **zod**: Runtime type validation

### Development Dependencies
- **typescript**: Type safety
- **vite**: Build tool and dev server
- **tsx**: TypeScript execution
- **esbuild**: Fast bundler for production

## Deployment Strategy

### Development Environment
- **Development server**: Vite dev server with HMR
- **Backend server**: tsx for TypeScript execution
- **Database**: Neon PostgreSQL with local development support
- **File uploads**: Local uploads directory

### Production Build
- **Frontend**: Vite build with static asset optimization
- **Backend**: esbuild bundle for Node.js deployment
- **Database**: Neon PostgreSQL serverless
- **Environment**: Docker-ready with environment variables

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment mode (development/production)
- **Session secrets**: Secure session configuration
- **File upload limits**: Configurable upload constraints

### Security Considerations
- **Password hashing**: Scrypt with salt for secure password storage
- **Session security**: Secure session cookies with PostgreSQL storage
- **File upload security**: Type and size validation
- **SQL injection prevention**: Parameterized queries with Drizzle ORM
- **CSRF protection**: Session-based authentication with same-origin policy

The system is designed to be scalable, secure, and maintainable, with clear separation of concerns and comprehensive error handling throughout the application stack.