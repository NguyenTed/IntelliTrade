import math
from db.models.article_model import find_vnexpress_predicted_articles, find_vnexpress_articles, find_tradingview_predicted_articles, find_tradingview_articles, count_articles_base_on_type, find_article_by_slug
from db.models.comment_model import find_comments_by_ids
from db.models.symbol_model import find_symbol_by_id
from db.models.predicted_article_model import find_predicted_articles_from_articles, find_predicted_article_from_article
from app.requests.page_request import PageRequest
from app.responses.page_response import PageResponse
from app.responses.comment_response import CommentResponse
from app.schemas.comment_schema import CommentSchema
from app.responses.predicted_article_response import PredictedArticleResponse
from enums.ArticleType import ArticleType

class CrawlArticleService:
    @staticmethod
    def get_vnexpress_predicted_articles():
        return find_vnexpress_predicted_articles()
    
    @staticmethod
    def get_tradingview_predicted_articles(page_request: PageRequest):
        return find_tradingview_predicted_articles(page_request)
    
    @staticmethod
    def get_vnexpress_articles():
        return find_vnexpress_articles()
    
    @staticmethod
    def get_tradingview_articles(page_request: PageRequest):
        return find_tradingview_articles(page_request)
    
    @staticmethod
    def get_tradingview_page(page_request: PageRequest) -> PageResponse:
        articles = find_tradingview_articles(page_request)
        predicted = find_predicted_articles_from_articles(articles)
        total_elements = count_articles_base_on_type(ArticleType.TRADINGVIEW)

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
        predicted = find_vnexpress_predicted_articles(page_request)
        articles = find_vnexpress_articles(page_request)
        total_elements = count_articles_base_on_type(ArticleType.VNEXPRESS)

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
    def get_articles_by_slug(slug: str) -> PredictedArticleResponse:
        article = find_article_by_slug(slug)
        predicted = find_predicted_article_from_article(article)

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
    
    


