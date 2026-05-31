class FieldOpsError(Exception):
    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code

class NotFoundError(FieldOpsError):
    def __init__(self, resource: str, ident: str):
        super().__init__("NOT_FOUND", f"{resource} not found: {ident}")

class ValidationError(FieldOpsError):
    def __init__(self, message: str):
        super().__init__("VALIDATION_ERROR", message)
