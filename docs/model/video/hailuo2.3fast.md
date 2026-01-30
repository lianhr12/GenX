# Hailuo-2.3-Fast Video Generation

> - Hailuo 2.3 Fast (MiniMax-Hailuo-2.3-Fast) supports I2V (Image-to-Video) mode only
- Fastest generation speed, ultimate physics effects
- Supports 15 camera motion commands like `[Pan left]`, `[Push in]`, `[Static shot]`
- Async processing, use returned task ID to [query status](/en/api-manual/task-management/get-task-detail)
- Generated video links are valid for 24 hours, please save promptly



## OpenAPI

````yaml en/api-manual/video-series/hailuo/hailuo-2-3-fast-video-generate.json post /v1/videos/generations
openapi: 3.1.0
info:
  title: Hailuo 2.3 Fast API
  description: >-
    Create video generation tasks using MiniMax Hailuo 2.3 Fast model, I2V mode
    only
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
      summary: Hailuo 2.3 Fast API
      description: >-
        - Hailuo 2.3 Fast (MiniMax-Hailuo-2.3-Fast) supports I2V
        (Image-to-Video) mode only

        - Fastest generation speed, ultimate physics effects

        - Supports 15 camera motion commands like `[Pan left]`, `[Push in]`,
        `[Static shot]`

        - Async processing, use returned task ID to [query
        status](/en/api-manual/task-management/get-task-detail)

        - Generated video links are valid for 24 hours, please save promptly
      operationId: createVideoGeneration
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/VideoGenerationRequest'
            examples:
              image_to_video:
                summary: Image-to-Video (I2V)
                value:
                  model: MiniMax-Hailuo-2.3-Fast
                  prompt: A cat slowly opens its eyes and looks around [Pan left]
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
        '401':
          description: Unauthorized, invalid or expired token
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '402':
          description: Insufficient quota, recharge required
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
components:
  schemas:
    VideoGenerationRequest:
      type: object
      required:
        - model
        - image_urls
      properties:
        model:
          type: string
          description: Video generation model name
          default: MiniMax-Hailuo-2.3-Fast
          example: MiniMax-Hailuo-2.3-Fast
        prompt:
          type: string
          description: >-
            Prompt describing motion and camera movement, optional. Max 2000
            characters


            **15 Camera Commands:**

            - Truck: `[Truck left]`, `[Truck right]`

            - Pan: `[Pan left]`, `[Pan right]`

            - Dolly: `[Push in]`, `[Pull out]`

            - Pedestal: `[Pedestal up]`, `[Pedestal down]`

            - Tilt: `[Tilt up]`, `[Tilt down]`

            - Zoom: `[Zoom in]`, `[Zoom out]`

            - Special: `[Shake]`

            - Follow: `[Tracking shot]`

            - Static: `[Static shot]`


            **Usage:**

            - Combined: Multiple commands in one `[]` execute simultaneously,
            e.g. `[Pan left,Pedestal up]`, max 3 recommended

            - Sequential: Commands execute in text order, e.g. `...slowly [Push
            in], then quickly [Pull out]`
          example: A cat slowly opens its eyes and looks around [Pan left]
          maxLength: 2000
        image_urls:
          type: array
          description: |-
            Reference image URL for I2V mode, required for Hailuo 2.3 Fast

            **Requirements:**
            - Must provide 1 image
            - Image size: max 20MB
            - Formats: JPG, JPEG, PNG, WebP
            - Aspect ratio: 2:5 to 5:2
            - Short edge > 300px
          items:
            type: string
            format: uri
          minItems: 1
          maxItems: 1
          example:
            - https://example.com/image.jpg
        quality:
          type: string
          description: |-
            Video resolution

            **I2V supported:**
            - 768p (default)
            - 1080p

            **Duration & Resolution:**
            - 768p: 6s, 10s
            - 1080p: 6s only
          enum:
            - 768p
            - 1080p
          default: 768p
          example: 1080p
        duration:
          type: integer
          description: |-
            Video duration (seconds)
            - 6 seconds (default)
            - 10 seconds (not available for 1080p)
          enum:
            - 6
            - 10
          default: 6
          example: 6
        model_params:
          type: object
          description: Model-specific parameters
          properties:
            prompt_optimizer:
              type: boolean
              description: Auto-optimize prompt. Set false for precise control
              default: true
              example: true
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
          example: MiniMax-Hailuo-2.3-Fast
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
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: >-
        ##All APIs require Bearer Token authentication##


        **Get API Key:**


        Visit [API Key Management Page](https://evolink.ai/dashboard/keys) to
        get your API Key


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
