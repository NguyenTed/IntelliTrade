from enums.ArticleType import ArticleType

new_label_rules = [
    { "selector": "h2[class^='title-']", "label": "title", "source":  ArticleType.TRADINGVIEW.value},
    { "selector": "time[datetime]", "label": "createdDate", "source":  ArticleType.TRADINGVIEW.value },
    { "selector": "div[class^='symbolsContainer-']", "label": "symbolContainer", "source": ArticleType.TRADINGVIEW.value},
    { "selector": "span[class^='tag-text-']", "label": "tag", "source": ArticleType.TRADINGVIEW.value},
    { "selector": "div[class^='body-']", "label": "newsContentHtml", "source": ArticleType.TRADINGVIEW.value},
]
