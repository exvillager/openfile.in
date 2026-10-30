package response

type ApiResponse[T any] struct {
	StatusCode int    `json:"statusCode"`
	Data       T      `json:"data"`
	Message    string `json:"message"`
	Success    bool   `json:"success"`
}

func New[T any](statusCode int, message string, data T) ApiResponse[T] {
	if message == "" {
		message = "Success"
	}

	return ApiResponse[T]{
		StatusCode: statusCode,
		Data:       data,
		Message:    message,
		Success:    statusCode < 400,
	}
}
