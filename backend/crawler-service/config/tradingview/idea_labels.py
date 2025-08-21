from enums.ArticleType import ArticleType

idea_label_rules = [
    { "selector": "h1[class^='title-']", "label": "title", "source":  ArticleType.TRADINGVIEW.value},
    { "selector": "span[class^='ast-']", "label": "content", "source":  ArticleType.TRADINGVIEW.value },
    { "selector": "span[class^='nameLabel-']", "label": "symbol", "source": ArticleType.TRADINGVIEW.value},
    { "selector": "span[class^='tag-text-']", "label": "tag", "source": ArticleType.TRADINGVIEW.value},
    { "selector": "img[class*='logo-']", "label": "symbolImage", "source": ArticleType.TRADINGVIEW.value},
    { "selector": "span[class*='short-']", "label": "tradeSide", "source": ArticleType.TRADINGVIEW.value},
    { "selector": "span[class*='long-']", "label": "tradeSide", "source": ArticleType.TRADINGVIEW.value},
    { "selector": "div[class*='description-']", "label": "contentHtml", "source": ArticleType.TRADINGVIEW.value},
]
