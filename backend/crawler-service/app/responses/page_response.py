from pydantic import BaseModel
from typing import List, Generic, TypeVar

T = TypeVar("T")

class PageResponse(BaseModel, Generic[T]):
    content: List[T]
    currentPage: int
    pageSize: int
    totalElements: int
    totalPages: int
    hasNext: bool
    hasPrevious: bool
