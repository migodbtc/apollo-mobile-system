# Apollo: Real-Time Fire Monitoring System

> **A Capstone Project for IT401/IT402**  
> Real-time fire detection, reporting, and analytics using AI, GIS, and modern web/mobile technologies.

---

## 🚀 Overview

Apollo is an integrated system for real-time fire monitoring, reporting, and response. It leverages AI-powered media analysis, geospatial data, and modern web/mobile interfaces to empower both citizens and first responders. Built for Daang Bakal Fire Station and the surrounding community.

---

## 🗂️ Project Structure

- **mobile/** – Expo React Native app for users and responders
- **server/** – Python Flask REST API, database, and ML model integration
- **server/model/** – TensorFlow-based fire detection model (Hermes)
- **web/** – React.js web dashboard for admin and analytics
- **sql/** – MySQL schemas and database scripts
- **doc/** – Project documentation and research papers

---

## 📱 Mobile App (`mobile/`)

- Built with Expo SDK 53 (React Native)
- Features:
  - Automated incident reporting (photo/video capture)
  - Real-time location tracking
  - AI-powered fire detection and validation
  - User authentication and privilege management
  - Admin dashboard (in-app)
- Quick start:
  ```bash
  cd mobile
  npm install
  npx expo start
  ```

## 🖥️ Web Dashboard (`web/`)

- Built with React.js + Vite
- Features:
  - Admin dashboard for database and report analytics
  - Public info and project mission
- Quick start:
  ```bash
  cd web
  npm install
  npm run dev
  ```

## 🧠 Backend & AI Model (`server/`)

- Python 3.11, Flask, SQLAlchemy, Celery
- RESTful API for all system operations
- Integrates with MySQL and the Hermes ML model
- ML model (`server/model/`): TensorFlow, Pandas, NumPy
- Quick start:
  ```bash
  cd server
  pip install -r requirements.txt
  python app.py
  ```

## 🗄️ Database (`sql/`)

- MySQL schema and migration scripts
- To set up: import the latest `.sql` file into your MySQL server

---

## 📝 Development & Contribution

- MIT License (see LICENSE.txt)
- See each subfolder's README for more details and advanced usage
- For research, see `doc/`

---

## 📣 Credits

- Developed by @migodbtc, @hushiirei, and Apollo Development Team of DBTC
- Special thanks to Daang Bakal Fire Station
