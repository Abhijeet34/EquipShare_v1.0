# EquipShare Documentation Guide

## Documentation Structure

This project follows a **version-specific documentation approach** where:
- **Root `/docs`** - Contains project-wide documentation applicable to both versions
- **`/phase1-manual/docs`** - Contains Phase 1 (v1) specific implementation details
- **READMEs** - Present at each level as entry points for that component

---

## Quick Navigation

### Getting Started
| Document                | Location                                       | Description                                                  |
|-------------------------|------------------------------------------------|--------------------------------------------------------------|
| **Project Overview**    | [README.md](./README.md)                       | Start here! Project overview, features, and quickstart       |
| **Quick Start Guide**   | [docs/QUICKSTART.md](./docs/QUICKSTART.md)     | Get running in 5 minutes - startup scripts and credentials   |
| **System Requirements** | [docs/REQUIREMENTS.md](./docs/REQUIREMENTS.md) | Prerequisites, installation steps, troubleshooting           |

### Architecture & Design
| Document                 | Location                                                        | Description                                              |
|--------------------------|-----------------------------------------------------------------|----------------------------------------------------------|
| **System Architecture**  | [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)                  | Full system design, API docs, database schema, data flow |
| **AI Usage Report**      | [docs/AI_USAGE_LOG.md](./docs/AI_USAGE_LOG.md)                  | AI-assisted development approach and reflection          |
| **Phase 2 Enhancements** | [docs/PHASE2_ENHANCEMENTS.md](./docs/PHASE2_ENHANCEMENTS.md)    | Summary of v2 enhancements and MailTrap setup            |

### Phase 1 (Manual Version) Documentation
| Document              | Location                                                                           | Description                                                  |
|-----------------------|------------------------------------------------------------------------------------|--------------------------------------------------------------|
| **Phase 1 README**    | [phase1-manual/README.md](./phase1-manual/README.md)                               | Phase 1 overview and setup                                   |
| **Security Guide**    | [phase1-manual/docs/SECURITY.md](./phase1-manual/docs/SECURITY.md)                 | RBAC, authentication, OTP, rate limiting, testing procedures |
| **Role Permissions**  | [phase1-manual/docs/ROLE_PERMISSIONS.md](./phase1-manual/docs/ROLE_PERMISSIONS.md) | Detailed RBAC implementation and testing                     |

### Phase 2 (AI-Enhanced Version) Documentation
| Document            | Location                                                       | Description                          |
|---------------------|----------------------------------------------------------------|--------------------------------------|
| **Phase 2 README**  | [phase2-ai-enhanced/README.md](./phase2-ai-enhanced/README.md) | Phase 2 overview and enhancements    |

### Component-Level Documentation
| Component              | Location                                                                         | Purpose                                |
|------------------------|----------------------------------------------------------------------------------|----------------------------------------|
| **Backend (Phase 1)**  | [phase1-manual/backend/README.md](./phase1-manual/backend/README.md)             | Backend setup, API endpoints, database |
| **Frontend (Phase 1)** | [phase1-manual/frontend/README.md](./phase1-manual/frontend/README.md)           | Frontend setup, pages, features        |
| **Backend (Phase 2)**  | [phase2-ai-enhanced/backend/README.md](./phase2-ai-enhanced/backend/README.md)   | Enhanced backend documentation         |
| **Frontend (Phase 2)** | [phase2-ai-enhanced/frontend/README.md](./phase2-ai-enhanced/frontend/README.md) | Enhanced frontend documentation        |

---

## Reading Order for New Users

### First Time Setup
1. Start with [README.md](./README.md) - Project overview
2. Check [docs/REQUIREMENTS.md](./docs/REQUIREMENTS.md) - Prerequisites
3. Run [docs/QUICKSTART.md](./docs/QUICKSTART.md) - Get started in 5 minutes

