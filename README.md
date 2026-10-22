# ♻️ ReLoop

**Give your old electronics a safe next step.** ReLoop connects citizens with admin-approved e-waste collectors, tracks every handover from request to recycling (with a handover code and a facility receipt), and rewards citizens with credits once their device is actually recycled.

🔗 **Live demo:** https://d1keoaa49b2oin.cloudfront.net
🎥 **Demo video:** _add the X/YouTube link here_

> Built at **Environmental Hacks** (WeMakeDevs × AWS, Bharat Builds Tour) by team scaleOps.

---

## The problem

Most people have old phones, laptops and chargers lying in a drawer. They don't know whether the device can be repaired, resold or must be recycled, the batteries inside are a fire and toxicity risk, and there is no simple, trustworthy way to hand it to someone who will process it properly.

## What ReLoop does

| Who | What they can do |
|---|---|
| **Citizen** | List a device, get safety advice (repair / resell / donate / recycle), request a pickup, track it live, share a handover code at the door, rate the pickup, earn and redeem credits |
| **Collector** | Apply with a registration or partner ID. Once an admin approves them: see open requests nearby, accept one, confirm the handover with the citizen's code, and record the receiving facility and receipt |
| **Delivery partner** (collector type) | Transport e-waste on a delivery route that already passes the citizen's pincode, earning the citizen a bonus |
| **Admin** | Review collector applications, suspend collectors, follow up on flagged pickups, and see total kg recycled, estimated CO₂ saved, requests by status, trends, and credits issued vs redeemed |

### The flow

```
Citizen lists a device  →  gets safety advice  →  requests pickup (with consent to share contact)
        ↓
Approved collector accepts  →  citizen gets a 6-digit handover code
        ↓
REQUESTED → ACCEPTED → PICKED_UP (collector enters the code) → RECYCLED (facility + receipt recorded)
        ↓
Citizen earns credits at RECYCLED  →  rates the pickup  →  redeems credits for rewards
```

### Credits

Credits are awarded **only when a pickup reaches RECYCLED** (which needs the receiving facility and a receipt number), and never twice.

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
- **Location-aware partner matching.** The "hand over with your next delivery" option appears only if an approved delivery partner actually serves the citizen's pincode.
- **Pluggable advice engine.** Guidance sits behind an `AdviceService` interface, so the current rule-based engine can be swapped for an LLM-backed one.

---

## Trust and safety

The hard question for any pickup service is *who is at the door, and where does the device really go?* This is what the prototype does about it:

| Risk | What the app does |
|---|---|
| Anyone can sign up as a collector | Collectors apply with a type and a registration or partner ID. They stay **pending** and cannot see or accept requests until an admin approves them. Admins can reject or suspend with a reason. |
| The wrong person turns up | The citizen gets a **6-digit handover code** and gives it only at the door. The collector must enter it to mark the pickup as picked up. Five wrong codes flag the pickup for review. |
| "Recycled" is just a click | Marking RECYCLED needs the **receiving facility and a receipt number**, and the citizen sees both. Credits are released only then. |
| Bad experiences go unnoticed | Citizens **rate** each pickup and can **report a problem**. Admins see flagged pickups and each collector's average rating. |
| Spam and credit farming | At most 5 open pickups per citizen, and credits are awarded once per pickup. |

What it does **not** do yet: the registration number is checked **by an admin, by hand**, against the official register (in India, the CPCB e-waste portal); nothing is verified automatically. A collector and a citizen who work together could still fake a pickup.
Details, the real-world background and the limits are in [docs/TRUST_AND_SAFETY.md](docs/TRUST_AND_SAFETY.md).

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
| Pickups (citizen) | `POST /pickups` · `GET /pickups/mine` · `PATCH /pickups/{id}/cancel` · `POST /pickups/{id}/feedback` · `GET /pickups/partner-availability?pincode=` |
| Pickups (collector) | `GET /pickups/available` · `GET /pickups/assigned` · `PATCH /pickups/{id}/accept` · `PATCH /pickups/{id}/status` (body carries the handover code, or the facility and receipt) |
| Shared | `GET /pickups/{id}` (the response is filtered to what the viewer may see) |
| Credits | `GET /credits` · `POST /credits/redeem` |
| Admin | `GET /admin/stats` · `GET /admin/collectors` · `PATCH /admin/collectors/{id}/review` · `GET /admin/flagged` |

