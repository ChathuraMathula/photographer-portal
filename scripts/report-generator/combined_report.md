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

This project focuses on completely automating the business process of reserving dates online, generating powerful analytical reports, and managing financial transactions. The primary goal is to assist the photographer in reducing administrative time and costs, while significantly increasing the efficiency and accuracy of the reservation process. To solve these issues, a robust, web-based date reservation and management system—the "Photographer Portal"—was built entirely from scratch. The system showcases all necessary details customers need to select a package, offers a real-time messaging interface for direct communication, and beautifully aggregates booking data into management reports to help the photographer make strategic business decisions.

This project was executed using the traditional monolithic Waterfall software development life cycle, as the core system requirements were fixed and designed upfront. Initially, the project was planned to be developed using the MERN stack (MongoDB, Express, React, Node). However, due to the complex relational data required for reservations and financial transactions, the architecture was pivoted. The system was ultimately developed using a highly scalable, modern technology stack: React 19 and Next.js 16 for the frontend, and NestJS 11 for the backend API, powered by a strict PostgreSQL relational database.

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
Most individual professional photographers who can be hired for events and functions face intense difficulties when attempting to reserve an available date and time for a customer. The background of this problem stems from the fact that independent photographers run their businesses entirely alone. They do not have dedicated secretaries, management teams, or data analysts to handle their business operations. As a result, they must balance their time between actual photography, editing, and managing client communications. 

When a potential client wants to hire a photographer, the process usually starts with a simple inquiry over a phone call or a direct message on a platform like WhatsApp or Instagram. The photographer then has to manually check a physical diary or a disjointed digital calendar to see if the requested date is available. Miscommunications frequently happen during these back-and-forth conversations, leading to dates being double-booked or critical event details (such as the exact venue location) being missed entirely.

## 1.2 Motivation
The motivation behind this project is to eliminate the inefficiencies, fragmented communications, and errors present in the manual booking process. Many customers ask for details about packages and services through lengthy phone calls even if they do not end up hiring the photographer, which wastes a significant amount of the photographer's valuable time. Taking down each event detail manually is very time-consuming and highly error-prone. 

Furthermore, the lack of a centralized platform creates a disjointed customer experience and leaves the photographer completely blind to their own business metrics. Without a proper system, a photographer cannot easily track how much money they have made in a month, which geographical locations generate the most business, or which invoices remain unpaid. Therefore, it is highly advantageous to find a comprehensive solution to this problem by building a centralized, web-based date reservation and management system that automatically handles bookings and generates insightful business reports.

## 1.3 Aims, and Objectives of the Project
The main objective of the Photographer Portal is to provide a unified platform to reserve an available date to get a photographer hired online and to efficiently manage the reservations, payments, and client communications.

The specific objectives are:
- To track all information about customers, their events, and their payments securely.
- To manage reservations by properly displaying them to the photographer in a clear, interactive calendar dashboard.
- To provide powerful management reports and analytics dashboards that help the photographer make strategic business decisions regarding transactions and geographical bookings.
- To implement real-time chat functionality so clients and photographers can communicate securely within the system itself.
- To fully automate the business process, from the initial customer inquiry to the final generation of a PDF invoice statement.

## 1.4 Scope of the Project
The scope defines the exact boundaries of the developed system. The system encompasses the following areas:

1. The system showcases the photographer’s details (contact details, packages, portfolios, and map locations) to the customers online without requiring an account. 
2. It collects customer, payment, and reservation details by allowing users to fill out secure online forms.
3. The Super Administrator is responsible for overseeing the system, capable of managing users, updating booking URLs, generating analytical reports, and viewing system-wide audit logs.
4. The customers can pick an available date via an interactive calendar and input their specific event details to initiate a booking request.
5. The chosen date is temporarily held (marked as pending) while the reservation request is being processed to prevent simultaneous double-booking.
6. The photographer can review incoming requests, propose a custom estimated price, and specify the advance payment required.
7. The system includes an integrated Payments Module utilizing the Stripe API, allowing the customer to securely process deposits via a unique tracking token.
8. Real-Time Chat is fully implemented via Socket.io, allowing clients and photographers to exchange live messages directly inside the application tracking page.
9. The system generates highly comprehensive Management Reports, allowing the photographer to view live transaction histories, track overall monetary volume, and generate custom-branded PDF ledger statements for their clients.
10. The system handles automated email notifications to inform users of critical state changes.

