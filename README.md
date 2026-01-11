# Task Planner Project

A full-stack task management application built with **PostgreSQL, Express, React, and Node.js**. Features include task creation, priority sorting, and user assignment.
## Prerequisites

Before you begin, make sure you have the following installed on your computer:

1.  **Node.js** (Download [here](https://nodejs.org/))
2.  **Docker Desktop** (Download [here](https://www.docker.com/products/docker-desktop/)) - *Used for the database.*
3.  **Git** (Optional, if cloning from GitHub).

---

## Installation Guide

### 1. Clone the Repository
Open your terminal and download the code:
```bash
git clone <YOUR_REPOSITORY_URL_HERE>
cd Super-Cool-Planner
```

### 2. Install Dependencies
This project has three parts (Root, Server, Client). You need to install tools for all of them.

**In the Root folder:**
```bash
npm install
```

**In the Server folder:**
```bash
cd server
npm install
cd ..
```

**In the Client folder:**
```bash
cd client
npm install
cd ..
```

---

## Database Setup (Docker)

This project uses **PostgreSQL** inside a Docker container. We use port **5433** to avoid conflicts with other database apps you might have.

### 1. Start the Database Container
Run this command in your terminal to download and start Postgres:

```bash
docker run --name pern_planner_db -e POSTGRES_PASSWORD=password123 -p 5433:5432 -d postgres
```

### 2. Create the Database & Tables
Now we need to create the `planner_db` and the tables.

1.  **Enter the Database Terminal:**
    ```bash
    docker exec -it pern_planner_db psql -U postgres
    ```

2.  **Create the Database:**
    ```sql
    CREATE DATABASE planner_db;
    \c planner_db
    ```

3.  **Create the Schema:**
    Copy and paste the following SQL commands into the terminal:
    ```sql
    -- 1. Create Users Table
    CREATE TABLE users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL
    );

    -- 2. Create Tasks Table
    CREATE TABLE tasks (
        task_id SERIAL PRIMARY KEY,
        description VARCHAR(255),
        priority VARCHAR(50) DEFAULT 'medium',
        position SERIAL
    );

    -- 3. Create Assignments Table (Links Users to Tasks)
    CREATE TABLE user_tasks (
        user_id INT,
        task_id INT,
        PRIMARY KEY (user_id, task_id)
    );
    ```

4.  **Exit the Database Terminal:**
    Type `\q` and hit Enter.

---

## Configuration

Create a `.env` file in the **server** folder (`server/.env`) so the backend knows how to access the database.

**File:** `server/.env`
```env
PGuser=postgres
PGpassword=password123
PGhost=localhost
PGport=5433
PGdatabase=planner_db
```

---

## How to Run

We have configured `concurrently` to run both the frontend and backend with a single command.

1.  Make sure you are in the **Root** folder (`Super-Cool-Planner`).
2.  Run the start script:

```bash
npm run dev
```

* **The Backend** will start on `http://localhost:5000`
* **The Frontend** will open automatically at `http://localhost:3000`

---

## Troubleshooting

* **"Port already in use":**
    If port 5433 is taken, you can stop the existing docker container:
    `docker stop pern_planner_db` followed by `docker rm pern_planner_db`
* **"Relation does not exist":**
    This means you skipped Step 2 of the Database Setup. You must create the tables inside `planner_db`.
* **Login doesn't work:**
    Ensure your server is running. Check the terminal for "Server has started on port 5000".

## You are now ready to use the program! Hope it helps :)
