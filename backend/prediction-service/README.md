# Flask LSTM API

This project is a Flask-based API for making predictions using a Long Short-Term Memory (LSTM) model trained on cryptocurrency price data. The API allows users to interact with the model and obtain predictions based on input data.

## Project Structure

```
flask-lstm-api
├── app
│   ├── __init__.py
│   ├── routes.py
│   ├── model
│   │   ├── lstm_model.py
│   │   └── price_scaler.pkl
│   └── utils.py
├── crypto_lstm.h5
├── btc_history.csv
├── requirements.txt
├── run.py
└── README.md
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd flask-lstm-api
   ```

2. **Create a virtual environment:**
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install the required packages:**
   ```
   pip install -r requirements.txt
   ```

4. **Run the application:**
   ```
   python run.py
   ```

## Usage

Once the server is running, you can access the API endpoints to make predictions. Use tools like Postman or cURL to send requests to the API.

### Example Endpoint

- **POST /predict**
  - Request Body: JSON containing the input data for prediction.
  - Response: JSON containing the predicted price.

## Dependencies

- Flask
- TensorFlow
- scikit-learn
- numpy
- pandas

## License

This project is licensed under the MIT License.