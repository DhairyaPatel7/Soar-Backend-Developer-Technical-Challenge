# SOAR BACKEND DEVELOPER TECHNICAL CHALLENGE

This is an explanation of the file structure, including the additional files created for various entities and their purposes:  

### **Directories and Their Purposes**  

- **`routes/`**  
  Contains all the route definitions for the API endpoints.  

- **`managers/`**  
  Includes the business logic and data management for different entities.  
  - **`managers/entities/`**  
    Houses subdirectories for each entity:  
    - **`managers/entities/user/`**: Files related to the user entity.  
    - **`managers/entities/school/`**: Files related to the school entity.  
    - **`managers/entities/classroom/`**: Files related to the classroom entity.  
    - **`managers/entities/student/`**: Files related to the student entity.  

- **`mws/`** (Middleware)  
  Contains middleware functions:  
  - **`mws/authMiddleware.js`**: Middleware for authentication.  
  - **`mws/roleMiddleware.js`**: Middleware for role-based access control.  

- **`tests/`**  
  Contains all the unit and integration tests:  
  - **`tests/unit/`**: Unit tests for individual components and functions.  
  - **`tests/integration/`**: Integration tests for interactions between different components.  

- **`mochawesome-report/`**  
  Contains test reports generated by the Mochawesome reporter. 

- **`database-design-schema-diagram`
    This is the schema diagram of all the entities used by the project.

# Project Setup Instructions

Follow the steps below to set up and run your project.

---

## Step 1: Install Node.js

