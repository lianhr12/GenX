# Wan2.6 Text to Video

> - WAN2.6 (wan2.6-text-to-video) model supports text-to-video generation
- Asynchronous processing mode, use the returned task ID to [query status](/en/api-manual/task-management/get-task-detail)
- Generated video links are valid for 24 hours, please save them promptly

## Pricing
| MODEL | MODE | QUALITY | DURATION | PRICE (CREDITS) |
| --- | --- | --- | --- | --- |
| WAN 2.6 Text to Video | Video Generation | 720p | 5s | 25.500 Credits / video |
| WAN 2.6 Text to Video | Video Generation | 720p | 10s | 51.000 Credits / video |
| WAN 2.6 Text to Video | Video Generation | 720p | 15s | 76.500 Credits / video |
| WAN 2.6 Text to Video | Video Generation | 1080p | 5s | 42.585 Credits / video |
| WAN 2.6 Text to Video | Video Generation | 1080p | 10s | 85.170 Credits / video |
| WAN 2.6 Text to Video | Video Generation | 1080p | 15s | 127.755 Credits / video |


## OpenAPI

````yaml en/api-manual/video-series/wan2.6/wan2.6-text-to-video.json post /v1/videos/generations
openapi: 3.1.0
info:
  title: wan2.6-text-to-video API
  description: >-
    Generate videos from text using the WAN2.6 model with simplified model
    parameter configuration
  license:
    name: MIT
  version: 1.0.0
servers:
  - url: https://api.evolink.ai
    description: Production Environment
security:
  - bearerAuth: []
paths:
  /v1/videos/generations:
    post:
      tags:
        - Video Generation
      summary: wan2.6-text-to-video API
      description: >-
        - WAN2.6 (wan2.6-text-to-video) model supports text-to-video generation

        - Asynchronous processing mode, use the returned task ID to [query
        status](/en/api-manual/task-management/get-task-detail)

        - Generated video links are valid for 24 hours, please save them
        promptly
      operationId: createWan26TextToVideoGeneration
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Wan26TextToVideoRequest'
            examples:
              text_to_video:
                summary: Text to Video
                value:
                  model: wan2.6-text-to-video
                  prompt: A cat playing piano
      responses:
        '200':
          description: Video task created successfully
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
                  message: Invalid request format
                  type: invalid_request_error
                  param: model
        '401':
          description: Authentication failed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                error:
                  code: 401
                  message: Invalid authentication credentials
                  type: authentication_error
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
                  fallback_suggestion: wan2.6-text-to-video
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
                  message: Bad gateway
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
    Wan26TextToVideoRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: Model name
          enum:
            - wan2.6-text-to-video
          default: wan2.6-text-to-video
          example: wan2.6-text-to-video
        prompt:
          type: string
          description: >-
            Prompt describing the video you want to generate, limited to 1500
            characters
          example: A cat playing piano
          maxLength: 1500
        aspect_ratio:
          type: string
          description: >-
            Video aspect ratio, defaults to `16:9`


            **Options:**

            - `720p`: Supports `16:9` (landscape), `9:16` (portrait), `1:1`
            (square), `4:3`, `3:4`

            - `1080p`: Supports `16:9` (landscape), `9:16` (portrait), `1:1`
            (square), `4:3`, `3:4`
          example: '16:9'
        quality:
          type: string
          description: >-
            Video quality, defaults to `720p`


            **Options:**

            - `720p`: Standard definition, standard price, this is the default

            - `1080p`: High definition, higher price


            **Note:** Different quality levels support different aspect ratios,
            see `aspect_ratio` parameter
          example: 720p
        duration:
          type: integer
          description: >-
            Specifies the duration of the generated video (in seconds)


            **Note:**

            - Only supports `5`, `10`, `15` values, representing `5 seconds`,
            `10 seconds`, `15 seconds`

            - Each request will be pre-charged based on the `duration` value,
            actual charge is based on the generated video duration
          example: 5
        prompt_extend:
          type: boolean
          description: >-
            Whether to enable intelligent prompt rewriting. When enabled, a
            large model will optimize the prompt, which significantly improves
            results for simple or insufficiently descriptive prompts. Default is
            `true`
          example: true
        model_params:
          type: object
          description: Model parameter configuration
          properties:
            shot_type:
              type: string
              description: >-
                Specifies the shot type for the generated video, i.e., whether
                the video consists of a single continuous shot or multiple
                switching shots


                **Effective Condition:**

                - Only effective when `prompt_extend` is `true`


                **Parameter Priority:**

                - `shot_type` > `prompt`

                - For example, if `shot_type` is set to `single`, even if the
                `prompt` contains `generate multi-shot video`, the model will
                still output a single-shot video


                **Options:**

                - `single`: Default, outputs single-shot video

                - `multi`: Outputs multi-shot video


                **Note:**

                - Use this parameter when you want to strictly control the
                narrative structure of the video (e.g., single shot for product
                showcases, multi-shot for short stories)
              enum:
                - single
                - multi
              example: single
        audio_url:
          type: string
          description: >-
            Audio file URL. The model will use this audio to generate the video.


            **Format Requirements:**

            - Supported format: `mp3`

            - Duration: `3~30` seconds

            - File size: Up to `15MB`


            **Overflow Handling:**

            - If the audio length exceeds the `duration` value (5 or 10
            seconds), the first 5 or 10 seconds will be automatically extracted,
            and the rest will be discarded

            - If the audio length is shorter than the video duration, the
            portion exceeding the audio length will be silent. For example, if
            the audio is 3 seconds and the video duration is 5 seconds, the
            output video will have sound for the first 3 seconds and be silent
            for the last 2 seconds
          format: uri
          example: >-
            https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/xxx.mp3
        callback_url:
          type: string
          description: >-
            HTTPS callback URL for task completion


            **Callback Timing:**

            - Triggered when task is completed, failed, or cancelled

            - Sent after billing confirmation


            **Security Restrictions:**

            - Only HTTPS protocol is supported

            - Callbacks to internal IP addresses are prohibited (127.0.0.1,
            10.x.x.x, 172.16-31.x.x, 192.168.x.x, etc.)

            - URL length must not exceed `2048` characters


            **Callback Mechanism:**

            - Timeout: `10` seconds

            - Up to `3` retries after failure (retries at `1`/`2`/`4` seconds
            after failure)

            - Callback response format is consistent with the task query API
            response

            - 2xx status codes are considered successful, other status codes
            trigger retries
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
          description: Actual model name used
          example: wan2.6-text-to-video
        object:
          type: string
          enum:
            - video.generation.task
          description: Task type
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
          description: Video task details
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
          $ref: '#/components/schemas/Usage'
          description: Usage and billing information
    ErrorResponse:
      type: object
      properties:
        error:
          type: object
          properties:
            code:
              type: integer
              description: Error code
            message:
              type: string
              description: Error message
            type:
              type: string
              description: Error type
            param:
              type: string
              description: Parameter that caused the error
            fallback_suggestion:
              type: string
              description: Suggested solution
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
          example: 120
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
          example: 5
        user_group:
          type: string
          description: User group category
          enum:
            - default
            - vip
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
                    example: wan2.5-text-to-video
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
              model: wan2.5-text-to-video
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
