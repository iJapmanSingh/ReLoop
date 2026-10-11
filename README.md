# ♻️ ReLoop — E-Waste Collection & Recycling Platform

**Making responsible e-waste disposal simpler, more accessible, and rewarding.**

ReLoop is a web-based e-waste management platform that connects citizens with verified waste collectors to help make electronic waste collection more organized and accessible.

The platform is designed to support responsible disposal, pickup coordination, and a more transparent recycling experience through a modern web application.

## ✨ Features

- **E-Waste Pickup Coordination** — Support the process of arranging e-waste pickups between citizens and collectors.
- **Verified Collectors** — Connect users with verified collection partners.
- **Delivery Partner Support** — Support pickup workflows involving delivery or collection partners.
- **Credits & Rewards** — Encourage responsible disposal through a rewards-oriented experience.
- **Web-Based Interface** — Access the platform through a React-based frontend.
- **Persistent Data Storage** — Store application data using PostgreSQL.
- **Containerized Deployment** — Package the frontend, backend, and database using Docker Compose.

*Note: Feature availability depends on the current implementation in the repository.*

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, JavaScript |
| Web Server | Nginx |
| Backend | Java, Spring Boot, Maven |
| Database | PostgreSQL |
| Containerization | Docker, Docker Compose |
| Cloud Deployment | AWS EC2 |
| Version Control | Git, GitHub |

## 🏗️ Architecture

ReLoop uses a containerized, multi-service architecture.

```text
                  User's Browser
                        |
                        v
                React Frontend
                Nginx :80
                        |
                 /api/* requests
                        |
                        v
                Spring Boot API
                   :8080
                        |
                        v
                   PostgreSQL
                   :5432
```

Docker Compose manages the frontend, backend, and database services.

The frontend's Nginx server proxies API requests to the backend over the internal Docker network. PostgreSQL is intended to remain private to that network rather than being exposed directly to the internet.

## 🚀 Getting Started

### Prerequisites

Install the following tools:

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine
- [Docker Compose](https://docs.docker.com/compose/)

### 1. Clone the repository

```bash
git clone https://github.com/iJapmanSingh/ReLoop.git
cd ReLoop
```

### 2. Configure environment variables

Create a `.env` file in the project root. Generate unique, strong secrets for your environment and never commit this file.

Example configuration:

```dotenv
POSTGRES_DB=ewaste
POSTGRES_USER=ewaste
POSTGRES_PASSWORD=replace-with-a-strong-password

DB_URL=jdbc:postgresql://db:5432/ewaste
DB_USER=ewaste
DB_PASSWORD=replace-with-a-strong-password

JWT_SECRET=replace-with-a-long-random-secret
SEED_DEMO=false
```

Use the same database password for `POSTGRES_PASSWORD` and `DB_PASSWORD`.

**Security:** Use different credentials for development and production. Keep `.env` out of version control and never publish real secrets in documentation, screenshots, or logs.

### 3. Build and start the application

```bash
docker compose build
docker compose up -d
```

### 4. Verify the services

```bash
docker compose ps
docker compose logs --tail=100
```

Check that the database, backend, and frontend start successfully.

### 5. Access the application

Open the following address in your browser when running locally:

**http://localhost**

The frontend is served by Nginx on port 80. API requests are proxied to the Spring Boot backend.

> Ensure the environment variable names and defaults in `.env` match the current `docker-compose.yml` and Spring Boot configuration before starting the application.

## ☁️ Deployment

ReLoop can be deployed to an AWS EC2 instance using Docker Compose.

The deployment workflow is:

1. Launch an EC2 instance with a supported Linux distribution.
2. Configure SSH access and install Docker, Docker Compose, and Git.
3. Clone the repository and configure production environment variables.
4. Build the Docker images.
5. Start the application using Docker Compose.
6. Configure security group rules to expose only the required public ports.
7. Configure HTTPS before handling real user credentials or sensitive information.

For a production deployment, keep PostgreSQL and the backend inaccessible directly from the public internet. Use strong secrets, restrict SSH access, and configure database backups and TLS.

## 🔐 Security Considerations

- Never commit `.env` files or credentials.
- Use a strong JWT signing secret.
- Keep PostgreSQL on a private network.
- Restrict administrative access to the server.
- Use HTTPS for production traffic.
- Back up persistent database data and periodically test restoration.

## 🧪 Development & Testing

Build the application:

```bash
docker compose build
```

Start all services:

```bash
docker compose up -d
```

Inspect service status:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f backend
```

Stop the application without deleting the database volume:

```bash
docker compose down
```

To restart the application:

```bash
docker compose up -d
```

## 📁 Project Structure

```text
ReLoop/
├── backend/
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

*The structure above summarizes the main project components; individual files and directories may vary as development continues.*

## 🌱 Vision

ReLoop aims to make responsible e-waste disposal easier by connecting people with collection partners and encouraging participation in recycling.

By combining a web-based experience with a containerized backend and persistent storage, the project provides a foundation for a more accessible and organized e-waste collection workflow.

## 👨‍💻 Contributors

- **Japman Singh** — [GitHub](https://github.com/iJapmanSingh)
- **Harshpreet Kaur** — Contributor

## 📄 License

A license has not yet been specified. Add a `LICENSE` file and update this section once the project license has been chosen.

---

**Built with ♻️ to support more responsible e-waste management.**
