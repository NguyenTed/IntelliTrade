import math
from db.models.idea_model import find_vnexpress_predicted_ideas, find_vnexpress_ideas, find_tradingview_predicted_ideas, find_tradingview_ideas, count_ideas_base_on_type, find_idea_by_slug
from db.models.news_model import find_tradingview_news, count_news, find_news_by_slug
from db.models.comment_model import find_comments_by_ids
from db.models.symbol_model import find_symbol_by_id
from db.models.predicted_idea_model import find_predicted_articles_from_ids, find_predicted_article_from_id
from app.requests.page_request import PageRequest
from app.responses.page_response import PageResponse
from app.responses.comment_response import CommentResponse
from app.schemas.comment_schema import CommentSchema
from app.responses.predicted_article_response import PredictedArticleResponse
from enums.ArticleType import ArticleType
from enums.ArticleCategory import ArticleCategory

class CrawlIdeaService:
    @staticmethod
    def get_vnexpress_predicted_articles():
        return find_vnexpress_predicted_ideas()
    
    @staticmethod
    def get_tradingview_predicted_ideas(page_request: PageRequest):
        return find_tradingview_predicted_ideas(page_request)
    
    @staticmethod
    def get_vnexpress_ideas():
        return find_vnexpress_ideas()
    
    @staticmethod
    def get_tradingview_ideas(page_request: PageRequest):
        return find_tradingview_ideas(page_request)
    
    @staticmethod
    def get_tradingview_page(page_request: PageRequest, category: ArticleCategory) -> PageResponse:
        articles = []
        total_elements = 0
        if category == ArticleCategory.IDEA:
            articles = find_tradingview_ideas(page_request)
            total_elements = count_ideas_base_on_type(ArticleType.TRADINGVIEW)
        else:
            articles = find_tradingview_news(page_request)
            total_elements = count_news()
        predicted = find_predicted_articles_from_ids([article.predicted for article in articles if article.predicted])
        

        article_map = {
            str(article.predicted): {
                "imgUrl": article.imgUrl,
                "slug": article.slug,
            }
            for article in articles if article.predicted
        }

        content = []
        for p in predicted:
            full_comments = []
            if (ArticleCategory.IDEA == category):
                full_comments = find_comments_by_ids(p.comments or [])
            symbols = find_symbol_by_id(p.symbols[0]) if p.symbols else None
            article_info = article_map.get(str(p.id), {})

            content.append(PredictedArticleResponse(
                id=str(p.id),
                url=p.url,
                title=p.title,
                description=p.description,
                imgUrl=article_info.get("imgUrl"),
                slug=article_info.get("slug"),  
                content=p.content,
                comments=[
                    CommentResponse(
                        id=str(c.id),
                        comment_id=c.comment_id,
                        parent_id = c.parent_id if c.parent_id is not None else -1,
                        author=c.author,
                        text=c.text,
                        timestamp=c.timestamp
                    ) for c in full_comments
                ],
                tradeSide=p.tradeSide,
                contentHtml=p.contentHtml,
                tags=p.tags,
                symbols=[symbols],
                sections=p.sections,
                createdAt=p.createdAt,
                updatedAt=p.updatedAt
            ))

        total_pages = math.ceil(total_elements / page_request.size)

        return PageResponse(
            content=content,
            currentPage=page_request.page,
            pageSize=page_request.size,
            totalElements=total_elements,
            totalPages=total_pages,
            hasNext=page_request.page + 1 < total_pages,
            hasPrevious=page_request.page > 0
        )
    
    @staticmethod
    def get_vnexpress_page(page_request: PageRequest) -> PageResponse:
        predicted = find_vnexpress_predicted_ideas(page_request)
        articles = find_vnexpress_ideas(page_request)
        total_elements = count_ideas_base_on_type(ArticleType.VNEXPRESS)

        article_map = {
            str(article.predicted): {
                "imgUrl": article.imgUrl,
                "slug": article.slug,
            }
            for article in articles if article.predicted
        }

        content = []
        for p in predicted:
            full_comments = find_comments_by_ids(p.comments or [])
            article_info = article_map.get(str(p.id), {})

            content.append(PredictedArticleResponse(
                id=str(p.id),
                url=p.url,
                title=p.title,
                description=p.description,
                imgUrl=article_info.get("imgUrl"),
                slug=article_info.get("slug"), 
                content=p.content,
                comments=[
                    CommentResponse(
                        id=str(c.id),
                        comment_id=c.comment_id,
                        parent_id = c.parent_id if c.parent_id is not None else -1,
                        author=c.author,
                        text=c.text,
                        timestamp=c.timestamp
                    ) for c in full_comments
                ],
                tags=p.tags,
                symbols=p.symbols,
                sections=p.sections,
                createdAt=p.createdAt,
                updatedAt=p.updatedAt
            ))

        total_pages = math.ceil(total_elements / page_request.size)

        return PageResponse(
            content=content,
            currentPage=page_request.page,
            pageSize=page_request.size,
            totalElements=total_elements,
            totalPages=total_pages,
            hasNext=page_request.page + 1 < total_pages,
            hasPrevious=page_request.page > 0
        )
    
    @staticmethod
    def get_ideas_by_slug(slug: str) -> PredictedArticleResponse:
        article = find_idea_by_slug(slug)
        predicted = find_predicted_article_from_id(article.predicted)

        full_comments = find_comments_by_ids(predicted.comments or [])
        symbols = find_symbol_by_id(predicted.symbols[0]) if predicted.symbols else None
        response = PredictedArticleResponse(
            id=str(predicted.id),
            url=predicted.url,
            title=predicted.title,
            description=predicted.description,
            imgUrl=article.imgUrl,
            slug=article.slug,
            content=predicted.content,
            comments=[
                CommentResponse(
                    id=str(c.id),
                    comment_id=c.comment_id,
                    parent_id=c.parent_id if c.parent_id is not None else -1,
                    author=c.author,
                    text=c.text,
                    timestamp=c.timestamp
                ) for c in full_comments
            ],
            tradeSide=predicted.tradeSide,
            contentHtml=predicted.contentHtml,
            tags=predicted.tags,
            symbols=[symbols],
            sections=predicted.sections,
            createdAt=predicted.createdAt,
            updatedAt=predicted.updatedAt
        )

        return response

    @staticmethod
    def get_news_by_slug(slug: str) -> PredictedArticleResponse:
        article = find_news_by_slug(slug)
        predicted = find_predicted_article_from_id(article.predicted)

        symbols = find_symbol_by_id(predicted.symbols[0]) if predicted.symbols else None
        response = PredictedArticleResponse(
            id=str(predicted.id),
            url=predicted.url,
            title=predicted.title,
            description=predicted.description,
            imgUrl="",
            slug=article.slug,
            content=predicted.content,
            comments=[],
            tradeSide=predicted.tradeSide,
            contentHtml=predicted.contentHtml,
            tags=predicted.tags,
            symbols=[symbols],
            sections=predicted.sections,
            createdAt=predicted.createdAt,
            updatedAt=predicted.updatedAt
        )

        return response


