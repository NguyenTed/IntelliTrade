from enums.ArticleType import ArticleType

article_label_rules = [
    { "selector": "h1[class^='title-']", "label": "title", "source":  ArticleType.TRADINGVIEW.value},
    { "selector": "span[class^='ast-']", "label": "content", "source":  ArticleType.TRADINGVIEW.value },
    { "selector": "span[class^='nameLabel-']", "label": "symbol", "source": ArticleType.TRADINGVIEW.value},
    { "selector": "span[class^='tag-text-']", "label": "tag", "source": ArticleType.TRADINGVIEW.value}
]