# Chapter 2 – Analysis

## 2.1 Analysis

### 2.1.1 Existing System and Problem Description
The existing manual system for managing photography bookings is heavily fragmented. When a customer wants to book a photographer, they must find them on social media and send a direct message. The photographer must stop their current work, manually check their physical diary, and reply. If the customer agrees to the price, the photographer asks for the event details and writes them down. To secure the date, the photographer sends their bank details. The customer makes the transfer and sends a screenshot of the receipt. The photographer then manually verifies the bank account and marks the date as booked.

This manual process suffers from several severe limitations:
- **High Risk of Errors**: Writing details on paper or managing them in endless chat threads leads to lost information and accidental double-bookings.
- **No Analytical Insights**: Because payments are tracked on banking apps and scheduling is done in a physical diary, the photographer has no easy way to generate business reports or calculate their yearly earnings.
- **Inefficiency**: The constant back-and-forth communication for simple inquiries consumes hours of the photographer's week.

*[INSERT MANUAL PROCESS FLOWCHART HERE]*

### 2.1.2 Review of Similar Systems
To understand the landscape of reservation software, existing systems were reviewed. While they operate in different business domains, they share the same underlying scheduling logic.

**Online Hotel Room Reservation System (Colombo Hilton Hotel)**
The Hilton Hotel utilizes an effective hotel room reservation system embedded in their official website. It offers customers the option to check room availability and rates without needing to log in. The system strictly validates user input and handles payments via credit cards. This system is an excellent example of how clean user interfaces and step-by-step booking flows simplify complex reservations.

**Online Train Seats Reservation System (Sri Lanka Railways)**
The Sri Lanka Railways developed an online train seat reservation system to automate their bookings. This system allows passengers to check the availability of trains based on routes and dates. Once a seat is selected, the system temporarily holds that seat while the user enters passenger information and completes the payment. This demonstrates the critical importance of a robust state machine that temporarily holds a resource to prevent race conditions (double-booking).

### 2.1.3 System Requirements Analysis

#### 2.1.3.1 Functional Requirements
The core functional requirements for the Photographer Portal are:
- **User Management**: The system must support role-based accounts for Super Admins, Admins, Photographers, and Public Customers.
- **Reservation Workflow**: Customers must be able to submit booking requests, which photographers can subsequently review, propose quotes for, and confirm or reject based on payments.
- **Management Reports and Analytics**: The system must provide a comprehensive Transaction dashboard where the photographer can view total volume (e.g., LKR 37,847,000), card checkouts, and offline cash logs. The system must also provide a custom PDF invoice generator that tracks outstanding balances and settled amounts per client.
- **Real-Time Messaging**: The system must facilitate live, bi-directional text communication between the photographer and the client regarding a specific reservation.
- **Payment Processing**: The system must handle the tracking and verification of reservation deposits using Stripe to update booking statuses.

#### 2.1.3.2 Security as a Functional Requirement
Because this system handles personal customer data and financial transaction records, security is a core functional requirement.
- **Role-Based Access Control (RBAC)**: A customer must under no circumstances be able to view another customer's reservations. Super Admins are the only users who can access the system-wide Audit Logs.
- **Authentication**: Secure login mechanisms using encrypted JSON Web Tokens (JWT) are required.
- **Input Validation**: All API endpoints must rigidly validate incoming payloads to prevent SQL injection and cross-site scripting (XSS) attacks.

#### 2.1.3.3 Non-Functional Requirements
- **Performance**: The system must load the public booking pages in under 2 seconds to ensure a smooth user experience.
- **Scalability**: The backend architecture must be decoupled to allow independent scaling of the API, the database, and the message queues.
- **Usability**: The application must be fully responsive, ensuring photographers can manage their business on mobile devices as easily as on desktop computers.

