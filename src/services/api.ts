import axios from 'axios'
import type { ListingsResponse, InfoResponse, QuoteResponse } from '../types/crypto'

const API_KEY = import.meta.env.VITE_CMC_API_KEY as string

const client = axios.create({
  baseURL: '/cmc-api',
  headers: {
    'X-CMC_PRO_API_KEY': API_KEY,
    Accept: 'application/json',
  },
})

export async function getListings(limit = 100, start = 1): Promise<ListingsResponse> {
  const { data } = await client.get<ListingsResponse>('/v1/cryptocurrency/listings/latest', {
    params: {
      start,
      limit,
      convert: 'USD',
      aux: 'num_market_pairs,circulating_supply,total_supply,max_supply',
    },
  })
  return data
}

export async function getCoinInfo(ids: number[]): Promise<InfoResponse> {
  const { data } = await client.get<InfoResponse>('/v2/cryptocurrency/info', {
    params: { id: ids.join(',') },
  })
  return data
}

export async function getCoinQuote(ids: number[]): Promise<QuoteResponse> {
  const { data } = await client.get<QuoteResponse>('/v2/cryptocurrency/quotes/latest', {
    params: {
      id: ids.join(','),
      convert: 'USD',
    },
  })
  return data
}
