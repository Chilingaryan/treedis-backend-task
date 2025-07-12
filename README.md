# Media Upload Service

Simple Node.js backend (without Express) for uploading files to S3 asynchronously via Redis queue.

---

## 🚀 What’s Done

- Uploads go to a temp file and are queued to Redis
- Worker picks up the job and streams to S3
- WebSocket notifications for success/failure
- AWS S3 support + MinIO for local dev
- Real-time upload progress (uploadId-based room)
- Admin queue UI via bull-board at `/admin/queues`

---

## ▶️ How to Run

First, copy one of the `.env` templates and set the correct AWS/MinIO credentials.

```bash
cp .env.local .env.dev   # for local dev
cp .env.local .env.prod  # for prod
```

Then:

### For Dev (with MinIO)

```bash
npm run docker:dev
```

### For Prod (with real S3)

```bash
npm run docker:prod
```

---

## 🧪 File Upload Flow

1. `POST /media` — Accepts form-data file upload
2. Saves file to `/tmp/uploads`
3. Enqueues to Redis (`upload` queue)
4. Worker picks it up and streams to S3
5. Emits `upload:success` or `upload:failed` over socket.io (`uploadId` room)

---

## 🔧 Requirements

- Node.js `^20.18.1`
- Docker + Docker Compose
- AWS S3 credentials (or use MinIO for local)

---

## 📁 Environment Setup

You’ll need `.env.dev` and `.env.prod`. Example:

```env
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-north-1
AWS_S3_BUCKET=your-bucket-name
```

Add `MINIO_ENDPOINT=http://minio:9000` if using MinIO locally.

---

## 🤷‍♂️ What’s Missing / Could Be Better

- I had no time for improving the router — not flexible
- No global request timeout middleware
- Folder structure still evolving (especially `core/` and `config/`)

---

## 📎 Notes

- Admin queue UI: [http://localhost:8000/admin/queues](http://localhost:8000/admin/queues) (since the router is not perfect - I also don't have a guard on this api)
- File responses streamed directly from S3
- Logging is done via a custom `Logger` service
