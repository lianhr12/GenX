# OmniHuman-1.5 Digital Human Video Generation

> - OmniHuman-1.5 (omnihuman-1.5) model generates digital human videos driven by audio
- Asynchronous processing mode, use the returned task ID to [query](/en/api-manual/task-management/get-task-detail)
- Generated video links are valid for 24 hours, please save them promptly

**Note:**
- Audio duration limit: maximum 35 seconds
- Supported audio formats: MP3, WAV
- Billing is based on audio duration (rounded up to the nearest second)



## OpenAPI

````yaml en/api-manual/video-series/omnihuman/omnihuman-1.5-video-generate.json post /v1/videos/generations
openapi: 3.1.0
info:
  title: OmniHuman-1.5 Digital Human Video Generation API
  description: >-
    Create audio-driven digital human video generation tasks using OmniHuman-1.5
    model
  license:
    name: MIT
  version: 1.0.0
servers:
  - url: https://api.evolink.ai
    description: Production environment
security:
  - bearerAuth: []
tags:
  - name: Digital Human Video Generation
    description: OmniHuman-1.5 digital human video generation APIs
paths:
  /v1/videos/generations:
    post:
      tags:
        - Digital Human Video Generation
      summary: OmniHuman-1.5 Digital Human Video Generation
      description: >-
        - OmniHuman-1.5 (omnihuman-1.5) model generates digital human videos
        driven by audio

        - Asynchronous processing mode, use the returned task ID to
        [query](/en/api-manual/task-management/get-task-detail)

        - Generated video links are valid for 24 hours, please save them
        promptly


        **Note:**

        - Audio duration limit: maximum 35 seconds

        - Supported audio formats: MP3, WAV

        - Billing is based on audio duration (rounded up to the nearest second)
      operationId: createOmniHumanVideoGeneration
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OmniHumanVideoGenerationRequest'
            examples:
              basic_generation:
                summary: Basic Digital Human Generation
                value:
                  model: omnihuman-1.5
                  audio_url: https://example.com/audio.mp3
                  image_urls:
                    - https://example.com/person.jpg
      responses:
        '200':
          description: Digital human video generation task created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OmniHumanVideoGenerationResponse'
        '400':
          description: Invalid request parameters
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              examples:
                invalid_audio:
                  summary: Invalid audio format
                  value:
                    error:
                      code: 400
                      message: Invalid audio format or duration exceeds 35 seconds
                      type: invalid_request_error
                      param: audio_url
                      fallback_suggestion: use MP3 or WAV format, max 35 seconds
                no_subject:
                  summary: No human subject detected
                  value:
                    error:
                      code: 400
                      message: No human subject detected in image
                      type: invalid_request_error
                      param: image_urls
                      fallback_suggestion: provide an image with a clear human figure
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
                  fallback_suggestion: omnihuman-1.5
        '413':
          description: Request entity too large
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: 413
                  message: Image or audio file too large
                  type: request_too_large_error
                  param: image_urls
                  fallback_suggestion: compress file to under 10MB
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
    OmniHumanVideoGenerationRequest:
      type: object
      required:
        - model
        - audio_url
        - image_urls
      properties:
        model:
          type: string
          description: Digital human video generation model name
          enum:
            - omnihuman-1.5
          default: omnihuman-1.5
          example: omnihuman-1.5
        audio_url:
          type: string
          format: uri
          description: >-
            Audio URL for driving lip-sync and body movements


            **Note:**

            - Maximum audio duration: `35` seconds

            - Supported formats: `.mp3`, `.wav`

            - Audio URLs must be directly accessible by the server

            - Billing is based on audio duration (rounded up to the nearest
            second)
          example: https://example.com/audio.mp3
        image_urls:
          type: array
          description: |-
            Reference image URL list containing the person to animate

            **Note:**
            - Number of images per request: `1`
            - Image should contain a clear human figure
            - Image size: no more than `10MB`
            - Supported file formats: `.jpg`, `.jpeg`, `.png`, `.webp`
            - Image URLs must be directly viewable by the server
          items:
            type: string
            format: uri
          maxItems: 1
          example:
            - https://example.com/person.jpg
        prompt:
          type: string
          description: >-
            Optional text prompt to guide the generation style, only supports
            Chinese, English, Japanese, Korean, Mexican Spanish, and Indonesian
          example: A person speaking naturally with subtle expressions
        pe_fast_mode:
          type: boolean
          description: |-
            Enable fast processing mode

            **Note:**
            - `true`: Faster generation with potentially lower quality
            - `false`: Standard quality processing (default)
          default: false
          example: false
        mask_url:
          type: array
          description: |-
            Mask URL array for specifying animation regions

            **Note:**
            - Optional parameter for advanced control
            - Mask images should match the reference image dimensions
          items:
            type: string
            format: uri
          example:
            - https://example.com/mask.png
        seed:
          type: integer
          description: >-
            Random seed as the basis for determining the initial diffusion
            state, default random. If the seed is the same positive integer and
            all other parameters are consistent, the generated content may have
            consistent results
        subject_check:
          type: boolean
          description: >-
            Enable subject detection to verify human presence in the image


            **Note:**

            - `true`: Enable subject detection, request initiation time will
            increase

            - `false`: Skip subject detection (default)
          default: false
          example: false
        auto_mask:
          type: boolean
          description: >-
            Enable automatic mask generation


            **Note:**

            - `true`: Automatically detect and mask the human figure, request
            initiation time will increase. This parameter is ignored when
            `mask_url` has a value

            - `false`: Use provided mask_url or no mask (default)
          default: false
          example: false
        callback_url:
          type: string
          description: >-
            HTTPS callback address after task completion


            **Callback Timing:**

            - Triggered when task is completed, failed, or cancelled

            - Sent after billing confirmation is completed


            **Security Restrictions:**

            - Only HTTPS protocol is supported

            - Callback to internal IP addresses is prohibited (127.0.0.1,
            10.x.x.x, 172.16-31.x.x, 192.168.x.x, etc.)

            - URL length must not exceed `2048` characters


            **Callback Mechanism:**

            - Timeout: `10` seconds

            - Maximum `3` retries on failure (retries after `1` second/`2`
            seconds/`4` seconds)

            - Callback response body format is consistent with the task query
            API response format

            - Callback address returning 2xx status code is considered
            successful, other status codes will trigger retry
          format: uri
          example: https://your-domain.com/webhooks/video-task-completed
    OmniHumanVideoGenerationResponse:
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
          description: Actual model name used
          example: omnihuman-1.5
        object:
          type: string
          enum:
            - video.generation.task
          description: Specific task type
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
          description: Task output type
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
              description: Error description
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
              description: Suggestion for error resolution
              example: omnihuman-1.5
    VideoTaskInfo:
      type: object
      properties:
        can_cancel:
          type: boolean
          description: Whether the task can be cancelled (always false for OmniHuman)
          example: false
        estimated_time:
          type: integer
          description: Estimated completion time (seconds)
          minimum: 0
          example: 120
        video_duration:
          type: integer
          description: Video duration (seconds), based on audio duration
          example: 10
    VideoUsage:
      type: object
      description: Usage and billing information
      properties:
        billing_rule:
          type: string
          description: Billing rule (per_second for OmniHuman)
          enum:
            - per_call
            - per_token
            - per_second
          example: per_second
        credits_reserved:
          type: number
          description: Estimated credits consumed (based on audio duration)
          minimum: 0
          example: 10
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


        **Add to request header when using:**

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
                    example: omnihuman-1.5
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
                      - https://example.com/video.mp4
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
              model: omnihuman-1.5
              object: video.generation.task
              progress: 100
              results:
                - https://example.com/video.mp4
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

