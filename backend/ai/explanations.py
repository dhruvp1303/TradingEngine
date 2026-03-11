import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_explanation(ticker, ma_signal, rsi_signal, bb_signal, sentiment_signal):
    prompt = f"""You are a financial analyst explaining stock signals to a retail investor in exactly 3 sentences.

Ticker: {ticker}
MA Crossover: {ma_signal}
RSI: {rsi_signal}
Bollinger Bands: {bb_signal}
News Sentiment: {sentiment_signal}

Explain what these signals mean for {ticker} today. Be concise and avoid jargon. Do not use bullet points or headers."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq explanation error for {ticker}: {e}")
        return "Unable to generate explanation at this time."