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
- **Database Server**: PostgreSQL Server 16 (Port 5433)
- **Message Broker**: RabbitMQ 3
- **SMTP Server**: Maildev (SMTP Port 1025, Web UI Port 1080)
- **Web Browsers**: Google Chrome (for testing and debugging)
- **API Testing Tool**: Postman

## 4.2 Module Interactions and Reservation Management
The implemented system relies on the interaction between numerous distinct modules. In the NestJS backend, modules are used to organize the code into cohesive blocks of functionality.

Because this project is fundamentally a Date Reservation and Management System, the **Reservations Module** sits at the absolute core of the backend architecture. When a user initiates a booking, the request is received by the **Bookings Module**. It validates the requested date against the PostgreSQL database to ensure no overlap exists, then communicates with the **Reservations Module** to create a new record with a `PENDING` status. 

Once the record is saved, the Reservations Module fires an event that interacts with multiple other subsystems:
1. **RabbitMQ Module**: It places a notification message on the asynchronous queue, which the Email Module picks up to dispatch an HTML confirmation email to the user.
2. **Chat Module (Socket.io)**: It initializes a secure WebSocket room for this specific reservation ID, allowing the customer and photographer to immediately begin real-time messaging.
3. **Payments Module**: If the photographer approves the request, the Payments Module interfaces with the Stripe API to process the required advance deposit.
4. **Reports & Analytics Module**: Every confirmed transaction is aggregated by this module. It performs complex SQL SUM and COUNT queries via TypeORM to feed live data into the photographer's financial dashboard.

## 4.3 Implementation Platforms and Frameworks Used
A full-stack JavaScript approach was taken for this project. Utilizing JavaScript (specifically TypeScript) on both the front-end and back-end significantly increases developer productivity, as data models and interfaces can be shared across the entire stack.

### 4.3.1 Back-End Implementation Platforms
- **Node.js**: The underlying runtime environment that allows JavaScript to be executed on the server.
- **NestJS 11**: A progressive Node.js framework utilized for building efficient, reliable, and scalable server-side applications. Unlike raw Express.js, NestJS enforces strict TypeScript typing and dependency injection, which heavily reduces runtime errors.
- **TypeORM**: An Object-Relational Mapper (ORM) that links the TypeScript entity classes directly to the PostgreSQL database tables. It abstracts away raw SQL queries, allowing the database to be manipulated using standard programming methods.

### 4.3.2 Front-End Implementation Platforms
- **React 19**: A declarative JavaScript library used for building interactive user interfaces based on reusable components.
- **Next.js 16**: A React framework utilizing the new App Router. It provides powerful file-based routing and Server-Side Rendering (SSR). It was used to ensure the public photographer profiles loaded instantly and were optimized for search engines.
- **Redux Toolkit**: Used to manage the global state of the application on the client-side, heavily utilized to fetch and store the large datasets required for the analytics charts and transaction ledgers.
- **Tailwind CSS 4**: A utility-first CSS framework that allows for rapid UI development without writing custom CSS files.

## 4.4 Folder Structures
Proper folder structure is vital for the maintainability of the codebase. The project repository is cleanly divided into a `frontend` directory and a `backend` directory.

### 4.4.1 Back-End Folder Structure
The NestJS backend (`backend/src`) is highly modular:
- **`/entities`**: Contains the TypeORM TypeScript classes that map directly to the PostgreSQL database tables.
- **`/reservations`**: Contains the core business logic for handling the state machine of the booking process.
- **`/chat`**: Contains the WebSocket gateways that handle real-time bi-directional messaging.
- **`/reports`**: Contains the PDF generation and statistical aggregation logic for the analytics dashboard.

### 4.4.2 Front-End Folder Structure
The Next.js frontend (`frontend/src/app`) uses the modern App Router architecture:
- **`/book/[slug]`**: Contains the public-facing pages where customers view photographer profiles and initiate bookings.
- **`/book/track/[token]`**: The secure tracking page where customers pay deposits and chat with the photographer.
- **`/dashboard`**: Contains the secured, authenticated pages for managing packages, viewing OpenStreetMap analytics, and approving reservations.
- **`/dashboard/reports`**: Contains the React components (`PhotographerAnalyticsCharts.tsx`, `LocationAnalyticsSection.tsx`) responsible for rendering the business management reports.

## 4.5 User Authentication
User authentication proves the identity of the user before allowing them to access sensitive data, such as a customer's personal phone number or the photographer's financial earnings. Instead of traditional session cookies—which can be difficult to scale across distributed servers—this system implements authentication using **JSON Web Tokens (JWT)**. 

A JWT is a compact, URL-safe string. When a user logs in, the backend verifies their credentials and cryptographically signs a payload containing the user's ID and role. On subsequent requests to protected routes (like viewing the transactions dashboard), the client attaches this JWT in the HTTP Authorization header. The server verifies the signature before granting access.

## 4.6 Acknowledgement of Reused Codes and Packages
Modern software development relies heavily on open-source packages to avoid "reinventing the wheel" for solved problems. 

### 4.6.1 Back-End Reused Code Modules
- **`@nestjs/typeorm` & `pg`**: The official integrations to connect the application to the PostgreSQL database natively.
- **`socket.io`**: The core library providing WebSockets to enable the real-time bi-directional chat communication.
- **`amqplib`**: The standard Node.js client for communicating with the RabbitMQ message broker.
- **`stripe`**: The official SDK used to securely communicate with the Stripe API for handling payment intents and webhooks.

### 4.6.2 Front-End Reused Code Modules
- **`socket.io-client`**: The front-end counterpart used to maintain the active WebSocket connection for the live chat interface.
- **`@reduxjs/toolkit`**: The official toolset for efficient Redux development, used for managing client-side application state.
- **`leaflet` & `react-leaflet`**: An open-source JavaScript library for interactive maps, utilized alongside OpenStreetMap tile engines to render geographical analytics.

## 4.7 Routes and API Endpoints
The backend exposes a strictly defined RESTful API. The following endpoints process core system actions related to reservations and analytics.

| Endpoint Path | HTTP Method | Description |
| :--- | :--- | :--- |
| `/api/reservations/request` | POST | Submits a new booking reservation request. Sets the reservation status to `PENDING`. |
| `/api/reservations/:id/confirm` | PATCH | Photographer manually confirms the payment. Sets reservation status to `CONFIRMED`. |
| `/api/reports/analytics` | GET | Fetches aggregated reservation statistics (total earnings, transaction volumes, location map markers) for the management reports dashboard. |
| `/api/payments/intent` | POST | Generates a Stripe payment intent to initiate the secure checkout flow. |
| `/api/chat/message` | POST | Fallback REST endpoint for sending a message if the WebSocket connection drops. |
| `/api/audit-logs` | GET | Retrieves the system-wide security audit logs for the Super Admin. |
