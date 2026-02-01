# Sora-2 Video Generation

> - Sora 2 Preview (sora-2-preview) supports text-to-video, image-to-video and more
- Async processing, use returned task ID to [query status](/en/api-manual/task-management/get-task-detail)
- Generated video links are valid for 24 hours, please save promptly

**Note:**
- Sora2 has very strict content moderation, tasks may fail due to this
- Real person images are not supported

## Pricing
| MODEL | MODE | DURATION | PRICE (CREDITS) |
| --- | --- | --- | --- |
| Sora 2 | Video Generation | 4s | **23.040 Credits / video** |
| Sora 2 | Video Generation | 8s | **46.080 Credits / video** |
| Sora 2 | Video Generation | 12s | **69.120 Credits / video** |

## OpenAPI

````yaml en/api-manual/video-series/sora2/sora-2-preview-video-generate.json post /v1/videos/generations
openapi: 3.1.0
info:
  title: Sora-2-Preview API
  description: >-
    Create video generation tasks using AI models, supporting text-to-video,
    image-to-video and more
  license:
    name: MIT
  version: 1.0.0
servers:
  - url: https://api.evolink.ai
    description: Production
security:
  - bearerAuth: []
tags:
  - name: Video Generation
    description: AI video generation APIs
paths:
  /v1/videos/generations:
    post:
      tags:
        - Video Generation
      summary: Sora-2-Preview API
      description: >-
        - Sora 2 Preview (sora-2-preview) supports text-to-video, image-to-video
        and more

        - Async processing, use returned task ID to [query
        status](/en/api-manual/task-management/get-task-detail)

        - Generated video links are valid for 24 hours, please save promptly


        **Note:**

        - Sora2 has very strict content moderation, tasks may fail due to this

        - Real person images are not supported
      operationId: createVideoGeneration
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/VideoGenerationRequest'
            examples:
              text_to_video:
                summary: Text-to-Video
                value:
                  model: sora-2-preview
                  prompt: A cat playing piano
      responses:
        '200':
          description: Video generation task created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/VideoGenerationResponse'
        '400':
          description: Invalid request parameters
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: 400
                  message: Invalid duration parameter
                  type: invalid_request_error
                  param: duration
                  fallback_suggestion: use duration between 1-12 seconds
        '401':
          description: Unauthorized, invalid or expired token
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: 401
                  message: Invalid or expired token
                  type: authentication_error
        '402':
          description: Insufficient quota, recharge required
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: 402
                  message: Insufficient quota
                  type: insufficient_quota_error
                  fallback_suggestion: https://evolink.ai/dashboard/billing
        '403':
          description: Access denied
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: 403
                  message: Access denied for this model
                  type: permission_error
                  param: model
        '404':
          description: Resource not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: 404
                  message: Specified model not found
                  type: not_found_error
                  param: model
                  fallback_suggestion: sora-2-preview
        '413':
          description: Request body too large
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: 413
                  message: Image file too large
                  type: request_too_large_error
                  param: image_urls
                  fallback_suggestion: compress image to under 4MB
        '429':
          description: Rate limit exceeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: 429
                  message: Rate limit exceeded
                  type: rate_limit_error
                  fallback_suggestion: retry after 60 seconds
        '500':
          description: Internal server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: 500
                  message: Internal server error
                  type: internal_server_error
                  fallback_suggestion: try again later
        '502':
          description: Upstream service error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: 502
                  message: Upstream AI service unavailable
                  type: upstream_error
                  fallback_suggestion: try different model
        '503':
          description: Service temporarily unavailable
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: 503
                  message: Service temporarily unavailable
                  type: service_unavailable_error
                  fallback_suggestion: retry after 30 seconds
