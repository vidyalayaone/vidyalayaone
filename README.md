# VidyalayaOne

Easy-to-use school management system

## ✨ Current Features

- Authentication system  
- User management 
- RBAC
- Multitenancy
- Student and teacher data management
- Admission management
- Attendance management

## 🔮 Roadmap / Upcoming Features

- Fee management  
- Exams management  
- Timetable management  
- Grading and report cards  
- Future expansions may include: notifications, messaging, analytics, integrations with third-party tools

## 🏗 Architecture Overview

VidyalayaOne follows a **microservices architecture** with a monorepo managed via **pnpm workspaces**.

### Backend
- **API Gateway:** Central entry point for all frontend requests  
- **Microservices (5):**  
  - `auth-service`  
  - `user-service`  
  - `attendance-service`  
  - `school-service`  
  - `payment-service`  
- Each microservice has its own **PostgreSQL database**

### Frontend
- **Platform Frontend:** `vidyalayaone.com` — for school onboarding  
- **School Frontend:** `*.vidyalayaone.com` — our actual product

### Architecture Diagram
```
    ┌─────────────────┐       ┌─────────────────┐
    │Platform Frontend│       │ School Frontend │
    └─────────┬───────┘       └─────────┬───────┘
              │                         │
              └─────────────┬───────────┘
                            ▼
                      ┌─────────────┐
                      │ API Gateway │
                      └─────┬───────┘
      ┌─────────────┬───────┼───────┬─────────────┐
      ▼             ▼       ▼       ▼             ▼
┌──────────┐ ┌──────────┐ ┌─────────────┐ ┌──────────┐ ┌─────────────┐
│ Auth     │ │ User     │ │ Attendance  │ │ School   │ │ Payment     │
│ Service  │ │ Service  │ │ Service     │ │ Service  │ │ Service     │
└──────────┘ └──────────┘ └─────────────┘ └──────────┘ └─────────────┘
```

## ⚡ Tech Stack

| Layer       | Technology |
|------------|------------|
| Backend     | Node.js, TypeScript, Express, Prisma, PostgreSQL |
| Frontend    | React, Vite, TailwindCSS, Zustand |
| Deployment  | Kubernetes, GCP, Github Actions |
| Monorepo    | pnpm workspaces |

## 📦 Getting Started

Setup instructions can be found here: [setup/SETUP.md](setup/SETUP.md)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on how to get started.

## 🌐 Community & Support

Join discussions, ask questions, and get support:  

- [GitHub Discussions](https://github.com/orgs/vidyalayaone/discussions)

## 📱 Connect With Us

- [Twitter](https://x.com/vidyalayaone)
- [vidyalayaone.com](https://vidyalayaone.com/contact)

## 📄 License

VidyalayaOne is open-source and available under the **MIT License**. See [LICENSE](LICENSE) for details.
