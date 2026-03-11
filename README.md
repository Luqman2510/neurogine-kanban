# 🚀 Neurogine - Real-Time Collaborative Kanban Board
# I wan to add anything that I want.
A modern, full-stack Kanban board application with real-time collaboration features, built with Spring Boot and React.

# What if I add One more.

## ✨ Features

### Core Functionality
- 📊 **Kanban Board Management** - Create and manage multiple boards with customizable columns
- 🎯 **Drag & Drop Tasks** - Intuitive task management with smooth drag-and-drop interface
- ⚡ **Real-Time Collaboration** - Multiple users can work on the same board simultaneously
- 🔄 **Live Updates** - See changes from other users instantly without refreshing

### Advanced Features
- 👥 **Board Sharing** - Share boards with team members with role-based access control
- 💬 **Task Comments** - Collaborate through task-specific comments
- 📋 **Activity Logging** - Complete audit trail of all task changes
- 📎 **File Attachments** - Upload and preview files on tasks (images, PDFs, text files)
- 🔍 **Search & Filters** - Filter tasks by priority, due date, and search by keywords
- 🎨 **Beautiful UI** - Apple-inspired design with dark mode support
- 🔐 **Secure Authentication** - JWT-based authentication with BCrypt password hashing

## 🛠️ Technology Stack

### Backend
- **Spring Boot 3.5.10** - Java 21
- **PostgreSQL 18.1** - Database
- **Flyway 11.7.2** - Database migrations
- **Spring Data JPA** - ORM with Hibernate
- **Spring Security** - JWT authentication
- **Spring WebSocket** - Real-time communication with STOMP protocol
- **Lombok** - Reduce boilerplate code
- **Maven** - Dependency management

### Frontend
- **React 19.2.4** - UI library with functional components
- **React Router DOM** - Client-side routing
- **@dnd-kit** - Drag-and-drop functionality
- **@stomp/stompjs** - WebSocket client
- **Axios** - HTTP client with interceptors
- **CSS3** - Custom styling with Apple design principles

### Database Schema
- 8 tables: `users`, `boards`, `board_columns`, `tasks`, `task_attachments`, `task_comments`, `activity_log`, `board_members`
- Optimistic locking for concurrent updates
- Foreign key constraints for data integrity
- Indexes for performance optimization

## 🚀 Getting Started

### Prerequisites
- Java 21 or higher
- Node.js 18 or higher
- PostgreSQL 18.1 or higher
- Maven 3.9+

### Database Setup

1. Create PostgreSQL database:
```bash
createdb neurogine_db
```

2. Create database user:
```sql
CREATE USER neurogine_user WITH PASSWORD 'neurogine_pass_2026';
GRANT ALL PRIVILEGES ON DATABASE neurogine_db TO neurogine_user;
```

### Backend Setup

1. Navigate to project root:
```bash
cd neurogine
```

2. Update database credentials in `src/main/resources/application.properties` if needed

3. Run the application:
```bash
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

Flyway will automatically run database migrations on startup.

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will start on `http://localhost:3000`

## 📖 Usage

1. **Register** a new account at `http://localhost:3000`
2. **Create a board** - A default board is created automatically
3. **Add tasks** - Click "New Task" to create tasks in any column
4. **Drag & drop** - Move tasks between columns
5. **Share boards** - Click the "👥 Share" button to invite team members
6. **Collaborate** - Open the same board in multiple browsers to see real-time updates!

## 🏗️ Architecture

### Real-Time Collaboration Flow
1. User A drags a task to a new column
2. Frontend sends WebSocket message to `/app/task/move/{boardId}`
3. Backend processes the update with optimistic locking check
4. Backend broadcasts update to `/topic/board/{boardId}`
5. All connected users receive the update and UI updates automatically

### Security Flow
1. User logs in with username/password
2. Backend validates credentials and generates JWT token
3. Frontend stores token in localStorage
4. Axios interceptor adds token to all API requests
5. JwtAuthenticationFilter validates token on each request

## 📁 Project Structure

```
neurogine/
├── src/main/java/com/amgnips/neurogine/
│   ├── config/          # WebSocket, Security, CORS configuration
│   ├── controller/      # REST and WebSocket controllers
│   ├── dto/             # Data Transfer Objects
│   ├── model/           # JPA entities
│   ├── repository/      # Spring Data repositories
│   ├── security/        # JWT authentication
│   └── service/         # Business logic
├── src/main/resources/
│   └── db/migration/    # Flyway database migrations
├── frontend/
│   ├── public/          # Static assets
│   └── src/
│       ├── components/  # React components
│       ├── pages/       # Page components
│       └── services/    # API and WebSocket services
└── uploads/             # User-uploaded files

```

## 🔑 Key Technical Highlights

- **Optimistic Locking**: Prevents data loss from concurrent updates using `@Version`
- **Activity Logging**: Automatic audit trail of all task changes
- **Lazy Loading**: Efficient database queries with JPA lazy fetching
- **Immutable State**: React state updates follow immutability principles
- **Error Handling**: Comprehensive error handling on both frontend and backend

## 👨‍💻 Author

Built for job interview demonstration - February 2026

## 📄 License

This project is for educational and demonstration purposes.

## Practice
This is my practice commit!

# neurogine-kanban
# neurogine-kanban
