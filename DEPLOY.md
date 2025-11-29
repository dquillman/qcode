# Deploy to Google Cloud Run (code-q-476515 / us-central1)

This app is a Next.js 15 (standalone) service backed by Cloud SQL Postgres. Use the steps below to build, migrate, and deploy to Cloud Run.

## Prerequisites
- gcloud CLI installed and logged in: `gcloud auth login`
- Set project/region:
  - `gcloud config set project code-q-476515`
  - Region: `us-central1`

## Enable Required Services
```
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com
```

## Cloud SQL (Postgres)
Create a small Postgres instance, database, and user.
```
gcloud sql instances create qcode-pg \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region us-central1

gcloud sql databases create qcode --instance qcode-pg
gcloud sql users create qcode_user --instance qcode-pg --password <STRONG_PASSWORD>

INSTANCE_CONNECTION_NAME="$(gcloud sql instances describe qcode-pg --format='value(connectionName)')"
echo "$INSTANCE_CONNECTION_NAME"  # should look like code-q-476515:us-central1:qcode-pg
```

Grant the (default) Cloud Run service account Cloud SQL access:
```
SA="$(gcloud projects describe code-q-476515 --format='value(projectNumber)')-compute@developer.gserviceaccount.com"
gcloud projects add-iam-policy-binding code-q-476515 \
  --member="serviceAccount:${SA}" \
  --role="roles/cloudsql.client"
```

## Artifact Registry
Create a Docker repo (one-time). If it exists, you can ignore the error.
```
gcloud artifacts repositories create web \
  --repository-format=docker \
  --location=us \
  --description="Web images"
```

## Build and Push Image
```
gcloud builds submit --tag us-docker.pkg.dev/code-q-476515/web/qcode:latest
```

## Deploy Cloud Run Service
Replace placeholders for `<STRONG_PASSWORD>` and `<YOUR_ADMIN_TOKEN>`.
```
gcloud run deploy qcode \
  --image us-docker.pkg.dev/code-q-476515/web/qcode:latest \
  --region us-central1 \
  --platform managed \
  --port 8080 \
  --allow-unauthenticated \
  --add-cloudsql-instances "$INSTANCE_CONNECTION_NAME" \
  --update-env-vars INSTANCE_CONNECTION_NAME="$INSTANCE_CONNECTION_NAME",DB_USER=qcode_user,DB_PASSWORD=<STRONG_PASSWORD>,DB_NAME=qcode,ADMIN_TOKEN=<YOUR_ADMIN_TOKEN>
```

### (Recommended) Use Secret Manager for sensitive envs
```
# DB password
gcloud secrets create db-password --replication-policy=automatic
printf '<STRONG_PASSWORD>' | gcloud secrets versions add db-password --data-file=-
gcloud run services update qcode --region us-central1 --set-secrets DB_PASSWORD=db-password:latest

# Admin token
gcloud secrets create admin-token --replication-policy=automatic
printf '<YOUR_ADMIN_TOKEN>' | gcloud secrets versions add admin-token --data-file=-
gcloud run services update qcode --region us-central1 --set-secrets ADMIN_TOKEN=admin-token:latest
```

## Database Migration
Create and run a Cloud Run Job to apply `scripts/migrate.sql` against the same Cloud SQL instance.
```
gcloud run jobs create qcode-migrate \
  --image us-docker.pkg.dev/code-q-476515/web/qcode:latest \
  --region us-central1 \
  --set-cloudsql-instances "$INSTANCE_CONNECTION_NAME" \
  --set-env-vars INSTANCE_CONNECTION_NAME="$INSTANCE_CONNECTION_NAME",DB_USER=qcode_user,DB_PASSWORD=<STRONG_PASSWORD>,DB_NAME=qcode \
  --command "node" \
  --args "scripts/migrate.js"

gcloud run jobs execute qcode-migrate --region us-central1
```

Alternatively, run locally if you have a direct connection string:
```
DATABASE_URL=postgres://qcode_user:<STRONG_PASSWORD>@<DB_HOST_OR_IP>:5432/qcode npm run db:migrate
```

## Get the Hosted URL
```
gcloud run services describe qcode --region us-central1 --format='value(status.url)'
```

## Local Development
Set a local DB connection and admin token in `.env.local`:
```
DATABASE_URL=postgres://qcode_user:<STRONG_PASSWORD>@127.0.0.1:5432/qcode
ADMIN_TOKEN=local_dev_token
```
Run dev server:
```
npm run dev
```

## Notes
- Filesystem writes are removed from APIs; all project CRUD now uses Postgres.
- `/api/sheets` remains optional; set `GOOGLE_SERVICE_ACCOUNT_KEY` and `GOOGLE_SHEET_ID` if used.
- The Docker image exposes port 8080 and binds 0.0.0.0 for Cloud Run.
