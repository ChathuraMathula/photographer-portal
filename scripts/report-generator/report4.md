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
