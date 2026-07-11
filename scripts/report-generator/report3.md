# Chapter 4 - Implementation

## 4.1 Implementation Device Specifications
The implementation phase is where the theoretical design is translated into a working software system. To successfully write, compile, and run the code for the Photographer Portal, specific hardware and software environments were established. 

### 4.1.1 Hardware Specifications
The development was carried out on a standalone personal computer, which provided the necessary computing power to run the client, server, and database containers simultaneously without lag.
- **Processor**: Intel(R) Core(TM) i7 or equivalent (2.0 GHz or higher)
- **Installed RAM**: 16.0 GB
- **Storage**: 512 GB SSD

### 4.1.2 Software Specifications
A robust software environment is critical for modern web development.
- **Operating System**: Microsoft Windows 11 Pro (64-bit)
- **IDE**: Visual Studio Code (VS Code)
- **Version Control**: Git
- **Containerization**: Docker Desktop for Windows
- **Runtime Environment**: Node.js (v20 LTS)
- **Database Server**: PostgreSQL Server 16
- **Web Browsers**: Google Chrome (for testing and debugging)
- **API Testing Tool**: Postman

## 4.2 Module Interactions and Reservation Management
The implemented system relies on the interaction between numerous distinct modules. In the NestJS backend, modules are used to organize the code into cohesive blocks of functionality.

Because this project is fundamentally a **Date Reservation and Management System**, the **Reservations Module** sits at the absolute core of the backend architecture. The reservation management process is modeled as a complex State Machine. 

When a user initiates a booking, the request is received by the **Bookings Module**. This module validates the selected packages and the requested date against the PostgreSQL database to ensure no overlap exists. It then communicates with the **Reservations Module** to create a new database record with a `PENDING` status. 

Once the record is saved, the Reservations Module fires an event that interacts with multiple other subsystems:
1. **RabbitMQ Module**: It places a notification message on the queue. The **Email Module** listens to this queue, picks up the message asynchronously, and dispatches an HTML confirmation email to the user.
2. **Chat Module (Socket.io)**: It initializes a secure WebSocket room for this specific reservation ID, allowing the customer and photographer to immediately begin real-time messaging regarding the event details.
3. **Payments Module**: If the photographer approves the request, the state transitions to `PROPOSED`, and the Payments Module takes over to handle the tracking of the required advance deposit. Once the payment is verified, the reservation state is finally transitioned to `CONFIRMED`.

This deeply interconnected, decoupled interaction ensures that the core reservation logic remains highly reliable while auxiliary features (like sending emails) do not slow down the main server thread.

## 4.3 Implementation Platforms and Frameworks Used
A full-stack JavaScript approach was taken for this project. Utilizing JavaScript (specifically TypeScript) on both the front-end and back-end significantly increases developer productivity, as data models and interfaces can be shared across the entire stack.

### 4.3.1 Back-End Implementation Platforms
- **Node.js**: The underlying runtime environment that allows JavaScript to be executed on the server.
- **NestJS**: A progressive Node.js framework utilized for building efficient, reliable, and scalable server-side applications. Unlike raw Express.js, NestJS enforces an Angular-like architecture using decorators, dependency injection, and strict TypeScript typing.
- **TypeORM**: An Object-Relational Mapper (ORM) that links the TypeScript entity classes directly to the PostgreSQL database tables. It abstracts away raw SQL queries, allowing the database to be manipulated using standard programming methods.

### 4.3.2 Front-End Implementation Platforms
- **React.js**: A declarative JavaScript library used for building interactive user interfaces based on reusable components.
- **Next.js**: A React framework that provides server-side rendering, static site generation, and powerful file-based routing. It was used to ensure the public photographer profiles loaded instantly and were optimized for search engines.
- **Redux Toolkit**: Used to manage the global state of the application on the client-side, such as keeping track of the currently logged-in user, their authentication tokens, and their real-time chat status.

## 4.4 Folder Structures
Proper folder structure is vital for the maintainability of the codebase. The project repository is cleanly divided into a `frontend` directory and a `backend` directory.

### 4.4.1 Back-End Folder Structure
The NestJS backend (`backend/src`) is highly modular:
- **`/entities`**: Contains the TypeORM TypeScript classes that map directly to the PostgreSQL database tables.
- **`/migrations`**: Contains the auto-generated scripts used to create and update the database schema.
- **`/auth`**: Contains the controllers and services responsible for login, registration, and JWT validation.
- **`/reservations`**: Contains the core business logic for handling the state machine of the booking process.
- **`/chat`**: Contains the WebSocket gateways that handle real-time bi-directional messaging.

### 4.4.2 Front-End Folder Structure
The Next.js frontend (`frontend/src/app`) uses the modern App Router architecture:
- **`/book/[slug]`**: Contains the public-facing pages where customers view photographer profiles and initiate bookings.
- **`/dashboard`**: Contains the secured, authenticated pages for managing packages, viewing analytical reports, and approving reservations.
- **`/components`**: Contains reusable UI elements like buttons, modal dialogs, and the interactive calendar.
- **`/store`**: Contains the Redux slices for global state management.

