# TITLE OF THE DISSERTATION
<CANDIDATE’S INITIALS AND LAST NAME>
<Submission Month> <Submission Year>

# Chapter 1 Introduction

## 1.1 Motivation
In recent years, the photography industry has seen a massive shift towards digital platforms. However, many independent photographers still rely on manual booking processes, such as phone calls, emails, and physical calendars, to manage their clients. This manual approach is time-consuming, prone to double-booking, and lacks a centralized system for tracking payments and customer communications. The motivation behind the "Photographer Portal" project is to bridge the gap between photographers and their clients by providing a seamless, automated, and centralized platform for booking and reservation management. This project aims to empower photographers to focus more on their creative work while the system handles scheduling, deposits, and client interactions.

## 1.2 Aims, and Objectives of the Project
The primary aim of this project is to design and implement a web-based reservation management system tailored specifically for photographers and their clients. 

The specific objectives are:
- To develop a public-facing portal where customers can view photographer profiles, check availability, and request bookings.
- To implement a secure dashboard for photographers to manage their service packages, accept or reject reservations, and track their schedule.
- To integrate a secure payment gateway for handling reservation deposits seamlessly.
- To create a comprehensive analytics dashboard for administrators to monitor system-wide performance and user activities.

## 1.3 Scope of the Project
The scope of the Photographer Portal covers the entire booking lifecycle from the initial customer inquiry to the final payment collection. The system includes public booking pages for clients, authenticated management dashboards for photographers, and a system administration panel. It handles geolocation mapping, package management, email notifications, and online payment processing.

However, the scope explicitly excludes the actual delivery of digital photographs. The system is strictly a reservation and business management tool, meaning features like high-resolution image galleries, client photo downloading, and photo editing are outside the boundaries of this project.

# Chapter 2 – Analysis

## 2.1 Analysis

### 2.1.1 Existing System and Problem Description
The current manual booking process used by many independent photographers is heavily fragmented. Typically, a customer discovers a photographer through social media and sends a direct message to inquire about rates and availability. The photographer then manually checks their physical or digital calendar, calculates a quote, and replies. If agreed, the photographer sends bank details for a deposit, which they must manually verify upon receipt. 

This manual system suffers from several limitations:
- **High Risk of Errors**: Double-booking is a frequent issue due to human error in calendar management.
- **Inefficiency**: Constant back-and-forth communication delays the booking confirmation process.
- **Lack of Tracking**: Payments and reservation details are scattered across chat apps and bank statements, making auditing difficult.

*(Include flowchart of the existing manual process here)*

### 2.1.2 Review of Similar Systems
To understand the landscape of booking software, several existing systems were reviewed:

- **Calendly**: A highly popular scheduling tool that excels in booking time slots. However, it is a generic tool and lacks industry-specific features like package management and detailed event location tracking.
- **HoneyBook**: A comprehensive client management system for creatives. While feature-rich, it is often overly complex and expensive for beginner or part-time photographers who only need a straightforward reservation system.

The proposed Photographer Portal aims to strike a balance by offering a tailored, industry-specific solution without the overwhelming complexity of enterprise software.

### 2.1.3 System Requirements Analysis

#### 2.1.3.1 Functional Requirements
The core features the system must provide include:
- **User Authentication**: Secure login and role-based access for Photographers and Administrators.
- **Profile Management**: Photographers must be able to configure their bios, base locations (using geographical coordinates), and service packages.
- **Reservation Workflow**: The system must allow customers to submit booking requests, which photographers can subsequently review, propose custom quotes for, and accept or reject.
- **Payment Processing**: The system must process credit card payments for reservation deposits and update the booking status upon successful transaction.
- **Email Notifications**: The system must send automated emails to customers for booking tracking and payment links.

#### 2.1.3.2 Security as a Functional Requirement
Security is a critical functional requirement for this platform, as it handles personal customer data and financial transactions. Essential security functions include:
- **Access Control**: Implementing strict Role-Based Access Control (RBAC) to ensure that photographers can only view their own reservations, while admins have system-wide oversight.
- **Input Validation**: All API endpoints must strictly validate incoming payloads to prevent SQL injection and cross-site scripting (XSS) attacks.
- **Secure Authentication**: Utilizing JSON Web Tokens (JWT) for secure, stateless user authentication.

