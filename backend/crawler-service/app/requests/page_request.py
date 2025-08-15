from pydantic import BaseModel, Field, ValidationError
from flask import request

class PageRequest(BaseModel):
    page: int = Field(default=0, ge=0)
    size: int = Field(default=10, ge=1, le=100)
    sortBy: str = "createdAt"
    sortDirection: str = "desc"

    @classmethod
    def from_flask(cls):
        try:
            return cls.model_validate({
                "page": request.args.get("page", 0),
                "size": request.args.get("size", 10),
                "sortBy": request.args.get("sortBy", "createdAt"),
                "sortDirection": request.args.get("sortDirection", "desc")
            })
        except ValidationError:
            return cls()  # fallback to default
