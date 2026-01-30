# Seedance-1.5-Pro Video Generation

> - Seedance 1.5 Pro (seedance-1.5-pro) model supports multiple generation modes including text-to-video, image-to-video, and first-last-frame
- Asynchronous processing mode, use the returned task ID to [query](/en/api-manual/task-management/get-task-detail)
- Generated video links are valid for 24 hours, please save them promptly



## OpenAPI

````yaml en/api-manual/video-series/seedance1.5/seedance-1.5-pro-video-generate.json post /v1/videos/generations
openapi: 3.1.0
info:
  title: seedance-1.5-pro API
  description: >-
    Create video generation tasks using AI models, supporting text-to-video
    generation mode
  license:
    name: MIT
  version: 1.0.0
servers:
  - url: https://api.evolink.ai
    description: Production environment
security:
  - bearerAuth: []
tags:
  - name: Video Generation
    description: AI video generation related APIs
paths:
  /v1/videos/generations:
    post:
      tags:
        - Video Generation
      summary: seedance-1.5-pro API
      description: >-
        - Seedance 1.5 Pro (seedance-1.5-pro) model supports multiple generation
        modes including text-to-video, image-to-video, and first-last-frame

        - Asynchronous processing mode, use the returned task ID to
        [query](/en/api-manual/task-management/get-task-detail)

        - Generated video links are valid for 24 hours, please save them
        promptly
      operationId: createVideoGeneration
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/VideoGenerationRequest'
            examples:
              text_to_video_basic:
                summary: Text to Video (Basic)
                value:
                  model: seedance-1.5-pro
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
                  message: Invalid prompt parameter
                  type: invalid_request_error
                  param: prompt
                  fallback_suggestion: provide a valid prompt
        '401':
          description: Unauthenticated, invalid or expired token
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
                  fallback_suggestion: seedance-1.5-pro
        '413':
          description: Request body too large
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: 413
                  message: Request body too large
                  type: request_too_large_error
                  fallback_suggestion: reduce prompt length
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
          enum:
            - seedance-1.5-pro
          default: seedance-1.5-pro
          example: seedance-1.5-pro
        prompt:
          type: string
          description: >-
            Prompt describing the video you want to generate, limited to 2000
            tokens
          example: A cat playing piano
          maxLength: 2000
        image_urls:
          type: array
          description: >-
            Reference image URL list for image-to-video functionality


            **Mode Detection:**

            - 0 images = text-to-video

            - 1 image = image-to-video

            - 2 images = first-last-frame


            **Note:**

            - Number of images supported per request: `2` images

            - Image size: Not exceeding `10MB`

            - Supported file formats: `.jpg`, `.jpeg`, `.png`, `.webp`

            - Image URLs must be directly viewable by the server, or the URL
            should trigger a direct download when accessed (typically these URLs
            end with image extensions like `.png`, `.jpg`)
          items:
            type: string
            format: uri
          maxItems: 2
          example:
            - https://example.com/image.jpg
        duration:
          type: integer
          description: >-
            Specifies the duration of the generated video (in seconds), defaults
            to `5` seconds


            **Note:**

            - Supports any integer value between `4` and `12` seconds

            - Billing for a single request is based on the `duration` value;
            longer durations result in higher costs
          minimum: 4
          maximum: 12
        quality:
          type: string
          description: >-
            Video resolution, defaults to `720p`


            **Note:**

            - `480p`: Lower resolution, lower pricing

            - `720p`: Standard definition, standard pricing, this is the default
            value

            - `1080p`: High definition, higher pricing
          enum:
            - 480p
            - 720p
            - 1080p
          example: 720p
        aspect_ratio:
          type: string
          description: >-
            Video aspect ratio


            **Supported values:**

            - `16:9` (landscape), `9:16` (portrait), `1:1` (square), `4:3`,
            `3:4`, `21:9` (ultra-wide), `adaptive`

            - Default value: `16:9`
          example: '16:9'
        generate_audio:
          type: boolean
          description: >-
            Whether to generate audio, enabling will increase cost, defaults to
            `true`


            **Options:**

            - `true`: Model output video includes synchronized audio. Seedance
            1.5 Pro can automatically generate matching voice, sound effects,
            and background music based on text prompts and visual content. It is
            recommended to place dialogue within double quotes to optimize audio
            generation. Example: The man stopped the woman and said: "Remember,
            you must never point at the moon with your finger."

            - `false`: Model output video is silent
          default: true
          example: true
        callback_url:
          type: string
          description: >-
            HTTPS callback URL after task completion


            **Callback timing:**

            - Triggered when task is completed, failed, or cancelled

            - Sent after billing confirmation is completed


            **Security restrictions:**

            - Only HTTPS protocol is supported

            - Callbacks to internal network IP addresses are prohibited
            (127.0.0.1, 10.x.x.x, 172.16-31.x.x, 192.168.x.x, etc.)

            - URL length must not exceed `2048` characters


            **Callback mechanism:**

            - Timeout: `10` seconds

            - Maximum of `3` retries after failure (retries occur after
            `1`/`2`/`4` seconds following failure)

            - Callback response body format is consistent with task query API
            response format

            - Callback URL returning 2xx status code is considered successful;
            other status codes will trigger retries
          format: uri
          example: https://your-domain.com/webhooks/video-task-completed
    VideoGenerationResponse:
      type: object
      properties:
        created:
          type: integer
          description: Task creation timestamp
          example: 1761313744
        id:
          type: string
          description: Task ID
          example: task-unified-1761313744-vux2jw0k
        model:
          type: string
          description: Actual model name used
          example: seedance-1.5-pro
        object:
          type: string
          enum:
            - video.generation.task
          description: Specific type of the task
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
          $ref: '#/components/schemas/VideoTaskInfo'
          description: Video task detailed information
        type:
          type: string
          enum:
            - text
            - image
            - audio
            - video
          description: Output type of the task
          example: video
        usage:
          $ref: '#/components/schemas/VideoUsage'
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
              description: Error description message
              example: Invalid request parameters
            type:
              type: string
              description: Error type
              example: invalid_request_error
            param:
              type: string
              description: Related parameter name
              example: model
            fallback_suggestion:
              type: string
              description: Suggestion when error occurs
              example: seedance-1.5-pro
    VideoTaskInfo:
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
          example: 165
        video_duration:
          type: integer
          description: Video duration (seconds)
          example: 8
    VideoUsage:
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
          description: Estimated credits consumed
          minimum: 0
          example: 8
        user_group:
          type: string
          description: User group category
          example: default
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
    '200':
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
                    example: seedance-1.5-pro
              object:
                allOf:
                  - type: string
                    description: Task type
                    enum:
                      - image.generation.task
                      - video.generation.task
                      - audio.generation.task
                    example: video.generation.task
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
                      - http://example.com/video.mp4
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
                    example: video
            refIdentifier: '#/components/schemas/TaskDetailResponse'
        examples:
          example:
            value:
              created: 1756817821
              id: task-unified-1756817821-4x3rx6ny
              model: seedance-1.5-pro
              object: video.generation.task
              progress: 100
              results:
                - http://example.com/video.mp4
              status: completed
              task_info:
                can_cancel: false
              type: video
        description: Task status details
    '400':
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
            refIdentifier: '#/components/schemas/ErrorResponse'
        examples:
          example:
            value:
              error:
                code: 400
                message: Invalid task ID format
                type: invalid_request_error
                param: task_id
        description: Request parameter error, format error
    '401':
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - *ref_0
            refIdentifier: '#/components/schemas/ErrorResponse'
        examples:
          example:
            value:
              error:
                code: 401
                message: Invalid or expired token
                type: authentication_error
        description: Unauthenticated, token invalid or expired
    '402':
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - *ref_0
            refIdentifier: '#/components/schemas/ErrorResponse'
        examples:
          example:
            value:
              error:
                code: 402
                message: Insufficient quota
                type: insufficient_quota_error
                fallback_suggestion: https://evolink.ai/dashboard/billing
        description: Insufficient quota, recharge required
    '403':
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - *ref_0
            refIdentifier: '#/components/schemas/ErrorResponse'
        examples:
          example:
            value:
              error:
                code: 403
                message: Access denied
                type: permission_error
        description: No permission to access
    '404':
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - *ref_0
            refIdentifier: '#/components/schemas/ErrorResponse'
        examples:
          example:
            value:
              error:
                code: 404
                message: Task not found or expired
                type: not_found_error
                param: task_id
        description: Resource does not exist
    '429':
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - *ref_0
            refIdentifier: '#/components/schemas/ErrorResponse'
        examples:
          example:
            value:
              error:
                code: 429
                message: Rate limit exceeded
                type: rate_limit_error
                fallback_suggestion: retry after 60 seconds
        description: Request rate limit exceeded
    '500':
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - *ref_0
            refIdentifier: '#/components/schemas/ErrorResponse'
        examples:
          example:
            value:
              error:
                code: 500
                message: Internal server error
                type: internal_server_error
                fallback_suggestion: try again later
        description: Internal server error
    '502':
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - *ref_0
            refIdentifier: '#/components/schemas/ErrorResponse'
        examples:
          example:
            value:
              error:
                code: 502
                message: Upstream service error
                type: upstream_error
                fallback_suggestion: try again later
        description: Upstream service error
    '503':
      application/json:
        schemaArray:
          - type: object
            properties:
              error:
                allOf:
                  - *ref_0
            refIdentifier: '#/components/schemas/ErrorResponse'
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
