# Database Setup Guide — SkillBridge CUET

This guide explains how to set up MongoDB for the SkillBridge CUET backend.

---

## Why MongoDB Was Chosen

SkillBridge CUET is a **MERN stack** project (MongoDB, Express, React, Node.js). MongoDB was chosen because:

1. **Native MERN fit** — MongoDB is the "M" in MERN. The entire stack shares one language (JavaScript) and one data format (JSON/BSON), so data flows from the database to the browser with no translation layer.
2. **Flexible schema** — Recruitment data (opportunities, applications, messages) naturally varies in shape. MongoDB's document model accommodates optional fields and arrays (skills, tags, requirements) without migrations.
3. **Mongoose ODM** — Mongoose gives us schema validation, middleware (password hashing hooks), and rich querying on top of MongoDB, all written in JavaScript.
4. **Relationships via references** — We use ObjectId references (not deep embedding) for users, opportunities, applications, and conversations, which keeps documents lean and avoids data duplication.
5. **Free and scalable** — MongoDB Atlas provides a free cluster suitable for development and scales seamlessly to production.
6. **JSON-native responses** — The API returns JSON directly; MongoDB documents serialize to JSON with zero impedance.

---

## Option A — MongoDB Atlas (Recommended, Cloud)

MongoDB Atlas is a free cloud database. This is the recommended setup for a university MERN project.

### 1. Create an account

Go to **https://www.mongodb.com/cloud/atlas/register** and sign up (free).

### 2. Create a cluster

1. After logging in, click **Build a Database**.
2. Choose the **Free** tier (M0).
3. Pick a cloud provider (AWS, Google Cloud, or Azure) and a region close to you.
4. Click **Create Cluster**. Provisioning takes 1–3 minutes.

### 3. Create a database user

1. Under **Security → Database Access**, click **Add New Database User**.
2. Choose **Password** authentication.
3. Enter a username (e.g. `skillbridge`) and a strong password. **Save the password** — you will need it.
4. Set the user privileges to **Read and write to any database** (or a specific database).
5. Click **Add User**.

### 4. Allow network access

1. Under **Security → Network Access**, click **Add IP Address**.
2. For development, click **Allow Access from Anywhere** (`0.0.0.0/0`). For production, add only your server's IP.
3. Click **Confirm**.

### 5. Obtain the connection string

1. Click **Connect** on your cluster.
2. Choose **Connect your application**.
3. Select **Node.js** and copy the connection string. It looks like:

```
mongodb+srv://skillbridge:<password>@cluster0.xxxxx.mongodb.net/skillbridge_cuet?retryWrites=true&w=majority
```

4. Replace `<password>` with your database user's password.

### 6. Configure .env

In the `backend/` folder, create a `.env` file (copy from `.env.example`) and set:

```env
MONGODB_URI=mongodb+srv://skillbridge:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/skillbridge_cuet?retryWrites=true&w=majority
```

The database name `skillbridge_cuet` at the end of the URI is created automatically on first connection.

---

## Option B — Install MongoDB Locally

If you prefer a local database during development:

### Linux (Ubuntu/Debian)

```bash
# Import the MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add the repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### macOS (Homebrew)

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Windows

1. Download the MongoDB Community Server installer from **https://www.mongodb.com/try/download/community**.
2. Run the installer (complete setup).
3. MongoDB runs as a Windows service. Verify it is running in **Services**.

### Local .env

```env
MONGODB_URI=mongodb://127.0.0.1:27017/skillbridge_cuet
```

---

## Test the Database Connection

After configuring `.env`, run the backend:

```bash
cd backend
npm install
npm run dev
```

On success you will see:

```
✅ MongoDB connected: 127.0.0.1/skillbridge_cuet
🚀 SkillBridge CUET API running on port 5000
```

If you see `❌ MongoDB connection error`, check the common errors section below.

---

## View Data Using MongoDB Compass

MongoDB Compass is a free GUI for inspecting your database visually.

### Install Compass

Download from **https://www.mongodb.com/try/download/compass** and install.

### Connect

1. Open Compass.
2. Paste your connection string (the same `MONGODB_URI` from `.env`) into the connection bar.
3. Click **Connect**.

### Inspect collections

After running the backend and creating a few records (register a student, etc.), you will see these collections under the `skillbridge_cuet` database:

- `students`
- `companies`
- `admins`
- `opportunities`
- `applications`
- `conversations`
- `messages`
- `notifications`

Click any collection to browse documents, filter, and edit. This is the easiest way to verify that registration and verification are working correctly during development.

---

## Common Connection Errors and Fixes

| Error / Symptom | Cause | Fix |
|-----------------|-------|-----|
| `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017` | Local MongoDB is not running | Start the service: `sudo systemctl start mongod` (Linux) or `brew services start mongodb-community` (macOS) |
| `bad auth Authentication failed` | Wrong username or password in the Atlas URI | Re-enter the database user's password in the connection string |
| `connection timed out` / `could not connect` | IP not whitelisted in Atlas | Add your IP (or `0.0.0.0/0` for dev) under **Network Access** |
| `MONGODB_URI is not defined` | `.env` missing or not loaded | Create `.env` from `.env.example` and ensure `dotenv` is required in `server.js` |
| `Invalid scheme, expected connection string` | Malformed URI | Ensure the URI starts with `mongodb://` or `mongodb+srv://` and has no spaces |
| `password` placeholder not replaced | You copied the Atlas template literally | Replace `<password>` (including the angle brackets) with your actual password |
| `ECONNREFUSED` after sleep / laptop wake | Local mongod stopped | Restart the MongoDB service |
| Special characters in password | `@`, `:`, `/` in password break the URI | URL-encode the password (e.g. `@` → `%40`) |

---

## Creating the First Admin Account

Admins are **manually inserted** — there is no public admin registration endpoint. Use the seed script:

```bash
node src/scripts/seedAdmin.js "Admin Name" admin@yourdomain.com YourStrongPass1
```

You can then log in via `POST /api/auth/login` with `role: "admin"` and use the admin endpoints to approve students and companies.
