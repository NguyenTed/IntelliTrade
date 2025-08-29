import math
from collections import Counter
from db.models.idea_model import find_vnexpress_predicted_ideas, find_vnexpress_ideas, find_tradingview_predicted_ideas, find_tradingview_ideas, count_ideas_base_on_type, find_idea_by_slug
from db.models.news_model import find_tradingview_news, count_news, find_news_by_slug
from db.models.comment_model import find_comments_by_ids
from db.models.symbol_model import find_symbol_by_id, find_symbols_by_name
from db.models.predicted_article_model import find_predicted_articles_from_ids, find_predicted_article_from_id, find_tradingview_sentiment_articles, collection, find_predicted_from_symbol
from app.requests.page_request import PageRequest
from app.responses.page_response import PageResponse
from app.responses.comment_response import CommentResponse
from app.responses.sentiment_article_response import SentimentArticleResponse
from app.schemas.comment_schema import CommentSchema
from app.responses.predicted_article_response import PredictedArticleResponse
from app.responses.sentiment_aggregate_response import SentimentAggregateResponse
from enums.ArticleType import ArticleType
from enums.ArticleCategory import ArticleCategory

class CrawlArticleService:
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
            symbols = [find_symbol_by_id(symbol) for symbol in p.symbols] if p.symbols else None
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
                symbols=symbols,
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
        symbols = [find_symbol_by_id(symbol) for symbol in predicted.symbols] if predicted.symbols else None
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
            symbols=symbols,
            sections=predicted.sections,
            createdAt=predicted.createdAt,
            updatedAt=predicted.updatedAt
        )

        return response

    @staticmethod
    def get_news_by_slug(slug: str) -> PredictedArticleResponse:
        article = find_news_by_slug(slug)
        predicted = find_predicted_article_from_id(article.predicted)

        symbols = [find_symbol_by_id(symbol) for symbol in predicted.symbols] if predicted.symbols else None
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
            symbols=symbols,
            sections=predicted.sections,
            createdAt=predicted.createdAt,
            updatedAt=predicted.updatedAt
        )

        return response

    @staticmethod
    def get_tradingview_sentiment(page_request: PageRequest) -> PageResponse[SentimentArticleResponse]:
        articles = find_tradingview_sentiment_articles(page_request)
        total = collection.count_documents({})

        content = []
        for article in articles:
            symbols = []
            if article.symbols:
                symbols = [find_symbol_by_id(symbol_id) for symbol_id in article.symbols]

            content.append(
                SentimentArticleResponse(
                    id=str(article.id),
                    title=article.title,
                    content=article.content,
                    url=article.url,
                    tags=article.tags,
                    tradeSide=article.tradeSide,
                    symbols=symbols, 
                    sentiment=article.sentiment,
                    createdAt=article.createdAt,
                    updatedAt=article.updatedAt
                )
            )

        total_pages = (total + page_request.size - 1) // page_request.size

        return PageResponse[SentimentArticleResponse](
            content=content,
            currentPage=page_request.page,
            pageSize=page_request.size,
            totalElements=total,
            totalPages=total_pages,
            hasNext=page_request.page < total_pages,
            hasPrevious=page_request.page > 1
        )
    
    @staticmethod
    def get_sentiment_by_symbol(symbolName: str) -> SentimentAggregateResponse:
        symbol = find_symbols_by_name(symbolName)
        if not symbol:
            return None

        predicted_articles = find_predicted_from_symbol(symbol.id)
        if not predicted_articles:
            return None

        labels = []
        scores = []

        for article in predicted_articles:
            if article.sentiment:
                labels.append(article.sentiment.label)
                scores.append(article.sentiment.score)

        if not labels or not scores:
            return None

        most_common_label = Counter(labels).most_common(1)[0][0]
        avg_score = sum(scores) / len(scores)

        return SentimentAggregateResponse(
            symbol=symbol,
            label=most_common_label,
            score=round(avg_score, 4),
            count=len(scores)
        )
