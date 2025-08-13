import requests

url = "https://news-headlines.tradingview.com/headlines/"
headers = {
    "User-Agent": "Mozilla/5.0",
    "Referer": "https://www.tradingview.com/",
}
params = {
    "category": "stock",
    "lang": "en"
}

res = requests.get(url, headers=headers, params=params)
print("Status:", res.status_code)
try:
    print(res.json())
except Exception as e:
    print("Không parse được JSON:", e)