components:
  schemas:
    VideoGenerationRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: Video generation model name
          default: sora-2-preview
          example: sora-2-preview
        prompt:
          type: string
          description: Prompt describing the video to generate, max 5000 tokens
          example: A cat playing piano
          maxLength: 5000
        aspect_ratio:
          type: string
          description: >-
            Video aspect ratio. `1280x720` generates landscape video, `720x1280`
            generates portrait video
          enum:
            - 1280x720
            - 720x1280
            - '16:9'
            - '9:16'
          example: '16:9'
        duration:
          type: integer
          description: |-
            Video duration (seconds), default `4`

            **Note:**
            - Only supports `4`, `8`, `12` seconds
            - Longer duration costs more
          example: 4
        image_urls:
          type: array
          description: >-
            Reference image URLs for image-to-video


            **Note:**

            - Real person images not supported

            - Max 1 image per request

            - Max size: 10MB

            - Formats: .jpg, .jpeg, .png, .webp

            - **Image pixel dimensions must exactly match the selected
            aspect_ratio** (e.g., if aspect_ratio is `1280x720`, the uploaded
            image must be exactly 1280x720 pixels)

            - Image URL must be directly accessible by server, or trigger
            download when accessed (typically URLs ending with image extensions
            like .png, .jpg)
          items:
            type: string
            format: uri
          maxItems: 1
          example:
            - http://example.com/image1.jpg
        callback_url:
          type: string
          description: >-
            HTTPS callback URL for task completion


            **Callback Timing:**

            - Triggered when task is completed, failed, or cancelled

            - Sent after billing confirmation


            **Security Restrictions:**

            - HTTPS protocol only

            - Private IP addresses not allowed (127.0.0.1, 10.x.x.x,
            172.16-31.x.x, 192.168.x.x, etc.)

            - URL length max 2048 characters


            **Callback Mechanism:**

            - Timeout: 10 seconds

            - Max 3 retries on failure (at 1s/2s/4s intervals)

            - Response format matches task query API

            - 2xx status code = success, other codes trigger retry
          format: uri
          example: https://your-domain.com/webhooks/video-task-completed
    VideoGenerationResponse:
      type: object
      properties:
        created:
          type: integer
          description: Task creation timestamp
          example: 1757169743
        id:
          type: string
          description: Task ID
          example: task-unified-1757169743-7cvnl5zw
        model:
          type: string
          description: Model name used
          example: sora-2-preview
        object:
          type: string
          enum:
            - video.generation.task
          description: Task type
        progress:
          type: integer
          description: Task progress (0-100)
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
          $ref: '#/components/schemas/VideoTaskInfo'
        type:
          type: string
          enum:
            - text
            - image
            - audio
            - video
          description: Output type
          example: video
        usage:
          $ref: '#/components/schemas/VideoUsage'
    ErrorResponse:
      type: object
      properties:
        error:
          type: object
          properties:
            code:
              type: integer
              description: HTTP error code
            message:
              type: string
              description: Error description
            type:
              type: string
              description: Error type
            param:
              type: string
              description: Related parameter
            fallback_suggestion:
              type: string
              description: Suggested solution
    VideoTaskInfo:
      type: object
      properties:
        can_cancel:
          type: boolean
          description: Whether task can be cancelled
          example: true
        estimated_time:
          type: integer
          description: Estimated completion time (seconds)
          minimum: 0
          example: 300
        video_duration:
          type: integer
          description: Video duration (seconds)
          example: 9
    VideoUsage:
      type: object
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
          description: Estimated credits
          minimum: 0
          example: 7
        user_group:
          type: string
          description: User group category
          example: default
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: >-
        ## All APIs require Bearer Token authentication


        **Get API Key:**


        Visit [API Key Management](https://evolink.ai/dashboard/keys) to get
        your API Key


        **Add to request header:**

        ```

        Authorization: Bearer YOUR_API_KEY

        ```

````








# Query Task Status

> Query the status, progress, and result information of asynchronous tasks by task ID



## OpenAPI

````yaml en/api-manual/task-management/get-task-detail.json get /v1/tasks/{task_id}
openapi: 3.1.0
info:
  title: Get Task Details API
  description: >-
    Query the status, progress, and result information of asynchronous tasks by
    task ID
  license:
    name: MIT
  version: 1.0.0
servers:
  - url: https://api.evolink.ai
    description: Production environment
security:
  - bearerAuth: []
tags:
  - name: Task Management
    description: Asynchronous task management related APIs
paths:
  /v1/tasks/{task_id}:
    get:
      tags:
        - Task Management
      summary: Query Task Status
      description: >-
        Query the status, progress, and result information of asynchronous tasks
        by task ID
      operationId: getTaskDetail
      parameters:
        - name: task_id
          in: path
          required: true
          schema:
            type: string
          description: >-
            Task ID, ignore {} when querying, append the id from the async task
            response body at the end of the path
          example: task-unified-1756817821-4x3rx6ny
      responses:
        '200':
          description: Task status details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TaskDetailResponse'
        '400':
          description: Request parameter error, format error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: 400
                  message: Invalid task ID format
                  type: invalid_request_error
                  param: task_id
        '401':
          description: Unauthenticated, token invalid or expired
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: 401
                  message: Invalid or expired token
                  type: authentication_error
        '402':
          description: Insufficient quota, recharge required
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: 402
                  message: Insufficient quota
                  type: insufficient_quota_error
                  fallback_suggestion: https://evolink.ai/dashboard/billing
        '403':
          description: No permission to access
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: 403
                  message: Access denied
                  type: permission_error
        '404':
          description: Resource does not exist
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: 404
                  message: Task not found or expired
                  type: not_found_error
                  param: task_id
        '429':
          description: Request rate limit exceeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: 429
                  message: Rate limit exceeded
                  type: rate_limit_error
                  fallback_suggestion: retry after 60 seconds
        '500':
          description: Internal server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: 500
                  message: Internal server error
                  type: internal_server_error
                  fallback_suggestion: try again later
        '502':
          description: Upstream service error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: 502
                  message: Upstream service error
                  type: upstream_error
                  fallback_suggestion: try again later
        '503':
          description: Service temporarily unavailable
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: 503
                  message: Service temporarily unavailable
                  type: service_unavailable_error
                  fallback_suggestion: retry after 30 seconds
components:
  schemas:
    TaskDetailResponse:
      type: object
      properties:
        created:
          type: integer
          description: Task creation timestamp
          example: 1756817821
        id:
          type: string
          description: Task ID
          example: task-unified-1756817821-4x3rx6ny
        model:
          type: string
          description: Model used
          example: gpt-4o-image
        object:
          type: string
          description: Task type
          enum:
            - image.generation.task
            - video.generation.task
            - audio.generation.task
          example: image.generation.task
        progress:
          type: integer
          minimum: 0
          maximum: 100
          description: Task progress percentage
          example: 100
        results:
          type: array
          items:
            type: string
            format: uri
          description: Task result list (provided when completed)
          example:
            - http://example.com/image.jpg
        status:
          type: string
          description: Task status
          enum:
            - pending
            - processing
            - completed
            - failed
          example: completed
        task_info:
          type: object
          description: Task detailed information
          properties:
            can_cancel:
              type: boolean
              description: Whether the task can be cancelled
              example: false
        type:
          type: string
          description: Task type
          enum:
            - image
            - video
            - audio
            - text
          example: image
    ErrorResponse:
      type: object
      properties:
        error:
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
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: >-
        ##All APIs require Bearer Token authentication##


        **Get API Key:**


        Visit [API Key Management Page](https://evolink.ai/dashboard/keys) to
        get your API Key


        **Add to request header when using:**

        ```

        Authorization: Bearer YOUR_API_KEY

        ```

````

