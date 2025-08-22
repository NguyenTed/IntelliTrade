from pydantic import BaseModel, Field, ValidationError
from flask import request

class PageRequest(BaseModel):
    page: int = Field(default=1, ge=1)
    size: int = Field(default=12, ge=1, le=100)
    sortBy: str = "_id"
    sortDirection: str = "asc"

    @classmethod
    def from_flask(cls):
        try:
            page = int(request.args.get("page", 1))
            size = int(request.args.get("size", 12))
            sort_by = request.args.get("sortBy", "_id")
            sort_direction = request.args.get("sortDirection", "asc").lower()
            if sort_direction not in {"asc", "desc"}:
                sort_direction = "asc"
            return cls.model_validate({
                "page": page,
                "size": size,
                "sortBy": sort_by,
                "sortDirection": sort_direction
            })
        except (ValidationError, ValueError):
            return cls()

