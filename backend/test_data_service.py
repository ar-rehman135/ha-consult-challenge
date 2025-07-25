#!/usr/bin/env python3
"""
Test script for DataService
"""
import asyncio
import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.services.data_service import DataService

async def test_data_service():
    """Test the data service functionality"""
    data_service = DataService()
    
    print("Testing DataService...")
    
    # Test 1: Get available tickers
    print("\n1. Testing get_available_tickers()...")
    tickers = data_service.get_available_tickers()
    print(f"Available tickers: {tickers}")
    
    if not tickers:
        print("ERROR: No tickers found!")
        return
    
    # Test 2: Get stock data for AAPL
    print("\n2. Testing get_stock_data() for AAPL...")
    data = await data_service.get_stock_data("AAPL", "2023-01-01", "2023-12-31")
    
    if data is not None:
        print(f"Successfully fetched data for AAPL")
        print(f"Data shape: {data.shape}")
        print(f"Date range: {data.index.min()} to {data.index.max()}")
        print(f"Columns: {list(data.columns)}")
        print(f"First few rows:")
        print(data.head())
    else:
        print("ERROR: Failed to fetch data for AAPL")
    
    # Test 3: Validate ticker
    print("\n3. Testing validate_ticker()...")
    is_valid = data_service.validate_ticker("AAPL")
    print(f"AAPL is valid: {is_valid}")
    
    is_invalid = data_service.validate_ticker("INVALID")
    print(f"INVALID is valid: {is_invalid}")

if __name__ == "__main__":
    asyncio.run(test_data_service()) 