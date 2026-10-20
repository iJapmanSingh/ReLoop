# ♻️ ReLoop

**Give your old electronics a safe next step.** ReLoop connects citizens with verified e-waste collectors, tracks every handover from request to recycling, and rewards citizens with credits once their device is actually recycled.

🔗 **Live demo:** https://d1keoaa49b2oin.cloudfront.net
🎥 **Demo video:** _add the X/YouTube link here_

> Built at **Environmental Hacks** (WeMakeDevs × AWS, Bharat Builds Tour) by team scaleOps.

---

## The problem

Most people have old phones, laptops and chargers lying in a drawer. They don't know whether the device can be repaired, resold or must be recycled, the batteries inside are a fire and toxicity risk, and there is no simple, trustworthy way to hand it to someone who will process it properly.

## What ReLoop does

| Who | What they can do |
|---|---|
| **Citizen** | List a device, get safety-aware guidance (repair / resell / donate / recycle), request a pickup, track it live, earn and redeem credits |
| **Collector** | See open requests in their area, accept one, and move it through *Picked up* and *Recycled* |
| **Delivery partner** (collector type) | Pick up e-waste on a delivery route that already passes the citizen's pincode, earning the citizen a bonus |
| **Admin** | See total kg recycled, estimated CO₂ saved, requests by status, trends by month, city and device type, and credits issued vs redeemed |

### The flow

```
Citizen lists a device  →  gets guidance  →  requests pickup (with consent to share contact)
        ↓
Collector accepts   →   REQUESTED → ACCEPTED → PICKED_UP → RECYCLED
        ↓
Citizen earns credits at RECYCLED  →  redeems them for rewards
```

### Credits

Credits are awarded **only when a pickup reaches RECYCLED**, and never twice.

`credits = category base + 10 per kg (+ 25 if handed to a delivery partner)`

| Category | Base |
|---|---|
| Phone / tablet | 100 |
| Laptop / computer | 200 |
| Monitor / TV | 150 |
| Printer / peripheral | 80 |
| Large appliance | 250 |
| Small electronics | 40 |

Rewards (demo vouchers): 250 credits → ₹50, 500 → ₹100, 1200 → ₹250.

---

## Engineering highlights

- **Pickup state machine.** `REQUESTED → ACCEPTED → PICKED_UP → RECYCLED`, stages can't be skipped, and a citizen can cancel only while `REQUESTED`.
- **Concurrency-safe.** Pickups and user balances are loaded with pessimistic locks, so two collectors can't accept the same request and credits can't be double-awarded.
- **Privacy by design.** A citizen's address and phone number are visible only to them and the collector assigned to the pickup, and only after the citizen consents to sharing.
- **Auth and roles.** JWT (stateless) with BCrypt password hashing and role-based endpoint protection for Citizen, Collector and Admin.
- **Location-aware partner matching.** The "hand over with your next delivery" option appears only if a verified delivery partner actually serves the citizen's pincode.
- **Pluggable advice engine.** Guidance sits behind an `AdviceService` interface, so the current rule-based engine can be swapped for an LLM-backed one.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Tailwind CSS 4, Recharts |
| Backend | Java 17, Spring Boot, Spring Security, JPA/Hibernate, Lombok |
| Database | PostgreSQL 16 |
| Serving | nginx (static files + `/api` reverse proxy) |
| Packaging | Docker, Docker Compose |
| Cloud | AWS EC2 + Amazon CloudFront (HTTPS) |

## Architecture

```
        Browser
           │  HTTPS
           ▼
   Amazon CloudFront  (HTTPS, no caching: live API data)
           │  HTTP :80
           ▼
   EC2 instance ── Docker Compose
        ├── frontend   nginx :80   serves the React app, proxies /api/*
        ├── backend    Spring Boot :8080
        └── db         PostgreSQL :5432  (internal network only, no public port)
```

---

## API overview

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register` · `POST /auth/login` · `GET /auth/me` |
| Items (citizen) | `POST /items` · `GET /items/mine` · `GET /items/{id}` · `PUT /items/{id}` · `POST /items/{id}/advice` |
| Pickups (citizen) | `POST /pickups` · `GET /pickups/mine` · `PATCH /pickups/{id}/cancel` · `GET /pickups/partner-availability?pincode=` |
| Pickups (collector) | `GET /pickups/available` · `GET /pickups/assigned` · `PATCH /pickups/{id}/accept` · `PATCH /pickups/{id}/status` |
| Shared | `GET /pickups/{id}` (the response is filtered to what the viewer may see) |
| Credits | `GET /credits` · `POST /credits/redeem` |
| Admin | `GET /admin/stats` |

---

## Try it

Open the live demo and sign in with a demo account:

| Role | Email | Password |
|---|---|---|
| Citizen | `ananya.rao@example.com` | `Citizen@123` |
| Collector | `ravi@greenloop.in` | `Collector@123` |
| Delivery partner | `suresh@delivery-partner.demo` | `Partner@123` |

**Suggested walkthrough:** sign in as the citizen, add a device, request a pickup, then sign in as the collector in another window, accept it and move it to *Recycled*. Switch back to the citizen to see the credits arrive.

## Run it locally

Requires [Git](https://git-scm.com/) and [Docker](https://www.docker.com/products/docker-desktop/).

```bash
git clone https://github.com/iJapmanSingh/ReLoop.git
cd ReLoop

cp .env.example .env
# edit .env: set POSTGRES_PASSWORD and JWT_SECRET
#   generate a secret with:  openssl rand -hex 32

docker compose up -d --build
```

Open **http://localhost**. Stop everything with `docker compose down` (add `-v` to also delete the database volume).

Set `SEED_DEMO=false` in `.env` to skip the sample recycling history.

---

## What's real and what's demo

Being upfront about the prototype's limits:

- ✅ **Real:** authentication, roles, the full pickup lifecycle, credits ledger, admin statistics, and the AWS deployment.
- 🧪 **Rule-based, not AI:** item guidance comes from a rules engine (condition + category → recommendation and hazards). It is built behind an interface so an LLM can replace it.
- 🧪 **Proposed, not signed:** the Amazon delivery-partner idea came from an AWS mentor at the event. It is prototyped here, but there is no actual partnership, and the vouchers are demo codes.
- 🧪 **Demo data:** the facilities directory and the dashboard's sample history are illustrative.

## Roadmap

- [ ] LLM-backed advice engine (swap in behind `AdviceService`)
- [ ] Admin UI to verify collector accounts
- [ ] Photo upload for items
- [ ] Real facility data and map view
- [ ] Managed database (Amazon RDS) with backups
- [ ] CI/CD pipeline and automated tests
- [ ] Restrict CORS and the server's security group to CloudFront only

## Team

- **Japman Singh** ([@iJapmanSingh](https://github.com/iJapmanSingh)): UI design (Figma), backend, AWS deployment
- **Harshpreet Kaur**: frontend