### 2.1.4 Justification of Development Approach and Technologies

#### 2.1.4.1 Chosen SDLC Model and Rationale
The **Monolithic Waterfall model** was selected for this project. The Waterfall model is a plan-driven process where development is carried out in strict, sequential phases: requirements definition, system analysis and design, implementation, testing, and finally operation.

This model was chosen and justified because the system's requirements were entirely fixed upfront. As a solo developer building this system from scratch, I needed a highly disciplined and predictable path. The Waterfall approach allowed me to deeply design the strict relational database schema first, implement the backend APIs second, and finally build the frontend interfaces without the chaotic overhead of iterative redesigns. 

#### 2.1.4.2 Technology Stack Justification
At the very beginning of the project, the intention was to build the Photographer Portal using the highly popular **MERN Stack** (MongoDB, Express, React, Node.js). However, as the deep analysis of the system's requirements unfolded, it became explicitly clear that the MERN stack would struggle to meet the strict engineering demands of a complex reservation and financial system. As a result, a massive architectural pivot was made to a much more robust stack.

The reasons for moving away from the MERN stack are as follows:
- **Database Transition (MongoDB vs PostgreSQL)**: MongoDB is a NoSQL document database. It is excellent for storing unstructured data rapidly. However, a reservation system inherently requires strict, complex relational data. A single reservation is directly tied to a specific customer, a specific photographer, a package, chat messages, and payment records. Using MongoDB would have led to massive data duplication and potential data anomalies if a package price changed or a user was deleted. Therefore, the decision was made to migrate to **PostgreSQL**, an advanced relational database that guarantees ACID compliance and ensures transactional integrity through strict foreign key constraints.
- **Backend Transition (Express vs NestJS)**: Express.js is highly unopinionated and lightweight, which often leads to messy, unstructured code in large projects. By switching to **NestJS**, the project benefited from a highly structured, object-oriented, Angular-like architecture. NestJS enforces strict TypeScript typing and Dependency Injection, which heavily reduced runtime errors and made the codebase much easier to maintain.
- **Frontend Transition (React vs Next.js)**: While pure React is powerful, it renders entirely on the client-side, which is terrible for Search Engine Optimization (SEO). Since photographers need their public booking pages to be easily discoverable on Google, the frontend was upgraded to **Next.js**. Next.js provides powerful Server-Side Rendering (SSR), ensuring that the photographer's public portfolios load instantly and are perfectly indexed by search engines.


# Chapter 3 - Design

## 3.1 Introduction to System Design
The design phase of a software system is the most critical part of the SDLC. It translates the theoretical requirements gathered during the analysis phase into a structured, logical blueprint that developers can follow to implement the system. The primary goal of the Photographer Portal's design was to create a highly scalable, decoupled architecture that could securely manage complex reservations, real-time messaging, and comprehensive management reports without performance bottlenecks.

## 3.2 Design Principles and Methodologies
Even though the proposed date reservation system could theoretically be implemented entirely from scratch using only raw, low-level programming constructs, doing so is considered a bad practice in modern software engineering. Implementing standard protocols from scratch increases development time, costs, and the likelihood of introducing severe bugs and security vulnerabilities. Therefore, a major design strategy was to utilize reliable, free, and open-source software (FOSS) utility components to handle complex but standard logic. This includes using established libraries for database Object-Relational Mapping (TypeORM), real-time WebSockets (Socket.io), and cryptographic password hashing (Bcrypt). By doing so, the project maintains robustness, consistency, and security, allowing the primary development focus to remain firmly on the unique business logic of the reservation and analytics processes.

## 3.3 System Architecture Overview
Architectural design exposes the system’s overall structure clearly to help stakeholders understand how different subsystems communicate. Because the proposed system is a modern web application, it was decided to use a combination of the Three-Tier Architecture and the Model-View-Controller (MVC) design pattern.