#### 2.1.3.3 Non-Functional Requirements
- **Performance**: The system must load the public booking pages in under 2 seconds to ensure a smooth user experience for customers.
- **Scalability**: The backend architecture must be decoupled to allow independent scaling of the API and the database as the user base grows.
- **Usability**: The application must be fully responsive, ensuring photographers can manage their business on mobile devices as easily as on desktop computers.

### 2.1.4 Justification of Development Approach and Technologies

#### 2.1.4.1 Chosen SDLC Model and Rationale
An Iterative and Agile Software Development Life Cycle (SDLC) model was selected for this project. Given the dynamic nature of web applications and the need to refine user interfaces based on ongoing feedback, a strict Waterfall approach would have been too rigid. The iterative model allowed for the core booking engine to be developed and tested first, followed by incremental additions such as the payment gateway and analytics dashboards. This approach minimized implementation risks and ensured the core requirements were met early in the development cycle.

#### 2.1.4.2 Technology Stack Justification
- **Frontend (Next.js 16 & React 19)**: Next.js was chosen for its App Router and Server-Side Rendering (SSR) capabilities, which are crucial for the SEO of public photographer profiles. React ensures a highly interactive user interface.
- **Backend (NestJS 11)**: NestJS provides a highly modular, TypeScript-based architecture that enforces good design patterns, making the codebase maintainable and scalable.
- **Database (PostgreSQL 16 & TypeORM)**: PostgreSQL is a robust relational database ideal for handling complex financial and reservation data with strict transactional integrity.
- **Message Broker (RabbitMQ)**: Used to decouple the email notification system from the main API thread, ensuring fast response times for users while emails are processed asynchronously.

# Chapter 3 – Design

## 3.1 Introduction to System Design
The design phase bridges the gap between the analyzed requirements and the actual code. The goal was to architect a system that is not only functional but also highly modular, maintainable, and secure.

## 3.2 System Architecture Overview
The Photographer Portal utilizes a modern, decoupled Client-Server architecture deployed via Docker. 
- **Client Layer**: The Next.js application serves as the presentation layer, communicating with the backend via secure RESTful APIs.
- **Application Logic Layer**: The NestJS backend acts as the central hub, processing business rules, enforcing security guards, and validating data.
- **Data Layer**: PostgreSQL handles data persistence, while RabbitMQ manages asynchronous message queues.

*(Include Layered Architecture Diagram here)*

## 3.3 Component and Module Design
The backend is structured using a domain-driven modular design. Key modules include:
- **Auth Module**: Handles JWT issuing and passport strategies.
- **Reservations Module**: Manages the complex state machine of a booking (Pending -> Proposed -> Confirmed).
- **Payments Module**: Integrates with the payment gateway to secure deposits.
- **Email Module**: Acts as a consumer in the RabbitMQ network to dispatch HTML emails without blocking the main event loop.

## 3.4 Workflow and Behavioral Modeling
The core workflow of the system is the Reservation Lifecycle. When a customer submits a booking, the state is initialized as PENDING. Upon photographer review, the state transitions to PROPOSED, and an automated email containing a unique tracking token is dispatched to the client. Once the client completes the payment via the tracking link, a webhook triggers the status to change to CONFIRMED.

*(Include Sequence Diagram for the Reservation Lifecycle here)*

## 3.5 Data Modeling
The database is structured using strict relational principles to maintain data integrity. The core entities include users, photographer profiles, customers, packages, reservations, and payments. Foreign key constraints enforce referential integrity; for example, every reservation must map to a valid customer ID and photographer ID. The audit logs table is uniquely designed with a loose reference to user IDs, ensuring that historical system actions are preserved even if a user account is eventually deleted.

*(Include Entity-Relationship Diagram (ERD) here)*

## 3.6 User Interface Design
The user interface was designed with a focus on simplicity and modern aesthetics, utilizing the Tailwind CSS framework and shadcn/ui components. Key design principles included:
- **Consistency**: Using a unified color palette and typography across all dashboards.
- **Responsiveness**: Ensuring that complex tables (like the invoices and audit logs) collapse into readable card layouts on mobile devices.
- **Accessibility**: Implementing proper contrast ratios and ARIA labels for screen readers.

*(Include Wireframes/Mockups here)*

# Chapter 4 – Implementation

