# GPT Image 1.5 Image Generation

> - GPT Image 1.5 (gpt-image-1.5) model supports text-to-image, image-to-image, and image editing modes

- Asynchronous processing mode, use the returned task ID to [query status](/en/api-manual/task-management/get-task-detail)
- Generated image links are valid for 24 hours, please save them promptly

## Pricing

| MODEL         | MODE             | QUALITY | SIZE                 | PRICE (CREDITS)        |
| ------------- | ---------------- | ------- | -------------------- | ---------------------- |
| GPT Image 1.5 | Image Generation | Low     | 1024×1024            | 0.509 Credits / image  |
| GPT Image 1.5 | Image Generation | Low     | 1024×1536, 1536×1024 | 0.749 Credits / image  |
| GPT Image 1.5 | Image Generation | Medium  | 1024×1024            | 1.958 Credits / image  |
| GPT Image 1.5 | Image Generation | Medium  | 1024×1536, 1536×1024 | 2.879 Credits / image  |
| GPT Image 1.5 | Image Generation | High    | 1024×1024            | 7.657 Credits / image  |
| GPT Image 1.5 | Image Generation | High    | 1024×1536, 1536×1024 | 11.256 Credits / image |

## OpenAPI

````yaml en/api-manual/image-series/gpt-image-1.5/gpt-image-1.5-image-generation.json post /v1/images/generations
openapi: 3.1.0
info:
  title: gpt-image-1.5 API
  description: >-
    Create image tasks using AI models with support for multiple models and
    parameter configurations
  license:
    name: MIT
  version: 1.0.0
servers:
  - url: https://api.evolink.ai
    description: Production
security:
  - bearerAuth: []
tags:
  - name: Image Generation
    description: AI image generation APIs
paths:
  /v1/images/generations:
    post:
      tags:
        - Image Generation
      summary: gpt-image-1.5-lite API
      description: >-
        - GPT Image 1.5 (gpt-image-1.5) model supports text-to-image,
        image-to-image, and image editing modes

        - Asynchronous processing mode, use the returned task ID to [query
        status](/en/api-manual/task-management/get-task-detail)

        - Generated image links are valid for 24 hours, please save them
        promptly
      operationId: createImageGeneration
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ImageGenerationRequest"
            examples:
              text_to_image:
                summary: Text to Image
                value:
                  model: gpt-image-1.5
                  prompt: A beautiful colorful sunset over the ocean
      responses:
        "200":
          description: Image task created successfully
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ImageGenerationResponse"
        "400":
          description: Invalid request parameters
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
              example:
                error:
                  code: 400
                  message: Invalid request parameters
                  type: invalid_request_error
        "401":
          description: Unauthenticated, invalid or expired token
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
              example:
                error:
                  code: 401
                  message: Invalid or expired token
                  type: authentication_error
        "402":
          description: Insufficient quota, payment required
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
              example:
                error:
                  code: 402
                  message: Insufficient quota
                  type: insufficient_quota_error
                  fallback_suggestion: https://evolink.ai/dashboard/billing
        "403":
          description: Access denied
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
              example:
                error:
                  code: 403
                  message: Access denied for this model
                  type: permission_error
                  param: model
        "404":
          description: Resource not found
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
              example:
                error:
                  code: 404
                  message: Specified model not found
                  type: not_found_error
                  param: model
                  fallback_suggestion: gpt-image-1.5
        "413":
          description: Request body too large
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
              example:
                error:
                  code: 413
                  message: Image file too large
                  type: request_too_large_error
                  param: image_urls
                  fallback_suggestion: compress image to under 4MB
        "429":
          description: Rate limit exceeded
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
              example:
                error:
                  code: 429
                  message: Rate limit exceeded
                  type: rate_limit_error
                  fallback_suggestion: retry after 60 seconds
        "500":
          description: Internal server error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
              example:
                error:
                  code: 500
                  message: Internal server error
                  type: internal_server_error
                  fallback_suggestion: try again later
        "502":
          description: Upstream service error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
              example:
                error:
                  code: 502
                  message: Upstream AI service unavailable
                  type: upstream_error
                  fallback_suggestion: try different model
        "503":
          description: Service temporarily unavailable
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
              example:
                error:
                  code: 503
                  message: Service temporarily unavailable
                  type: service_unavailable_error
                  fallback_suggestion: retry after 30 seconds
