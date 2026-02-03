# Qwen Image Edit Plus

> - Qwen (qwen-image-edit-plus) model supports image editing, image-to-image and other modes

- Asynchronous processing mode, use the returned task ID to [query](/en/api-manual/task-management/get-task-detail)
- Generated image links are valid for 24 hours, please save them promptly

## Pricing

| MODEL                | MODE                 | PRICE (CREDITS)       |
| -------------------- | -------------------- | --------------------- |
| Qwen Image Edit Plus | Image Editing (Plus) | 1.500 Credits / image |

## OpenAPI

````yaml en/api-manual/image-series/qwen/qwen-image-edit-plus.json post /v1/images/generations
openapi: 3.1.0
info:
  title: qwen-image-edit-plus Interface
  description: >-
    Use Qwen model for image editing with simplified model parameter
    configuration
  license:
    name: MIT
  version: 1.0.0
servers:
  - url: https://api.evolink.ai
    description: Production environment
security:
  - bearerAuth: []
tags:
  - name: Image Generation
    description: AI image generation related APIs
paths:
  /v1/images/generations:
    post:
      tags:
        - Image Generation
      summary: qwen-image-edit-plus Interface
      description: >-
        - Qwen (qwen-image-edit-plus) model supports image editing,
        image-to-image and other modes

        - Asynchronous processing mode, use the returned task ID to
        [query](/en/api-manual/task-management/get-task-detail)

        - Generated image links are valid for 24 hours, please save them
        promptly
      operationId: createQwenImageEditPlusGeneration
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/QwenImageEditRequest"
            examples:
              image_edit:
                summary: Image Edit
                value:
                  model: qwen-image-edit-plus
                  prompt: Replace the background of this image
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
                  message: Invalid request format
                  type: invalid_request_error
                  param: model
        "401":
          description: Authentication failed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
              example:
                error:
                  code: 401
                  message: Invalid authentication credentials
                  type: authentication_error
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
                  fallback_suggestion: qwen-image-edit-plus
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
                  message: Bad gateway
                  type: upstream_error
                  fallback_suggestion: try again later
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
    QwenImageEditRequest:
      type: object
      required:
        - model
        - prompt
        - image_urls
      properties:
        model:
          type: string
          description: Model name
          enum:
            - qwen-image-edit-plus
          default: qwen-image-edit-plus
          example: qwen-image-edit-plus
        prompt:
          type: string
          description: >-
            Prompt describing the image to generate or how to edit the input
            image, limited to 2000 tokens
          example: Replace the background of this image
          maxLength: 2000
        image_urls:
          type: array
          description: >-
            Reference image URL list


            **Note:**

            - Maximum number of input images per request: `3` images

            - Image width and height must be within `[384-3072]` pixel range

            - Supported file formats: `.jpg`, `.jpeg`, `.png`, `.bmp`, `.webp`,
            `.tiff`

            - Image URLs must be directly accessible by the server, or the image
            URL should directly download when accessed (typically these URLs end
            with image file extensions, such as `.png`, `.jpg`)
          items:
            type: string
            format: uri
          example:
            - https://example.com/image1.png
            - https://example.com/image2.png
        "n":
          type: integer
          description: >-
            Specifies the number of images to generate, supports any integer
            value between `[1,6]`


            **Note:**

            - Each request will be pre-charged based on the value of `n`, actual
            charges are based on the number of images generated
          minimum: 1
          maximum: 6
          default: 1
          example: 1
        negative_prompt:
          type: string
          description: >-
            Negative prompt to describe content you don't want to see in the
            image, used to constrain the output


            **Note:**

            - Supports Chinese and English, maximum length of `500` characters,
            each Chinese character/letter counts as one character, excess will
            be automatically truncated
          maxLength: 500
          example: >-
            low resolution, error, worst quality, low quality, mutilated, extra
            fingers, bad proportions
        size:
          type: string
          description: >-
            Generated image size, supports **pixel format**:

            - Width x Height, such as: `1024x1024`, `1024x1536`, `1536x1024` and
            other values within range

            - Width and height range: `[512, 2048]` pixels

            - If not set, output image will maintain aspect ratio similar to
            original image, close to `1024x1024` resolution


            **Note:**

            - This parameter is only available when the number of output images
            `n` is `1`, otherwise an error will be returned
          pattern: ^[0-9]+x[0-9]+$
          example: 1024x1024
        prompt_extend:
          type: boolean
          description: >-
            Whether to enable intelligent prompt rewriting. When enabled, uses a
            large model to optimize the positive prompt, significantly improving
            results for simple or insufficiently descriptive prompts. Default
            value is `true`
          default: true
          example: true
        watermark:
          type: boolean
          description: >-
            Whether to add "Qwen-Image" watermark to the bottom right corner of
            the image. Default value is `false`
          default: false
          example: false
        seed:
          type: integer
          description: >-
            Random seed, range `[0, 2147483647]`, using the same seed value can
            keep generated content relatively stable


            **Note:**

            - If not provided, the algorithm will automatically use a random
            seed

            - Model generation process is probabilistic, even with the same
            seed, results cannot be guaranteed to be completely identical each
            time
          minimum: 0
          maximum: 2147483647
          example: 12345
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
          example: https://your-domain.com/webhooks/image-task-completed
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
          example: qwen-image-edit-plus
        object:
          type: string
          enum:
            - image.generation.task
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
          $ref: "#/components/schemas/TaskInfo"
          description: Asynchronous task information
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
              description: Error code
            message:
              type: string
              description: Error message
            type:
              type: string
              description: Error type
            param:
              type: string
              description: Parameter name that caused the error
            fallback_suggestion:
              type: string
              description: Suggested solution
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
          example: 30
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
          description: Estimated credits consumed
          minimum: 0
          example: 1
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
                    example: qwen-image-edit-plus
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
              model: qwen-image-edit-plus
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
