# Get Images REST API

The REST API lets scripts, CLI tools, agents, and third-party apps generate images and read account usage over HTTPS.

Base URL:

```text
https://getimages.dev
```

Use this URL for production API calls.

## Authentication

Create an API key in the dashboard:

1. Sign in to Get Images.
2. Open **Dashboard > API keys**.
3. Create a key and save the full secret when it is shown. The secret is only shown once.

Send the key as a Bearer token on every request:

```bash
curl https://getimages.dev/api/v1/account \
  -H "Authorization: Bearer $GET_IMAGES_API_KEY"
```

API keys are rate limited to 60 requests per minute by default. When the limit is exceeded, the API returns `429` and may include a `Retry-After` response header.

## Generate An Image

`POST /api/v1/images/generate`

Request body:

```json
{
  "prompt": "A warm editorial product photo of a ceramic coffee cup on a studio desk",
  "modelId": "google:gemini-2.5-flash-image",
  "aspectRatio": "1:1"
}
```

Example:

```bash
curl https://getimages.dev/api/v1/images/generate \
  -X POST \
  -H "Authorization: Bearer $GET_IMAGES_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A warm editorial product photo of a ceramic coffee cup on a studio desk",
    "modelId": "google:gemini-2.5-flash-image",
    "aspectRatio": "1:1"
  }'
```

Response:

```json
{
  "image": {
    "id": "0c7f0b4a-2c7b-43b6-9b65-6d4e4d0c4b8b",
    "prompt": "A warm editorial product photo of a ceramic coffee cup on a studio desk",
    "modelId": "google:gemini-2.5-flash-image",
    "providerId": "google",
    "aspectRatio": "1:1",
    "style": null,
    "thinkingLevel": null,
    "mediaType": "image/png",
    "b64_json": "iVBORw0KGgoAAA...",
    "createdAt": "2026-05-13T10:30:00.000Z"
  },
  "credits": {
    "charged": 3,
    "remaining": 97
  }
}
```

The image bytes are returned inline as base64 in `image.b64_json`.

## Request Fields

`prompt` is required and must be between 1 and 2,000 characters.

`modelId` is required. Supported values:

- `openai:gpt-image-1.5`
- `openai:gpt-image-2`
- `google:gemini-2.5-flash-image`
- `google:gemini-3.1-flash-image-preview`
- `google:gemini-3-pro-image-preview`

`aspectRatio` is optional. Supported values:

- `1:1`
- `3:2`
- `2:3`
- `16:9`
- `9:16`
- `4:3`
- `3:4`
- `21:9`

`style` is optional and can be any short style instruction.

`thinkingLevel` is optional and can be `default` or `deep`. Only the Gemini 3.1 Flash Image and Gemini 3 Pro Image models support thinking controls.

## List Images

`GET /api/v1/images`

Returns metadata for previous generations. Image bytes are not included in list responses.

```bash
curl "https://getimages.dev/api/v1/images?limit=20&offset=0" \
  -H "Authorization: Bearer $GET_IMAGES_API_KEY"
```

Response:

```json
{
  "images": [
    {
      "id": "0c7f0b4a-2c7b-43b6-9b65-6d4e4d0c4b8b",
      "prompt": "A warm editorial product photo of a ceramic coffee cup on a studio desk",
      "modelId": "google:gemini-2.5-flash-image",
      "providerId": "google",
      "aspectRatio": "1:1",
      "style": null,
      "thinkingLevel": null,
      "mediaType": "image/png",
      "creditCost": 3,
      "createdAt": "2026-05-13T10:30:00.000Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

Pagination uses `limit` and `offset`. The default limit is 20 and the maximum is 100.

## Get One Image

`GET /api/v1/images/{id}`

Returns metadata plus inline base64 image bytes.

```bash
curl https://getimages.dev/api/v1/images/0c7f0b4a-2c7b-43b6-9b65-6d4e4d0c4b8b \
  -H "Authorization: Bearer $GET_IMAGES_API_KEY"
```

To fetch metadata only:

```bash
curl "https://getimages.dev/api/v1/images/0c7f0b4a-2c7b-43b6-9b65-6d4e4d0c4b8b?format=metadata" \
  -H "Authorization: Bearer $GET_IMAGES_API_KEY"
```

## Account

`GET /api/v1/account`

```bash
curl https://getimages.dev/api/v1/account \
  -H "Authorization: Bearer $GET_IMAGES_API_KEY"
```

Response:

```json
{
  "userId": "user_abc123",
  "email": "person@example.com",
  "creditBalance": 97
}
```

## Usage

`GET /api/v1/usage`

```bash
curl "https://getimages.dev/api/v1/usage?limit=20&offset=0" \
  -H "Authorization: Bearer $GET_IMAGES_API_KEY"
```

Response:

```json
{
  "transactions": [
    {
      "id": "0f1c89a4-2843-47e2-8b69-6de51b777c07",
      "amount": -3,
      "type": "deduction",
      "description": "Generated image",
      "referenceId": "0c7f0b4a-2c7b-43b6-9b65-6d4e4d0c4b8b",
      "createdAt": "2026-05-13T10:30:00.000Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

## Errors

Errors use a consistent JSON shape:

```json
{
  "error": {
    "message": "Invalid request body.",
    "details": [
      {
        "path": "prompt",
        "message": "Too small: expected string to have >=1 characters",
        "code": "too_small"
      }
    ]
  }
}
```

Common status codes:

- `400` - invalid JSON, request body, pagination, model, or image option.
- `401` - missing, invalid, or revoked API key.
- `404` - account or image was not found.
- `429` - API key rate limit exceeded.
- `500` - image generation failed unexpectedly.

## Machine-Readable Schema

The OpenAPI schema is available at:

```text
/openapi.json
```

Use it with tools such as Scalar, Redoc, Swagger UI, OpenAPI Generator, or `openapi-typescript` to render API references and generate typed clients.
