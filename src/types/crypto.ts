export interface CoinQuote {
  price: number
  volume_24h: number
  volume_change_24h: number
  percent_change_1h: number
  percent_change_24h: number
  percent_change_7d: number
  percent_change_30d: number
  percent_change_60d: number
  percent_change_90d: number
  market_cap: number
  market_cap_dominance: number
  fully_diluted_market_cap: number
  last_updated: string
}

export interface Coin {
  id: number
  name: string
  symbol: string
  slug: string
  cmc_rank: number
  num_market_pairs: number
  circulating_supply: number
  total_supply: number
  max_supply: number | null
  infinite_supply: boolean
  last_updated: string
  date_added: string
  tags: string[]
  platform: null | { id: number; name: string; symbol: string; slug: string; token_address: string }
  quote: {
    USD: CoinQuote
  }
}

export interface CoinInfo {
  id: number
  name: string
  symbol: string
  slug: string
  description: string
  logo: string
  urls: {
    website: string[]
    twitter: string[]
    reddit: string[]
    technical_doc: string[]
    source_code: string[]
  }
  date_added: string
  tags: string[]
  category: string
}

export interface ListingsResponse {
  status: {
    timestamp: string
    error_code: number
    error_message: string | null
    elapsed: number
    credit_count: number
  }
  data: Coin[]
}

export interface InfoResponse {
  status: {
    timestamp: string
    error_code: number
    error_message: string | null
    elapsed: number
    credit_count: number
  }
  data: Record<string, CoinInfo>
}

export interface QuoteResponse {
  status: {
    timestamp: string
    error_code: number
    error_message: string | null
    elapsed: number
    credit_count: number
  }
  data: Record<string, Coin>
}
