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
