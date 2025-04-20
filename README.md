# Media Management API

This project provides a minimal Node.js server (no Express) for uploading, retrieving, replacing, and deleting media files using AWS S3.

---

## ⚙️ Setup Instructions

1. **Install dependencies**

```bash
npm install
```

2. **Create `.env`**

```env
AWS_ACCESS_KEY_ID=aws_access_key
AWS_SECRET_ACCESS_KEY=aws_secret_key
AWS_REGION=aws_region
AWS_S3_BUCKET=aws_bucket_name
```

3. **Start the server**

```bash
npm start
```

---

## API Usage

### `POST /media`

Upload a file.

- Form-data key: `file`
- Returns:

```json
{ "message": "Uploaded!", "fileName": "uuid.ext" }
```

---

### `GET /media?file=uuid.ext`

Stream a file from S3.

---

### `PUT /media?file=uuid.ext`

Replace a file with a new one.

- Form-data key: `file`
- Returns:

```json
{ "message": "Replaced!", "fileName": "uuid.ext" }
```

---

### `DELETE /media?file=uuid.ext`

Deletes a file from S3.

---

### `GET /media/metadata?file=uuid.ext`

Returns metadata of a file (Content-Type, Size, etc.).

---

## ✅ Features

- UUID-based file naming
- Streamed upload/download (handles large files)
- Custom NestJS-like routing mechanism
- Business logic isolation and future scalability
- Simple logger
