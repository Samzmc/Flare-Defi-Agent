"""
flare_mcp_server.py
An MCP server that exposes Flare/Web2/Web3 tools.

Run locally (stdio transport):
  python flare_mcp_server.py

Your agent (MCP client) can spawn this process over stdio, discover tools,
and call them.
"""

import asyncio
import os
import json
import time
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
load_dotenv()

# --- MCP imports (may vary slightly by mcp version) ---
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent


# =========================
# 1) Your Flare/API helpers
# =========================

def _flare_api_get(path: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Replace this stub with real Flare platform calls (web2/web3 + other APIs).
    For hackathon: keep it simple and deterministic.
    """
    # Example placeholder response
    return {
        "ok": True,
        "path": path,
        "params": params or {},
        "note": "TODO: implement real Flare calls here"
    }


# =========================
# 2) Define MCP server
# =========================

server = Server("flare-mcp")


@server.list_tools()
async def list_tools() -> List[Tool]:
    """
    Advertise tools to MCP clients.
    """
    return [
        Tool(
            name="flare_health",
            description="Health check for the Flare MCP server.",
            inputSchema={"type": "object", "properties": {}, "required": []},
        ),
        Tool(
            name="flare_search",
            description="Search Flare for an entity (token, project, address, contract) by keyword.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Keyword to search"},
                    "limit": {"type": "integer", "description": "Max results", "default": 5},
                },
                "required": ["query"],
            },
        ),
        Tool(
            name="flare_get_wallet_tx",
            description="Get recent transactions for a wallet address on a given chain.",
            inputSchema={
                "type": "object",
                "properties": {
                    "address": {"type": "string", "description": "Wallet address"},
                    "chain": {"type": "string", "description": "Chain name, e.g. ethereum/base/solana", "default": "ethereum"},
                    "limit": {"type": "integer", "description": "Max transactions", "default": 20},
                },
                "required": ["address"],
            },
        ),
    ]


@server.call_tool()
async def call_tool(name: str, arguments: Dict[str, Any]) -> List[TextContent]:
    """
    Execute a tool call and return results.
    MCP returns content objects; we’ll return JSON as text for simplicity.
    """
    if name == "flare_health":
        result = {
            "status": "ok",
            "server": "flare-mcp",
            "time_unix": time.time(),
        }
        return [TextContent(type="text", text=json.dumps(result, indent=2))]

    if name == "flare_search":
        query = arguments["query"]
        limit = int(arguments.get("limit", 5))

        # TODO: replace with real search
        result = _flare_api_get("/search", {"query": query, "limit": limit})
        return [TextContent(type="text", text=json.dumps(result, indent=2))]

    if name == "flare_get_wallet_tx":
        address = arguments["address"]
        chain = arguments.get("chain", "ethereum")
        limit = int(arguments.get("limit", 20))

        # TODO: replace with real wallet tx fetching
        result = _flare_api_get("/wallet/tx", {"address": address, "chain": chain, "limit": limit})
        return [TextContent(type="text", text=json.dumps(result, indent=2))]

    # Unknown tool
    return [TextContent(type="text", text=json.dumps({"error": f"Unknown tool: {name}"}))]


async def main() -> None:
    """
    Run the MCP server using stdio transport.
    """
    async with stdio_server() as (read_stream, write_stream):
        init_options = server.create_initialization_options()
        await server.run(
            read_stream,
            write_stream,
            init_options
        )


if __name__ == "__main__":
    asyncio.run(main())
