import { createServerFn } from "@tanstack/react-start";
import { buildSignal, downsample, type Signal } from "./engine";

export type CoinRow = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  rank: number;
  price: number;
  change1h: number | null;
  change24h: number | null;
  change7d: number | null;
  volume: number;
  marketCap: number;
  spark: number[];
  signal: Signal;
};

export type Board =
  | {
      ok: true;
      fetchedAt: string;
      cached: boolean;
      btcDominance: number | null;
      marketChange24h: number | null;
      coins: CoinRow[];
    }
  | {
      ok: false;
      message: string;
      fetchedAt: string | null;
    };

type Cache = { at: number; board: Extract<Board, { ok: true }> };

let cache: Cache | null = null;

const MARKETS =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h,7d";
const GLOBAL = "https://api.coingecko.com/api/v3/global";

export const getBoard = createServerFn({ method: "GET" })
  .validator((input: { force?: boolean } | undefined) => ({
    force: Boolean(input && typeof input === "object" && input.force),
  }))
  .handler(async ({ data }): Promise<Board> => {
    const now = Date.now();
    if (cache && now - cache.at < 15_000) {
      return { ...cache.board, cached: true };
    }
    if (!data.force && cache && now - cache.at < 90_000) {
      return { ...cache.board, cached: true };
    }
    try {
      const board = await loadBoard();
      cache = { at: now, board };
      return board;
    } catch (error) {
      if (cache) return { ...cache.board, cached: true };
      const message = error instanceof Error ? error.message : "دریافت قیمت‌ها ناموفق بود";
      return { ok: false, message, fetchedAt: null };
    }
  });

async function loadBoard(): Promise<Extract<Board, { ok: true }>> {
  const headers = {
    accept: "application/json",
    "user-agent": "NabzSignals/1.0",
  };
  const [marketsRes, globalRes] = await Promise.all([
    fetch(MARKETS, { headers, signal: AbortSignal.timeout(12_000) }),
    fetch(GLOBAL, { headers, signal: AbortSignal.timeout(12_000) }),
  ]);
  if (marketsRes.status === 429) {
    throw new Error("کوین‌گکو محدودیت درخواست داده. چند ثانیه بعد تازه کنید.");
  }
  if (!marketsRes.ok) {
    throw new Error("قیمت‌ها از کوین‌گکو گرفته نشد.");
  }
  const markets: unknown = await marketsRes.json();
  if (!Array.isArray(markets)) {
    throw new Error("پاسخ کوین‌گکو قابل خواندن نیست.");
  }

  let btcDominance: number | null = null;
  let marketChange24h: number | null = null;
  if (globalRes.ok) {
    const globalBody: unknown = await globalRes.json();
    const root = asRecord(globalBody);
    const data = asRecord(root?.data);
    const pct = asRecord(data?.market_cap_percentage);
    if (typeof pct?.btc === "number") btcDominance = pct.btc;
    if (typeof data?.market_cap_change_percentage_24h_usd === "number") {
      marketChange24h = data.market_cap_change_percentage_24h_usd;
    }
  }

  const coins: CoinRow[] = [];
  for (const item of markets) {
    const row = asRecord(item);
    if (!row) continue;
    const id = str(row.id);
    const symbol = str(row.symbol);
    const name = (str(row.name) ?? "").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
    const price = num(row.current_price);
    if (!id || !symbol || !name || price == null || price <= 0) continue;
    const sparkRaw = asRecord(row.sparkline_in_7d);
    const sparkList = Array.isArray(sparkRaw?.price) ? sparkRaw.price.filter((v): v is number => typeof v === "number") : [];
    const signal = buildSignal({
      symbol,
      name,
      price,
      spark: sparkList,
      volume: num(row.total_volume) ?? 0,
      marketCap: num(row.market_cap) ?? 0,
      change1h: num(row.price_change_percentage_1h_in_currency),
      change7d: num(row.price_change_percentage_7d_in_currency),
    });
    coins.push({
      id,
      symbol: symbol.toUpperCase(),
      name,
      image: str(row.image) ?? "",
      rank: num(row.market_cap_rank) ?? coins.length + 1,
      price,
      change1h: num(row.price_change_percentage_1h_in_currency),
      change24h: num(row.price_change_percentage_24h_in_currency) ?? num(row.price_change_percentage_24h),
      change7d: num(row.price_change_percentage_7d_in_currency),
      volume: num(row.total_volume) ?? 0,
      marketCap: num(row.market_cap) ?? 0,
      spark: downsample(sparkList.length > 0 ? sparkList : [price], 72),
      signal,
    });
  }

  if (coins.length < 20) {
    throw new Error("فهرست ۱۰۰ ارز ناقص برگشت. دوباره تلاش کنید.");
  }

  return {
    ok: true,
    fetchedAt: new Date().toISOString(),
    cached: false,
    btcDominance,
    marketChange24h,
    coins,
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
