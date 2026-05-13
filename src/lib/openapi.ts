import { IMAGE_MODELS } from "@/services/image-generation/models";
import { SUPPORTED_ASPECT_RATIOS } from "@/services/image-generation/types";

const BASE_URL = "https://getimages.dev";

const modelIds = IMAGE_MODELS.map((model) => model.id);
const thinkingModelIds = IMAGE_MODELS.filter((model) => model.thinking).map((model) => model.id);

const errorResponse = {
  description: "Error response",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/ErrorResponse",
      },
    },
  },
};

const authErrorResponse = {
  description: "Missing, invalid, revoked, or rate-limited API key",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/ErrorResponse",
      },
    },
  },
};

const paginationParameters = [
  {
    name: "limit",
    in: "query",
    description: "Number of items to return. Defaults to 20. Maximum is 100.",
    required: false,
    schema: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      default: 20,
    },
  },
  {
    name: "offset",
    in: "query",
    description: "Number of items to skip. Defaults to 0.",
    required: false,
    schema: {
      type: "integer",
      minimum: 0,
      default: 0,
    },
  },
];

export function getOpenApiDocument() {
  return {
    openapi: "3.1.0",
    info: {
      title: "Get Images REST API",
      version: "1.0.0",
      description:
        "Generate images, list generations, inspect account credit balance, and read credit usage.",
    },
    servers: [
      {
        url: BASE_URL,
      },
    ],
    security: [
      {
        ApiKeyBearer: [],
      },
    ],
    tags: [
      {
        name: "Images",
        description: "Generate and retrieve images.",
      },
      {
        name: "Account",
        description: "Read account and usage information.",
      },
    ],
    paths: {
      "/api/v1/images/generate": {
        post: {
          tags: ["Images"],
          summary: "Generate an image",
          description:
            "Generates an image, charges credits, stores the generation, and returns inline base64 image bytes.",
          operationId: "generateImage",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/GenerateImageRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Generated image",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/GenerateImageResponse",
                  },
                },
              },
            },
            "400": errorResponse,
            "401": authErrorResponse,
            "429": authErrorResponse,
            "500": errorResponse,
          },
        },
      },
      "/api/v1/images": {
        get: {
          tags: ["Images"],
          summary: "List generated images",
          description:
            "Returns paginated metadata for the caller's generated images. Base64 image bytes are not included.",
          operationId: "listImages",
          parameters: paginationParameters,
          responses: {
            "200": {
              description: "Paginated image metadata",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ListImagesResponse",
                  },
                },
              },
            },
            "400": errorResponse,
            "401": authErrorResponse,
            "429": authErrorResponse,
          },
        },
      },
      "/api/v1/images/{id}": {
        get: {
          tags: ["Images"],
          summary: "Get a generated image",
          description:
            "Returns one generated image. By default the response includes inline base64 image bytes. Use format=metadata to omit bytes.",
          operationId: "getImage",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
            {
              name: "format",
              in: "query",
              required: false,
              description: "Pass metadata to omit b64_json from the response.",
              schema: {
                type: "string",
                enum: ["metadata"],
              },
            },
          ],
          responses: {
            "200": {
              description: "Generated image",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { $ref: "#/components/schemas/GetImageResponse" },
                      { $ref: "#/components/schemas/GetImageMetadataResponse" },
                    ],
                  },
                },
              },
            },
            "401": authErrorResponse,
            "404": errorResponse,
            "429": authErrorResponse,
          },
        },
      },
      "/api/v1/account": {
        get: {
          tags: ["Account"],
          summary: "Get account",
          description: "Returns the caller's user ID, email, and current credit balance.",
          operationId: "getAccount",
          responses: {
            "200": {
              description: "Account details",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/AccountResponse",
                  },
                },
              },
            },
            "401": authErrorResponse,
            "404": errorResponse,
            "429": authErrorResponse,
          },
        },
      },
      "/api/v1/usage": {
        get: {
          tags: ["Account"],
          summary: "List credit usage",
          description: "Returns paginated credit transactions for the caller.",
          operationId: "listUsage",
          parameters: paginationParameters,
          responses: {
            "200": {
              description: "Paginated credit transactions",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ListUsageResponse",
                  },
                },
              },
            },
            "400": errorResponse,
            "401": authErrorResponse,
            "429": authErrorResponse,
          },
        },
      },
    },
    components: {
      securitySchemes: {
        ApiKeyBearer: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "API key",
          description:
            "Create an API key in the dashboard and send it as Authorization: Bearer <key>.",
        },
      },
      schemas: {
        GenerateImageRequest: {
          type: "object",
          additionalProperties: false,
          required: ["prompt", "modelId"],
          properties: {
            prompt: {
              type: "string",
              minLength: 1,
              maxLength: 2000,
              description: "Text prompt for the image.",
            },
            modelId: {
              type: "string",
              enum: modelIds,
            },
            aspectRatio: {
              type: "string",
              enum: SUPPORTED_ASPECT_RATIOS,
              default: "1:1",
            },
            style: {
              type: "string",
              description: "Optional style instruction.",
            },
            thinkingLevel: {
              type: "string",
              enum: ["default", "deep"],
              description: `Only supported by: ${thinkingModelIds.join(", ")}.`,
            },
          },
        },
        GenerateImageResponse: {
          type: "object",
          required: ["image", "credits"],
          properties: {
            image: {
              $ref: "#/components/schemas/GeneratedImage",
            },
            credits: {
              $ref: "#/components/schemas/CreditCharge",
            },
          },
        },
        GetImageResponse: {
          type: "object",
          required: ["image"],
          properties: {
            image: {
              $ref: "#/components/schemas/ImageWithBytes",
            },
          },
        },
        GetImageMetadataResponse: {
          type: "object",
          required: ["image"],
          properties: {
            image: {
              $ref: "#/components/schemas/ImageMetadata",
            },
          },
        },
        ListImagesResponse: {
          type: "object",
          required: ["images", "total", "limit", "offset"],
          properties: {
            images: {
              type: "array",
              items: {
                $ref: "#/components/schemas/ImageMetadata",
              },
            },
            total: {
              type: "integer",
              minimum: 0,
            },
            limit: {
              type: "integer",
              minimum: 1,
              maximum: 100,
            },
            offset: {
              type: "integer",
              minimum: 0,
            },
          },
        },
        GeneratedImage: {
          allOf: [
            {
              $ref: "#/components/schemas/ImageMetadata",
            },
            {
              type: "object",
              required: ["b64_json"],
              properties: {
                b64_json: {
                  type: "string",
                  contentEncoding: "base64",
                  description: "Base64-encoded image bytes.",
                },
              },
            },
          ],
        },
        ImageWithBytes: {
          allOf: [
            {
              $ref: "#/components/schemas/ImageMetadata",
            },
            {
              type: "object",
              required: ["b64_json"],
              properties: {
                b64_json: {
                  type: "string",
                  contentEncoding: "base64",
                  description: "Base64-encoded image bytes.",
                },
              },
            },
          ],
        },
        ImageMetadata: {
          type: "object",
          required: [
            "id",
            "prompt",
            "modelId",
            "providerId",
            "aspectRatio",
            "style",
            "thinkingLevel",
            "mediaType",
            "createdAt",
          ],
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            prompt: {
              type: "string",
            },
            modelId: {
              type: "string",
              enum: modelIds,
            },
            providerId: {
              type: "string",
              enum: ["openai", "google"],
            },
            aspectRatio: {
              type: "string",
              enum: SUPPORTED_ASPECT_RATIOS,
            },
            style: {
              type: ["string", "null"],
            },
            thinkingLevel: {
              type: ["string", "null"],
              enum: ["default", "deep", null],
            },
            mediaType: {
              type: "string",
              examples: ["image/png"],
            },
            creditCost: {
              type: ["integer", "null"],
              minimum: 0,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        CreditCharge: {
          type: "object",
          required: ["charged", "remaining"],
          properties: {
            charged: {
              type: "integer",
              minimum: 0,
            },
            remaining: {
              type: "integer",
              minimum: 0,
            },
          },
        },
        AccountResponse: {
          type: "object",
          required: ["userId", "email", "creditBalance"],
          properties: {
            userId: {
              type: "string",
            },
            email: {
              type: "string",
              format: "email",
            },
            creditBalance: {
              type: "integer",
              minimum: 0,
            },
          },
        },
        ListUsageResponse: {
          type: "object",
          required: ["transactions", "total", "limit", "offset"],
          properties: {
            transactions: {
              type: "array",
              items: {
                $ref: "#/components/schemas/CreditTransaction",
              },
            },
            total: {
              type: "integer",
              minimum: 0,
            },
            limit: {
              type: "integer",
              minimum: 1,
              maximum: 100,
            },
            offset: {
              type: "integer",
              minimum: 0,
            },
          },
        },
        CreditTransaction: {
          type: "object",
          required: ["id", "amount", "type", "description", "referenceId", "createdAt"],
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            amount: {
              type: "integer",
            },
            type: {
              type: "string",
              enum: ["addition", "deduction", "refund"],
            },
            description: {
              type: ["string", "null"],
            },
            referenceId: {
              type: ["string", "null"],
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          required: ["error"],
          properties: {
            error: {
              type: "object",
              required: ["message"],
              properties: {
                message: {
                  type: "string",
                },
                details: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["path", "message", "code"],
                    properties: {
                      path: {
                        type: "string",
                      },
                      message: {
                        type: "string",
                      },
                      code: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}
