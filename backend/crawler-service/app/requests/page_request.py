from pydantic import BaseModel, Field, ValidationError
from flask import request

class PageRequest(BaseModel):
    page: int = Field(default=1, ge=1)
    size: int = Field(default=12, ge=1, le=100)
    sortBy: str = "createdAt"
    sortDirection: str = "desc"

    @classmethod
    def from_flask(cls):
        try:
            return cls.model_validate({
                "page": request.args.get("page", 1),
                "size": request.args.get("size", 12),
                "sortBy": request.args.get("sortBy", "createdAt"),
                "sortDirection": request.args.get("sortDirection", "desc")
            })
        except ValidationError:
            return cls()  # fallback to default