### Understanding the System
4. Read [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System design
5. Explore [phase1-manual/README.md](./phase1-manual/README.md) - Manual implementation
6. Review [phase2-ai-enhanced/README.md](./phase2-ai-enhanced/README.md) - AI enhancements

### Deep Dive Topics
7. **Security** → [phase1-manual/docs/SECURITY.md](./phase1-manual/docs/SECURITY.md)
8. **Permissions** → [phase1-manual/docs/ROLE_PERMISSIONS.md](./phase1-manual/docs/ROLE_PERMISSIONS.md)
9. **AI Approach** → [docs/AI_USAGE_LOG.md](./docs/AI_USAGE_LOG.md)

---

## Documentation by Use Case

### I want to...
| Goal                       | Document(s) to Read                                                                                   |
|----------------------------|-------------------------------------------------------------------------------------------------------|
| **Run the application**    | [docs/QUICKSTART.md](./docs/QUICKSTART.md)                                                            |
| **Understand the API**     | [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)                                                        |
| **Learn about security**   | [phase1-manual/docs/SECURITY.md](./phase1-manual/docs/SECURITY.md)                                    |
| **Test role permissions**  | [phase1-manual/docs/ROLE_PERMISSIONS.md](./phase1-manual/docs/ROLE_PERMISSIONS.md)                    |
| **See database schema**    | [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) (Database Schema section)                              |
| **Troubleshoot issues**    | [docs/REQUIREMENTS.md](./docs/REQUIREMENTS.md) (Troubleshooting section)                              |
| **Understand AI usage**    | [docs/AI_USAGE_LOG.md](./docs/AI_USAGE_LOG.md)                                                        |
| **Compare versions**       | [README.md](./README.md) (Phase Comparison section)                                                   |

---

## Directory Structure

```
EquipShare/
├── README.md                           # Main project entry point
├── DOCUMENTATION.md                    # This guide
│
├── docs/                               # Project-wide documentation
│   ├── QUICKSTART.md                   # Quick start guide
│   ├── REQUIREMENTS.md                 # System requirements
│   ├── ARCHITECTURE.md                 # System architecture & API
│   ├── PHASE2_ENHANCEMENTS.md          # Phase 2 summary and MailTrap setup
│   └── AI_USAGE_LOG.md                 # AI usage reflection
│
├── phase1-manual/                      # Version 1 (Manual)
│   ├── README.md                       # Phase 1 overview
│   ├── docs/                           # Phase 1 specific docs
│   │   ├── SECURITY.md                 # Security implementation
│   │   ├── ROLE_PERMISSIONS.md         # RBAC details
│   │   └── EQUIPMENT_DELETION_HANDLING.md
│   ├── backend/
│   │   └── README.md                   # Backend setup
│   └── frontend/
│       └── README.md                   # Frontend setup
│
└── phase2-ai-enhanced/                 # Version 2 (AI-Enhanced)
    ├── README.md                       # Phase 2 overview
    ├── backend/
    │   └── README.md                   # Enhanced backend
    └── frontend/
        └── README.md                   # Enhanced frontend
```

---

## Documentation Purpose

### Root Level (`/docs`)
**For:** Users who want to understand the overall project, setup, and architecture
**Contains:** Cross-version documentation that applies to both Phase 1 and Phase 2

### Phase 1 Level (`/phase1-manual/docs`)
**For:** Developers interested in Version 1 implementation details
**Contains:** Security, RBAC, deletion handling - specific to the manual implementation

### Phase 2 Level (`/phase2-ai-enhanced`)
**For:** Users exploring AI-enhanced features and improvements
**Contains:** Enhancements and AI-assisted patterns over Phase 1

---

## Tips

- **Entry Points**: Each folder has a README.md as the entry point
- **Cross-References**: Docs link to each other - follow the trail
- **Version Clarity**: Phase 1 and 2 are complete standalone versions, not progressive steps
- **Staying Updated**: Check the "Last Updated" date in each document

---

**Need help?** Start with [README.md](./README.md) or [docs/QUICKSTART.md](./docs/QUICKSTART.md)!
