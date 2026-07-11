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
