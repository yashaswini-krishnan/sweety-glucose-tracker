# Sweety – Glucose Tracker

Sweety is a web application that helps users record and track their blood glucose readings. Users can create an account, log in, manage their daily readings and view reports to understand their glucose levels over time.

The project includes a React frontend, a Node.js and Express backend, and a PostgreSQL database.

## 1. Features

- **User Registration and Login:** Users can create an account and securely log in.
- **Secure Authentication:** Passwords are hashed using bcrypt, and JWT is used for authentication.
- **Manage Readings:** Users can add, view, update and delete their glucose readings.
- **Four Daily Reading Slots:**
  - Morning fasting
  - After breakfast
  - After lunch
  - After dinner
- **Input Validation:** Prevents missing values, invalid glucose values, duplicate readings, more than four readings per day and future dates.
- **Reports:** View daily, month-to-date and previous-month reports.
- **Reading Summary:** Reports include the highest, lowest and average glucose values, along with the total number of readings.
- **User Data Protection:** Users can access only their own readings and reports.

## 2. Technologies Used

| Part           | Technologies                         |
| -------------- | ------------------------------------ |
| Frontend       | React, JavaScript, HTML, CSS         |
| Build Tool     | Vite                                 |
| Backend        | Node.js, Express.js                  |
| Database       | PostgreSQL                           |
| Authentication | JWT, bcrypt                          |
| Validation     | Zod and application-level validation |
| HTTP Requests  | Axios                                |
| Testing        | Jest, Supertest                      |

## 3. Project Structure

```text
sweety-glucose-tracker/
│
├── client/                 # React frontend
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Application pages
│       └── ...
│
├── server/                 # Node.js backend
│   └── src/
│       ├── controllers/    # Handles API requests
│       ├── routes/         # API routes
│       ├── services/       # Application logic
│       ├── middleware/     # Authentication middleware
│       ├── db/             # Database files
│       └── __tests__/      # Backend tests
│
└── README.md
```

## 4. How the Application Works

1. A user registers or logs in through the React frontend.
2. The backend verifies the user's credentials and provides a JWT token.
3. The frontend sends API requests to the Express server with the authentication token.
4. The backend verifies the token and processes the request.
5. PostgreSQL stores the user's account details and glucose readings.
6. The application displays the readings and reports belonging to that user.

## 5. Database Design

The application uses PostgreSQL with two main tables.

**Users table**

Stores user account information:

- `id` – Unique user ID
- `name` – User's name
- `email` – User's email address
- `password_hash` – Hashed password
- `created_at` – Account creation time

**Readings table**

Stores glucose readings:

- `id` – Unique reading ID
- `user_id` – ID of the user who owns the reading
- `reading_date` – Date of the reading
- `slot` – Reading time slot
- `value` – Glucose value in mg/dL
- `created_at` – Record creation time

Each reading is connected to a user through `user_id`. The database prevents duplicate readings for the same user, date and slot.

## 6. Prerequisites

Install the following tools before setting up the project.

| Tool               | Purpose                                       | Required?             |
| ------------------ | --------------------------------------------- | --------------------- |
| Git                | Download the project from GitHub              | Yes                   |
| Node.js            | Run the frontend and backend                  | Yes                   |
| npm                | Install project dependencies                  | Included with Node.js |
| PostgreSQL         | Store application data                        | Yes                   |
| pgAdmin            | Manage PostgreSQL using a graphical interface | Optional              |
| Visual Studio Code | View and edit project files                   | Optional              |

### 6.1 Install Git

Git is used to download the project from GitHub.

