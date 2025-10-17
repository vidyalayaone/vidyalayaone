# VidyalayaOne

Easy-to-use school management system

## ✨ Current Features

- Authentication system  
- User management 
- RBAC
- Multitenancy
- Student Data Management
- Teacher Data Management
- Admission Management
- Attendance Management
- Grading & Reports
- Academic Calender
- Time Table Management
- Fee Management

## 🔮 Upcoming Features

- Parent Portal 
- Multi-branch Management  
- Analytics Dashboard 
- Mobile Apps
- Third-party Integrations

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

If you have any questions, need setup help, or want to discuss contribution ideas, feel free to join our contributor community:

👉 [Join the Telegram Group](https://t.me/+nVYA-DsHWwNkMGE9)

### Contributors

<div align="left">
  <table>
    <tr>
      <td align="center">
        <a href="https://github.com/SuyashPant04">
          <img src="https://github.com/SuyashPant04.png" width="80px;"/>
          <br />
          <sub><b>@SuyashPant04</b></sub>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/adityarepos">
          <img src="https://github.com/adityarepos.png" width="80px;"/>
          <br />
          <sub><b>@adityarepos</b></sub>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/AndreaKrankotova">
          <img src="https://github.com/AndreaKrankotova.png" width="80px;"/>
          <br />
          <sub><b>@adityarepos</b></sub>
        </a>
      </td>
    </tr>
  </table>
</div>

## 📄 License

VidyalayaOne is open-source and available under the **MIT License**. See [LICENSE](LICENSE) for details.
