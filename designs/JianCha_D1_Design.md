# JianCha\_D1\_Design

## C4 Diagram

1. ### Context Diagram

   The design of this Context Diagram shows the big picture of the Travel Naja System. It shows which actors and external systems interact with the system and how they conceptually relate to it.  
   ![Context Diagram](https://github.com/ICT-Mahidol/2025-ITCS383-JianCha/blob/master/designs/Diagrams/Context_diagram.png)

   **1\. Requirements Alignment:** The diagram addresses key stakeholders from the requirements and shows who needs to do what:  
* Guest: View promotions and public content, Register account  
* Membership User: Make a reservation  
* Back-end Staff: Manage reservation, Generate reports  
* Flight Agency: Provides flight data and handles ticket reservations  
* Car Agency: Provides car rental availability and booking  
* Hotel Agency: Provides room availability and reservations  
* Bank Gateway: Processes credit card transactions  
  **2\. Design Decision:**  
* **Actor Separation:** Actors are separated by roles in which Guest represents unauthenticated users who can only browse, while Membership User represents authenticated users who can perform bookings and Back-end Staff can manage reservations, reflecting different access levels in the system.  
* **External Integration:** External systems including Flight Agency, Car Agency, Hotel Agency, and Bank Gateway are included to support the core requirement of travel booking. These systems are owned and operated by third parties, so they sit outside the system boundary.  
* **System Boundary:** The single "Travel Naja" node represents the entire system as a black box, separating what the system is responsible for from its external dependencies, keeping the diagram at the appropriate level of abstraction for C4 Level 1\.

2. ### Container Diagram

   The design of this Container Diagram zooms into the Travel Naja system boundary to show the high-level technology choices and how responsibilities are divided across containers, and how they communicate with each other.  
   ![Container Diagram](designs/Diagrams/Container_diagram.png)
   **1\. Requirements Alignment:** The diagram maps each container to the system's core responsibilities:  
* **Web Application** (React, Vite.js, Tailwind — Hosted by Vercel): Serves as the single interface for all actors in which Guest browses and registers, Membership user makes and manages reservations, and Back-end Staff generates reports  
* **API Gateway** (Express — Hosted by Render): Handles all incoming API calls from the Web Application, providing authentication, rate limiting, and request routing as a single entry point for all backend calls  
* **Core Booking & Guide Management Service** (Node.js, Express — Hosted by Render): Contains all business logic including booking orchestration and reporting, and communicates with all external agencies directly  
* **Main Database** (MySQL — Hosted by Clever Cloud): Persists all core data including users, bookings, and capacity.  
  **2\. Design Decision:**  
* **Cloud Hosting Strategy:** Each container is hosted on a platform suited to its role. The Web Application on Vercel for optimized frontend delivery, the API Gateway and Core Service on Render for scalable backend hosting, and the Main Database on Clever Cloud for managed database services. This separates deployment concerns across specialized platforms.  
* **API Gateway Pattern:** All traffic from the Web Application passes through the API Gateway before reaching backend services, centralizing authentication and rate limiting without duplicating these concerns across services.  
* **Single Backend Service:** All business logic is consolidated into one Core Booking & Guide Management Service rather than splitting into microservices, which is appropriate for the current scale and reduces operational complexity.  
* **Direct Agency Integration:** The Core Booking & Guide Management Service calls Car Agency, Hotel Agency, and Flight Agency directly via HTTPS.  
* **Separation of Read and Write:** The Core Booking Service uses Read/Write to Main Database for transactional operations and booking orchestrator , while reporting uses Query data to reflect read-only access for analytics purposes.

3. ### Component Diagram

   The design of this Component Diagram zooms into the Core Booking & Guide Management Service to show the internal components, their responsibilities, and how they interact with each other and with external systems.

![Component Diagram](https://github.com/ICT-Mahidol/2025-ITCS383-JianCha/blob/master/designs/Diagrams/Component_diagram.png)

**1\. Requirements Alignment:** Each component maps directly to a core system responsibility:

* **API Routes & Controllers** (Express, NestJS): Receives all incoming requests from API Gateway and routes them to the appropriate internal components, acting as the internal entry point.  
* **Payment Service**: Handles the requirement for secure payment processing by managing credit card transactions and communicating with Bank Gateway via HTTPS.  
* **Booking Orchestrator**: Fulfills the core booking requirement by coordinating flight, car, and hotel bookings, delegating external agency calls to External API Clients and persisting data to Main Database.  
* **Reporting Service**: Fulfills the Back-end Staff requirement to generate reports by querying data directly from Main Database in a read-only manner.  
* **External API Clients** (Axios): Abstracts all outbound HTTP calls to Car Agency, Hotel Agency, and Flight Agency, keeping integration logic separated from business logic in Booking Orchestrator.  
  **2\. Design Decision:**  
* **Separation of Concerns:** Each component has a single, well-defined responsibility. Booking Orchestrator focuses purely on coordination logic and delegates payment to Payment Service and external calls to External API Clients, avoiding mixing concerns in one place.  
* **External API Abstraction:** External Agency calls are isolated in the External API Clients component rather than being called directly from Booking Orchestrator. This makes it easier to swap or mock external integrations without affecting core business logic.  
* **Read/Write Separation:** Booking Orchestrator and Payment Service use Read/Write to Main Database for transactional operations, while Reporting Service uses Query data to reflect that it only reads data for analytics, making the intent of each access clear.

## 

## Use Case Diagram

Use Case Diagram describes the main interactions between users and the Travel Naja System. It shows what functions each actor can perform and how they interact with the system.  
![Context Diagram](https://github.com/ICT-Mahidol/2025-ITCS383-JianCha/blob/master/designs/Diagrams/JianCha-UseCase.png)

**1\. Requirements Alignment:**

* **User Roles Requirement:** The system defines different types of users who interact with the platform. Actors shown in the Use Case Diagram include:  
  * **Guest** \- Guest is a person who visits the Travel Naja platform without creating an account.  
  * **Membership User** \- Membership User is a registered user who has created an account in the Travel Naja system. Members can access additional features.  
  * **Back-end Staff** \- The back-end staff acts primarily as middleman and  report generators for the executives—tracking data like how many users booked flights this month or what the most popular destinations are for strategic planning.  
  * **Car Agency** \-  The platform communicates car agency to handle car types, availability, dates, and locations. The platform also simply lists what is available based on their data.  
  * **Bank Gateway** \- The platform communicates with the bank's credit card gateway to provide a credit card payment for customers.

* **Account Registration and Authentication:** The system requires users to register and create a profile before they can make reservations. Related use cases:  
  * **Register** – allows guests to create an account and become a member.  
  * **Authenticate user account** – verifies user identity when accessing the system.  
  * **Login** – allows registered users (membership users) to access member features.  
  * **Update profile** – allows membership users to modify personal information.  
  * **Set preferences** – allows membership users to define travel preferences.  
  * **Retrieve customer preferences** – retrieves membership users preferences for personalized services.

    These use cases support the requirement which states that users must fill in their profile and payment details to become members. The requirement also requires the system to maintain comprehensive customer profiles for personalization and to intelligently recommend options based on these inputs.

* **Search and Browsing Functionality:** The system must allow users to search for available travel options. Related use cases:  
  * **Browse available cars** – allows users to search for rental cars.  
  * **Select trip details** – users specify destination, date, and other criteria.  
  * **Display unified results** – the system shows available results from different services.  
  * **Display available car and price** – shows detailed car information and rental price.

    These use cases align with the requirement, which states that the platform must communicate with external agencies such as car rental agencies. The requirement also requires a unified search interface for travel services.

* **Reservation Management:** Membership Users must be able to create and manage reservations. Related use cases:  
  * **Add Car / Create reservation** – allows membership users to select a car and create a reservation.  
  * **View reservation status** – allows membership users to check their booking status.  
  * **Update reservation status** – allows the back-end staff to update the reservation status after confirmation or payment.

    These use cases support the requirement which states that the system must support reservation services such as car rental reservations. These also align with the requirement which states that requires integrated booking functionality within the platform.

* **Payment Processing:** The system must process payments through a credit card gateway. Related use cases:  
  * **Manage payment details** – allows membership users to store and manage credit card information.  
  * **Confirm payment** – allows membership users to confirm the payment for a reservation.  
  * **Process payment** – allows the bank gateway to handle and  authorize the payment process.

    	These use cases directly support the requirement which states that the system must communicate with the bank's credit card gateway to process payments and provide a credit card payment for membership users.

* **Reporting and Monitoring:** Back-end staff must be able to analyze system data and generate reports. Related use cases:  
  * **View/track reservation records** – allows the back-end staff to monitor reservation activities.  
  * **Generate reservation report** – allows the back-end staff to  generate reports for business strategy and analysis.

    These use cases support the requirement which states that the back-end staff acts primarily as report generators for the executives—tracking data like how many users booked flights this month or what the most popular destinations are for strategic planning.

**2\. C4 model Alignments**

* **Context Level Support:** The diagram identifies external actors interacting with the system, such as:  
  * General Users  
  * Members  
  * Back-end Staff  
  * Payment Gateway  
  * Car Rental Agency  
* **System Boundary Representation:** The Use Case Diagram shows the system boundary of the Travel Naja System and the services it provides.  

## Data Flow Diagram

1. ### Data Flow Diagram Level 0

   The **DFD Level 0 diagram** presents the high-level view of the Travel Naja system as a single process. It shows how the main actors interact with the platform and how the system communicates with external services. The primary actors include **Guest, Membership User, and Back-end Staff**, while the external systems include **Flight Agency, Car Agency, Hotel Agency, and the Bank Gateway**.  
   Guests can view promotions and register for an account, while membership users can make reservations and manage their bookings. Back-end staff interact with the system to monitor reservations and generate reports for business analysis. The Travel Naja system also communicates with external agencies to retrieve travel availability data and with the bank gateway to process credit card payments.  
   

![Data Flow Diagram Level 0](https://github.com/ICT-Mahidol/2025-ITCS383-JianCha/blob/master/designs/Diagrams/JianCha-DFD-Level-0.png)

2. ### Data Flow Diagram Level 1

   The **DFD Level 1 diagram** expands the system into multiple functional processes that represent the main operations of the platform. These processes include **registering accounts, logging in, browsing available cars, managing cars, viewing promotions, managing payment details, updating user profiles, creating reservations, viewing reservation records, and generating reservation reports**.  
   Each process handles specific data inputs from users and interacts with the system database to store or retrieve information. For example, the reservation process collects booking details from membership users and communicates with external agencies to confirm availability, while the payment process interacts with the bank gateway to complete credit card transactions.  
   This level of decomposition provides a clearer view of how the system manages user data, reservation information, and reporting functions while integrating with external travel service providers.  
   

![Data Flow Diagram Level 1](https://github.com/ICT-Mahidol/2025-ITCS383-JianCha/blob/master/designs/Diagrams/JianCha-DFD-Level-1.png)
