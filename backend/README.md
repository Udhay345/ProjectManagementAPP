# ProFlow Project Management System - Node.js Express Backend

This is the production-ready Node.js Express backend for the Project Management System. It uses MySQL2 as the database client, features JWT-based authentication, and implements role-based access validation, rate limiting, and standard error handling.

---

## Folder Structure

```
backend/
├── config/
│   └── db.js            # MySQL2 promise-based pool connection
├── controllers/
│   ├── authController.js     # User registration and login
│   ├── projectController.js  # Project CRUD and members syncing
│   ├── taskController.js     # Task CRUD and project progress updates
│   └── dashboardController.js# Dashboard statistics aggregation
├── middleware/
│   ├── auth.js          # JWT protection and resource ownership validation
│   ├── errorHandler.js  # Centralized application error handling
│   └── rateLimiter.js   # API request rate limits
├── routes/
│   ├── authRoutes.js    # Routes for /api/auth
│   ├── projectRoutes.js # Routes for /api/projects
│   ├── taskRoutes.js    # Routes for /api/tasks
│   └── dashboardRoutes.js# Routes for /api/dashboard
├── utils/
│   └── helpers.js       # JWT generation and input validators
├── .env                 # Environment variables
├── app.js               # Express application configuration
├── package.json         # Dependencies and scripts
├── schema.sql           # Database schema SQL commands
└── server.js            # Server entry point
```

---

## Requirements & Installation

1. **MySQL Server**: Ensure your local MySQL instance is running (default port `3306`).
2. **Environment File**: Open the `backend/.env` file and configure your database username and password:
   ```env
   PORT=5000
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=project_management
   JWT_SECRET=super_secret_jwt_key_12345
   ```

3. **Install Dependencies**:
   Open a terminal in the `backend/` directory and run:
   ```bash
   npm install
   ```

---

## Database Setup

Initialize the database and table structures automatically by running the setup script from the `backend/` directory:

```bash
npm run db:setup
```

Alternatively, you can manually run the SQL statements provided in [schema.sql](./schema.sql) using any database client or GUI (e.g., MySQL Workbench, phpMyAdmin, DBeaver).

This creates the following tables:
- **`users`**: Stores user registration profiles, emails, passwords (hashed), roles, statuses, and departments.
- **`projects`**: Stores project names, descriptions, briefs, start/end dates, progress percentage, and owner associations.
- **`project_members`**: A junction table linking users (team members) to projects.
- **`tasks`**: Stores tasks including project relationship, assignees, priorities, due dates, and JSON columns for labels, subtasks, and comments.

---

## Running the Server

- **Development Mode** (with hot reloading via nodemon):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

Once running, the backend API will be available at: `http://localhost:5000/api`

---

## API Endpoints

### 1. Authentication
* **`POST /api/auth/register`** (Public)
  - Registers a new user. Hashes password using bcrypt. Returns JWT token.
* **`POST /api/auth/login`** (Public)
  - Validates credentials and returns JWT token.

### 2. Projects
* **`GET /api/projects`** (Private)
  - Fetches all projects the logged-in user is involved in (as owner or member), including populated member arrays and tasks.
* **`GET /api/projects/:id`** (Private)
  - Fetches a project by ID with members and tasks.
* **`POST /api/projects`** (Private)
  - Creates a new project, setting the logged-in user as owner and automatically adding them as the first member.
* **`PUT /api/projects/:id`** (Private - Owner Only)
  - Updates project fields and syncs project membership if members are provided.
* **`DELETE /api/projects/:id`** (Private - Owner Only)
  - Deletes the project. Cascades automatically to members and tasks.

### 3. Tasks
* **`GET /api/tasks`** (Private)
  - Fetches tasks in projects the user is involved in or assigned to.
* **`GET /api/tasks/:id`** (Private)
  - Fetches task details.
* **`POST /api/tasks`** (Private)
  - Creates a task and automatically recalculates parent project progress.
* **`PUT /api/tasks/:id`** (Private - Project Owner or Task Assignee)
  - Updates task properties (status, priority, subtasks, labels, comments) and recalculates project progress.
* **`DELETE /api/tasks/:id`** (Private - Project Owner or Task Assignee)
  - Deletes task and updates project progress.

### 4. Dashboard
* **`GET /api/dashboard`** (Private)
  - Aggregates dashboard metrics (`totalProjects`, `inProgressProjects`, `totalTasks`, `completedTasks`, `pendingTasks`) customized for the logged-in user.

---

## Design Highlights

1. **JSON Database Fields**: Storing `labels`, `subtasks`, and `comments` inside the `tasks` table as MySQL JSON columns allows flexible key-value representation without redundant database joins, mirroring the frontend TypeScript structures exactly.
2. **Auto-Computing Progress**: The backend automatically recalculates the parent project progress percentage whenever a task is created, updated, or deleted.
3. **CORS Enabled**: Configured to accept requests from frontend applications securely.
4. **Rate Limiting**: Rate limits IP addresses (100 requests per 15 minutes generally, and 20 requests per 15 minutes for registration and login) to prevent API abuse.
