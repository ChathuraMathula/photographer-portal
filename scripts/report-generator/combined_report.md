# TITLE OF THE DISSERTATION
<CANDIDATE’S INITIALS AND LAST NAME>
<Submission Month> <Submission Year>

# Declaration
I certify that this dissertation does not incorporate, without acknowledgement, any material previously submitted for a degree or diploma in any University/Institute, and to the best of my knowledge and belief, it does not contain any material previously published or written by another person or myself except where due reference is made in the text.

Signature of Candidate: ........................................... Date: ........................
Name of Candidate: ................................................

Countersigned by:
Signature of Supervisor(s)/Advisor(s): ........................................... Date: ........................
Name(s) of Supervisor(s)/Advisor(s): ................................................

# Abstract
Photography is a broad area that has become a widely respected profession since the invention of the camera. Most individual professional photographers who can be hired for events and functions face severe problems when managing their businesses. Reserving a date and time for a client efficiently, without making scheduling errors, and maintaining a friendly, continuous customer relationship is a complex task. Currently, many clients ask for packages and services via phone calls or fragmented social media messages before deciding to hire a photographer. They often request to reserve dates by calling the photographer directly, which leads to a highly time-consuming and error-prone process of manually recording each customer’s details.

This project focuses on completely automating the business process of reserving dates online, enabling real-time communication, and managing financial payments. The primary goal is to assist the photographer in reducing administrative time and costs, while significantly increasing the efficiency and accuracy of the reservation process. To solve these issues, a robust, web-based date reservation and management system—the "Photographer Portal"—was built entirely from scratch. The system showcases all necessary details customers need to select a package, offers a real-time messaging interface for direct communication, and seamlessly manages the state of reservations. 

This project was executed using the traditional monolithic Waterfall software development life cycle, as the core system requirements were fixed and designed upfront. The system was developed using a modern technology stack: React 19 and Next.js 16 (App Router) for the frontend, and NestJS 11 (Node.js) for the backend API. While the project initially began with MongoDB, it was deliberately migrated to PostgreSQL 16 to strictly enforce the complex relational integrity required by financial transactions and reservations. Furthermore, WebSockets were utilized to implement a live chat feature, Stripe API for secure payments, and OpenStreetMap for interactive geolocation analytics.

The main deliverable of this project is a fully functioning web-based platform that efficiently fulfills the given user requirements, allowing photographers to manage their professional lives with ease while providing a superior, transparent booking experience for their customers.

# Acknowledgements
This endeavour would not have been possible without my supervisor who guided and assisted me during the tough time I faced throughout the project.

At the same time, all the teachers and lecturers who taught me since my childhood should be kindly appreciated and thanked.

I would like to express my deepest gratitude to the professional photographers who have been in the industry for years for helping me succeed in this project by giving me all the necessary details and their invaluable time to build this software system.

I am also thankful to both of my university and school colleagues who supported me in completing this project by injecting me with their amazing ideas.

Similarly, I could not have undertaken this journey without my family who assisted me by proofreading this thesis as well as other reports I wrote.

Last but not least, words cannot express my gratitude to my parents and family members who helped me to complete this project successfully.

# Chapter 1 Introduction

## 1.1 Problem and background
Most individual professional photographers who can be hired for events and functions face intense difficulties when attempting to reserve an available date and time for a customer. The background of this problem stems from the fact that independent photographers run their businesses entirely alone. They do not have dedicated secretaries or management teams to handle their business operations. As a result, they must balance their time between actual photography, editing, and managing client communications. 

When a potential client wants to hire a photographer, the process usually starts with a simple inquiry over a phone call or a direct message on a platform like WhatsApp or Instagram. The photographer then has to manually check a physical diary or a disjointed digital calendar to see if the requested date is available. Miscommunications frequently happen during these back-and-forth conversations, leading to dates being double-booked or critical event details (such as the exact venue location) being missed entirely.

## 1.2 Motivation
The motivation behind this project is to eliminate the inefficiencies, fragmented communications, and errors present in the manual booking process. Many customers ask for details about packages and services through lengthy phone calls even if they do not end up hiring the photographer, which wastes a significant amount of the photographer's valuable time. Taking down each event detail manually is very time-consuming and highly error-prone. 

Furthermore, the lack of a centralized platform creates a disjointed customer experience. Customers must bounce between social media to see portfolios, phone calls to ask for prices, and banking apps to send payment receipts. This lack of professional cohesion can disappoint customers and lead to lost business. Therefore, it is highly advantageous to find a comprehensive solution to this problem by building a centralized, web-based date reservation and management system. 

## 1.3 Aims, and Objectives of the Project
The main objective of the Photographer Portal is to provide a unified platform to reserve an available date to get a photographer hired online and to efficiently manage the reservations, payments, and client communications.

The specific objectives are:
- To track all information about customers, their events, and their payments securely.
- To manage reservations by properly displaying them to the photographer in a clear, interactive calendar dashboard.
- To implement real-time chat functionality so clients and photographers can communicate securely within the system itself, eliminating the need for external messaging apps.
- To manage the photographer’s public profile, showcasing their contact information, portfolio albums, and package details.
- To fully automate the business process, from the initial customer inquiry to the final confirmation of an advance payment deposit via the Stripe payment gateway.