The Three-Tier Architecture logically and physically separates the system into three distinct tiers:
1. **Presentation Tier (Client-Side)**: This tier represents the front-end. It is implemented using Next.js and runs within the user's web browser on Port 4000. It is responsible for rendering the UI, maintaining WebSocket connections, and managing global state via Redux.
2. **Application Tier (Server-Side)**: This tier represents the back-end business logic. It is implemented using NestJS running on Port 4001. This tier receives requests from the presentation tier, processes the business rules, and communicates with the database.
3. **Database Tier (Storage)**: This tier represents the persistent data storage. It is implemented using a PostgreSQL database server on Port 5433, ensuring strict relational integrity for reservations and financial transactions.

*[INSERT SYSTEM ARCHITECTURE DIAGRAM HERE]*

## 3.4 Component and Module Design
The system's backend is heavily modularized using NestJS to ensure a separation of concerns. The core logic relies on several interconnected components:
- **Bookings Module**: Handles public incoming requests. It validates selected packages and requested dates, ensuring no overlap exists before placing a temporary `PENDING` hold on the calendar.
- **Reservations Module**: The core State Machine that transitions bookings from `PENDING` to `PROPOSED`, and ultimately to `CONFIRMED`.
- **Reports & Analytics Module**: This highly specialized module aggregates complex data from the database to generate the Management Reports. It calculates the total volume of successful bookings, counts card checkouts versus manual cash logs, and dynamically constructs the customized PDF invoice statements.
- **RabbitMQ Module**: Acts as an asynchronous queue to process automated email notifications without slowing down the main server thread. 

## 3.5 Workflow and Behavioral Modeling
Understanding how the system behaves over time and how users achieve their goals is critical. Use Case diagrams provide a high-level visual representation of the interactions between the system's actors and its functional capabilities.

*[INSERT USE CASE DIAGRAM HERE]*

There are three primary actors in the system:
1. **Customer**: Can search for photographers, initiate the "Book a Session" workflow, engage in "Real-Time Chat", and process deposit payments securely.
2. **Photographer**: Can manage their service packages, approve or reject incoming bookings, and most importantly, access the Management Reports to view their financial transactions and generate client invoices.
3. **Super Admin**: Has overarching control to manage all system users and view the system-wide audit logs.

## 3.6 Data Modeling
The database is the foundational bedrock of the system. As previously mentioned in the analysis chapter, migrating to **PostgreSQL** was a deliberate architectural decision because the system manages strict, interconnected financial data.

Entity-Relationship (ER) diagrams are utilized to visually design and represent the schema of the relational database.

*[INSERT ER DIAGRAM HERE]*

The database is highly normalized to prevent data redundancy and anomalies:
- The **`users`** table acts as the central entity for authentication.
- The **`packages`** table holds the pricing details offered by a photographer.
- The **`reservations`** table is the core transactional entity that acts as a bridging table linking customers, photographers, and event details.
- The **`payments`** table holds a Many-to-One relationship with `reservations`, recording successful deposit transactions (e.g., Stripe payments or offline cash logs). This table is the critical foundation for the system's financial analytics and management reports.

## 3.7 User Interface Design
The User Interface (UI) is the bridge between the human users and the complex backend logic. Because customers primarily access the booking portal via mobile devices, a "Mobile-First" design approach was utilized using React and Tailwind CSS.

For the photographer's dashboard, the UI focus shifted to heavy data visualization. The **Transactions and Invoices Dashboard** was designed to look like a professional, enterprise-grade accounting tool. It utilizes prominent KPI (Key Performance Indicator) cards to display "Total Volume" and "Payments Collected" in large, readable typography. The ledger tables were designed to cleanly separate invoice numbers, event details, and settled amounts, ensuring the photographer can monitor their business health instantly without feeling overwhelmed by raw data.


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


# Chapter 5 - Evaluation

Software testing is an essential task in the software development lifecycle. It ensures that the implemented Photographer Portal, particularly its core reservation management and analytics features, meets all functional and non-functional requirements by evaluating and verifying its behavior under various conditions. Rigorous software testing provides numerous advantages, including improving the overall quality of the software, significantly reducing operational risks, saving time and money, and most importantly, improving customer satisfaction by delivering a reliable product.

## 5.1 Common Types of Software Testing
Different testing methodologies were employed to evaluate the system. 

