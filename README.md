# 📝 Internal Feedback System

An internal feedback management system for organizations that enables employees and managers to give, receive, and analyze feedback. The app supports role-based dashboards, sentiment analysis, and feedback requests.

## 🚀 Features

### 👩‍💼 Manager Features:
- Give feedback to team members.
- View feedback summaries and sentiment trends.
- Edit previously submitted feedback.
- View visual charts (Pie Chart) for sentiment distribution.

### 👨‍💻 Employee Features:
- View feedback received (in a timeline format).
- Request feedback from managers.
- Acknowledge received feedback.
- Track sentiment of feedback over time.

---

## 🛠️ Tech Stack

### Frontend:
- **React** Library for building interactive user interfaces.
- **Recharts** For rendering interactive charts (sentiment analysis, summary, etc.).
- **Tailwind CSS** Utility-first CSS framework for responsive and modern UI design.
- Axios for API calls
- React Router for navigation

### Backend:
- **FastAPI** - Lightweight, fast, and async web framework used for building REST APIs.
- **SQLAlchemy** - ORM for managing database models and queries.
- **SQLite** - Lightweight embedded database used for local development.
- **Pydantic** - For request/response data validation and serialization.

### DevOps & Tooling:
- **Docker** - Containerization for consistent deployment environments.
- **Uvicorn** - ASGI server for running FastAPI apps in production or development.

---

## 🧠 Design Decisions

### Modular Architecture
- Backend is organized into clearly separated modules: routes, models, schemas, and services.
- This promotes maintainability, scalability, and separation of concerns.

### Role-Based Access Control
- Users have roles like manager or employee.
- Access to features (like giving feedback, viewing dashboards) is controlled based on user roles.

### Persistent Storage
- Used SQLite for simplicity and portability during development.
- Can be easily replaced with PostgreSQL or MySQL in production.

### Frontend Separation
- React frontend is fully decoupled from the FastAPI backend.
- Enables independent development and scaling of frontend and backend services.

### Interactive UI with Analytics
- Dashboards use Recharts to provide managers with visual insights into team sentiment trends and feedback statistics.
- Designed with Tailwind CSS to ensure responsive design and clean UI.

### Developer Experience
- Added support for automatic docs via FastAPI Swagger UI at /docs.
- Vite and Tailwind ensure fast dev experience and rapid UI iteration.

---

## Set up Instructions

### Option 1

### Backend:

1. Clone the Repository:
- git clone https://github.com/lakhoreJanvi/feedback-system.git

2. Navigate to the project root:
- cd feedback-system

3. Install dependencies:
- pip install -r backend/requirements.txt

4. Run the backend server:
- uvicorn backend.main:app --reload

Backend will be available at: http://localhost:8000

### Frontend:

1. Open a new terminal window:
- cd feedback-system/frontend

2. Install frontend dependencies:
- npm install

3. Start the frontend server:
- npm run dev

Frontend will be available at: http://localhost:5173

### Option 2

If you prefer Dockerized setup, make sure Docker is installed, then:

1. Build the image:
- docker build -t feedback-system .

2. Run the container:
- docker run -p 8000:8000 feedback-system
