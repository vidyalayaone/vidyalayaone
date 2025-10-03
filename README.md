# VidyalayaOne

**Easy-to-use school management system**  

VidyalayaOne is an open-source, modern school management system designed for schools of all sizes. It provides a scalable, multitenant platform with role-based access control (RBAC) and a modular microservices architecture, making it easy for developers to contribute and extend its functionality.

---

## 🚀 Demo

Try the demo school:

- **URL:** [my-school.vidyalayaone.com](https://my-school.vidyalayaone.com)  
- **Username:** `third_user`  
- **Password:** `password123`

Platform Frontend (landing & school registration): [vidyalayaone.com](https://vidyalayaone.com)  
School Frontend (tenant access): Subdomain e.g., `my-school.vidyalayaone.com`

---

## ✨ Current Features

- Authentication system (sign up, login, password reset)  
- User management (admins, teachers, students)  
- Role-Based Access Control (RBAC)  
- Subdomain provisioning for each school (multitenancy)  
- Student and teacher data management  
- Attendance management  

---

## 🔮 Roadmap / Upcoming Features

- Fee management  
- Exams management  
- Timetable management  
- Grading and report cards  
- Future expansions may include: notifications, messaging, analytics, integrations with third-party tools

---

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
- Each service has its own **PostgreSQL database**  
- Built with **Node.js, TypeScript, Express, Prisma, PostgreSQL**

### Frontend
- **Platform Frontend:** `vidyalayaone.com` — for school registration and landing pages  
- **School Frontend:** `*.vidyalayaone.com` — tenant-specific school application  
- Built with **React, Vite, TailwindCSS, Zustand**

### Deployment
- Deployed on **Kubernetes** using **GCP**  
- Fully containerized and scalable architecture

### Directory Structure
```

vidyalayaone/
├── apps/
│   ├── api-gateway/
│   ├── attendance-service/
│   ├── auth-service/
│   ├── payment-service/
│   ├── platform-frontend/
│   ├── profile-service/
│   ├── school-frontend/
│   └── school-service/
├── packages/
├── setup/
├── k8s-manifests/
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── tsconfig.base.json

```

### Architecture Diagram
```

```
      ┌─────────────┐
      │ Platform    │
      │ Frontend    │
      └─────┬──────┘
            │
            ▼
      ┌─────────────┐
      │ API Gateway │
      └─────┬──────┘
┌───────────┼───────────┐
▼           ▼           ▼
```

Auth Service  User Service  Attendance Service
▼           ▼           ▼
School Service      Payment Service

```

---

## ⚡ Tech Stack

| Layer       | Technology |
|------------|------------|
| Backend     | Node.js, TypeScript, Express, Prisma, PostgreSQL |
| Frontend    | React, Vite, TailwindCSS, Zustand |
| Deployment  | Kubernetes, GCP |
| Monorepo    | pnpm workspaces |

---

## 📦 Getting Started

Setup instructions can be found here: [setup/SETUP.md](setup/SETUP.md)

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on how to get started.  

- Check out issues labeled **“good first issue”** if you’re new.  
- Follow coding standards and commit guidelines as outlined in `CONTRIBUTING.md`.  

---

## 🗺 Roadmap

1. Fee management  
2. Exams and grading  
3. Timetable and scheduling  
4. Analytics and reporting  
5. Future integrations and advanced features  

---

## 🌐 Community & Support

Join discussions, ask questions, and get support:  

- Discord: [placeholder-link](https://discord.gg/placeholder)  
- GitHub Discussions: [placeholder-link](https://github.com/placeholder)  

---

## 📱 Connect With Us

- Twitter: [placeholder-link](https://twitter.com/placeholder)  
- LinkedIn: [placeholder-link](https://linkedin.com/company/placeholder)  
- Website: [vidyalayaone.com](https://vidyalayaone.com)  

---

## 📄 License

VidyalayaOne is open-source and available under the **MIT License**. See [LICENSE](LICENSE) for details.