## 4.1 Development and Deployment Environments
The system was developed in a strictly containerized environment to ensure consistency across development and production. 
- **Operating System**: Windows for local development, utilizing Docker Desktop.
- **IDEs**: Visual Studio Code.
- **Local Infrastructure**: A docker-compose.yml file was used to spin up PostgreSQL, RabbitMQ, and Maildev (a local SMTP server for testing emails without spamming real inboxes).

## 4.2 Development Practices
The implementation adhered strictly to clean code principles and modularity. In the frontend, the Redux Toolkit (RTK) was used for global state management, ensuring predictable data flows. In the backend, the logic was separated into Controllers (handling HTTP routing) and Services (handling business logic). 
Consistent naming conventions were enforced, and TypeScript interfaces were heavily utilized to catch errors at compile-time rather than runtime.

## 4.3 Critical Code Segments

**Reservation State Management**
The transition of a reservation from PENDING to PROPOSED required careful validation to ensure packages and prices were correctly calculated before dispatching the payment link.

*(Include annotated code snippet of ReservationsService logic here)*

**Asynchronous Email Processing**
To prevent the application from hanging while sending emails, the backend utilizes a RabbitMQ message broker. The main API publishes a message to the queue, and a separate worker process consumes it.

*(Include annotated code snippet of RabbitMQ Publisher/Consumer here)*

## 4.4 Software Version Management
Git was utilized for comprehensive source code control. Meaningful commit messages were strictly enforced, allowing the development history to serve as a reliable audit trail of features added and bugs fixed. The repository was structured into frontend and backend directories to maintain clear separation of concerns.

# Chapter 5 – Evaluation

## 5.1 Testing Strategy
To ensure the reliability of the Photographer Portal, a multi-layered testing strategy was employed.

**Unit Testing**
Individual functions and backend services were tested in isolation using the Jest framework. For example, unit tests were written to verify that the price calculation algorithms correctly summed up package costs and applied the appropriate deposit percentages. Mock objects were used extensively to simulate database interactions without requiring a live database connection.

**Integration Testing**
Following unit tests, integration tests verified that the Next.js frontend communicated correctly with the NestJS backend. These tests ensured that API endpoints correctly validated incoming payloads and returned the expected HTTP status codes.

## 5.2 System Testing
System testing evaluated the application as a whole. A critical test scenario involved the end-to-end payment flow: a mock customer was created, a booking was requested, the photographer proposed a quote, and a mock Stripe payment was processed. The test verified that the database updated the reservation status to CONFIRMED only after the payment gateway returned a successful transaction response.

## 5.3 User Acceptance Testing (UAT)
User Acceptance Testing was conducted with a small group of independent photographers. They were asked to set up their profiles, configure packages, and process a test booking from a simulated client. 

**Feedback and Improvements:**
- Initial feedback indicated that the map interface for selecting locations was slightly confusing on mobile. In response, the Leaflet map component was optimized for touch interactions.
- Users appreciated the automated email feature but requested the ability to send custom offline messages. This led to the implementation of the offline message configuration in the photographer profile settings.

# Chapter 6 – Conclusion

## 6.1 Effectiveness of the Solution
The Photographer Portal successfully addresses the core problem of fragmented and manual reservation management in the photography industry. The system meets all primary functional requirements, providing a secure, automated platform for bookings, payments, and analytics. The decoupling of the architecture and the use of asynchronous message queues ensure that the system performs efficiently, even under load. 

## 6.2 Personal Reflection
This project provided a profound learning experience, bridging the gap between theoretical software engineering principles and practical implementation. I significantly improved my understanding of modern web architectures, particularly the integration of Next.js with a strictly typed NestJS backend. Designing the relational database schema and orchestrating the services via Docker enhanced my skills in backend infrastructure. Furthermore, managing the project iteratively improved my time management and problem-solving abilities.

## 6.3 Future Work
While the current system provides a robust foundation, several enhancements could be explored in future iterations:
- **Photo Delivery Integration**: Expanding the scope to include secure, high-resolution photo gallery delivery directly to the client's tracking page.
- **AI-Powered Scheduling**: Implementing intelligent scheduling algorithms that analyze a photographer's travel time between locations to automatically suggest optimal booking slots to clients.
- **Multi-Currency Support**: Enhancing the payment gateway to support multiple currencies for photographers who cater to international clients.

This dissertation represents the successful culmination of the project, delivering a functional, secure, and highly useful software solution tailored to the needs of the modern photography business.