---

## Try it

Open the live demo and sign in with a demo account:

| Role | Email | Password |
|---|---|---|
| Citizen | `ananya.rao@example.com` | `Citizen@123` |
| Collector | `ravi@greenloop.in` | `Collector@123` |
| Delivery partner | `suresh@delivery-partner.demo` | `Partner@123` |
| Collector with a pending application | `meera@ecocycle.demo` | `Collector@123` |

The admin account is not published here. Whoever runs the server sets its password (see below).

**Suggested walkthrough:** sign in as the citizen, add a device, request a pickup, then sign in as the collector in another window and accept it. The citizen's tracking page now shows a handover code: enter it as the collector to mark *Picked up*, then record a facility and receipt for *Recycled*. Switch back to the citizen to see the credits arrive and rate the pickup. Registration numbers starting with `DEMO-` are samples, not real registrations.

## Run it locally

Requires [Git](https://git-scm.com/) and [Docker](https://www.docker.com/products/docker-desktop/).

```bash
git clone https://github.com/iJapmanSingh/ReLoop.git
cd ReLoop

cp .env.example .env
# edit .env: set POSTGRES_PASSWORD, JWT_SECRET and ADMIN_PASSWORD
#   generate a secret with:  openssl rand -hex 32

docker compose up -d --build
```

Open **http://localhost**. Stop everything with `docker compose down` (add `-v` to also delete the database volume).

Set `SEED_DEMO=false` in `.env` to skip the sample recycling history. The admin is `admin@ewaste.app` with the `ADMIN_PASSWORD` you set; on every start the stored password is updated to match, so changing it in `.env` and restarting rotates it. If `ADMIN_PASSWORD` is empty and `SEED_DEMO=true`, the demo password `Admin@123` is used, which is fine locally and never on a public server.

Run the unit tests with `cd backend && ./mvnw test` (the Spring context test in `BackendApplicationTests` needs a running PostgreSQL).

---

## What's real and what's demo

Being upfront about the prototype's limits:

- ✅ **Real:** authentication, roles, collector applications and admin approval, handover codes, facility receipts, ratings and flags, the pickup lifecycle, credits ledger, admin statistics, and the AWS deployment.
- 👤 **Manual, not automatic:** an admin compares a collector's registration number with the official register by hand. Numbers starting with `DEMO-` are samples.
- 🧪 **Rule-based, not AI:** the safety advice comes from a rules engine (condition + category → recommendation and hazards). It is built behind an interface so an LLM can replace it.
- 🧪 **Proposed, not signed:** the Amazon delivery-partner idea came from an AWS mentor at the event. It is prototyped here, but there is no actual partnership, and the vouchers are demo codes.
- 🧪 **Demo data:** the facilities directory and the dashboard's sample history are illustrative.

## Roadmap

- [ ] LLM-backed advice engine (swap in behind `AdviceService`)
- [ ] Check registration numbers against the official register automatically, with document upload
- [ ] Photo proof at pickup and facility-confirmed receipts
- [ ] Notifications at each pickup stage
- [ ] Photo upload for items
- [ ] Real facility data and map view
- [ ] Managed database (Amazon RDS) with backups
- [ ] CI/CD pipeline and API-level integration tests (unit tests for the core rules exist)
- [ ] Restrict CORS and the server's security group to CloudFront only

## Team

- **Japman Singh** ([@iJapmanSingh](https://github.com/iJapmanSingh)): UI design (Figma), backend, AWS deployment
- **Harshpreet Kaur**: frontend
