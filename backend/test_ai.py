from ai.sentiment import calculate_sentiment_signal
from ai.explanations import generate_explanation

ticker = "AAPL"
company = "Apple"

sentiment = calculate_sentiment_signal(ticker, company)
print(f"Sentiment: {sentiment}")

explanation = generate_explanation(
    ticker=ticker,
    ma_signal="BUY",
    rsi_signal="NEUTRAL",
    bb_signal="BUY",
    sentiment_signal=sentiment
)
print(f"Explanation: {explanation}")

from ai.sentiment import fetch_news_headlines

headlines = fetch_news_headlines("AAPL", "Apple")
for h in headlines:
    print(h)