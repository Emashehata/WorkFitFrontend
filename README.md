# TalentIQ — BI-Infused CRM Platform

**ITI Graduation Project** — Professional Diploma, Professional Development & BI-Infused CRM Track
Information Technology Institute (ITI), Tanta Branch

---

## 📖 Overview

**TalentIQ** is a full-stack, modular platform designed to manage the complete talent lifecycle within an organization — from recruitment and onboarding to performance tracking and workforce analytics — with BI-driven insights for decision-makers.

The system is built as a **modular monolith** using **Clean Architecture** and **CQRS**, with each business domain owned by a team member and integrated into one cohesive application: a shared **ASP.NET Core** backend and an **Angular** frontend.

---

## 🧩 Modules

| Module | Description |
|---|---|
| Talent Management | Employee talent data, performance evaluation, and related workflows |
| [Module 2] | *(fill in)* |
| [Module 4] | *(fill in)* |
| [Module 5] | *(fill in)* |

> Each module has its own domain, application, infrastructure, and API layers on the backend, and its own set of Angular feature modules on the frontend.

---

## 🏗️ Architecture

- **Style:** Modular Monolith
- **Backend Pattern:** Clean Architecture + CQRS (MediatR)
- **API Layer:** FastEndpoints
- **Frontend:** Angular 19, standalone components, feature-based structure
- **Auth:** JWT-based authentication & role/claims-based authorization
- **BI Layer:** Power BI dashboards / analytics integration

Each backend module contains:
- **Domain** — entities, value objects, domain logic
- **Application** — commands, queries, handlers, DTOs (CQRS)
- **Infrastructure** — EF Core configurations, repositories, migrations
- **Api** — FastEndpoints, module registration

Each frontend feature contains:
- **Components** — smart/dumb component split
- **Services** — API communication layer
- **State** — module-level state management
- **Models** — TypeScript interfaces matching backend DTOs

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 19, TypeScript, RxJS |
| Backend | ASP.NET Core (.NET 9) |
| Database | PostgreSQL / SQL Server |
| ORM | Entity Framework Core |
| API Style | CQRS with MediatR, FastEndpoints |
| Auth | JWT |
| Containerization | Docker / Docker Compose |
| BI / Analytics | Power BI |

---

## 📁 Project Structure

```
TalentIQ/
├── backend/                        # WorkFitBackend (ASP.NET Core)
│   ├── src/
│   │   ├── Modules/
│   │   │   ├── TalentManagement/
│   │   │   ├── [Module2]/
│   │   │   └── [ModuleN]/
│   │   ├── Shared/                 # Cross-cutting concerns
│   │   └── Host/                   # Composition root / API host
│   └── tests/
│
├── frontend/                       # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/                # Auth, interceptors, guards
│   │   │   ├── shared/              # Reusable UI components
│   │   │   ├── features/
│   │   │   │   ├── talent-management/
│   │   │   │   ├── [module2]/
│   │   │   │   └── [moduleN]/
│   │   │   └── layout/
│   │   └── environments/
│   └── angular.json
│
└── docker-compose.yml
```

---

## 🚀 Getting Started

### Prerequisites
- .NET 9 SDK
- Node.js (LTS) & Angular CLI
- PostgreSQL or SQL Server
- Docker (optional, for containerized setup)

### 1. Run the Backend
```bash
cd backend/src/Host
dotnet restore
dotnet ef database update
dotnet run
```
API will be available at `https://localhost:{port}`, with Swagger docs at `/swagger`.

### 2. Run the Frontend
```bash
cd frontend
npm install
ng serve
```
App will be available at `http://localhost:4200`.

### 3. Run with Docker (optional)
```bash
docker-compose up --build
```

---

## 🔑 Environment Configuration

Update the following before running:

**Backend** (`appsettings.json`):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=TalentIQ;..."
  },
  "Jwt": {
    "Issuer": "TalentIQ",
    "Audience": "TalentIQ",
    "Key": "your-secret-key"
  }
}
```

**Frontend** (`environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:{port}/api'
};
```

---

## 👥 Team

This project was developed collaboratively as part of the ITI Professional Diploma graduation requirements, with each team member owning a distinct module across the full stack.

| Name | Module |
|---|---|
| Eman Shehata | fill in |
| Rawda Ashour | fill in |
| [Name] | [Module] |

---

## 📄 License

This project was developed for educational purposes as part of the ITI Graduation Project.
