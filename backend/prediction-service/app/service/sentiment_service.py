import requests

def get_sentiment(symbol: str):
    url = "http://crawler-service:5002/crawler/sentiments/{}".format(symbol.upper())
    response = requests.get(url)
    print(f"[DEBUG] Sentiment response for {symbol}: {response.json().get('label')}")
    if response.status_code == 200:
        return response.json().get("label")
    else:
        return {"error": "Failed to analyze sentiment"}