- **Unit Testing**: This approach focuses on testing individual, isolated units of code. In this project, the Jest testing framework was utilized to test the backend services (such as verifying the mathematical algorithms that aggregate the total revenue volume for the Management Reports).
- **Integration Testing**: This approach tests how different units of code interact with one another. For example, testing if the `ChatModule` correctly authenticates a WebSocket connection by verifying the JWT against the `UsersModule` before allowing a user to join a live chat room.
- **System Testing**: In this testing approach, the software system is evaluated as a complete, integrated whole. This ensures the frontend and backend communicate correctly to satisfy end-to-end business requirements, like transitioning a reservation from `PENDING` to `CONFIRMED`.
- **User Acceptance Testing (UAT)**: This final phase of testing is carried out with the help of actual end users to determine whether the software system truly meets the business needs in a real-world scenario.

## 5.2 Test Plan Used
Every major API endpoint and React frontend component was thoroughly evaluated. The primary focus of the system testing was on critical user workflows: authentication, reservation creation, real-time chat, and the generation of management analytics. The tests were designed to cover both "happy paths" (where the user provides all correct data) and "edge cases" (where the user inputs invalid data or attempts unauthorized actions).

## 5.3 Test Cases
Test cases are formalized scenarios used to evaluate that the system performs exactly as required. The tables below outline the comprehensive test cases designed to evaluate all critical areas of the implemented Photographer Portal.

### 5.3.1 Booking & Concurrency Operation Test Cases
These tests evaluate the core booking engine, specifically ensuring that race conditions (double-booking) and asynchronous queues function correctly.

| Test ID | How to Test (Scenario / Tasks Performed) | Expected Behaviour |
| :--- | :--- | :--- |
| **TC-B01** | **Standard Booking**: Customer selects a package, picks an available date, fills in event details, and submits the form at `/book/[slug]`. | The system must create a `PENDING` reservation in PostgreSQL. A `RabbitMQ` message must be published, and an HTML confirmation email must be generated and dispatched. |
| **TC-B02** | **Concurrency Prevention**: Two different customers attempt to submit a booking for the exact same date and time simultaneously. | The database must process the first request and lock the date. The second request must be cleanly rejected by the backend with a `400 Bad Request` error to prevent double-booking. |
| **TC-B03** | **Deposit Payment via Stripe**: Customer opens the tracking link (`/book/track/[token]`), reviews the quote, and processes a deposit payment using a mock Stripe test card. | The Stripe webhook must trigger the `PaymentsModule`, save the transaction record, and flag the reservation for photographer review. |
| **TC-B04** | **Booking Confirmation**: Photographer reviews the payment record and clicks "Confirm Reservation". | The system must update the status to `CONFIRMED`. The date must remain permanently blocked on the interactive calendar, and a final confirmation email must be sent. |

### 5.3.2 Real-Time Chat (WebSocket) Test Cases
These tests evaluate the persistent, low-latency communication engine.

| Test ID | How to Test (Scenario / Tasks Performed) | Expected Behaviour |
| :--- | :--- | :--- |
| **TC-C01** | **Bi-Directional Messaging**: Customer navigates to a reservation tracking page and types a message. Photographer has the dashboard open. | The message must be transmitted instantly over `Socket.io` and saved in the PostgreSQL `messages` table. The photographer's UI must update immediately without a page refresh. |
| **TC-C02** | **Unauthorized Room Access**: A malicious user attempts to connect their WebSocket client to a reservation room ID they do not own. | The backend WebSocket gateway must verify the JWT payload, realize the user is unauthorized, and immediately reject the connection while emitting an error event. |
| **TC-C03** | **Offline Message Fallback**: Customer sends a message while the photographer is offline. | The message must be safely saved to the database. The next time the photographer logs in, the Redux state must fetch and display the unread message history. |

### 5.3.3 Analytics, Management Reports & Super Admin Test Cases
These tests ensure external map integrations and high-level administrative reporting functions operate flawlessly.