## 4.5 User Authentication
User authentication is arguably the most critical security feature of the system. It proves the identity of the user before allowing them to access sensitive data, such as a customer's personal phone number or the photographer's financial earnings.

Instead of traditional session cookies—which can be difficult to scale across distributed servers—this system implements authentication using **JSON Web Tokens (JWT)**. 

### 4.5.1 JSON Web Token (JWT) Process
A JWT is a compact, URL-safe string that contains three parts: a Header, a Payload, and a Signature.
1. When a user submits their email and password, the backend verifies the credentials.
2. The backend constructs a Payload containing the user's `id` and `role` (e.g., "PHOTOGRAPHER").
3. This Payload is cryptographically signed using a secret key known only to the server.
4. The resulting JWT string is sent back to the client and stored securely.
5. On subsequent requests to protected routes (like viewing reservations), the client attaches this JWT in the HTTP Authorization header. The server verifies the signature. If the signature is valid, the server trusts the Payload and grants access. 

## 4.6 Acknowledgement of Reused Codes and Packages
Modern software development relies heavily on open-source packages to avoid "reinventing the wheel" for solved problems. The following third-party dependencies were crucial to the implementation:

### 4.6.1 Back-End Reused Code Modules
- **`@nestjs/typeorm` & `pg`**: The official integrations to connect the application to the PostgreSQL database natively.
- **`socket.io`**: The core library providing WebSockets to enable the real-time bi-directional chat communication.
- **`bcrypt`**: A robust password-hashing function designed to protect user passwords against rainbow table attacks.
- **`jsonwebtoken`**: An implementation of JSON Web Tokens used to securely sign and verify authentication payloads.
- **`amqplib`**: The standard Node.js client for communicating with the RabbitMQ message broker.
- **`nodemailer`**: A module used within the email service to format and dispatch HTML emails.

### 4.6.2 Front-End Reused Code Modules
- **`react` & `react-dom`**: The core libraries for rendering the component-based UI.
- **`socket.io-client`**: The front-end counterpart used to maintain the active WebSocket connection for the live chat interface.
- **`@reduxjs/toolkit`**: The official toolset for efficient Redux development, used for managing client-side application state.
- **`leaflet` & `react-leaflet`**: An open-source JavaScript library for interactive maps, utilized to render the geographical analytics and base locations of photographers.
- **`date-fns`**: A modern library used to parse, validate, and manipulate dates, heavily utilized within the core Reservation Calendar component.

## 4.7 Routes and API Endpoints
An API (Application Programming Interface) provides the endpoints through which the front-end client communicates with the back-end server. The backend exposes a strictly defined RESTful API, with a heavy emphasis on Reservation Management.

### 4.7.1 GET API Endpoints (Data Retrieval)
The following endpoints are used to retrieve information from the server without modifying the database.

| Endpoint Path | Description | Allowed Roles |
| :--- | :--- | :--- |
| `/api/users/profile` | Fetches the current logged-in user's profile details. | All Authenticated |
| `/api/photographers/:slug` | Fetches the public portfolio, bio, and packages of a specific photographer. | Public |
| `/api/reservations/photographer` | Retrieves a paginated list of all reservations assigned to the currently logged-in photographer. | Photographer, Admin |
| `/api/reservations/customer` | Retrieves a list of all reservations made by the currently logged-in customer. | Customer, Admin |
| `/api/reservations/:id/messages` | Retrieves the real-time chat history associated with a specific reservation. | Assigned Users |
| `/api/reports/analytics` | Fetches aggregated reservation statistics (total earnings, booking counts) for the analytics dashboard. | Admin |
| `/api/audit-logs` | Retrieves the system-wide security audit logs, tracking all reservation state changes. | Super Admin |

### 4.7.2 POST/PATCH/DELETE API Endpoints (Data Modification)
The following endpoints process core system actions.

| Endpoint Path | HTTP Method | Description |
| :--- | :--- | :--- |
| `/api/auth/register` | POST | Registers a new customer user and hashes their password. |
| `/api/auth/login` | POST | Authenticates a user and returns a signed JWT. |
| `/api/reservations/request` | POST | Submits a new booking reservation request. Sets the reservation status to `PENDING`. |
| `/api/reservations/:id/propose` | PATCH | Photographer proposes a quote. Sets reservation status to `PROPOSED`. |
| `/api/reservations/:id/confirm` | PATCH | Photographer manually confirms the payment. Sets reservation status to `CONFIRMED`. |
| `/api/reservations/:id/reject` | PATCH | Photographer rejects the booking request, freeing up the calendar date. |
| `/api/chat/message` | POST | Fallback REST endpoint for sending a message if the WebSocket connection drops. |
| `/api/packages` | POST | Creates a new service package for a photographer. |
| `/api/users/:id` | DELETE | Admin deletes a user account from the system entirely. |