1. Download and install **Node.js** from [https://nodejs.org/en/download/](https://nodejs.org/en/download/).
2. Verify the installation by running:
    - Open your terminal and check the Node.js version by running `node -v`.

---

## Step 2: Install Redis

1. Download and install **Redis** from [https://redis.io/download](https://redis.io/download).
2. Once installed, start the Redis server:
    - Run `redis-server` to start the Redis service.
3. Verify that Redis is running by executing:
    - `redis-cli ping`. If Redis is running, it will return `PONG`.

---

## Step 3: Install MongoDB

1. Download and install **MongoDB** from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community).
2. Start the MongoDB service:
    - Ensure MongoDB is running on its default port **27017**.
3. Open your terminal and connect to MongoDB:
    - Use the MongoDB shell:
      ```shell
      mongo
      ```
4. Create your project database by running:
    ```shell
    use your_database_name
    ```
5. Confirm the database creation by executing:
    ```shell
    show dbs
    ```

---

## Step 4: Clone the Project Repository

1. Clone the project repository to your local machine using:
    ```shell
    git clone <git-repository-url>
    ```
2. Navigate to the project directory on your computer.

---

## Step 5: Install Dependencies

1. Open your terminal and navigate to your project directory.
2. Run the following command to install all required project dependencies:
    ```shell
    npm install
    ```

---

## Step 6: Configure Environment Variables

### Local Environment Configuration

If you are running the project locally, update your environment variables in the `/config/envs/local.js` file.

1. Open the `/config/envs/local.js` file.
2. Set the following environment variables:
    - `MONGO_URI`: Your MongoDB connection string.
    - `CACHE_REDIS`: Your Redis connection string.
    - `CORTEX_URI`: Any additional service URL you need.
    - `USER_PORT`: Port number for your application.

---

## Step 7: Run Tests

1. To run the test suite, use the following command:
    ```shell
    npm test
    ```

---

## Step 8: Start the Application

1. To start the project locally, run:
    ```shell
    node app.js local
    ```

2. Your application should be running on `http://localhost:3000`.

---

### Full Application Workflow

1. **Create a Superadmin User**
    - A **superadmin user** is created with access to all endpoints across the system.
2. **Authenticate the Superadmin User**
    - Authenticate the superadmin user to obtain an authentication token.

3. **Create a Schooladmin User**
    - A **schooladmin user** is created under the superadmin’s supervision.

4. **Authenticate the Schooladmin User**
    - Authenticate the schooladmin user to get their authentication token.

5. **Create a School**
    - The **superadmin** creates a school, assigning a schooladmin as the school administrator.
    - Only **superadmins** have access to all school-related endpoints.

6. **Link Schooladmin with a School**
    - The schooladmin user must be updated with the school reference in their user object.
    - If a schooladmin is not linked with a school, they won’t have access to that school's resources.

7. **Perform CRUD Operations for Classrooms and Students**
    - Once the schooladmin is linked to a school, they can create, update, and delete:
        - **Classrooms**
        - **Students**
    - This allows management of classrooms and students within a school environment.

8. **Transfer Students Across Classrooms**
    - Transferring students from one classroom to another has a built-in validation check.
    - If the destination classroom's capacity is full, a student cannot be added to it.

---

# API Documentation

## User Endpoints

### Register a New User

- **Endpoint**: `POST /api/users/register`
- **Description**: Registers a new user.
- **Roles**: Superadmin  
- **Request**:
    ```json
    {
        "username": "string",
        "email": "string",
        "password": "string",
        "role": "string" // "superadmin", "schooladmin", "user"
    }
    ```
- **Response**:
    ```json
    {
        "user": {
            "_id": "string",
            "username": "string",
            "email": "string",
            "role": "string",
            "school": "object" // Object or null
        }
    }
    ```

---

### Authenticate a User

- **Endpoint**: `POST /api/users/login`
- **Description**: Authenticates a user and returns a token.
- **Roles**: All  
- **Request**:
    ```json
    {
        "email": "string",
        "password": "string"
    }
    ```
- **Response**:
    ```json
    {
        "token": "string"
    }
    ```

---

### Update a User

- **Endpoint**: `PUT /api/users/:id`
- **Description**: Updates a user's information. Restricted to the **superadmin** role.
- **Roles**: Superadmin  
- **Request**:
    ```json
    {
        "username": "string",
        "email": "string",
        "password": "string",
        "role": "string",
        "school": "string" // ObjectId or null
    }
    ```
- **Response**:
    ```json
    {
        "_id": "string",
        "username": "string",
        "email": "string",
        "role": "string",
        "school": "object" // Object or null
    }
    ```

---

### Delete a User

- **Endpoint**: `DELETE /api/users/:id`
- **Description**: Deletes a user. Restricted to the **superadmin** role.
- **Roles**: Superadmin  
- **Request**:
    ```json
    {
        "Authorization": "Bearer <token>"
    }
    ```
- **Response**:
    ```json
    // No content
    ```

---

### Get All Users

- **Endpoint**: `GET /api/users`
- **Description**: Retrieves all users. Restricted to the **superadmin** role.
- **Roles**: Superadmin  
- **Request**:
    ```json
    {
        "Authorization": "Bearer <token>"
    }
    ```
- **Response**:
    ```json
    [
        {
            "_id": "string",
            "username": "string",
            "email": "string",
            "role": "string",
            "school": "object" // Object or null
        }
    ]
    ```

---

### Get User by ID

- **Endpoint**: `GET /api/users/:id`
- **Description**: Retrieves a user by their ID. Restricted to the **superadmin** role.
- **Roles**: Superadmin  
- **Request**:
    ```json
    {
        "Authorization": "Bearer <token>"
    }
    ```
- **Response**:
    ```json
    {
        "_id": "string",
        "username": "string",
        "email": "string",
        "role": "string",
        "school": "object" // Object or null
    }
    ```

## School Endpoints

### Create a New School

- **Endpoint**: `POST /api/schools`
- **Description**: Creates a new school. Restricted to the **superadmin** role.
- **Roles**: Superadmin  
- **Request**:
    ```json
    {
        "name": "string",
        "address": "string",
        "phone": "string",
        "email": "string",
        "website": "string",
        "established": "YYYY-MM-DD",
        "admin": "ObjectId" // Reference to the User who is the school administrator
    }
    ```
- **Response**:
    ```json
    {
        "_id": "string",
        "name": "string",
        "address": "string",
        "phone": "string",
        "email": "string",
        "website": "string",
        "established": "YYYY-MM-DD",
        "admin": "Object" // Reference to the school admin user
    }
    ```

---

### Get All Schools

- **Endpoint**: `GET /api/schools`
- **Description**: Retrieves a list of all schools. Restricted to the **superadmin** role.
- **Roles**: Superadmin  
- **Request**:
    ```json
    {
        "Authorization": "Bearer <token>"
    }
    ```
- **Response**:
    ```json
    [
        {
            "_id": "string",
            "name": "string",
            "address": "string",
            "phone": "string",
            "email": "string",
            "website": "string",
            "established": "YYYY-MM-DD",
            "admin": "Object"
        }
    ]
    ```

---

### Get School by ID

- **Endpoint**: `GET /api/schools/:id`
- **Description**: Retrieves a school by its ID. Restricted to the **superadmin** role.
- **Roles**: Superadmin  
- **Request**:
    ```json
    {
        "Authorization": "Bearer <token>"
    }
    ```
- **Response**:
    ```json
    {
        "_id": "string",
        "name": "string",
        "address": "string",
        "phone": "string",
        "email": "string",
        "website": "string",
        "established": "YYYY-MM-DD",
        "admin": "Object"
    }
    ```

---

### Update a School

- **Endpoint**: `PUT /api/schools/:id`
- **Description**: Updates the information of a school. Restricted to the **superadmin** role.
- **Roles**: Superadmin  
- **Request**:
    ```json
    {
        "name": "string",
        "address": "string",
        "phone": "string",
        "email": "string",
        "website": "string",
        "established": "YYYY-MM-DD",
        "admin": "ObjectId"
    }
    ```
- **Response**:
    ```json
    {
        "_id": "string",
        "name": "string",
        "address": "string",
        "phone": "string",
        "email": "string",
        "website": "string",
        "established": "YYYY-MM-DD",
        "admin": "Object"
    }
    ```

---

### Delete a School

- **Endpoint**: `DELETE /api/schools/:id`
- **Description**: Deletes a school. Restricted to the **superadmin** role.
- **Roles**: Superadmin  
- **Request**:
    ```json
    {
        "Authorization": "Bearer <token>"
    }
    ```
- **Response**:
    ```json
    // No content
    ```

## Classroom Endpoints

### Create a New Classroom

- **Endpoint**: `POST /api/classrooms`
- **Description**: Creates a new classroom. Restricted to **superadmin** and **schooladmin** roles.
- **Roles**: Superadmin, Schooladmin  
- **Request**:
    ```json
    {
        "name": "string",
        "school": "string",  // ObjectId reference to the school
        "capacity": 30,
        "resources": ["Projector", "Whiteboard"]
    }
    ```
- **Response**:
    ```json
    {
        "_id": "string",
        "name": "string",
        "school": {
            "_id": "string",
            "name": "string"
        },
        "capacity": 30,
        "resources": ["Projector", "Whiteboard"]
    }
    ```

---

### Get All Classrooms

- **Endpoint**: `GET /api/classrooms`
- **Description**: Fetch all classrooms. Restricted to **superadmin** and **schooladmin** roles.
- **Roles**: Superadmin, Schooladmin  
- **Request**:
    ```json
    {
        "Authorization": "Bearer <token>"
    }
    ```
- **Response**:
    ```json
    [
        {
            "_id": "string",
            "name": "Class A",
            "school": {
                "_id": "string",
                "name": "School Name"
            },
            "capacity": 40,
            "resources": ["Projector", "Whiteboard"]
        }
    ]
    ```

---

### Get Classroom by ID

- **Endpoint**: `GET /api/classrooms/:id`
- **Description**: Fetch a classroom by its ID. Restricted to **superadmin** and **schooladmin** roles.
- **Roles**: Superadmin, Schooladmin  
- **Request**:
    ```json
    {
        "Authorization": "Bearer <token>"
    }
    ```
- **Response**:
    ```json
    {
        "_id": "string",
        "name": "Classroom A",
        "school": {
            "_id": "string",
            "name": "School Name"
        },
        "capacity": 30,
        "resources": ["Projector", "Whiteboard"]
    }
    ```

---

### Update a Classroom

- **Endpoint**: `PUT /api/classrooms/:id`
- **Description**: Updates an existing classroom. Restricted to **superadmin** and **schooladmin** roles.
- **Roles**: Superadmin, Schooladmin  
- **Request**:
    ```json
    {
        "name": "Updated Classroom",
        "capacity": 35,
        "resources": ["Computers", "Projector"]
    }
    ```
- **Response**:
    ```json
    {
        "_id": "string",
        "name": "Updated Classroom",
        "school": {
            "_id": "string",
            "name": "School Name"
        },
        "capacity": 35,
        "resources": ["Computers", "Projector"]
    }
    ```

---

### Delete a Classroom

- **Endpoint**: `DELETE /api/classrooms/:id`
- **Description**: Deletes a classroom. Restricted to **superadmin** and **schooladmin** roles.
- **Roles**: Superadmin, Schooladmin  
- **Request**:
    ```json
    {
        "Authorization": "Bearer <token>"
    }
    ```
- **Response**:
    ```json
    // No content
    ```

## Student Endpoints

### Create a New Student

- **Endpoint**: `POST /api/students`
- **Description**: Creates a new student. Restricted to **superadmin** and **schooladmin** roles.
- **Roles**: Superadmin, Schooladmin  
- **Request**:
    ```json
    {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "classroom": "classroom_id",  // ObjectId reference to the classroom
        "age": 16,
        "address": "123 Main Street"
    }
    ```
- **Response**:
    ```json
    {
        "_id": "string",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "classroom": {
            "_id": "string",
            "name": "Class A"
        },
        "age": 16,
        "address": "123 Main Street"
    }
    ```

---

### Get All Students

- **Endpoint**: `GET /api/students`
- **Description**: Fetch all students. Restricted to **superadmin** and **schooladmin** roles.
- **Roles**: Superadmin, Schooladmin  
- **Request**:
    ```json
    {
        "Authorization": "Bearer <token>"
    }
    ```
- **Response**:
    ```json
    [
        {
            "_id": "string",
            "name": "Jane Smith",
            "email": "jane.smith@example.com",
            "classroom": {
                "_id": "string",
                "name": "Class B"
            },
            "age": 15,
            "address": "456 Elm Street"
        }
    ]
    ```

---

### Get Students by Classroom ID

- **Endpoint**: `GET /api/students/classrooms/:classroomId`
- **Description**: Fetch all students belonging to a specific classroom. Restricted to **superadmin** and **schooladmin** roles.
- **Roles**: Superadmin, Schooladmin  
- **Request**:
    ```json
    {
        "Authorization": "Bearer <token>"
    }
    ```
- **Response**:
    ```json
    [
        {
            "_id": "string",
            "name": "Mark Twain",
            "email": "mark.twain@example.com",
            "classroom": {
                "_id": "string",
                "name": "Class C"
            },
            "age": 17,
            "address": "789 Maple Street"
        }
    ]
    ```

---

### Get Student by ID

- **Endpoint**: `GET /api/students/:id`
- **Description**: Fetch a specific student by their ID. Restricted to **superadmin** and **schooladmin** roles.
- **Roles**: Superadmin, Schooladmin  
- **Request**:
    ```json
    {
        "Authorization": "Bearer <token>"
    }
    ```
- **Response**:
    ```json
    {
        "_id": "string",
        "name": "Alice Johnson",
        "email": "alice.johnson@example.com",
        "classroom": {
            "_id": "string",
            "name": "Class D"
        },
        "age": 16,
        "address": "321 Pine Street"
    }
    ```

---

### Update a Student

- **Endpoint**: `PUT /api/students/:id`
- **Description**: Updates an existing student's information. Restricted to **superadmin** and **schooladmin** roles.
- **Roles**: Superadmin, Schooladmin  
- **Request**:
    ```json
    {
        "name": "Alice Updated",
        "email": "alice.updated@example.com",
        "age": 17,
        "address": "Updated Address"
    }
    ```
- **Response**:
    ```json
    {
        "_id": "string",
        "name": "Alice Updated",
        "email": "alice.updated@example.com",
        "classroom": {
            "_id": "string",
            "name": "Class D"
        },
        "age": 17,
        "address": "Updated Address"
    }
    ```

---

### Delete a Student

- **Endpoint**: `DELETE /api/students/:id`
- **Description**: Deletes a student. Restricted to **superadmin** and **schooladmin** roles.
- **Roles**: Superadmin, Schooladmin  
- **Request**:
    ```json
    {
        "Authorization": "Bearer <token>"
    }
    ```
- **Response**:
    ```json
    // No content
    ```