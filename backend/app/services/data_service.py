import pandas as pd
import os
from datetime import datetime, timedelta
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)


class DataService:
    """Service for fetching and processing stock market data"""

    # Path to the CSV files
    DATA_FOLDER = os.path.join(os.path.dirname(__file__), "stock_data_files")

    @staticmethod
    async def get_stock_data(ticker: str, start_date: str, end_date: str) -> Optional[pd.DataFrame]:
        """
        Fetch OHLCV data for a given ticker and date range from local CSV files

        Args:
            ticker: Stock ticker symbol
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format

        Returns:
            DataFrame with OHLCV data or None if error
        """
        try:
            logger.info(f"Fetching data for {ticker} from {start_date} to {end_date}")

            # Build the CSV file path
            file_path = os.path.join(DataService.DATA_FOLDER, f"{ticker.upper()}.csv")

            if not os.path.exists(file_path):
                logger.error(f"CSV file not found for {ticker}: {file_path}")
                return None

            # Read CSV and parse dates
            data = pd.read_csv(file_path)

            # Convert date column to datetime and handle timezone issues
            data['Date'] = pd.to_datetime(data['Date'], utc=True).dt.tz_localize(None)

            # Convert input dates to timezone-naive datetime
            start_dt = pd.to_datetime(start_date).tz_localize(None)
            end_dt = pd.to_datetime(end_date).tz_localize(None)

            # Filter by date range
            data = data[(data['Date'] >= start_dt) & (data['Date'] <= end_dt)]

            if data.empty:
                logger.error(f"No data found for {ticker} in the specified date range")
                return None

            # Ensure we have all required columns
            required_columns = ['Open', 'High', 'Low', 'Close', 'Volume']
            if not all(col in data.columns for col in required_columns):
                logger.error(f"Missing required columns for {ticker}")
                return None

            # Set date as index
            data = data.set_index('Date')

            logger.info(f"Successfully fetched {len(data)} records for {ticker}")
            return data

        except Exception as e:
            logger.error(f"Error fetching data for {ticker}: {str(e)}")
            return None

    @staticmethod
    def validate_ticker(ticker: str) -> bool:
        """
        Validate if a ticker symbol exists in our CSV files

        Args:
            ticker: Stock ticker symbol

        Returns:
            True if ticker is valid, False otherwise
        """
        try:
            file_path = os.path.join(DataService.DATA_FOLDER, f"{ticker.upper()}.csv")
            return os.path.exists(file_path)
        except Exception as e:
            logger.error(f"Error validating ticker {ticker}: {str(e)}")
            return False

    @staticmethod
    def get_available_tickers() -> list:
        """
        Get a list of available tickers from CSV files

        Returns:
            List of available ticker symbols
        """
        try:
            if not os.path.exists(DataService.DATA_FOLDER):
                logger.error(f"Data folder not found: {DataService.DATA_FOLDER}")
                return []

            tickers = []
            for file in os.listdir(DataService.DATA_FOLDER):
                if file.endswith('.csv'):
                    ticker = file.replace('.csv', '')
                    tickers.append(ticker)

            return sorted(tickers)
        except Exception as e:
            logger.error(f"Error getting available tickers: {str(e)}")
            return ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA']

    @staticmethod
    def calculate_sma(data: pd.DataFrame, period: int) -> pd.Series:
        """
        Calculate Simple Moving Average

        Args:
            data: DataFrame with 'Close' column
            period: SMA period

        Returns:
            Series with SMA values
        """
        return data['Close'].rolling(window=period).mean()

    @staticmethod
    def calculate_volume_sma(data: pd.DataFrame, period: int) -> pd.Series:
        """
        Calculate Volume Simple Moving Average

        Args:
            data: DataFrame with 'Volume' column
            period: SMA period

        Returns:
            Series with Volume SMA values
        """
        return data['Volume'].rolling(window=period).mean()