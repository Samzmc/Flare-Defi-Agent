"""
FastAPI backend for Flare Copilot.

Receives chat messages from the Next.js frontend, calls Claude with
Flare oracle tools, executes tool calls directly against the oracle
classes, and returns responses with toolCalls for rich UI cards.

Run:
    uvicorn main:app --reload
"""

import os
import uuid
import hashlib
import time
import traceback

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import anthropic

from data_Flare import FlarePriceOracle, FlareRandomOracle, FlareFDCOracle

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
if not ANTHROPIC_API_KEY:
    raise RuntimeError(
        "ANTHROPIC_API_KEY not set. "
        "Copy .env.example to .env and add your key."
    )

# ---------------------------------------------------------------------------
# Initialize oracles once at startup
# ---------------------------------------------------------------------------
print("Initializing Flare oracles...")
price_oracle = FlarePriceOracle()
random_oracle = FlareRandomOracle()
fdc_oracle = FlareFDCOracle()
print("All oracles ready.\n")

# ---------------------------------------------------------------------------
# Anthropic client
# ---------------------------------------------------------------------------
client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

MODEL = "claude-sonnet-4-5-20250929"

SYSTEM_PROMPT = (
    "You are Flare Copilot, a helpful assistant for the Flare blockchain ecosystem. "
    "You have access to live on-chain data from the Flare Coston2 Testnet via three oracles:\n"
    "1. **FTSO v2 Price Oracle** — real-time decentralised price feeds for FLR, BTC, ETH\n"
    "2. **Secure Random Oracle** — cryptographically secure on-chain random numbers\n"
    "3. **Flare Data Connector (FDC)** — cross-chain transaction verification\n\n"
    "When users ask about prices, randomness, or verification, use the tools provided. "
    "Always explain results clearly and mention the data comes from Flare's decentralised oracles."
)

# ---------------------------------------------------------------------------
# Tool definitions (for Anthropic API)
# ---------------------------------------------------------------------------
TOOLS = [
    {
        "name": "get_flare_price",
        "description": (
            "Get the current USD price for a crypto asset from Flare's FTSO v2 oracle. "
            "Reads on-chain price data from the Flare Coston2 Testnet. "
            "Supported symbols: FLR, BTC, ETH."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "symbol": {
                    "type": "string",
                    "description": 'The asset ticker, e.g. "BTC", "ETH", "FLR"',
                }
            },
            "required": ["symbol"],
        },
    },
    {
        "name": "list_supported_assets",
        "description": "List all crypto assets currently supported by the Flare price oracle.",
        "input_schema": {
            "type": "object",
            "properties": {},
        },
    },
    {
        "name": "get_random_decision",
        "description": (
            "Get a random trading decision (BUY / SELL / HOLD) from Flare's on-chain "
            "secure random number generator. The random number is produced by the "
            "Flare protocol's Relay contract using commit-reveal entropy."
        ),
        "input_schema": {
            "type": "object",
            "properties": {},
        },
    },
    {
        "name": "get_raw_random_number",
        "description": (
            "Get the raw 256-bit secure random number from Flare's on-chain oracle. "
            "Returns the full random integer without any decision logic."
        ),
        "input_schema": {
            "type": "object",
            "properties": {},
        },
    },
    {
        "name": "verify_on_flare",
        "description": (
            "Verify a transaction on Flare using the Flare Data Connector (FDC). "
            "Submits the transaction hash for verification and fetches the attestation proof."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "tx_hash": {
                    "type": "string",
                    "description": 'The transaction hash to verify, e.g. "0xabc123..."',
                }
            },
            "required": ["tx_hash"],
        },
    },
    {
        "name": "get_fdc_proof",
        "description": (
            "Fetch an attestation proof for a specific consensus round from the "
            "Flare Data Connector."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "round_id": {
                    "type": "integer",
                    "description": "The consensus round ID to fetch the proof for",
                }
            },
            "required": ["round_id"],
        },
    },
]