components:
  schemas:
    ImageGenerationRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: Image generation model name
          enum:
            - gpt-image-1.5
          default: gpt-image-1.5
          example: gpt-image-1.5
        prompt:
          type: string
          description: >-
            Prompt describing the image you want to generate, or describing how
            to edit the input image. Limited to 2000 tokens
          example: A beautiful colorful sunset over the ocean
          maxLength: 2000
        size:
          type: string
          description: |-
            Size of the generated image, supports two formats:

            **Aspect Ratio Format:**
            - `1:1`: Square
            - `2:3`: Portrait
            - `3:2`: Landscape

            **Pixel Format:**
            - `1024x1024`: Square
            - `1024x1536`: Portrait
            - `1536x1024`: Landscape
          enum:
            - "1:1"
            - "2:3"
            - "3:2"
            - 1024x1024
            - 1024x1536
            - 1536x1024
          example: 1024x1024
        quality:
          type: string
          description: |-
            Quality of the generated image

            **Supported quality levels:**
            - `low`: Low quality, faster generation
            - `medium`: Medium quality
            - `high`: High quality, slower generation
            - `auto`: Automatic selection (default)
          enum:
            - low
            - medium
            - high
            - auto
          default: auto
          example: auto
        image_urls:
          type: array
          description: >-
            Reference image URL list for image-to-image and image editing
            features


            **Notes:**

            - Supports `1~16` images per request

            - Maximum size per image: `50MB`

            - Supported formats: `.jpeg`, `.jpg`, `.png`, `.webp`

            - Image URLs must be directly accessible by the server, or URLs that
            trigger direct download (typically URLs ending with image extensions
            like `.png`, `.jpg`)
          items:
            type: string
            format: uri
          example:
            - https://example.com/image1.png
            - https://example.com/image2.png
        "n":
          type: integer
          description: Number of images to generate, currently only supports `1`
          enum:
            - 1
          default: 1
          example: 1
    ImageGenerationResponse:
      type: object
      properties:
        created:
          type: integer
          description: Task creation timestamp
          example: 1757156493
        id:
          type: string
          description: Task ID
          example: task-unified-1757156493-imcg5zqt
        model:
          type: string
          description: Actual model name used
          example: gpt-image-1.5
        object:
          type: string
          enum:
            - image.generation.task
          description: Task object type
        progress:
          type: integer
          description: Task progress percentage (0-100)
          minimum: 0
          maximum: 100
          example: 0
        status:
          type: string
          description: Task status
          enum:
            - pending
            - processing
            - completed
            - failed
          example: pending
        task_info:
          $ref: "#/components/schemas/TaskInfo"
          description: Async task information
        type:
          type: string
          enum:
            - text
            - image
            - audio
            - video
          description: Task output type
          example: image
        usage:
          $ref: "#/components/schemas/Usage"
          description: Usage and billing information
    ErrorResponse:
      type: object
      properties:
        error:
          type: object
          properties:
            code:
              type: integer
              description: HTTP status error code
            message:
              type: string
              description: Error description
            type:
              type: string
              description: Error type
            param:
              type: string
              description: Related parameter name
            fallback_suggestion:
              type: string
              description: Suggestion for error resolution
    TaskInfo:
      type: object
      properties:
        can_cancel:
          type: boolean
          description: Whether the task can be cancelled
          example: true
        estimated_time:
          type: integer
          description: Estimated completion time (seconds)
          minimum: 0
          example: 100
    Usage:
      type: object
      description: Usage and billing information
      properties:
        billing_rule:
          type: string
          description: Billing rule
          enum:
            - per_call
            - per_token
            - per_second
          example: per_call
        credits_reserved:
          type: number
          description: Estimated credits consumption
          minimum: 0
          example: 2.5
        user_group:
          type: string
          description: User group category
          example: default
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: >-
        ## All APIs require Bearer Token authentication ##


        **Get API Key:**


        Visit the [API Key Management Page](https://evolink.ai/dashboard/keys)
        to get your API Key


        **Add to request header:**

        ```

        Authorization: Bearer YOUR_API_KEY

        ```
````

# Query Task Status

> Query the status, progress, and result information of asynchronous tasks by task ID

## OpenAPI

````yaml en/api-manual/task-management/get-task-detail.json get /v1/tasks/{task_id}
paths:
  path: /v1/tasks/{task_id}
  method: get
  servers:
    - url: https://api.evolink.ai
      description: Production environment
  request:
    security:
      - title: bearerAuth
        parameters:
          query: {}
          header:
            Authorization:
              type: http
              scheme: bearer
              description: >-
                ##All APIs require Bearer Token authentication##


                **Get API Key:**


                Visit [API Key Management
                Page](https://evolink.ai/dashboard/keys) to get your API Key


                **Add to request header when using:**

                ```

                Authorization: Bearer YOUR_API_KEY

                ```
          cookie: {}
    parameters:
      path:
        task_id:
          schema:
            - type: string
              required: true
              description: >-
                Task ID, ignore {} when querying, append the id from the async
                task response body at the end of the path
      query: {}
      header: {}
      cookie: {}
    body: {}
  response:
    "200":
      application/json:
        schemaArray:
          - type: object
            properties:
              created:
                allOf:
                  - type: integer
                    description: Task creation timestamp
                    example: 1756817821
              id:
                allOf:
                  - type: string
                    description: Task ID
                    example: task-unified-1756817821-4x3rx6ny
              model:
                allOf:
                  - type: string
                    description: Model used
                    example: gpt-4o-image
              object:
                allOf:
                  - type: string
                    description: Task type
                    enum:
                      - image.generation.task
                      - video.generation.task
                      - audio.generation.task
                    example: image.generation.task
              progress:
                allOf:
                  - type: integer
                    minimum: 0
                    maximum: 100
                    description: Task progress percentage
                    example: 100
              results:
                allOf:
                  - type: array
                    items:
                      type: string
                      format: uri
                    description: Task result list (provided when completed)
                    example:
                      - http://example.com/image.jpg
              status:
                allOf:
                  - type: string
                    description: Task status
                    enum:
                      - pending
                      - processing
                      - completed
                      - failed
                    example: completed
              task_info:
                allOf:
                  - type: object
                    description: Task detailed information
                    properties:
                      can_cancel:
                        type: boolean
                        description: Whether the task can be cancelled
                        example: false
              type:
                allOf:
                  - type: string
                    description: Task type
                    enum:
                      - image
                      - video
                      - audio
                      - text
                    example: image
            refIdentifier: "#/components/schemas/TaskDetailResponse"
        examples:
          example:
            value:
              created: 1756817821
              id: task-unified-1756817821-4x3rx6ny
              model: gpt-4o-image
              object: image.generation.task
              progress: 100
              results:
                - http://example.com/image.jpg
              status: completed
              task_info:
                can_cancel: false
              type: image
        description: Task status details
    "400":
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - &ref_0
                    type: object
                    properties:
                      code:
                        type: integer
                        description: HTTP status error code
                        example: 404
                      message:
                        type: string
                        description: Error description message
                        example: Task does not exist
                      type:
                        type: string
                        description: Error type
                        example: not_found_error
                      param:
                        type: string
                        description: Related parameter name
                        example: task_id
            refIdentifier: "#/components/schemas/ErrorResponse"
        examples:
          example:
            value:
              error:
                code: 400
                message: Invalid task ID format
                type: invalid_request_error
                param: task_id
        description: Request parameter error, format error
    "401":
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - *ref_0
            refIdentifier: "#/components/schemas/ErrorResponse"
        examples:
          example:
            value:
              error:
                code: 401
                message: Invalid or expired token
                type: authentication_error
        description: Unauthenticated, token invalid or expired
    "402":
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - *ref_0
            refIdentifier: "#/components/schemas/ErrorResponse"
        examples:
          example:
            value:
              error:
                code: 402
                message: Insufficient quota
                type: insufficient_quota_error
                fallback_suggestion: https://evolink.ai/dashboard/billing
        description: Insufficient quota, recharge required
    "403":
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - *ref_0
            refIdentifier: "#/components/schemas/ErrorResponse"
        examples:
          example:
            value:
              error:
                code: 403
                message: Access denied
                type: permission_error
        description: No permission to access
    "404":
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - *ref_0
            refIdentifier: "#/components/schemas/ErrorResponse"
        examples:
          example:
            value:
              error:
                code: 404
                message: Task not found or expired
                type: not_found_error
                param: task_id
        description: Resource does not exist
    "429":
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - *ref_0
            refIdentifier: "#/components/schemas/ErrorResponse"
        examples:
          example:
            value:
              error:
                code: 429
                message: Rate limit exceeded
                type: rate_limit_error
                fallback_suggestion: retry after 60 seconds
        description: Request rate limit exceeded
    "500":
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - *ref_0
            refIdentifier: "#/components/schemas/ErrorResponse"
        examples:
          example:
            value:
              error:
                code: 500
                message: Internal server error
                type: internal_server_error
                fallback_suggestion: try again later
        description: Internal server error
    "502":
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - *ref_0
            refIdentifier: "#/components/schemas/ErrorResponse"
        examples:
          example:
            value:
              error:
                code: 502
                message: Upstream service error
                type: upstream_error
                fallback_suggestion: try again later
        description: Upstream service error
    "503":
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - *ref_0
            refIdentifier: "#/components/schemas/ErrorResponse"
        examples:
          example:
            value:
              error:
                code: 503
                message: Service temporarily unavailable
                type: service_unavailable_error
                fallback_suggestion: retry after 30 seconds
        description: Service temporarily unavailable
  deprecated: false
  type: path
components:
  schemas: {}
````
