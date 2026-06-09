"""
Custom application exceptions.

Every exception maps to an HTTP status code and a machine-readable error code
so the frontend can rely on stable identifiers rather than message strings.

Note: Machine-readable means something that the frontend can use in code to make decisions (e.g. "token_expired"), as opposed to a 
human-readable message which may change or be localized (e.g. "Authentication token has expired.").
"""

from http import HTTPStatus

# Exception class which will be the base for all application-level errors. It includes a default message, an HTTP status code, and a 
# machine-readable error code. The constructor allows an optional detail message to be provided, which will be used in the response instead
# of the default message if given.

class AppError(Exception):
    """Base exception for all application-level errors."""

    message: str = "An unexpected application error occurred."
    status_code: int = HTTPStatus.INTERNAL_SERVER_ERROR
    error_code: str = "internal_error"

    def __init__(self, detail: str | None = None) -> None:
        self.detail = detail or self.message
        super().__init__(self.detail)


# Authentication / Authorisation exception classes, that will be raised by the security module and authentication services when there are 
# issues with user credentials, tokens, or permissions.

class CredentialsError(AppError):
    message = "Invalid email or password."
    status_code = HTTPStatus.UNAUTHORIZED
    error_code = "invalid_credentials"


class TokenExpiredError(AppError):
    message = "Authentication token has expired."
    status_code = HTTPStatus.UNAUTHORIZED
    error_code = "token_expired"


class TokenInvalidError(AppError):
    message = "Authentication token is invalid."
    status_code = HTTPStatus.UNAUTHORIZED
    error_code = "token_invalid"


class InsufficientPermissionsError(AppError):
    message = "You do not have permission to perform this action."
    status_code = HTTPStatus.FORBIDDEN
    error_code = "forbidden"


# Resource errors 


class NotFoundError(AppError):
    message = "The requested resource was not found."
    status_code = HTTPStatus.NOT_FOUND
    error_code = "not_found"


class ConflictError(AppError):
    message = "The resource already exists."
    status_code = HTTPStatus.CONFLICT
    error_code = "conflict"


class ValidationError(AppError):
    message = "Input validation failed."
    status_code = HTTPStatus.UNPROCESSABLE_ENTITY
    error_code = "validation_error"


# File / Storage errors 


class FileTooLargeError(AppError):
    message = "Uploaded file exceeds the maximum allowed size."
    status_code = HTTPStatus.REQUEST_ENTITY_TOO_LARGE
    error_code = "file_too_large"


class UnsupportedFileTypeError(AppError):
    message = "The file type is not supported."
    status_code = HTTPStatus.UNSUPPORTED_MEDIA_TYPE
    error_code = "unsupported_file_type"


class StorageError(AppError):
    message = "A storage operation failed."
    status_code = HTTPStatus.INTERNAL_SERVER_ERROR
    error_code = "storage_error"
