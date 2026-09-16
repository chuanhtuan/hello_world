# HelloWorld

Full-stack web app: React (TypeScript) frontend, Node/Express (TypeScript) backend, MySQL database, avatar storage on S3, deployed to AWS EC2 + RDS.

## Features

- Sign up / log in / log out (JWT, httpOnly cookie + bearer token fallback)
- Forgot password / reset password via emailed link (SMTP)
- View and edit own profile (name, email, avatar)
- Avatar upload to S3
- Admin: list all users, view any user's profile, delete a user

## Project structure

```
backend/    Node + Express + TypeScript API, MySQL via Sequelize
frontend/   React + TypeScript app (Vite)
infra/      Terraform for AWS (VPC, EC2, RDS MySQL, S3, IAM)
scripts/    Deploy script run on the EC2 instance
docker-compose.yml   Local MySQL for development
```

## Prerequisites

- Node.js 20+
- Docker (for local MySQL) or a local MySQL 8 server
- An AWS account (610734023706 / chuanhtuan) with credentials configured (`aws configure --profile chuanhtuan`)
- Terraform >= 1.5
- An SMTP account for sending "forgot password" emails (Gmail app password, SendGrid, Mailgun, etc.)

## 1. Local development

### Database

```bash
docker compose up -d mysql
```

### Backend

```bash
cd backend
cp .env.example .env
# edit .env: at minimum set JWT_SECRET, SMTP_*, and S3 settings once you have them
npm install
npm run db:migrate   # creates the `users` table
npm run dev           # http://localhost:4000
```

A seeder is included for a first admin login (email `admin@helloworld.local`, password `ChangeMe123!`). Run it with:

```bash
npx sequelize-cli db:seed:all
```

**Change or remove this account before going to production.**

### Frontend

```bash
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:4000/api
npm install
npm run dev             # http://localhost:5173
```

## 2. AWS infrastructure (Terraform)

The Terraform in `infra/` provisions, in `ap-southeast-1`:

- A VPC with public subnets (app server) and private subnets (database)
- One EC2 instance (Amazon Linux 2023) running the Node backend behind nginx, which also serves the built frontend
- An RDS MySQL 8 instance (private, only reachable from the EC2 security group)
- An S3 bucket for avatars, with public read on the `avatars/` prefix and an IAM role attached to the EC2 instance for uploads (no static AWS keys needed on the server)

### Steps

1. Create an EC2 key pair in the AWS console (EC2 → Key Pairs) named e.g. `hello-world-key`, and download the `.pem`.
2. Copy the vars file and fill it in:
   ```bash
   cd infra
   cp terraform.tfvars.example terraform.tfvars
   # edit: ssh_key_name, ssh_allowed_cidr (your IP), db_password
   ```
3. Initialize and apply:
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```
4. Note the outputs: `app_server_public_ip`, `rds_endpoint`, `s3_bucket_name`.

The EC2 instance's boot script (`user_data.sh.tpl`) installs Node, nginx and pm2, clones the GitHub repo, and writes `backend/.env` with the RDS endpoint, a generated `JWT_SECRET`, and the S3 bucket name. SMTP credentials are **not** auto-filled (they aren't AWS-managed secrets) — SSH in and fill them in `/opt/hello_world/backend/.env` after first boot.

> The EC2 instance needs access to your private GitHub repo to clone it. Either add a deploy key for `git@github.com:chuanhtuan/hello_world.git` to the instance, or push manually with `scp`/`rsync` on first deploy.

### Deploying app updates

SSH into the instance and run the deploy script (pulls latest `main`, installs deps, runs migrations, builds both apps, restarts pm2):

```bash
ssh -i hello-world-key.pem ec2-user@<app_server_public_ip>
sudo bash /opt/hello_world/scripts/deploy.sh
```

### Domain & HTTPS

The Terraform does not provision a domain or TLS certificate. Point a domain's A record at `app_server_public_ip`, then run `certbot --nginx` on the instance (Let's Encrypt) once DNS has propagated, and update `CLIENT_URL` in `backend/.env` to the HTTPS domain.

## 3. GitHub

```bash
git init
git remote add origin git@github.com:chuanhtuan/hello_world.git
git add .
git commit -m "Initial commit: HelloWorld full-stack scaffold"
git branch -M main
git push -u origin main
```

## API summary

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/signup | - | Create account |
| POST | /api/auth/login | - | Log in |
| POST | /api/auth/logout | - | Log out |
| POST | /api/auth/forgot-password | - | Request reset email |
| POST | /api/auth/reset-password/:token | - | Set new password |
| GET | /api/users/me | user | Current user's profile |
| PUT | /api/users/me | user | Update name/email |
| POST | /api/users/me/avatar | user | Upload avatar (multipart `avatar` field) |
| GET | /api/users/:id | user (self) / admin | View a profile |
| GET | /api/users | admin | List all users |
| DELETE | /api/users/:id | admin | Delete a user |

## Notes & next steps

- Passwords are hashed with bcrypt; reset tokens are stored hashed (SHA-256) with a 1-hour expiry.
- CORS is locked to `CLIENT_URL`; update it if the frontend is served from a different origin.
- For production-grade secrets management, consider AWS Secrets Manager instead of the `.env` file written by `user_data.sh.tpl`.
- Consider adding automated tests and a CI pipeline (GitHub Actions) before scaling the team.
