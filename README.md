# Apollo: Real-Time Fire Monitoring and Mobile Application

**Capstone Project for IT401 / Capstone Project 1 and 2**

This is the official GitHub repository for the development of **Apollo: Real-Time Fire Monitoring and Mobile Application Using AI, GIS, and Alerts for Daang Bakal Fire Station**.  
The project is developed as part of the Capstone Project 1 (IT401) and will continue into Capstone Project 2.

## Repository Structure

- **`doc/`**  
  Contains documents and files related to paper writing, presentations, and other documentation needs for the project.

- **`mobile/`**  
  The main mobile application built using Expo SDK 53. Features include:

  - Automated incident reporting via media capture
  - Real-time location tracking
  - AI-powered fire detection and data validation via machine learning

- **`server/`**  
  Flask-based API that connects to and interacts with the database. Handles all backend logic and system requests.

- **`sql/`**  
  SQL files and schemas used in the system. Structured in 3NF and includes:

  - Users
  - Reports
  - Statistics
  - Other related entities

- **`web/`**  
  A React.js-based web application that displays the information about the mobile application, the mission of the development, the main beneficiary, and other key details of the capstone project. It also houses the admin dashboard for the administrators in order to see a more technical overview of the database.
