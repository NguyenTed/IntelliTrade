from enums.ArticleType import ArticleType

article_label_rules = [
  { "selector": "h1.title-detail", "label": "title", "source":  ArticleType.VNEXPRESS.value },
  { "selector": ".Normal", "label": "content",  "source":  ArticleType.VNEXPRESS.value},
  {
    "selector": "div.comment_item",
    "label": "comment",
    "source":  ArticleType.VNEXPRESS.value
  }
]
