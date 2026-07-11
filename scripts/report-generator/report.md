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
