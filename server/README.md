# Handler Method Classifications

## Overview

This document provides a classification of the different handler methods in our RESTful API. These handler methods are designed to perform CRUD (Create, Read, Update, Delete) operations on the resources in the system.

---

### 1. **GET** (`GET /resource`)

**Purpose**:  
Retrieves a single resource from the database based on the identifier (e.g., `GET /user/get/one`).

**Behavior**:

- Searches the database for a resource by its unique identifier (e.g., user ID).
- Returns the resource if found.

**Response**:

- Returns the resource as JSON with a status code:
  - `200 OK` if the resource is found.
  - `404 Not Found` if the resource is not found.

---

### 2. **GET ALL** (`GET /resource/all`)

**Purpose**:  
Retrieves a collection of resources (e.g., `GET /user/get/all`).

**Behavior**:

- Fetches all available records of a specific resource type and returns them in a list.

**Response**:

- Returns an array of resources with a status code of `200 OK`.
- If no records are found, returns an empty array.

---

### 3. **ADD** (`POST /resource/add`)

**Purpose**:  
Adds a new resource to the database (e.g., `POST /user/add`).

**Behavior**:

- Receives the necessary data in the request body.
- Inserts the resource into the database.
- Returns the newly created resource ID.

**Response**:

- Returns a success message and the newly created resource ID with a status code of `201 Created`.

---

### 4. **UPDATE** (`POST /resource/update`)

**Purpose**:  
Updates an existing resource completely based on its identifier (e.g., `POST /user/update`).

**Behavior**:

- Receives the full resource data in the request body.
- Finds the resource by its unique ID and updates it with the new data.

**Response**:

- Returns a success message with the updated resource.
- If the resource is not found, returns an error with a status code of `404 Not Found`.

---

### 5. **PATCH** (`POST /resource/patch`)

**Purpose**:  
Partially updates an existing resource by modifying only the fields specified in the request body (e.g., `POST /user/patch`).

**Behavior**:

- Receives the partial resource data in the request body.
- Finds the resource by its unique ID and updates only the fields provided. Fields not provided remain unchanged.

**Response**:

- Returns a success message and the updated resource.
- If the resource is not found, returns an error with a status code of `404 Not Found`.

---

### 6. **DELETE** (`POST /resource/delete`)

**Purpose**:  
Deletes a resource from the database based on its unique identifier (e.g., `POST /user/delete`).

**Behavior**:

- Receives the unique ID of the resource to delete.
- Removes the resource from the database.

**Response**:

- Returns a success message if the deletion is successful.
- If the resource is not found, returns an error with a status code of `404 Not Found`.

---

## Summary of HTTP Methods:

- **GET**: Retrieves a resource or list of resources.
- **POST**: Used for adding new resources, updating existing ones, or deleting resources.
- **PATCH**: Partially updates a resource.
- **DELETE**: Removes a resource.

Each of these operations is critical in building a robust and scalable RESTful API, and they are designed to handle common database operations effectively.
