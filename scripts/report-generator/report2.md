# Chapter 3 - Design

## 3.1 Introduction to System Design
The design phase of a software system is the most critical part of the SDLC. It translates the theoretical requirements gathered during the analysis phase into a structured, logical blueprint that developers can follow to implement the system. The primary goal of the Photographer Portal's design is to create a highly scalable, decoupled architecture that securely manages complex reservations, real-time messaging, and comprehensive management reports without performance bottlenecks.

## 3.2 Design Principles and Methodologies
Even though the proposed date reservation system can theoretically be implemented entirely from scratch using only raw, low-level programming constructs, doing so is considered a bad practice in modern software engineering. Implementing standard protocols from scratch increases development time, costs, and the likelihood of introducing severe bugs and security vulnerabilities. Therefore, a major design strategy is to utilize reliable, free, and open-source software (FOSS) utility components to handle complex but standard logic. This includes using established libraries for database Object-Relational Mapping (TypeORM), real-time WebSockets (Socket.io), and cryptographic password hashing (Bcrypt). By doing so, the project maintains robustness, consistency, and security, allowing the primary development focus to remain firmly on the unique business logic of the reservation and analytics processes.

## 3.3 System Architecture Overview
Architectural design exposes the system’s overall structure clearly to help stakeholders understand how different subsystems communicate. Because the proposed system is a modern web application, it is decided to use a combination of the Three-Tier Architecture and the Model-View-Controller (MVC) design pattern.

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
The database is the foundational bedrock of the system. As previously mentioned in the analysis chapter, migrating to **PostgreSQL** is a deliberate architectural decision because the system manages strict, interconnected financial data.

Entity-Relationship (ER) diagrams are utilized to visually design and represent the schema of the relational database.

*[INSERT ER DIAGRAM HERE]*

The database is highly normalized to prevent data redundancy and anomalies:
- The **`users`** table acts as the central entity for authentication.
- The **`packages`** table holds the pricing details offered by a photographer.
- The **`reservations`** table is the core transactional entity that acts as a bridging table linking customers, photographers, and event details.
- The **`payments`** table holds a Many-to-One relationship with `reservations`, recording successful deposit transactions (e.g., Stripe payments or offline cash logs). This table is the critical foundation for the system's financial analytics and management reports.

## 3.7 User Interface Design
The User Interface (UI) is the bridge between the human users and the complex backend logic. Because customers primarily access the booking portal via mobile devices, a "Mobile-First" design approach is utilized using React and Tailwind CSS.

For the photographer's dashboard, the UI focus is shifted to heavy data visualization. The **Transactions and Invoices Dashboard** is designed to look like a professional, enterprise-grade accounting tool. It utilizes prominent KPI (Key Performance Indicator) cards to display "Total Volume" and "Payments Collected" in large, readable typography. The ledger tables are designed to cleanly separate invoice numbers, event details, and settled amounts, ensuring the photographer can monitor their business health instantly without feeling overwhelmed by raw data.