| Test ID | How to Test (Scenario / Tasks Performed) | Expected Behaviour |
| :--- | :--- | :--- |
| **TC-A01** | **Transactions Dashboard Aggregation**: Photographer navigates to the Transactions page after several successful bookings. | The system must correctly SUM the total monetary volume (e.g., LKR 37,847,000) and COUNT the exact number of card checkouts versus manual cash logs. |
| **TC-A02** | **Map Analytics Cluster Rendering**: Photographer loads the `LocationAnalyticsSection` dashboard. | The backend `ReportsModule` must aggregate booking counts by district and correctly render clustered, color-coded markers on the OpenStreetMap Leaflet map. |
| **TC-A03** | **PDF Invoice Generation**: Photographer navigates to the Invoices page, fills out the Invoice Customizer (Logo text, theme color, tax rate), and clicks "PDF" for a specific client. | The system must generate a customized, downloadable PDF ledger statement detailing the event, the settled amount, and the outstanding balance. |
| **TC-A04** | **Audit Log Tracking**: Super Admin modifies a photographer's booking slug, then navigates to the Audit Logs page. | The Audit Logs table must display the exact timestamp, the Super Admin's email, and the specific action taken (slug modification). |

## 5.4 User Acceptance Testing (UAT)
User Acceptance Testing was carried out by providing access to the deployed system to a professional photographer and an ordinary individual representing a standard customer. 

**Feedback and Observations:**
- **Photographer Feedback**: The photographer found the reservation management dashboard incredibly intuitive. They specifically praised the **Transactions and Invoices** management reports. They noted that having a live view of their total booking volume and the ability to instantly generate PDF ledger statements made them feel completely in control of their business finances. They also loved the Real-Time Chat functionality, stating that having all client conversations tied directly to the specific reservation completely solved their problem of scattered social media messages.
- **Customer Feedback**: The customer user found the step-by-step modal interfaces for making a booking very easy to use on their smartphone. They appreciated the immediate email notifications, the seamless Stripe payment integration, and the live chat, stating it provided a highly professional feel compared to traditional phone bookings.

# Chapter 6 - Conclusion

## 6.1 Critical Evaluation
The primary objective of the implemented date reservation and management system was to simplify the process of making photography reservations and to provide powerful business analytics for the photographer. By critically evaluating the final deliverable against the initial requirements, it is clear that the project was a resounding success. 

Typically, independent photographers rely on fragmented phone calls, social media messages, and handwritten diaries to manage their business. This manual process is slow, highly inaccurate, and leaves the photographer blind to their financial metrics. The newly developed web-based "Photographer Portal" successfully overcomes these difficulties. It provides a centralized, secure, and automated platform that handles everything from the initial customer inquiry, to real-time chat negotiations, to the final payment confirmation via Stripe. Furthermore, the robust PostgreSQL database feeds deeply insightful Management Reports, allowing the photographer to track transaction volumes and generate custom invoices effortlessly.

## 6.2 Lessons Learnt and Personal Reflection
This project served as a profound learning experience, allowing me to apply theoretical software engineering concepts to a complex, real-world problem.

- **The Database and Stack Migration**: The most critical lesson learned was recognizing the importance of choosing the right tool for the job. Initially, the project started with the MERN stack (MongoDB) because of its rapid setup time. However, as the reservation logic became more complex, it became clear that a document-based NoSQL database was the wrong choice for a system requiring strict financial integrity. I learned the immense value of pivoting the architecture and migrating the entire system to **NestJS and PostgreSQL**. The relational structure provided by PostgreSQL prevented data anomalies and ensured strict data integrity, which is absolutely vital for the analytics engine to generate accurate Management Reports.
- **Real-Time WebSockets**: Implementing the live chat using Socket.io taught me the complexities of managing persistent, stateful connections between the client and the server, as opposed to traditional stateless REST APIs.
- **System Architecture**: I learned the value of decoupling system components. Utilizing Docker to containerize the database and RabbitMQ message brokers taught me how enterprise-level applications are orchestrated and deployed.

## 6.3 Future Improvements
While the current system robustly meets all its core objectives and already includes advanced features like automated PDF invoice generation and real-time chat, software is never truly "finished." Several enhancements could be explored in future iterations:

1. **AI-Driven Pricing Suggestions**: The system currently tracks a massive amount of analytical data regarding which packages sell best in specific geographical districts. A future improvement could involve integrating a Machine Learning model that analyzes this historical data to suggest dynamic pricing adjustments to the photographer during peak wedding seasons.
2. **Two-Way Calendar Syncing (Google Calendar)**: While the system has a powerful built-in interactive calendar, many photographers also use external tools for personal events. Integrating the Google Calendar API to automatically perform a two-way sync would ensure that if a photographer adds a personal holiday on their phone, the system instantly blocks that date on their public booking page.

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
2. Click the **"Book a Session"** button to open the interactive calendar.
3. Select any available date (marked in green) and fill out your event details.
4. You will receive an automated email containing a secure tracking link (`/book/track/[token]`). Use this link to monitor your booking status, process your deposit payment via Stripe, and use the Real-Time Chat to talk directly to the photographer.

**For Photographers (Managing Reservations):**
1. Navigate to the system login page (`http://localhost:4000/login`) and log in.
2. Your calendar will display all bookings. Click on any `PENDING` reservation (marked in yellow).
3. Review the customer's event details, input your estimated price, and click "Send Quote".
4. Use the attached Chat Window to discuss any specific details live with the client.
5. Once the customer processes the payment, verify the payment record and click "Confirm Reservation". The date will now be permanently secured (red on the calendar).

## Appendix C - Management Reports
The Photographer Portal generates aggregated analytical reports to assist Photographers in making highly informed, strategic business decisions. These reports are a critical component of the system, transforming raw booking data into actionable business intelligence.

**Transactions Analytics Dashboard:**
The system automatically tracks the total monetary value of all `CONFIRMED` reservations. As shown in the attached screenshots, the Transactions Dashboard provides a live, visual representation of the photographer's overall financial health. It displays the **Total Volume** (e.g., LKR 37,847,000 from 1048 successful bookings) and breaks this data down into **Card Checkouts** versus **Manual Cash Logs**. This level of detail allows the photographer to instantly identify their primary revenue streams without needing to consult an external accountant or parse through disjointed bank statements. By tracking the exact transaction volumes, photographers can safely decide when it is financially viable to upgrade their camera equipment or hire assistant photographers.

*[INSERT TRANSACTIONS DASHBOARD SCREENSHOT HERE]*

**Invoices & Statements Ledger:**
Managing unpaid bookings is a major pain point for independent photographers. The system solves this by providing a comprehensive Invoices module. As depicted in the screenshots, the system lists all generated ledger statements, allowing the photographer to quickly cross-reference the `AMOUNT SETTLED` against the specific client and event details. Furthermore, the module includes an **Invoice Customizer**, empowering the photographer to dynamically brand their PDF statements with their studio's logo text, theme color, and tax rates. This completely automates the tedious administrative task of billing.

*[INSERT INVOICES CUSTOMIZER SCREENSHOT HERE]*

**Location and Geographical Analytics:**
Beyond purely financial data, the system provides a powerful geographical map utilizing OpenStreetMap. This map dynamically renders clustered markers showing exactly where the highest volume of successful bookings occurs. By analyzing these heat maps, a photographer can make massive business decisions, such as identifying the most profitable district to open a physical photography studio, or deciding which exact cities they should target when running localized Facebook and Instagram marketing campaigns.

**Future Analytical Capabilities:**
Because the system stores strict relational data in PostgreSQL, the foundation is laid for even more powerful business reports. Future analytical dashboards can easily generate:
- **Package Popularity Reports**: A pie chart showing exactly which photography packages (e.g., "Wedding Standard" vs "Wedding Premium") are booked most frequently, allowing the photographer to retire unpopular packages and aggressively market their best-sellers.
- **Seasonal Predictive Analytics**: By analyzing the volume of bookings across different months of the year, the system can graphically show the photographer their busiest seasons. The photographer can use this data to preemptively raise prices during peak wedding seasons (like December) to maximize profits, or offer heavy discounts during slow seasons to maintain cash flow.