1. Visit [Git Downloads](https://git-scm.com/downloads).
2. Select your operating system.
3. Download and run the installer.
4. Follow the installation instructions using the default settings.

Verify the installation:

```bash
git --version
```

### 6.2 Install Node.js and npm

Node.js allows JavaScript to run outside the browser. It is required to run the backend and frontend development tools.

npm is included with Node.js and installs the libraries used by the project.

1. Visit [Node.js Downloads](https://nodejs.org/en/download).
2. Download a supported LTS version.
3. Run the installer and follow the instructions.
4. Complete the installation and reopen your terminal.

**Version requirement:** Vite 8 requires Node.js 20.19+ or 22.12+. Use a supported version.

Verify the installation:

```bash
node -v
npm -v
```

Both commands should display their installed versions.

### 6.3 Install PostgreSQL

PostgreSQL is the database used to store user accounts and glucose readings.

1. Visit [PostgreSQL Downloads](https://www.postgresql.org/download/).
2. Select your operating system.
3. For Windows, follow the installer link provided on the website.
4. Download and run the installer.
5. Select PostgreSQL Server and pgAdmin if available.
6. During installation, create a password for the default `postgres` database user.
7. Remember this password because it is needed to connect the application to the database.
8. Keep the default port `5432`, unless it is already in use.
9. Complete the installation.

### 6.4 pgAdmin (Optional)

pgAdmin is a graphical tool for managing PostgreSQL databases.

If you installed it with PostgreSQL:

1. Open pgAdmin.
2. Expand the Servers section.
3. Select your PostgreSQL server.
4. Enter the password created during PostgreSQL installation.
5. Expand Databases to view your databases.

You can also use PostgreSQL's SQL Shell (psql) instead.

### 6.5 Visual Studio Code (Optional)

You can use any code editor to view and edit the project.

For example, [Visual Studio Code](https://code.visualstudio.com/) is a free editor.

1. Visit the website.
2. Download the installer for your operating system.
3. Run the installer and complete the setup.
4. Open the downloaded project folder in VS Code.

No additional editor extensions are required to run the application.

## 7. Project Setup

The following instructions use Windows PowerShell. If you use another terminal, the commands may differ slightly.

### Step 1: Clone the repository

Open PowerShell or your preferred terminal and run:

```bash
git clone https://github.com/yashaswini-krishnan/sweety-glucose-tracker.git
cd sweety-glucose-tracker
```

### Step 2: Install backend dependencies

Move into the server folder:

```bash
cd server
npm install
```

This installs the backend packages listed in `server/package.json`, including:

- Express – Creates the backend API.
- pg – Connects Node.js to PostgreSQL.
- bcrypt – Hashes user passwords.
- jsonwebtoken – Creates and verifies authentication tokens.
- dotenv – Loads environment variables.
- Zod – Validates input data.
- Jest – Runs automated tests.
- Supertest – Tests API endpoints.
- Nodemon – Restarts the server when code changes.

### Step 3: Install frontend dependencies

Open another terminal in the project folder and run:

```bash
cd client
npm install
```

This installs the frontend packages listed in `client/package.json`, including:

- React and React DOM – Build the user interface.
- React Router DOM – Manage navigation.
- Axios – Send HTTP requests to the backend.
- Vite – Run the frontend development server and create production builds.

You do not need to install these libraries individually. Running `npm install` in each folder installs them automatically.

## 8. Database Setup

### Step 1: Create the databases

Open pgAdmin or PostgreSQL SQL Shell and connect to your local PostgreSQL server.

Run:

```sql
CREATE DATABASE sweety;
CREATE DATABASE sweety_test;
```

The databases have different purposes:

- `sweety` – Stores the application's actual data.
- `sweety_test` – Used for automated tests.

### Step 2: Configure backend environment variables

Inside the `server` folder, find `.env.example`.

Copy this file and create another file named `.env` in the same folder.

In PowerShell, you can use:

```powershell
Copy-Item .env.example .env
```

Open `server/.env` and configure:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/sweety
TEST_DATABASE_URL=postgresql://postgres:your_password@localhost:5432/sweety_test
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
```

**Understanding DATABASE_URL**

The database URL tells the backend how to connect to PostgreSQL.

It follows this format:

```text
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

For a local PostgreSQL installation:

- `USERNAME` – Your PostgreSQL username, commonly `postgres`.
- `PASSWORD` – The password created during installation.
- `HOST` – `localhost`, because PostgreSQL is running on your computer.
- `PORT` – `5432`, the default PostgreSQL port.
- `DATABASE_NAME` – The database name, either `sweety` or `sweety_test`.

For example:

```text
postgresql://postgres:myPassword@localhost:5432/sweety
```

Replace the example password with your actual PostgreSQL password.

If you use a hosted PostgreSQL database, copy its connection URL from the provider's database connection settings.

**Generating JWT_SECRET**

`JWT_SECRET` is a private random value used by the backend to sign authentication tokens.

You can generate one using Node.js.

Open a terminal and run:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated value and paste it after `JWT_SECRET=` in your `.env` file.

Keep this value private. Never upload your actual `.env` file to GitHub.

### Step 3: Configure frontend environment variables

Inside the `client` folder, find `.env.example`.

Copy it and create another file named `.env`.

In PowerShell, run:

```powershell
Copy-Item .env.example .env
```

Open `client/.env` and add:

```env
VITE_API_URL=http://localhost:3000/api
```

This tells the frontend where to send API requests.

If you change the backend port, update this URL to match. Keep `/api` at the end.

## 9. Run Database Migrations and Add Demo Data

### Step 1: Create database tables

Open a terminal inside the `server` folder and run:

```bash
npm run db:migrate
```

This executes the migration script and creates the required database tables.

### Step 2: Add sample data

Run:

```bash
npm run seed
```

This creates a demo account and adds sample glucose readings.

**Demo login credentials:**

- Email: `demo@sweety.com`
- Password: `Demo@1234`

## 10. Run the Application

The frontend and backend run separately, so you need two terminals.

### Start the backend server

Open a terminal inside the `server` folder:

```bash
npm run dev
```

The backend runs at:

`http://localhost:3000`

### Start the frontend

Open another terminal inside the `client` folder:

```bash
npm run dev
```

Vite displays a local development URL in the terminal. Open that URL in your browser.

Keep both terminals running while using the application.

## 11. Run Automated Tests

The backend uses Jest and Supertest for automated API testing.

Before running tests, make sure `TEST_DATABASE_URL` points to the separate `sweety_test` database.

Open a terminal inside the `server` folder and run:

```bash
npm test
```

The tests cover:

- Glucose value validation.
- Duplicate reading prevention.
- Maximum four readings per day.
- Future date validation.
- Report calculations and average rounding.
- Authentication requirements.
- User data access protection.
- Reading creation, updating and deletion.
- Invalid login credentials.
- Duplicate email registration.

**Important:** The test setup clears test data before each test run. Never point the test database to your actual application database.

## 12. Create a Production Build

To check whether the frontend can be built for production, open a terminal inside the `client` folder and run:

```bash
npm run build
```

Vite generates the production build in the `dist` folder.

## 13. API Endpoints

All API routes use `/api` as the base path.

Readings and reports require a valid bearer token.

| Method | Endpoint                                     | Purpose                              |
| ------ | -------------------------------------------- | ------------------------------------ |
| POST   | `/api/auth/register`                         | Create an account                    |
| POST   | `/api/auth/login`                            | Log in                               |
| GET    | `/api/auth/me`                               | Get the current user                 |
| GET    | `/api/health`                                | Check API health                     |
| GET    | `/api/readings`                              | List readings                        |
| POST   | `/api/readings`                              | Create a reading                     |
| PUT    | `/api/readings/:id`                          | Update a reading                     |
| DELETE | `/api/readings/:id`                          | Delete a reading                     |
| GET    | `/api/reports/daily?date=YYYY-MM-DD`         | Get a daily report and readings      |
| GET    | `/api/reports/month-to-date?date=YYYY-MM-DD` | Get the current-month-to-date report |
| GET    | `/api/reports/monthly?date=YYYY-MM-DD`       | Get the previous-month report        |

Protected endpoints require a JWT token in the request header:

```text
Authorization: Bearer <your_token>
```

## 14. Assumptions and Notes

- "Today" is determined using the `Asia/Kolkata` timezone.
- Passwords must contain at least 8 characters.
- Reading dates are compared as calendar dates, without time-of-day comparisons.
- The maximum of four readings per day is checked before duplicate-slot validation. Therefore, the maximum-four message can take precedence.
- Invalid-date and invalid-slot errors use project-specific messages.
- The test database must be separate from the development database.

## 15. Possible Improvements

Some features that could be added in the future:

- Pagination for longer reading histories.
- Charts to make glucose trends easier to understand.
- Frontend automated tests.
- Docker configuration for a repeatable local environment.

## 16. AI Assistance

I used AI assistance during development to understand technical concepts, review code, troubleshoot issues and improve the implementation. I reviewed the changes, tested the application and worked through the implementation to understand how the different parts fit together.