## 1.4 Scope of the Project
The scope defines the exact boundaries of the developed system. The system encompasses the following areas:

1. The system showcases the photographer’s details (contact details, packages, portfolios, and OpenStreetMap locations) to the customers online without requiring an account. Customers access public landing pages via custom URLs (e.g., `/book/[slug]`).
2. It collects customer, payment, and reservation details by allowing users to fill out secure online forms.
3. The Super Administrator is responsible for overseeing the system, capable of managing users, updating booking slugs, generating analytical reports, and viewing system-wide audit logs.
4. The system allows customers to select a base package and add additional extra services before requesting a reservation.
5. The customers can pick an available date via an interactive calendar and input their specific event details to initiate a booking request.
6. The chosen date is temporarily held (marked as pending) while the reservation request is being processed to prevent simultaneous double-booking.
7. The photographer can review incoming requests, propose a custom estimated price, and specify the advance payment required.
8. The system includes an integrated Payments Module utilizing the Stripe API, allowing the customer to securely process deposits via a unique tracking token at `/book/track/[token]`. If a customer fails to process the payment within a specified deadline, the system automatically releases the date.
9. Real-Time Chat is fully implemented via Socket.io. Customers and photographers can exchange live messages regarding specific event details directly inside the application tracking page.
10. The system handles automated email notifications (via a RabbitMQ message broker and Maildev SMTP) to inform users of critical state changes (e.g., when a booking is confirmed).
11. The photographer has full control over their calendar, able to manually block out unavailable dates for personal holidays.

# Chapter 2 – Analysis

## 2.1 Analysis

### 2.1.1 Existing System and Problem Description
The existing manual system for managing photography bookings is heavily fragmented. When a customer wants to book a photographer, they must find them on social media and send a direct message. The photographer must stop their current work, manually check their physical diary, and reply. If the date is free, the photographer must manually type out package details or send a static PDF brochure. 

If the customer agrees to the price, the photographer asks for the event details and writes them down. To secure the date, the photographer sends their bank details. The customer makes the transfer and sends a screenshot of the receipt via a chat app. The photographer then manually verifies the bank account, confirms receipt, and marks the date as booked in their diary.

This manual process suffers from several severe limitations:
- **High Risk of Errors**: Writing details on paper or managing them in endless chat threads leads to lost information and accidental double-bookings.
- **Inefficiency**: The constant back-and-forth communication for simple inquiries consumes hours of the photographer's week.
- **Scattered Data**: Because communication happens on WhatsApp, payments on banking apps, and scheduling in a physical diary, there is no single "source of truth." This makes auditing or resolving disputes incredibly difficult.

*[INSERT MANUAL PROCESS FLOWCHART HERE]*

### 2.1.2 Review of Similar Systems
To understand the landscape of reservation software, existing systems were reviewed. While they operate in different business domains, they share the same underlying scheduling logic.

**Online Hotel Room Reservation System (Colombo Hilton Hotel)**
The Hilton Hotel utilizes an effective hotel room reservation system embedded in their official website. It offers customers the option to check room availability and rates without needing to log in. Customers can book a reservation by properly filling out a generated form with payment and personal details. The system strictly validates user input and handles payments via credit cards. This system is an excellent example of how clean user interfaces and step-by-step booking flows simplify complex reservations.

**Online Train Seats Reservation System (Sri Lanka Railways)**
The Sri Lanka Railways developed an online train seat reservation system to automate their bookings. This system allows passengers to check the availability of trains based on routes and dates. Once a seat is selected, the system temporarily holds that seat while the user enters passenger information and completes the payment. This demonstrates the critical importance of a robust state machine that temporarily holds a resource to prevent race conditions (double-booking).

### 2.1.3 System Requirements Analysis

#### 2.1.3.1 Functional Requirements
The core functional requirements for the Photographer Portal are:
- **User Management**: The system must support role-based accounts for Super Admins, Admins, Photographers, and Public Customers.
- **Profile & Package Management**: Photographers must be able to configure their bios, base locations (using OpenStreetMap coordinates), and service packages.
- **Reservation Workflow**: Customers must be able to submit booking requests, which photographers can subsequently review, propose quotes for, and confirm or reject based on payments.
- **Real-Time Messaging**: The system must facilitate live, bi-directional text communication between the photographer and the client regarding a specific reservation.
- **Payment Processing**: The system must handle the tracking and verification of reservation deposits using Stripe to update booking statuses.
- **Notifications**: The system must send automated emails to customers for booking tracking and state changes.
- **Analytical Reports**: The system must generate visual heatmaps based on booking locations and earnings charts for photographers and Super Admins.

#### 2.1.3.2 Security as a Functional Requirement
Because this system handles personal customer data and financial transaction records, security is a core functional requirement.
- **Role-Based Access Control (RBAC)**: A customer must under no circumstances be able to view another customer's reservations. The photographer must only be able to view their own bookings. Super Admins are the only users who can access the system-wide Audit Logs.
- **Authentication**: Secure login mechanisms using encrypted JSON Web Tokens (JWT) are required.
- **Input Validation**: All API endpoints must rigidly validate incoming payloads to prevent SQL injection and cross-site scripting (XSS) attacks.

