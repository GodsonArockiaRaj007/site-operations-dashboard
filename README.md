# Site Operations Dashboard

A full-stack Site Operations Management Dashboard built with React.js, Node.js, Express.js, and PostgreSQL.

The application allows operations teams to monitor sites, track installation activities, and view operational summaries through a responsive dashboard.

## Live Demo

### Frontend
https://site-operations-dashboard-tau.vercel.app/

### Backend API
https://site-operations-api-iwwx.onrender.com/

---

## Features

- Operations dashboard with summary metrics
- Site management
- Installation tracking
- Create new sites
- Create new installations
- Search sites by name, location, or status
- Installation status tracking
- RESTful APIs
- PostgreSQL relational database
- SQL joins and aggregations
- Database indexes for optimized queries
- Request validation
- Centralized error handling
- API logging using Morgan
- Responsive React UI
- Production deployment

---

## Tech Stack

### Frontend

- React.js
- Vite
- React Router
- Tailwind CSS
- Axios
- Lucide React

### Backend

- Node.js
- Express.js
- PostgreSQL
- node-postgres (`pg`)
- REST APIs
- CORS
- Morgan
- dotenv

### Database

- PostgreSQL
- Neon PostgreSQL

### Deployment

- Vercel - Frontend
- Render - Backend
- Neon - PostgreSQL

### Version Control

- Git
- GitHub

---

## Architecture

```text
                    GitHub
                       |
              +--------+--------+
              |                 |
              v                 v
          Vercel              Render
       React Frontend      Node + Express API
              |                 |
              +--------+--------+
                       |
                       v
                 Neon PostgreSQL