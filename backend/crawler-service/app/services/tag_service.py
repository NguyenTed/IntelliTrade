from db.models.tag_model import find_tag_by_keyword
from app.responses.tag_response import TagResponse

class TagService:
    @staticmethod
    def find_tag_by_keyword(keyword: str):
        keyword = keyword.strip('"')
        tags = find_tag_by_keyword(keyword)
        tag_responses = []
        for tag in tags:
            tag_responses.append(TagResponse(
                id=str(tag.id),
                name=tag.name,
                source=tag.source
            ))
        return tag_responses

    