#### 2.1.3.3 Non-Functional Requirements
- **Performance**: The system must load the public booking pages (`/book/[slug]`) in under 2 seconds to ensure a smooth user experience.
- **Scalability**: The backend architecture must be decoupled to allow independent scaling of the API, the PostgreSQL database, and the RabbitMQ message queues.
- **Usability**: The application must be fully responsive, ensuring photographers can manage their business on mobile devices as easily as on desktop computers.
- **Reliability**: The system must process concurrent booking requests securely without data corruption.

### 2.1.4 Justification of Development Approach and Technologies

#### 2.1.4.1 Chosen SDLC Model and Rationale
The **Monolithic Waterfall model** was selected for this project. The Waterfall model is a plan-driven process where development is carried out in strict, sequential phases: requirements definition, system analysis and design, implementation, testing, and finally operation.

This model was chosen and justified because the system's requirements were entirely fixed upfront. As a solo developer building this system from scratch with a strict deadline, I needed a highly disciplined and predictable path. Unlike large enterprise teams that might benefit from Agile pivots, I acted as the sole architect, designer, and programmer. The Waterfall approach allowed me to deeply design the strict relational database schema first, implement the backend APIs second, and finally build the frontend interfaces without the chaotic overhead of iterative redesigns. 

#### 2.1.4.2 Technology Stack Justification
To build this robust system from scratch, a modern and powerful technology stack was carefully selected based on performance, relevance, and technical requirements.

