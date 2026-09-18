package response

// ApiError is a handler/service-level error carrying an HTTP status code.
// It implements the standard `error` interface, so it can be returned
// directly from any nanoserve.HandlerFunction.
type ApiError struct {
	StatusCode int
	Message    string
}

func (e *ApiError) Error() string {
	return e.Message
}

func NewApiError(message string, statusCode int) *ApiError {
	return &ApiError{
		StatusCode: statusCode,
		Message:    message,
	}
}
