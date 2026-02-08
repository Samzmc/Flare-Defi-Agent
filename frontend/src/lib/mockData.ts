import { ChatResponse } from "./types";

const MOCK_DELAY = 1200;

interface MockPattern {
  keywords: string[];
  response: ChatResponse;
}

const mockPatterns: MockPattern[] = [
  {
    keywords: ["price", "flr", "cost"],
    response: {
      role: "assistant",
      content:
        "I checked the current FLR/USD price using the Flare Time Series Oracle (FTSO). The price is pulled directly from Flare's decentralized price feeds, which aggregate data from multiple providers for accuracy.",
      toolCalls: [
        {
          id: "tc_price_1",
          name: "get_price",
          input: { symbol: "FLR", currency: "USD" },
          output: {
            symbol: "FLR/USD",
            price: 0.0234,
            timestamp: Date.now(),
            source: "FTSO v2",
            decimals: 6,
          },
          status: "success",
        },
      ],
    },
  },
  {
    keywords: ["btc", "bitcoin"],
    response: {
      role: "assistant",
      content:
        "Here's the current BTC/USD price from the FTSO decentralized oracle. Flare's FTSO provides reliable price feeds without centralized intermediaries.",
      toolCalls: [
        {
          id: "tc_price_2",
          name: "get_price",
          input: { symbol: "BTC", currency: "USD" },
          output: {
            symbol: "BTC/USD",
            price: 97542.18,
            timestamp: Date.now(),
            source: "FTSO v2",
            decimals: 2,
          },
          status: "success",
        },
      ],
    },
  },
  {
    keywords: ["eth", "ethereum"],
    response: {
      role: "assistant",
      content:
        "Here's the current ETH/USD price fetched from Flare's FTSO decentralized oracle network.",
      toolCalls: [
        {
          id: "tc_price_3",
          name: "get_price",
          input: { symbol: "ETH", currency: "USD" },
          output: {
            symbol: "ETH/USD",
            price: 3156.42,
            timestamp: Date.now(),
            source: "FTSO v2",
            decimals: 2,
          },
          status: "success",
        },
      ],
    },
  },
  {
    keywords: ["balance", "wallet", "account"],
    response: {
      role: "assistant",
      content:
        "I've retrieved the wallet balance on the Coston2 testnet. This shows the native FLR token balance for the specified address.",
      toolCalls: [
        {
          id: "tc_balance_1",
          name: "get_balance",
          input: { address: "0x1234...abcd" },
          output: {
            address: "0x1234567890abcdef1234567890abcdef12345678",
            balance: "1250.75",
            symbol: "C2FLR",
            network: "Coston2 Testnet",
          },
          status: "success",
        },
      ],
    },
  },
  {
    keywords: ["send", "transfer", "transaction"],
    response: {
      role: "assistant",
      content:
        "I've prepared a transaction on the Coston2 testnet. Here are the transaction details for your review.",
      toolCalls: [
        {
          id: "tc_send_1",
          name: "send_transaction",
          input: {
            to: "0xabcd...1234",
            amount: "10.0",
            token: "C2FLR",
          },
          output: {
            txHash:
              "0xabc123def456789abc123def456789abc123def456789abc123def456789abcd",
            from: "0x1234567890abcdef1234567890abcdef12345678",
            to: "0xabcdef1234567890abcdef1234567890abcdef12",
            amount: "10.0",
            symbol: "C2FLR",
            status: "confirmed",
            blockNumber: 12345678,
          },
          status: "success",
        },
      ],
    },
  },
  {
    keywords: ["random", "number", "rng"],
    response: {
      role: "assistant",
      content:
        "I've generated a secure random number using Flare's on-chain random number generator. This uses the Secure Random protocol, which provides verifiable randomness from the Flare network's validator set.",
      toolCalls: [
        {
          id: "tc_random_1",
          name: "get_random",
          input: { range: 1000 },
          output: {
            randomNumber: 742,
            range: 1000,
            isSecure: true,
            source: "Flare Secure Random",
            blockNumber: 12345679,
          },
          status: "success",
        },
      ],
    },
  },
  {
    keywords: ["search", "find", "lookup", "info"],
    response: {
      role: "assistant",
      content:
        "I searched the Flare documentation and ecosystem for relevant information. Here's what I found.",
      toolCalls: [
        {
          id: "tc_search_1",
          name: "flare_search",
          input: { query: "Flare Network DeFi protocols" },
          output: {
            results: [
              {
                title: "Flare FTSO - Decentralized Price Oracle",
                snippet:
                  "The Flare Time Series Oracle provides decentralized price feeds...",
              },
              {
                title: "FAsssets - Cross-chain Asset Bridge",
                snippet:
                  "FAsssets enables trustless use of non-smart-contract tokens on Flare...",
              },
            ],
            totalResults: 2,
          },
          status: "success",
        },
      ],
    },
  },
];

const defaultResponse: ChatResponse = {
  role: "assistant",
  content:
    "I'm the Flare DeFi Agent! I can help you with:\n\n- **Check prices** - Get real-time crypto prices from Flare's FTSO oracle\n- **Wallet operations** - Check balances and send transactions on Coston2\n- **Random numbers** - Generate secure random numbers via Flare's protocol\n- **Search** - Look up information about Flare's ecosystem\n\nTry asking me something like \"What's the price of FLR?\" or \"Check my wallet balance\"!",
};

export function getMockResponse(userMessage: string): Promise<ChatResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lower = userMessage.toLowerCase();
      const match = mockPatterns.find((p) =>
        p.keywords.some((kw) => lower.includes(kw))
      );
      resolve(match ? match.response : defaultResponse);
    }, MOCK_DELAY);
  });
}