- **Backend Framework (NestJS 11)**: NestJS was chosen over basic Express.js because it enforces a highly structured, scalable, and object-oriented architecture out of the box using TypeScript. This ensures the backend code is strictly typed, heavily reducing runtime errors.
- **Frontend Framework (Next.js 16 & React 19)**: Next.js with its App Router provides powerful file-based routing and Server-Side Rendering (SSR). SSR is absolutely critical for the Photographer Portal because public pages (like the photographer's portfolio) must be easily indexable by search engines (SEO).
- **The Database Transition (MongoDB to PostgreSQL 16)**: At the very beginning of the project, MongoDB (a NoSQL database) was initially considered for its ease of setup. However, during the deep analysis phase, it became explicitly clear that a reservation system inherently requires strict, complex relational data. A single reservation is directly tied to a specific customer, a specific photographer, a package, chat messages, and payment records. Using a NoSQL document store would lead to massive data duplication and potential data anomalies if a package price changed or a user was deleted. Therefore, I made the crucial engineering decision to migrate the architecture to **PostgreSQL**. PostgreSQL is an advanced, highly reliable relational database that guarantees ACID compliance and ensures transactional integrity through strict foreign key constraints, which is absolutely vital for a system handling financial bookings.
- **Real-Time Communication (Socket.io)**: To fulfill the real-time chat requirement, WebSockets were chosen over HTTP polling because they maintain a persistent, low-latency bi-directional connection between the client and the server.
- **Maps and Styling**: Tailwind CSS 4 was utilized for rapid UI development. For interactive geocoding and analytics mapping, OpenStreetMap and Leaflet were utilized rather than proprietary vendor APIs to reduce long-term operational costs.


# Chapter 3 - Design

## 3.1 Design Strategies
The design phase of a software system is the most critical part of the SDLC. It translates the theoretical requirements gathered during the analysis phase into a structured, logical blueprint that developers can follow to implement the system.

Even though the proposed date reservation system could theoretically be implemented entirely from scratch using only raw, low-level programming constructs, doing so is considered a bad practice in modern software engineering. Implementing standard protocols from scratch increases development time, costs, and the likelihood of introducing severe bugs and security vulnerabilities. Therefore, a major design strategy was to utilize reliable, free, and open-source software (FOSS) utility components and libraries to handle complex but standard logic. This includes using libraries for database connectivity, real-time WebSockets, cryptographic password hashing, and HTML email dispatching. By doing so, the project maintains robustness, consistency, and security, allowing the primary development focus to remain firmly on the unique business logic of the reservation process itself.

## 3.2 System Architecture Overview
Architectural design exposes the system’s overall structure clearly to help stakeholders understand how different subsystems communicate. Because the proposed system is a modern web application, it was decided to use a combination of the Three-Tier Architecture and the Model-View-Controller (MVC) design pattern.

The Three-Tier Architecture logically and physically separates the system into three distinct tiers:
1. **Presentation Tier (Client-Side)**: This tier represents the front-end of the proposed system. It is implemented using Next.js and runs within the customer's or photographer's web browser, served on **Port 4000**. It is responsible for rendering the user interfaces, capturing user inputs, maintaining WebSocket connections for the live chat, and displaying data using Redux RTK Store for global state.
2. **Application Tier (Server-Side)**: This tier represents the back-end business logic. It is implemented using NestJS and runs on a Node.js server environment on **Port 4001**. This tier receives requests from the presentation tier, processes the business rules (such as checking if a date is truly available), manages the real-time WebSocket server, and communicates with the database.
3. **Database Tier (Storage)**: This tier represents the persistent data storage. It is implemented using a PostgreSQL database server exposed on **Port 5433**. It securely stores all records regarding users, packages, chat messages, and reservations.

Because each tier represents a distinct physical separation, the code in the Presentation Tier never directly accesses the Database Tier. It must communicate through the Application Tier via secured RESTful API endpoints and WebSocket channels.

*[INSERT SYSTEM ARCHITECTURE DIAGRAM HERE]*

As depicted in the architecture diagram, the system also incorporates powerful external integrations to handle specific tasks efficiently:
- A **RabbitMQ** message broker acts as an asynchronous queue within the Application Tier to process email notifications without slowing down the main server thread. 
- A **Maildev** SMTP Server runs on Port 1080 to capture and display outbound emails.
- A **Real-Time Messaging Engine** runs alongside the REST API, utilizing WebSockets to push live chat messages instantly between the customer and the photographer.
- External APIs like **Stripe** and **OpenStreetMap** are integrated into the Application and Presentation tiers respectively to handle secure payments and geographical map rendering.

## 3.3 Database Design
The database is the foundational bedrock of the system. As previously mentioned in the analysis chapter, a deliberate architectural decision was made to utilize **PostgreSQL** over a NoSQL database. Because the system manages strict, interconnected data—such as a reservation that must belong to exactly one customer, exactly one photographer, and must include exactly one package—a strict relational database design was mandatory to prevent orphaned data.

Entity-Relationship (ER) diagrams are utilized to visually design and represent the schema of the relational database. The ER diagram defines the tables (entities), their columns (attributes), and how they link to one another through primary and foreign keys (relationships).

*[INSERT ER DIAGRAM HERE]*

As depicted in the ER diagram, the database is highly normalized to prevent data redundancy and anomalies:
- The **`users`** table acts as the central entity for authentication, storing shared properties like email, password hash, and role (SUPER_ADMIN, ADMIN, PHOTOGRAPHER).
- The **`photographer_profiles`** table shares a strict One-to-One relationship with the `users` table. It holds details specific only to photographers, such as their booking slug, bio, district, and universal deposit values.
- The **`customers`** table holds the specific profile details for regular users who wish to place a booking.
- The **`packages`** table holds a Many-to-One relationship with the `users` table (specifically the photographer). A single photographer can offer many different packages, but a package belongs to only one photographer.
- The **`reservations`** table is the core transactional entity. It sits at the intersection of `customers` and `users` (photographers), acting as a bridging table that records the date, time, selected packages, costs, and the current status (e.g., PENDING, PROPOSED, CONFIRMED) of the booking event.
- The **`messages`** table is newly introduced to support the Real-Time Chat feature. It holds a Many-to-One relationship with the `reservations` table, meaning a single reservation can have an infinite history of chat messages tied directly to it.
- The **`payments`** table holds a Many-to-One relationship with `reservations`, recording successful or failed deposit transactions.
- The **`audit_logs`** table uniquely utilizes a "loose" relationship (no strict database foreign key) to the `users` table. This design decision ensures that if a user account is deleted from the system, their historical actions remain preserved in the audit log for security and compliance purposes.

## 3.4 Workflow and Behavioral Modeling
Understanding how the system behaves over time and how users achieve their goals is just as important as understanding its static structure. Use Case diagrams provide a high-level visual representation of the interactions between the system's actors (users) and its functional capabilities.

*[INSERT USE CASE DIAGRAM HERE]*

As shown in the Use Case Diagram, there are three primary actors in the system:
1. **Customer**: Can search for photographers, view packages, manage their own profile, and initiate the "Book a Session" workflow. The customer can also engage in "Real-Time Chat" with the photographer regarding their specific booking, and process payments via Stripe.
2. **Photographer**: Can manage their profile, portfolio, and service packages. They have the critical capability to manage incoming bookings—specifically approving or rejecting them based on the provided event details and payment validations. They also utilize the "Real-Time Chat" to negotiate details directly with the client.
3. **Super Admin**: Has overarching control to manage all system users. This includes the ability to update photographer booking slugs (e.g., changing `alice-clicks` to `alice-photography`). They can also view system-wide analytical reports, access the system audit logs, and resolve disputes.

## 3.5 User Interface Design
The User Interface (UI) is the bridge between the human users and the complex backend logic. If a UI is confusing or cluttered, the system will fail, regardless of how well the backend is coded. The proposed system’s presentation logic was designed using modern UI principles, focusing on mobile responsiveness, consistency, and clean typography.

Because the customers will primarily access the photographer's booking portal via mobile devices (e.g., clicking a link on an Instagram profile on their phone), a "Mobile-First" design approach was strictly utilized. The UI components were built using the React framework in conjunction with Tailwind CSS. 

Key UI design decisions included:
- **Consistent Color Schemes**: Utilizing a cohesive brand palette (dark and light modes) that looks professional, modern, and trustworthy.
- **Interactive Calendars**: Instead of simple dropdowns, a visual, reactive calendar component was designed. This allows customers to immediately see which dates are available (green) or already booked (red) at a glance.
- **Real-Time Chat Window**: A dedicated, floating chat interface attached to the reservation view, allowing users to type and receive messages instantly without refreshing the page.
- **Modal Dialogs**: For complex, multi-step actions like submitting a reservation or uploading a payment slip, modal dialog boxes (pop-ups) are used. This keeps the user on the current page context without jarring navigation redirects, significantly improving the user experience.


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

Because this project is fundamentally a **Date Reservation and Management System**, the **Reservations Module** sits at the absolute core of the backend architecture. The reservation management process is modeled as a complex State Machine. 

When a user initiates a booking, the request is received by the **Bookings Module**. This module validates the selected packages and the requested date against the PostgreSQL database to ensure no overlap exists. It then communicates with the **Reservations Module** to create a new database record with a `PENDING` status. 

Once the record is saved, the Reservations Module fires an event that interacts with multiple other subsystems:
1. **RabbitMQ Module**: It places a notification message on the queue. The **Email Module** listens to this queue, picks up the message asynchronously, and dispatches an HTML confirmation email to the user via Maildev.
2. **Chat Module (Socket.io)**: It initializes a secure WebSocket room for this specific reservation ID, allowing the customer and photographer to immediately begin real-time messaging regarding the event details.
3. **Payments Module**: If the photographer approves the request, the state transitions to `PROPOSED`, and the Payments Module interfaces with the Stripe API to handle the tracking of the required advance deposit. Once the payment is verified, the reservation state is finally transitioned to `CONFIRMED`.
4. **Audit Logs Module**: Every critical state change (e.g., creating the reservation, accepting payment) is asynchronously recorded in the Audit Logs Module to maintain a strict, system-wide history.

This deeply interconnected, decoupled interaction ensures that the core reservation logic remains highly reliable while auxiliary features (like sending emails) do not slow down the main server thread.

## 4.3 Implementation Platforms and Frameworks Used
A full-stack JavaScript approach was taken for this project. Utilizing JavaScript (specifically TypeScript) on both the front-end and back-end significantly increases developer productivity, as data models and interfaces can be shared across the entire stack.

### 4.3.1 Back-End Implementation Platforms
- **Node.js**: The underlying runtime environment that allows JavaScript to be executed on the server.
- **NestJS 11**: A progressive Node.js framework utilized for building efficient, reliable, and scalable server-side applications. Unlike raw Express.js, NestJS enforces an Angular-like architecture using decorators, dependency injection, and strict TypeScript typing.
- **TypeORM**: An Object-Relational Mapper (ORM) that links the TypeScript entity classes directly to the PostgreSQL database tables. It abstracts away raw SQL queries, allowing the database to be manipulated using standard programming methods.

### 4.3.2 Front-End Implementation Platforms
- **React 19**: A declarative JavaScript library used for building interactive user interfaces based on reusable components.
- **Next.js 16**: A React framework utilizing the new App Router. It provides powerful file-based routing and Server-Side Rendering (SSR). It was used to ensure the public photographer profiles loaded instantly and were optimized for search engines.
- **Redux Toolkit**: Used to manage the global state of the application on the client-side, such as keeping track of the currently logged-in user, their authentication tokens, and their real-time chat status.
- **Tailwind CSS 4**: A utility-first CSS framework that allows for rapid UI development without writing custom CSS files.

## 4.4 Folder Structures
Proper folder structure is vital for the maintainability of the codebase. The project repository is cleanly divided into a `frontend` directory and a `backend` directory.

### 4.4.1 Back-End Folder Structure
The NestJS backend (`backend/src`) is highly modular:
- **`/entities`**: Contains the TypeORM TypeScript classes that map directly to the PostgreSQL database tables.
- **`/migrations`**: Contains the auto-generated scripts used to create and update the database schema.
- **`/auth`**: Contains the controllers and services responsible for login, registration, and JWT validation.
- **`/reservations`**: Contains the core business logic for handling the state machine of the booking process.
- **`/chat`**: Contains the WebSocket gateways that handle real-time bi-directional messaging.
- **`/reports`**: Contains the PDF generation and statistical aggregation logic for the analytics dashboard.

### 4.4.2 Front-End Folder Structure
The Next.js frontend (`frontend/src/app`) uses the modern App Router architecture:
- **`/book/[slug]`**: Contains the public-facing pages where customers view photographer profiles and initiate bookings.
- **`/book/track/[token]`**: The secure tracking page where customers pay deposits and chat with the photographer.
- **`/dashboard`**: Contains the secured, authenticated pages for managing packages, viewing OpenStreetMap analytics, and approving reservations.
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
- **`nodemailer`**: A module used within the email service to format and dispatch HTML emails to Maildev.
- **`stripe`**: The official SDK used to securely communicate with the Stripe API for handling payment intents and webhooks.

### 4.6.2 Front-End Reused Code Modules
- **`react` & `react-dom`**: The core libraries for rendering the component-based UI.
- **`socket.io-client`**: The front-end counterpart used to maintain the active WebSocket connection for the live chat interface.
- **`@reduxjs/toolkit`**: The official toolset for efficient Redux development, used for managing client-side application state.
- **`leaflet` & `react-leaflet`**: An open-source JavaScript library for interactive maps, utilized alongside OpenStreetMap tile engines to render geographical analytics and base locations of photographers.
- **`date-fns`**: A modern library used to parse, validate, and manipulate dates, heavily utilized within the core Reservation Calendar component.
- **`shadcn/ui`**: A collection of re-usable, accessible UI components.

## 4.7 Routes and API Endpoints
An API (Application Programming Interface) provides the endpoints through which the front-end client communicates with the back-end server. The backend exposes a strictly defined RESTful API, with a heavy emphasis on Reservation Management.

### 4.7.1 GET API Endpoints (Data Retrieval)
The following endpoints are used to retrieve information from the server without modifying the database.

| Endpoint Path | Description | Allowed Roles |
| :--- | :--- | :--- |
| `/api/users/profile` | Fetches the current logged-in user's profile details. | All Authenticated |
| `/api/photographers/:slug` | Fetches the public portfolio, bio, and packages of a specific photographer. | Public |
| `/api/reservations/photographer` | Retrieves a paginated list of all reservations assigned to the currently logged-in photographer. | Photographer, Admin, Super Admin |
| `/api/reservations/customer` | Retrieves a list of all reservations made by the currently logged-in customer. | Customer, Admin, Super Admin |
| `/api/reservations/:id/messages` | Retrieves the real-time chat history associated with a specific reservation. | Assigned Users |
| `/api/reports/analytics` | Fetches aggregated reservation statistics (total earnings, booking counts, location map markers) for the analytics dashboard. | Photographer, Admin, Super Admin |
| `/api/audit-logs` | Retrieves the system-wide security audit logs, tracking all reservation state changes and admin actions. | Super Admin |

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
| `/api/payments/intent` | POST | Generates a Stripe payment intent to initiate the secure checkout flow. |
| `/api/chat/message` | POST | Fallback REST endpoint for sending a message if the WebSocket connection drops. |
| `/api/packages` | POST | Creates a new service package for a photographer. |
| `/api/users/:id` | DELETE | Super Admin deletes a user account from the system entirely. |
| `/api/photographers/:id/slug` | PATCH | Super Admin updates a photographer's booking slug URL. |


# Chapter 5 - Evaluation

Software testing is an essential task in the software development lifecycle. It ensures that the implemented Photographer Portal, particularly its core reservation management features, meets all functional and non-functional requirements by evaluating and verifying its behavior under various conditions. Rigorous software testing provides numerous advantages, including improving the overall quality of the software, significantly reducing operational risks, saving time and money, and most importantly, improving customer satisfaction by delivering a reliable product.

## 5.1 Common Types of Software Testing
Different testing methodologies were employed to evaluate the system. 

- **Unit Testing**: This is the testing approach that focuses on testing individual, isolated units of code. In this project, the Jest testing framework was utilized to test the backend services (such as verifying the algorithms that calculate the exact advance deposit prices for a reservation based on package selections).
- **Integration Testing**: This approach tests how different units of code interact with one another. For example, testing if the `ChatModule` correctly authenticates a WebSocket connection by verifying the JWT against the `UsersModule` before allowing a user to join a live chat room.
- **System Testing**: In this testing approach, the software system is evaluated as a complete, integrated whole. This ensures the frontend and backend communicate correctly to satisfy end-to-end business requirements, like transitioning a reservation from `PENDING` to `CONFIRMED`.
- **User Acceptance Testing (UAT)**: This final phase of testing is carried out with the help of actual end users to determine whether the software system truly meets the business needs in a real-world scenario.

## 5.2 Test Plan Used
Every major API endpoint and React frontend component was thoroughly evaluated. The primary focus of the system testing was on critical user workflows: authentication, reservation creation, real-time chat, and geolocation mapping. The tests were designed to cover both "happy paths" (where the user provides all correct data) and "edge cases" (where the user inputs invalid data or attempts unauthorized actions).

## 5.3 Real System Test Cases
Test cases are formalized scenarios used to evaluate that the system performs exactly as required. The tables below outline the actual test cases used to evaluate the implemented Photographer Portal.

### 5.3.1 Booking & Concurrency Operation Test Cases
These tests evaluate the core booking engine, specifically ensuring that race conditions (double-booking) and asynchronous queues function correctly.

| Test ID | Scenario / Tasks Performed | Expected Result | Real Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-B01** | **Standard Booking**: Customer selects a package, picks an available date, fills in event details, and submits the form at `/book/[slug]`. | System creates a `PENDING` reservation in PostgreSQL. A `RabbitMQ` message is published, and `Maildev` captures the HTML confirmation email. | Reservation saved. RabbitMQ processed the event. Maildev received the HTML email successfully. | Pass |
| **TC-B02** | **Concurrency Prevention**: Two different customers attempt to submit a booking for the exact same date and time simultaneously. | The database should process the first request and lock the date. The second request should be rejected by the backend with a `400 Bad Request` error. | First booking succeeded. Second booking was safely rejected, preventing a double-booking. | Pass |
| **TC-B03** | **Deposit Payment via Stripe**: Customer opens the tracking link (`/book/track/[token]`), reviews the quote, and processes a deposit payment using a mock Stripe test card. | The Stripe webhook should trigger the `PaymentsModule`, save the transaction record, and flag the reservation for photographer review. | Stripe webhook received. Payment record created successfully in the database. | Pass |
| **TC-B04** | **Booking Confirmation**: Photographer reviews the payment record and clicks "Confirm Reservation". | System updates the status to `CONFIRMED`. The date remains permanently blocked on the interactive calendar. | Status updated to `CONFIRMED`. Customer received final confirmation email via Maildev. | Pass |

### 5.3.2 Real-Time Chat (WebSocket) Test Cases
These tests evaluate the persistent, low-latency communication engine.

| Test ID | Scenario / Tasks Performed | Expected Result | Real Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-C01** | **Bi-Directional Messaging**: Customer navigates to a reservation tracking page and types a message. Photographer has the dashboard open. | The message should be sent instantly over `Socket.io` and saved in the PostgreSQL `messages` table. Photographer UI updates instantly. | Message persisted in DB. Photographer UI updated immediately without a page refresh. | Pass |
| **TC-C02** | **Unauthorized Room Access**: A malicious user attempts to connect their WebSocket client to a reservation room ID they do not own. | The backend WebSocket gateway must verify the JWT payload and reject the connection, emitting an unauthorized event. | Connection rejected immediately. Error emitted to the malicious client. | Pass |
| **TC-C03** | **Offline Message Fallback**: Customer sends a message while the photographer is offline. | Message saves to DB. Next time photographer logs in, Redux state fetches the unread message history. | Message saved. History loaded successfully upon photographer login. | Pass |

### 5.3.3 Geolocation & Super Admin Test Cases
These tests ensure external map integrations and high-level administrative functions operate flawlessly.

| Test ID | Scenario / Tasks Performed | Expected Result | Real Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-A01** | **Geolocation Picker**: Photographer updates their profile, clicking a location on the `OSMMapPicker` component. | The Latitude and Longitude coordinates, along with City and District, should be extracted and saved to `photographer_profiles`. | Coordinates and district accurately extracted from OpenStreetMap and saved. | Pass |
| **TC-A02** | **Map Analytics Cluster Rendering**: Photographer loads the `LocationAnalyticsSection` dashboard. | The backend `ReportsModule` should aggregate booking counts by district and render clustered color-coded markers on the Leaflet map. | Map rendered successfully with clustered markers reflecting true booking locations. | Pass |
| **TC-A03** | **Slug Modification**: Super Admin navigates to the dashboard and modifies a photographer's booking slug from `alice-clicks` to `alice-photography`. | The old `/book/alice-clicks` URL should return a 404, and the new URL should properly serve the portfolio. | Profile successfully loaded on the new URL. Old URL returned a 404 Not Found error. | Pass |
| **TC-A04** | **Audit Log Tracking**: Super Admin logs in and navigates to the Audit Logs page to review the slug change from TC-A03. | The Audit Logs table should display the exact timestamp, the Super Admin's email, and the specific action taken. | Audit log populated successfully with the exact action string and user email. | Pass |

## 5.4 User Acceptance Testing (UAT)
User Acceptance Testing was carried out by providing access to the deployed system to a professional photographer and an ordinary individual representing a standard customer. 

**Feedback and Observations:**
- **Photographer Feedback**: The photographer found the reservation management dashboard incredibly intuitive. They specifically noted that the color-coded calendar (Available, Pending, Confirmed) made it easy to visualize their monthly schedule at a single glance. They heavily praised the Real-Time Chat functionality, stating that having all client conversations tied directly to the specific reservation completely solved their problem of scattered social media messages. They also loved the OpenStreetMap geographical cluster view, which allowed them to easily see where most of their bookings were located.
- **Customer Feedback**: The customer user found the step-by-step modal interfaces for making a booking very easy to use on their smartphone. They appreciated the immediate email notifications and the live chat, stating it provided a highly professional feel compared to traditional phone bookings.

# Chapter 6 - Conclusion

## 6.1 Critical Evaluation
The primary objective of the implemented date reservation and management system was to simplify and speed up the process of making reservations to hire a photographer online. By critically evaluating the final deliverable against the initial requirements, it is clear that the project was a resounding success. 

Typically, independent photographers rely on fragmented phone calls, social media messages, and handwritten diaries to manage their business. This manual process is slow, highly inaccurate, and frustrating for both the photographer and the client. The newly developed web-based "Photographer Portal" successfully overcomes these difficulties. It provides a centralized, secure, and automated platform that handles everything from the initial customer inquiry, to real-time chat negotiations, to the final payment confirmation via Stripe. The use of a robust PostgreSQL database ensures that double-bookings are technically impossible, while the integration of an asynchronous RabbitMQ email system guarantees that clients are always kept in the loop regarding their reservation status.

## 6.2 Lessons Learnt and Personal Reflection
This project served as a profound learning experience, allowing me to apply theoretical software engineering concepts to a complex, real-world problem.

- **The Database Migration**: The most critical lesson learned was recognizing the importance of choosing the right tool for the job. Initially, the project started with MongoDB because of its rapid setup time. However, as the reservation logic became more complex—requiring strict linkages between users, packages, chat messages, and payments—it became clear that a document-based NoSQL database was the wrong choice. I learned the immense value of pivoting the architecture and migrating the entire system to **PostgreSQL**. The relational structure provided by PostgreSQL prevented data anomalies and ensured strict data integrity, which is absolutely vital for a business scheduling system.
- **Real-Time WebSockets**: Implementing the live chat using Socket.io taught me the complexities of managing persistent, stateful connections between the client and the server, as opposed to traditional stateless REST APIs.
- **System Architecture**: I learned the value of decoupling system components. Utilizing Docker to containerize the database and message brokers taught me how enterprise-level applications are orchestrated and deployed.

## 6.3 Future Improvements
While the current system robustly meets all its core objectives, software is never truly "finished." Several enhancements could be explored in future iterations to further increase the system's value:

1. **Automated PDF Invoice Generation**: Implementing a feature that automatically generates a commercial PDF invoice and emails it to the customer upon reservation confirmation would further professionalize the photographer's business operations.
2. **SMS Notifications**: While the current system relies heavily on email, integrating an SMS gateway (like Twilio) to send instant text message alerts for upcoming bookings would significantly reduce client no-shows.

# References
[1] Ian Sommerville, *Software Engineering*, 10th ed, Pearson Education Limited, 2016.
[2] "NestJS - A progressive Node.js framework", NestJS, 2023. [Online]. Available: https://nestjs.com/
[3] "Next.js by Vercel - The React Framework", Vercel, 2023. [Online]. Available: https://nextjs.org/
[4] "PostgreSQL: The World's Most Advanced Open Source Relational Database", PostgreSQL Global Development Group, 2023. [Online]. Available: https://www.postgresql.org/
[5] Colombo Hilton Hotel, *Hotel Reservation System*, 2022. [Online]. Available: https://www.hilton.com/
[6] Sri Lanka Railways, *Train Seats Reservation System*, 2022. [Online]. Available: https://seatreservation.railway.gov.lk/
[7] "RabbitMQ - Messaging that just works", VMware, 2023. [Online]. Available: https://www.rabbitmq.com/
[8] "TypeORM - ORM for TypeScript and JavaScript", TypeORM, 2023. [Online]. Available: https://typeorm.io/
[9] "Socket.IO", Socket.IO, 2023. [Online]. Available: https://socket.io/

# Appendices

## Appendix A - System Manual
This section provides technical documentation to guide developers or administrators who wish to install, run, or maintain the Photographer Portal source code.

**Prerequisites:**
- Node.js (v20 LTS or higher) installed on the host machine.
- Docker Desktop installed and running.
- Git version control installed.

**Installation and Compilation:**
1. Clone the repository to your local machine using Git.
2. Open a terminal and navigate to the root directory of the project.
3. Start the required background services (PostgreSQL database, RabbitMQ message broker, and Maildev SMTP server) by running the Docker Compose command:
   `docker-compose up -d`
4. Open a new terminal window, navigate to the `backend` directory, and install the required dependencies:
   `cd backend`
   `npm install`
5. Start the NestJS backend server:
   `npm run start:dev`
   *(The backend API will now be running on `http://localhost:4001`)*
6. Open a third terminal window, navigate to the `frontend` directory, and install the front-end dependencies:
   `cd frontend`
   `npm install`
7. Start the Next.js frontend development server:
   `npm run dev`
   *(The frontend application will now be running on `http://localhost:4000`)*

## Appendix B - User Manual
The system has distinct primary user roles: Super Admin, Photographer, and Customer.

**For Customers (Booking a Date):**
1. Navigate to the photographer's public booking URL (e.g., `http://localhost:4000/book/john-doe`).
2. Review the photographer's portfolio and package details.
3. Click the **"Book a Session"** button to open the interactive calendar.
4. Select any available date (marked in green).
5. Fill out the secure reservation form with your event details (location, time, type of event) and click submit.
6. You will receive an automated email containing a secure tracking link (`/book/track/[token]`). Use this link to monitor your booking status, process your deposit payment via Stripe, and use the Real-Time Chat to talk directly to the photographer.

**For Photographers (Managing Reservations):**
1. Navigate to the system login page (`http://localhost:4000/login`) and log in using your provided credentials.
2. You will be redirected to your secure Dashboard.
3. Your calendar will display all bookings. Click on any `PENDING` reservation (marked in yellow).
4. Review the customer's event details and input your estimated price and required advance deposit amount. Click "Send Quote".
5. Use the attached Chat Window to discuss any specific details live with the client.
6. Once the customer processes the payment, the reservation will require your final review. Click the reservation, verify the payment record, and click "Confirm Reservation". The date will now be permanently secured (red on the calendar).

## Appendix C - Management Reports
The Photographer Portal generates aggregated analytical reports to assist the Super Admins and Photographers in making informed business decisions.

**Location Analytics (OpenStreetMap):**
The system provides a geographical heat map that aggregates all confirmed reservations based on the district and city. It renders clustered markers representing reservation locations directly onto Leaflet widgets using OpenStreetMap tile sets. This allows the photographer to visually identify which regions generate the most business.

**Earnings Dashboard:**
The system automatically tracks the total monetary value of all `CONFIRMED` reservations. It provides a visual chart on the dashboard displaying the monthly revenue, alongside counts of new, pending, and completed reservations. This ensures the photographer has a clear, real-time overview of their business's financial health without needing external accounting software.
