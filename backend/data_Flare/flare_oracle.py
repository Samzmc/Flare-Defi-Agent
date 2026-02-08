"""
Flare Price Oracle - FTSO v2 Integration for Coston2 Testnet

Installation:
    pip install web3

Usage:
    oracle = FlarePriceOracle()
    price_data = oracle.get_price("BTC")
    print(f"BTC Price: ${price_data['price']}")
"""

from web3 import Web3
from typing import Dict, Any


class FlarePriceOracle:
    """
    A robust Oracle class for fetching real-time price data from Flare's FTSO v2
    on the Coston2 Testnet.

    This class automatically resolves the FtsoV2 contract address from
    the ContractRegistry and provides methods to query asset prices.
    """

    # Network Configuration
    RPC_URL = "https://coston2-api.flare.network/ext/C/rpc"
    CHAIN_ID = 114
    CONTRACT_REGISTRY_ADDRESS = "0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019"

    # Hardcoded Feed IDs for Coston2 Testnet (bytes21 format)
    # These are pre-defined identifiers for FTSO v2 price feeds
    FEED_IDS = {
        "FLR": "0x01464c522f55534400000000000000000000000000",  # FLR/USD
        "BTC": "0x014254432f55534400000000000000000000000000",  # BTC/USD
        "ETH": "0x014554482f55534400000000000000000000000000",  # ETH/USD
    }

    # Minimal ABI for ContractRegistry
    CONTRACT_REGISTRY_ABI = [
        {
            "inputs": [{"name": "name", "type": "string"}],
            "name": "getContractAddressByName",
            "outputs": [{"name": "", "type": "address"}],
            "stateMutability": "view",
            "type": "function"
        }
    ]

    # Minimal ABI for FtsoV2
    FTSO_V2_ABI = [
        {
            "inputs": [{"name": "feedId", "type": "bytes21"}],
            "name": "getFeedById",
            "outputs": [
                {"name": "value", "type": "uint256"},
                {"name": "decimals", "type": "int8"},
                {"name": "timestamp", "type": "uint64"}
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]

    def __init__(self):
        """
        Initialize the FlarePriceOracle by connecting to Coston2 Testnet
        and resolving the FtsoV2 contract address.

        Raises:
            ConnectionError: If unable to connect to the RPC endpoint
            RuntimeError: If unable to resolve the FtsoV2 address
        """
        # Initialize Web3 provider
        self.w3 = Web3(Web3.HTTPProvider(self.RPC_URL))

        # Verify connection
        if not self.w3.is_connected():
            raise ConnectionError(f"Failed to connect to Flare Coston2 RPC at {self.RPC_URL}")

        print(f"[OK] Connected to Flare Coston2 Testnet (Chain ID: {self.w3.eth.chain_id})")

        # Initialize ContractRegistry
        self.registry = self.w3.eth.contract(
            address=Web3.to_checksum_address(self.CONTRACT_REGISTRY_ADDRESS),
            abi=self.CONTRACT_REGISTRY_ABI
        )

        # Query the FtsoV2 address from the registry
        self.ftso_v2_address = self._get_ftso_v2_address()
        print(f"[OK] FtsoV2 resolved to: {self.ftso_v2_address}")

        # Initialize FtsoV2 contract
        self.ftso_v2 = self.w3.eth.contract(
            address=self.ftso_v2_address,
            abi=self.FTSO_V2_ABI
        )

    def _get_ftso_v2_address(self) -> str:
        """
        Query the ContractRegistry to get the current FtsoV2 address.

        Returns:
            str: Checksum address of the FtsoV2 contract

        Raises:
            RuntimeError: If the contract address cannot be resolved
        """
        try:
            address = self.registry.functions.getContractAddressByName("FtsoV2").call()
            return Web3.to_checksum_address(address)
        except Exception as e:
            raise RuntimeError(f"Failed to resolve FtsoV2 address: {e}")

    def _get_feed_id(self, symbol: str) -> bytes:
        """
        Map a symbol to its hardcoded Feed ID.

        Args:
            symbol: Asset symbol (e.g., "BTC", "FLR", "ETH")

        Returns:
            bytes: The bytes21 Feed ID

        Raises:
            ValueError: If the symbol is not supported
        """
        symbol = symbol.upper()
        if symbol not in self.FEED_IDS:
            raise ValueError(
                f"Unsupported symbol: {symbol}. "
                f"Supported symbols: {', '.join(self.FEED_IDS.keys())}"
            )
        return bytes.fromhex(self.FEED_IDS[symbol][2:])  # Remove '0x' prefix

    def get_price(self, symbol: str) -> Dict[str, Any]:
        """
        Fetch the current price for a given asset symbol from FTSO v2.

        This method:
        1. Converts the symbol to its corresponding Feed ID
        2. Calls getFeedById on the FtsoV2 contract
        3. Processes the returned value using the decimals field
        4. Returns a clean dictionary with the price and metadata

        Args:
            symbol: Asset symbol (e.g., "BTC", "FLR", "ETH")

        Returns:
            dict: {
                'symbol': str,      # The asset pair (e.g., "BTC/USD")
                'price': float,     # Human-readable price
                'timestamp': int    # Unix timestamp of the price update
            }

        Raises:
            ValueError: If the symbol is not supported
            RuntimeError: If the contract call fails

        Example:
            >>> oracle = FlarePriceOracle()
            >>> data = oracle.get_price("BTC")
            >>> print(f"Bitcoin price: ${data['price']:,.2f}")
        """
        try:
            # Get the Feed ID for the symbol
            feed_id = self._get_feed_id(symbol)

            # Call the contract
            value, decimals, timestamp = self.ftso_v2.functions.getFeedById(feed_id).call()

            # Convert raw value to human-readable price
            # decimals indicates the number of decimal places
            # Positive decimals: divide by 10^decimals
            # Negative decimals: multiply by 10^abs(decimals)
            if decimals >= 0:
                price = value / (10 ** decimals)
            else:
                price = value * (10 ** abs(decimals))

            return {
                'symbol': f"{symbol.upper()}/USD",
                'price': float(price),
                'timestamp': int(timestamp)
            }

        except ValueError as e:
            # Re-raise ValueError for unsupported symbols
            raise
        except Exception as e:
            raise RuntimeError(f"Failed to fetch price for {symbol}: {e}")


def main():
    """
    Test the FlarePriceOracle with multiple assets.
    """
    print("=" * 60)
    print("Flare FTSO v2 Price Oracle - Coston2 Testnet")
    print("=" * 60)
    print()

    try:
        # Initialize the oracle
        oracle = FlarePriceOracle()
        print()

        # Test symbols
        symbols = ["FLR", "BTC", "ETH"]

        print("Fetching current prices...")
        print("-" * 60)

        for symbol in symbols:
            try:
                price_data = oracle.get_price(symbol)
                print(f"\n{price_data['symbol']}:")
                print(f"  Price:     ${price_data['price']:,.2f}")
                print(f"  Timestamp: {price_data['timestamp']}")

            except Exception as e:
                print(f"\n{symbol}/USD:")
                print(f"  Error: {e}")

        print("\n" + "=" * 60)
        print("[SUCCESS] Test completed successfully!")
        print("=" * 60)

    except Exception as e:
        print(f"\n[ERROR] Fatal error: {e}")
        raise


if __name__ == "__main__":
    main()
