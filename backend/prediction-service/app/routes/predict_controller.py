from flask import Blueprint, request, jsonify
from app.service.fetch_data_service import fetch_binance_closes
from app.service.predict_service import predict_next_close
from app.service.sentiment_service import get_sentiment

predict_routes = Blueprint('predict', __name__)

@predict_routes.route('/prediction', methods=['POST'])
def predict():
    data = request.get_json()
    if 'symbol' not in data:
        return jsonify({'error': 'No symbol provided'}), 400

    symbol = data['symbol'].upper()
    interval = data.get('interval', '1d')
    try:
        # fetch data from history service
        closes = fetch_binance_closes(symbol, interval)
        # fetch sentiment from sentiment service
        sentiment = get_sentiment(symbol)
        result = predict_next_close(closes, seq_len=60, user_id=data.get('userId'), model_name=data.get('modelName'), sentiment=sentiment)
        result['symbol'] = symbol
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500