# ---------------------------------------------------------------------------
# Execute a tool call against the oracles
# ---------------------------------------------------------------------------
def execute_tool(name: str, args: dict) -> dict:
    """Run a tool and return its result dict."""
    if name == "get_flare_price":
        try:
            data = price_oracle.get_price(args["symbol"])
            return {"success": True, **data}
        except (ValueError, RuntimeError) as e:
            return {"success": False, "error": str(e)}

    if name == "list_supported_assets":
        return {
            "success": True,
            "supported_symbols": list(price_oracle.FEED_IDS.keys()),
            "note": "Pass any of these symbols to get_flare_price()",
        }

    if name == "get_random_decision":
        try:
            result = random_oracle.get_random_decision()
            return {
                "success": True,
                "raw": str(result["raw"]),
                "score": result["score"],
                "decision": result["decision"],
            }
        except RuntimeError as e:
            return {"success": False, "error": str(e)}

    if name == "get_raw_random_number":
        try:
            raw = random_oracle.get_random_number()
            return {"success": True, "random_number": str(raw)}
        except RuntimeError as e:
            return {"success": False, "error": str(e)}

    if name == "verify_on_flare":
        try:
            result = fdc_oracle.submit_verification_request(args["tx_hash"])
            return {
                "success": True,
                "verified": result.get("verified", False),
                "tx_hash": result.get("tx_hash", ""),
                "status": result.get("status", ""),
                "message": result.get("message", ""),
                "roundId": result.get("roundId", 0),
                "details": result.get("details"),
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    if name == "get_fdc_proof":
        try:
            result = fdc_oracle.get_attestation_proof(args["round_id"])
            return {
                "success": True,
                "status": result["status"],
                "roundId": result["roundId"],
                "source": result["source"],
                "proof": result["proof"],
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    return {"success": False, "error": f"Unknown tool: {name}"}


# ---------------------------------------------------------------------------
# Map backend tool names → frontend card names + reshape output
# ---------------------------------------------------------------------------
# Frontend ToolCallCard.tsx checks toolCall.name to pick the card component:
#   "get_price"            → PriceCard        (expects: symbol, price, timestamp, source)
#   "get_random"           → RandomCard       (expects: randomNumber, range, isSecure, source, blockNumber)
#   "verify_on_flare"      → VerificationCard (expects: submission, proof with status/roundId/source)
#   "get_fdc_proof"        → VerificationCard (expects: status, roundId, source)
#   "list_supported_assets"→ AssetsCard       (expects: supported_symbols[], note)
#   anything else          → GenericCard      (renders JSON)

def map_tool_for_frontend(name: str, input_args: dict, output: dict) -> dict:
    """
    Return { "name": frontendName, "input": ..., "output": reshapedOutput }.
    """
    if name == "get_flare_price":
        return {
            "name": "get_price",
            "input": {"symbol": input_args.get("symbol", ""), "currency": "USD"},
            "output": {
                "symbol": output.get("symbol", ""),
                "price": output.get("price", 0),
                "timestamp": output.get("timestamp", 0),
                "source": "FTSO v2",
            },
        }

    if name in ("get_random_decision", "get_raw_random_number"):
        if name == "get_random_decision":
            num = output.get("score", 0)
        else:
            raw_str = output.get("random_number", "0")
            num = int(raw_str[:8]) if raw_str else 0
        return {
            "name": "get_random",
            "input": {"range": 100},
            "output": {
                "randomNumber": num,
                "range": 100,
                "isSecure": True,
                "source": "Flare Secure Random",
                "blockNumber": 0,
            },
        }

    # FDC tools and list_supported_assets → GenericCard (frontend renders JSON)
    return {
        "name": name,
        "input": input_args,
        "output": output,
    }


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(title="Flare Copilot Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MessageIn(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[MessageIn]


@app.post("/chat")
async def chat(req: ChatRequest):
    """
    Receive conversation messages, call Claude with Flare tools,
    execute any tool calls, and return the final response.
    """
    # Build messages for Anthropic API
    messages = [{"role": m.role, "content": m.content} for m in req.messages]

    collected_tool_calls: list[dict] = []

    try:
        # Agentic loop: keep calling Claude until it stops requesting tools
        while True:
            response = client.messages.create(
                model=MODEL,
                max_tokens=4096,
                system=SYSTEM_PROMPT,
                tools=TOOLS,
                messages=messages,
            )

            # Check if Claude wants to use tools
            if response.stop_reason != "tool_use":
                # Final text response — extract text blocks
                text_parts = [
                    block.text
                    for block in response.content
                    if block.type == "text"
                ]
                final_text = "\n".join(text_parts) if text_parts else ""
                break

            # Process tool use blocks
            assistant_content = response.content
            tool_results = []

            for block in assistant_content:
                if block.type != "tool_use":
                    continue

                tool_name = block.name
                tool_input = block.input
                tool_id = block.id

                print(f"[Tool Call] {tool_name}({tool_input})")

                # Execute the tool
                result = execute_tool(tool_name, tool_input)
                print(f"[Tool Result] {tool_name} -> success={result.get('success')}")

                # Map for frontend card display
                mapped = map_tool_for_frontend(tool_name, tool_input, result)
                collected_tool_calls.append({
                    "id": f"tc_{uuid.uuid4().hex[:8]}",
                    "name": mapped["name"],
                    "input": mapped["input"],
                    "output": mapped["output"],
                    "status": "success" if result.get("success") else "error",
                })

                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": tool_id,
                    "content": str(result),
                })

            # Feed tool results back into the conversation
            messages.append({"role": "assistant", "content": assistant_content})
            messages.append({"role": "user", "content": tool_results})

        return {
            "role": "assistant",
            "content": final_text,
            "toolCalls": collected_tool_calls if collected_tool_calls else None,
        }

    except Exception as e:
        traceback.print_exc()
        return {
            "role": "assistant",
            "content": f"Sorry, something went wrong: {e}",
            "toolCalls": collected_tool_calls if collected_tool_calls else None,
        }


@app.get("/lottery/roll")
async def lottery_roll():
    """Return a 5-digit number derived from Flare's on-chain random oracle.

    The oracle random number updates once per FTSO round (~90s), so we hash
    it with a unique nonce to produce a different 5-digit number on every call
    while still being seeded by real Flare on-chain randomness.
    """
    raw = random_oracle.get_random_number()
    nonce = f"{time.time_ns()}-{uuid.uuid4().hex}"
    digest = hashlib.sha256(f"{raw}-{nonce}".encode()).hexdigest()
    five_digits = int(digest[:12], 16) % 100000  # 00000–99999
    return {"number": five_digits}


@app.get("/health")
async def health():
    return {"status": "ok"}
