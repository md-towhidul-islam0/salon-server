<div align="center">

# ✂️ SalonBook Server

**The backend API powering a modern salon booking experience — services, appointments, authentication and secure payments.**

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Checkout-635BFF?logo=stripe&logoColor=white)
![License: ISC](https://img.shields.io/badge/License-ISC-blue)

[🌐 Live Website](https://salonbook-client-iota.vercel.app/) · [💻 Client Repo](https://github.com/md-towhidul-islam0/salon-client) · [⚙️ Server Repo](https://github.com/md-towhidul-islam0/salon-server)

</div>

---

## 📑 Table of Contents

- [Project Overview](#project-overview)
- [Important Features](#important-features)
- [Technology Stack](#technology-stack)
- [Folder Structure](#folder-structure)
- [Installation Instructions](#installation-instructions)
- [Required Environment Variables](#required-environment-variables)
- [How to Run Locally](#how-to-run-locally)
- [API Reference](#api-reference)
- [Payment Flow](#payment-flow)
- [Authentication](#authentication)
- [Troubleshooting](#troubleshooting)
- [Security Notes](#security-notes)
- [Links](#links)

---

## 🎯 Project Overview

**SalonBook Server** is a lightweight Express REST API for a salon appointment platform. It manages the full booking lifecycle: users can browse and search services, create and track appointments, and complete payments through Stripe Checkout. The API stores its data in MongoDB Atlas and is deployed on Vercel.

> The npm package name is `barber-server`; the application itself is the SalonBook backend. The entire API lives in a single, easy-to-follow `index.js` file.

---

## ✨ Important Features

| Feature | What it does |
| --- | --- |
| 🧾 **Service catalog** | List all services with optional `?category=` filtering and case-insensitive `?search=` by name. |
| 🔒 **Protected service details** | Fetching a single service requires a valid session token. |
| 📅 **Appointment management** | Create, list, update, and look up appointments — including by customer ID. |
| 💳 **Stripe Checkout verification** | Verifies a completed Checkout Session before recording a transaction. |
| 🛡️ **Duplicate-payment protection** | Rejects transactions that were already stored for the same Checkout Session ID. |
| ✅ **Automatic payment status sync** | Marks the related appointment as `paid` after a successful payment. |
| 🧍 **User endpoints** | Read and update user records. |
| 🔐 **Session-based auth middleware** | Validates `Authorization` bearer tokens against a MongoDB `session` collection. |
| 🌐 **CORS enabled** | Ready to be consumed by the React client, including local development. |
| ⚙️ **Environment-driven config** | Database, payment keys, and port are configured through environment variables. |

---

## 🛠️ Technology Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js (ES Modules) |
| Framework | Express 5 |
| Database | MongoDB Atlas (official `mongodb` driver) |
| Payments | Stripe Checkout |
| Configuration | `dotenv` |
| Cross-origin | `cors` |
| Deployment | Vercel |

Dependencies are declared in `package.json` and locked in `package-lock.json`.

---

## 📁 Folder Structure

```text
salonbook-server/
├── .vercel/                # Vercel deployment metadata (generated)
├── .vscode/                # Shared editor settings
├── node_modules/           # Installed packages (ignored by Git)
├── .env                    # Local secrets — ignored by Git, never commit
├── .gitignore              # Ignores node_modules, .env and .vercel
├── index.js                # App entry point: config, auth, routes, DB, payments
├── package.json            # Project metadata and dependencies
└── package-lock.json       # Exact dependency versions

# Recommended addition (not currently in the repo):
# .env.example              # Variable names only — no secret values
```

### MongoDB collections used by `index.js`

| Collection | Purpose |
| --- | --- |
| `user` | User profiles |
| `service-collection` | Salon services and categories |
| `session` | Active auth tokens |
| `appointments-Collection` | Booking records |
| `transactions-collection` | Verified Stripe payments |

The API connects to the `salondb` database.

---

## 📦 Installation Instructions

1. **Clone the server repository**

   ```bash
   git clone https://github.com/md-towhidul-islam0/salon-server.git
   cd salon-server
   ```

   > The folder may also be named `salonbook-server` depending on how you cloned it.

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create your local environment file**

   Create a file named `.env` in the project root containing the variable names listed below, with your own values. `.env` is already ignored by Git.

4. **Run the server** (see next section).

Requirements: Node.js 20+ and access to a MongoDB Atlas cluster and a Stripe account.

---

## 🔑 Required Environment Variables

**Names only — no values are shown here. Never commit real credentials.**

| Variable | Required | Used for |
| --- | --- | --- |
| `MONGODB_URL` | ✅ Yes | MongoDB Atlas connection string |
| `STRIPE_SECRET_KEY` | ✅ Yes | Verifying Stripe Checkout sessions |
| `PORT` | ⬜ Optional | HTTP port (defaults to `5000`) |

Example **shape** (placeholders only — replace with your own values):

```dotenv
MONGODB_URL=<your-mongodb-atlas-connection-string>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
PORT=5000
```

---

## 🚀 How to Run the Project Locally

Start the API:

```bash
node index.js
```

> There is no `npm start` script configured yet, so run `node index.js` directly.

You should see output similar to:

```text
You successfully connected to MongoDB!
App listening on port 5000
```

Quick health check:

```bash
curl http://localhost:5000/
# HairSalon
```

Set `PORT` in `.env` to use a different port. Then point the client at `http://localhost:<PORT>`.

---

## 🧭 API Reference

Base URL (local): `http://localhost:5000`

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `GET` | `/` | Health check — returns `HairSalon` | Public |
| `GET` | `/users` | List users | Public |
| `GET` | `/users/:id` | Get a user by MongoDB ObjectId | Public |
| `PATCH` | `/users/:id` | Update a user | Public |
| `GET` | `/services` | List services (`?category=`, `?search=`) | Public |
| `POST` | `/services` | Create a service | Public |
| `GET` | `/services/:id` | Get one service | 🔒 Bearer token |
| `PATCH` | `/services/:id` | Update a service | Public |
| `DELETE` | `/services/:id` | Delete a service | Public |
| `GET` | `/appointments` | List all appointments | Public |
| `POST` | `/appointments` | Create an appointment | Public |
| `PATCH` | `/appointments/:id` | Update an appointment | Public |
| `GET` | `/appointments/:id` | Appointments by `customerId` | Public |
| `GET` | `/appointments/e/:id` | One appointment by ObjectId | Public |
| `POST` | `/transactions` | Verify and record a payment | Public |
| `GET` | `/transactions` | List recorded payments | Public |

**Service filtering examples**

```text
GET /services?category=hair
GET /services?search=trim
```

---

## 💳 Payment Flow

1. The client creates a Stripe Checkout Session and redirects the customer to pay.
2. On return, the client calls `POST /transactions` with `{ "sessionId": "<checkout-session-id>" }`.
3. The server retrieves the session from Stripe and confirms:
   - `status === 'complete'`
   - `payment_status === 'paid'`
4. If that `sessionId` is already stored, the API responds with `success: false` and `"Already payment"` — no duplicate record is created.
5. Otherwise, the transaction is saved and the appointment identified by `metadata.serviceID` is updated to `paymentStatus: "paid"`.

> ℹ️ The current success response uses the legacy key `sussess` (not `success`). Keep this in mind when integrating the client.

---

## 🔐 Authentication

Protected routes use the `verifyToken` middleware:

```text
Authorization: Bearer <session-token>
```

The middleware extracts the token from the `Authorization` header and looks it up in the MongoDB `session` collection:

- Missing header → `401` with `"unauthorized access"`
- Missing/invalid token → `403` with `"forbidden access"`

Currently, `GET /services/:id` is the protected route.

---

## 🧰 Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `App listening...` never appears, Mongo error in console | Invalid `MONGODB_URL`, IP not allowlisted, or cluster unreachable | Double-check the connection string and Atlas network access. |
| `401 unauthorized access` | No `Authorization` header | Send `Authorization: Bearer <token>`. |
| `403 forbidden access` | Token not found in the `session` collection | Ensure the client stores the token used at login. |
| Stripe retrieval error | Wrong `STRIPE_SECRET_KEY` or wrong mode (test vs live) | Use the key matching the Checkout Session environment. |
| `EADDRINUSE` | Port already in use | Change `PORT` in `.env`. |
| Cannot import modules | Old Node.js version | Use Node.js 20+ (project uses `"type": "module"`). |

---

## 🔒 Security Notes

- `.env` and `.vercel` are listed in `.gitignore`; keep it that way.
- Store environment variables in your hosting provider's dashboard for production.
- If any credential was ever committed or shared, **rotate it immediately**.
- CORS is currently fully open via `app.use(cors())`. Restrict it to trusted client origins before production use.
- Consider adding request validation, rate limiting, and a `start` script as next improvements.

---

## 🔗 Links

- 🌐 **Live website:** [https://salonbook-client-iota.vercel.app/](https://salonbook-client-iota.vercel.app/)
- 💻 **Client repository:** [https://github.com/md-towhidul-islam0/salon-client](https://github.com/md-towhidul-islam0/salon-client)
- ⚙️ **Server repository:** [https://github.com/md-towhidul-islam0/salon-server](https://github.com/md-towhidul-islam0/salon-server)

---

<div align="center">

Built with ❤️ for seamless salon booking.

</div>
