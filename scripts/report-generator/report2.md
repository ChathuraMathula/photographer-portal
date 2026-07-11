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
