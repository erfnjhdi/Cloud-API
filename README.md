# Cloud Tasks API

A cloud-deployed REST API designed to demonstrate modern backend development, containerization, and CI/CD practices using AWS EC2. This project focuses on building a production-style service with automated testing, persistent storage, and cloud deployment workflows.

The API provides a simple task management system and serves as a practical example of how backend services can be built, tested, and deployed reliably in a cloud environment.

## Project Overview

The API exposes RESTful endpoints for managing tasks and CRUD operations (create, retrieve, update, delete). The application is containerized with Docker, deployed on AWS EC2, and served behind an Nginx reverse proxy.

A CI/CD pipeline using GitHub Actions automatically builds and tests the application on every push, ensuring code quality and deployment readiness. Data is persisted using SQLite with Docker volumes to maintain durability across container restarts.

This project was built with an emphasis on **cloud readiness**, **automation**, and **infrastructure-aware backend design**.

## Key Features

- RESTful API built with **Node.js**
- Containerized application using **Docker**
- Deployed on **AWS EC2**
- **Nginx** reverse proxy for request handling
- Persistent storage using **SQLite** with Docker volumes
- Automated API testing with **Jest** and **Supertest**
- **CI/CD pipeline** with **GitHub Actions** for automated builds and tests
- Structured error handling for consistent API responses

## Tech Stack

### Backend
- Node.js
- Express.js
- SQLite

### Cloud & DevOps
- AWS EC2
- Docker & Docker Volumes
- Nginx
- GitHub Actions (CI/CD)

### Testing
- Jest
- Supertest

