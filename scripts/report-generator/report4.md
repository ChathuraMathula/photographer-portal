# Chapter 5 - Evaluation

Software testing is an essential task in the software development lifecycle. It ensures that the implemented Photographer Portal, particularly its core reservation management features, meets all functional and non-functional requirements by evaluating and verifying its behavior under various conditions. Rigorous software testing provides numerous advantages, including improving the overall quality of the software, significantly reducing operational risks, saving time and money, and most importantly, improving customer satisfaction by delivering a reliable product.

## 5.1 Common Types of Software Testing
Different testing methodologies were employed to evaluate the system. 

- **Unit Testing**: This is the testing approach that focuses on testing individual, isolated units of code. In this project, the Jest testing framework was utilized to test the backend services (such as verifying the algorithms that calculate the exact advance deposit prices for a reservation).
- **Integration Testing**: This approach tests how different units of code interact with one another. For example, testing if the `ChatModule` correctly authenticates a WebSocket connection by verifying the JWT against the `UsersModule` before allowing a user to join a live chat room.
- **System Testing**: In this testing approach, the software system is evaluated as a complete, integrated whole. This ensures the frontend and backend communicate correctly to satisfy end-to-end business requirements, like transitioning a reservation from `PENDING` to `CONFIRMED`.
- **User Acceptance Testing (UAT)**: This final phase of testing is carried out with the help of actual end users to determine whether the software system truly meets the business needs in a real-world scenario.

## 5.2 Test Plan Used
Every major API endpoint and React frontend component was thoroughly evaluated. The primary focus of the system testing was on critical user workflows: authentication, reservation creation, and real-time chat. The tests were designed to cover both "happy paths" (where the user provides all correct data) and "edge cases" (where the user inputs invalid data or attempts unauthorized actions).

## 5.3 Test Cases
Test cases are formalized scenarios used to evaluate that the system performs exactly as required. The tables below outline the critical test cases used to evaluate the implemented Photographer Portal, along with the expected and actual results.

### 5.3.1 User Login Operation Test Cases
The login operation is the gateway to the system. It is critical that invalid attempts are rejected immediately while valid users are granted access.

| Test Case | Tasks Performed | Expected Result | Real Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **01** | Login with an unregistered email address and a random password. | Display an error message stating "Invalid credentials" while rejecting the login operation. | System displayed "Invalid credentials" and prevented access. | Pass |
| **02** | Login with an existing valid email address but an incorrect password. | Display an error message to the user while rejecting the login operation. | System displayed "Invalid credentials" and prevented access. | Pass |
| **03** | Login without entering any email address or password (empty fields). | Display front-end validation errors urging the user to fill in the required fields. | Form borders turned red and displayed "This field is required". | Pass |
| **04** | Login with a valid email and correct password. | Successfully authenticate the user, issue a JWT, and redirect them to their specific dashboard based on their role. | User was logged in and immediately redirected to the authenticated dashboard. | Pass |

### 5.3.2 Reservation Management Operation Test Cases
This is the core business logic of the system. It tests the complex State Machine interaction between the public customer and the photographer's backend logic.

| Test Case | Tasks Performed | Expected Result | Real Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **01** | Customer selects a package, picks an available date (green) on the calendar, fills in event details, and clicks submit. | The system should create a `PENDING` reservation in PostgreSQL. The date on the calendar should instantly turn red (unavailable) for other users. | Reservation was successfully created. Calendar updated immediately to reflect the booked date. | Pass |
| **02** | Photographer logs into their dashboard and clicks on the newly created `PENDING` reservation to propose a quote. | The system should allow the photographer to input an estimated price. The status should change to `PROPOSED`, and an email should be dispatched. | Status updated to `PROPOSED`. Customer received an automated email with a tracking link. | Pass |
| **03** | Customer opens the tracking link, reviews the quote, and uploads a mock payment slip. | The system should save the payment details and notify the photographer that verification is required. | Slip was uploaded successfully. Photographer dashboard highlighted the reservation requiring review. | Pass |
| **04** | Photographer reviews the payment slip and clicks "Confirm Reservation". | The system should update the status to `CONFIRMED`. The date remains permanently blocked on the calendar. | Status updated to `CONFIRMED`. Customer received final confirmation email. | Pass |

### 5.3.3 Real-Time Chat Operation Test Cases
Testing the WebSocket integration to ensure reliable communication.

| Test Case | Tasks Performed | Expected Result | Real Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **01** | Customer navigates to a reservation and types a message into the chat window. | The message should be sent instantly over the WebSocket connection and saved in the PostgreSQL `messages` table. | Message sent successfully and persisted in the database. | Pass |
| **02** | Photographer has the reservation dashboard open while the customer sends a message. | The photographer's UI should update instantly with the new message without requiring a page refresh. | Message appeared instantly on the photographer's screen via Socket.io. | Pass |
| **03** | User attempts to access a chat room for a reservation that does not belong to them. | The backend WebSocket gateway should verify the JWT and reject the connection, emitting an unauthorized event. | Connection rejected immediately. Error emitted to the malicious client. | Pass |

## 5.4 User Acceptance Testing (UAT)
User Acceptance Testing was carried out by providing access to the deployed system to a professional photographer and an ordinary individual representing a standard customer. 

