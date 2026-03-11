import os
import requests
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
NEWS_API_KEY = os.getenv("NEWS_API_KEY")

client = Groq(api_key=GROQ_API_KEY)

def fetch_news_headlines(ticker, company_name=None):
    query = f"{ticker} {company_name} stock market" if company_name else f"{ticker} stock"
    url = "https://newsapi.org/v2/everything"
    params = {
        "q": query,
        "sortBy": "publishedAt",
        "pageSize": 5,
        "language": "en",
        "apiKey": NEWS_API_KEY
    }
    try:
        response = requests.get(url, params=params)
        data = response.json()
        if data.get("status") != "ok":
            print(f"NewsAPI error for {ticker}: {data.get('message')}")
            return []
        return [article["title"] for article in data.get("articles", [])]
    except Exception as e:
        print(f"Error fetching news for {ticker}: {e}")
        return []

def calculate_sentiment_signal(ticker, company_name=None):
    headlines = fetch_news_headlines(ticker, company_name)

    if not headlines:
        return "NEUTRAL"

    headlines_text = "\n".join(f"- {h}" for h in headlines)

    prompt = f"""You are a financial analyst. Based on these 5 recent news headlines for {ticker}, return a single sentiment signal.

Headlines:
{headlines_text}

Rules:
- Reply with ONLY one word: BUY, SELL, or NEUTRAL
- BUY = headlines are clearly positive for the stock
- SELL = headlines are clearly negative for the stock
- NEUTRAL = mixed, unclear, or unrelated to stock performance

Signal:"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=5,
            temperature=0.1
        )
        signal = response.choices[0].message.content.strip().upper()
        return signal if signal in ["BUY", "SELL", "NEUTRAL"] else "NEUTRAL"
    except Exception as e:
        print(f"Groq error for {ticker}: {e}")
        return "NEUTRAL"