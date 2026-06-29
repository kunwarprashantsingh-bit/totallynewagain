import { Sector } from './constants';

export type Language = 'en' | 'zh';

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  category: Sector;
  trend: number[];
  url?: string;
}

export interface UserLocation {
  ip: string;
  city: string;
  region: string;
  country_name: string;
  timezone: string;
  utc_offset: string;
  latitude?: number;
  longitude?: number;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface ResearchReport {
  title: string;
  type: string;
  source: string;
  date: string;
  url?: string;
  abstract?: string;
}

export interface NewsArticle {
  title: string;
  summary: string;
  source: string;
  url: string;
  date: string;
  topic: string;
  sentiment?: 'Bullish' | 'Bearish' | 'Neutral';
  impact?: 'High' | 'Medium' | 'Low';
}

export interface PredictiveModelData {
  variable: string;
  impact: number;
  description: string;
}

export interface SupplyChainNode {
  id: string;
  name: string;
  status: 'optimal' | 'congested' | 'critical';
  lat: number;
  lng: number;
  description: string;
}

export interface ComplianceRegulation {
  id: string;
  region: string;
  title: string;
  status: 'active' | 'upcoming' | 'proposed';
  impactScore: number;
  description: string;
  esgCategory: 'environmental' | 'social' | 'governance';
}

export interface BenchmarkMetric {
  label: string;
  clientValue: number;
  globalAverage: number;
  unit: string;
}

export interface SentimentData {
  commodity: string;
  sentiment: number; // -1 to 1
  trend: 'up' | 'down' | 'neutral';
  topKeywords: string[];
  date: string; // ISO date string
}