**Feedback and Observations:**
- **Photographer Feedback**: The photographer found the reservation management dashboard incredibly intuitive. They specifically noted that the color-coded calendar (Available, Pending, Confirmed) made it easy to visualize their monthly schedule at a single glance. They also heavily praised the Real-Time Chat functionality, stating that having all client conversations tied directly to the specific reservation completely solved their problem of scattered social media messages.
- **Customer Feedback**: The customer user found the step-by-step modal interfaces for making a booking very easy to use on their smartphone. They appreciated the immediate email notifications and the live chat, stating it provided a highly professional feel compared to traditional phone bookings.

# Chapter 6 - Conclusion

## 6.1 Critical Evaluation
The primary objective of the implemented date reservation and management system was to simplify and speed up the process of making reservations to hire a photographer online. By critically evaluating the final deliverable against the initial requirements, it is clear that the project was a resounding success. 

Typically, independent photographers rely on fragmented phone calls, social media messages, and handwritten diaries to manage their business. This manual process is slow, highly inaccurate, and frustrating for both the photographer and the client. The newly developed web-based "Photographer Portal" successfully overcomes these difficulties. It provides a centralized, secure, and automated platform that handles everything from the initial customer inquiry, to real-time chat negotiations, to the final payment confirmation. The use of a robust PostgreSQL database ensures that double-bookings are technically impossible, while the integration of an asynchronous RabbitMQ email system guarantees that clients are always kept in the loop regarding their reservation status.

## 6.2 Lessons Learnt and Personal Reflection
This project served as a profound learning experience, allowing me to apply theoretical software engineering concepts to a complex, real-world problem.

- **The Database Migration**: The most critical lesson learned was recognizing the importance of choosing the right tool for the job. Initially, the project started with MongoDB because of its rapid setup time. However, as the reservation logic became more complex—requiring strict linkages between users, packages, chat messages, and payments—it became clear that a document-based NoSQL database was the wrong choice. I learned the immense value of pivoting the architecture and migrating the entire system to **PostgreSQL**. The relational structure provided by PostgreSQL prevented data anomalies and ensured strict data integrity, which is absolutely vital for a business scheduling system.
- **Real-Time WebSockets**: Implementing the live chat using Socket.io taught me the complexities of managing persistent, stateful connections between the client and the server, as opposed to traditional stateless REST APIs.
- **System Architecture**: I learned the value of decoupling system components. Utilizing Docker to containerize the database and message brokers taught me how enterprise-level applications are orchestrated and deployed.

## 6.3 Future Improvements
While the current system robustly meets all its core objectives, software is never truly "finished." Several enhancements could be explored in future iterations to further increase the system's value:

1. **Live Payment Gateway Integration**: Currently, the system relies on manual verification of uploaded payment slips. Integrating a live payment gateway (such as a full Stripe Checkout or PayPal integration) would allow deposits to be verified and reservations to be confirmed instantly without photographer intervention.
2. **Automated PDF Invoice Generation**: Implementing a feature that automatically generates a commercial PDF invoice and emails it to the customer upon reservation confirmation would further professionalize the photographer's business operations.
3. **SMS Notifications**: While the current system relies heavily on email, integrating an SMS gateway (like Twilio) to send instant text message alerts for upcoming bookings would significantly reduce client no-shows.

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
The system has three primary user roles: Admin, Photographer, and Customer.

**For Customers (Booking a Date):**
1. Navigate to the photographer's public booking URL (e.g., `http://localhost:4000/book/john-doe`).
2. Review the photographer's portfolio and package details.
3. Click the **"Book a Session"** button to open the interactive calendar.
4. Select any available date (marked in green).
5. Fill out the secure reservation form with your event details (location, time, type of event) and click submit.
6. You will receive an automated email containing a secure tracking link. Use this link to monitor your booking status, upload your payment slip, and use the Real-Time Chat to talk to the photographer.

**For Photographers (Managing Reservations):**
1. Navigate to the system login page (`http://localhost:4000/login`) and log in using your provided credentials.
2. You will be redirected to your secure Dashboard.
3. Your calendar will display all bookings. Click on any `PENDING` reservation (marked in yellow).
4. Review the customer's event details and input your estimated price and required advance deposit amount. Click "Send Quote".
5. Use the attached Chat Window to discuss any specific details live with the client.
6. Once the customer uploads a payment slip, the reservation will require your review. Click the reservation, verify the payment slip photo, and click "Confirm Reservation". The date will now be permanently secured (red on the calendar).

## Appendix C - Management Reports
The Photographer Portal generates aggregated analytical reports to assist the Admin and Photographer in making informed business decisions.

**Location Analytics:**
The system provides a geographical heat map that aggregates all confirmed reservations based on the district and city. This allows the photographer to visually identify which regions generate the most business, enabling them to target their marketing efforts more effectively.

**Earnings Dashboard:**
The system automatically tracks the total monetary value of all `CONFIRMED` reservations. It provides a visual chart on the dashboard displaying the monthly revenue, alongside counts of new, pending, and completed reservations. This ensures the photographer has a clear, real-time overview of their business's financial health without needing external accounting software.
