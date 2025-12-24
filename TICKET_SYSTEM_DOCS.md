# Ticket System API Documentation

This document outlines the API endpoints for the Ticket Management System.

## Endpoints

### 1. Get Ticket Statistics (Admin)
- **Endpoint**: `GET /ticket/stats`
- **Description**: Retrieves statistics about tickets (e.g., total, active, resolved).
- **Roles**: Admin
- **Response**: JSON object with ticket counts.

### 2. List All Tickets (Admin)
- **Endpoint**: `GET /ticket`
- **Description**: Retrieves a list of all tickets in the system.
- **Roles**: Admin
- **Response**: Array of ticket objects.

### 3. Create Ticket
- **Endpoint**: `POST /ticket`
- **Description**: Creates a new support ticket.
- **Body**:
  ```json
  {
    "title": "Issue Title",
    "description": "Detailed description of the issue"
  }
  ```
- **Response**: Created ticket object.

### 4. Reply to Ticket
- **Endpoint**: `POST /ticket/:id/reply`
- **Description**: Adds a reply/comment to a specific ticket.
- **Restriction**: **Cannot reply to a resolved ticket.** The backend (and frontend service) will reject replies if `status` is `resolved`.
- **Body**:
  ```json
  {
    "comment": "My reply message"
  }
  ```
- **Response**: Updated ticket object with new reply.

### 5. View Ticket Details
- **Endpoint**: `GET /ticket/:id`
- **Description**: Retrieves details of a specific ticket, including its reply history.
- **Roles**: Admin, Manager, Director (if applicable)
- **Response**: Ticket object.
