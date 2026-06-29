export const SECTORS = [
  'Energy',
  'Building Materials',
  'Shipping',
  'Steel',
  'Chemicals',
  'Mining',
  'Defense & Aerospace',
  'Agribusiness',
  'Logistics',
  'Industrial AI',
  'Pharmaceuticals',
  'Index'
] as const;

export type Sector = typeof SECTORS[number];

export const COMMODITIES = [
  'Steel',
  'Oil',
  'Natural Gas',
  'Cement',
  'Pharmaceuticals',
  'Copper',
  'Aluminum',
  'Lithium',
  'Nickel',
  'Gold',
  'Silver',
  'Iron Ore',
  'Coal',
  'Chemicals',
  'Fertilizers',
  'Lumber'
] as const;

export type Commodity = typeof COMMODITIES[number];

export const REGIONS = [
  'Latin and Central America',
  'North America',
  'Western Europe',
  'Eastern Europe',
  'Middle East',
  'Africa',
  'India',
  'China',
  'Asia -ex China',
  'Oceania'
] as const;

export type Region = typeof REGIONS[number];

export const NEWS_TOPICS = [
  'Cement',
  'Bulk Shipping',
  'Paper Industry',
  'Energy',
  'Steel',
  'Chemicals',
  'Mining',
  'Defense & Aerospace',
  'Logistics',
  'Pharmaceuticals'
] as const;

export type NewsTopic = typeof NEWS_TOPICS[number];

export const METHODOLOGIES = {
  "Predictive Market Modeler": {
    title: "Predictive Market Modeler",
    content: "Our Modeler utilizes recursive AI training on 50+ years of industrial datasets to simulate recursive market shifts. We don't just predict price; we model the systemic response of global manufacturing hubs to specific volatility triggers.",
    outcomes: [
      "94% Accuracy in 3-month commodity price corridors",
      "Identification of early-warning arbitrage windows",
      "Stress-testing of internal procurement hedges"
    ]
  },
  "Dynamic Supply Chain Map": {
    title: "Dynamic Supply Chain Map",
    content: "Unlike static GIS systems, our resilience map ingests real-time telemetry from port authorities, satellite vessel tracking (AIS), and internal logistical audits to provide a live bottleneck score for every node in your value chain.",
    outcomes: [
      "Real-time rerouting automation for critical components",
      "Dynamic lead-time forecasting with ±3% error margin",
      "Supplier health monitoring via autonomous risk scanning"
    ]
  },
  "Virtual AI Consultant": {
    title: "Virtual AI Consultant",
    content: "Survvi's Virtual Consultant uses Gemini 3.1 Pro architecture fine-tuned on industrial whitepapers and Survvi's private intelligence vaults. It parses your proprietary specs to find strategic 'blind spots' that general models miss.",
    outcomes: [
      "Automated gap analysis of internal industrial strategy",
      "Instant synthesis of regulatory impact for project bids",
      "Tailored mitigation tactics for specific operational risks"
    ]
  },
  "Global Compliance Tracker": {
    title: "Global Compliance Tracker",
    content: "Our tracker monitors 1,200+ regulatory bodies worldwide. It doesn't just alert; it maps the legislative ripple effects on your multi-regional operations, ensuring you are ahead of ESG mandates and CBAM tariffs.",
    outcomes: [
      "Zero-penalty compliance posture across all active regions",
      "Proactive carbon emission tax modeling for 2026-2030",
      "Automated ESG reporting readiness for institutional audits"
    ]
  },
  "Peer Benchmarking Vault": {
    title: "Peer Benchmarking Vault",
    content: "Access anonymized operational alpha from across the sector. We compare your energy intensity, water recycling, and digital maturity against the 'Survvi Alpha Group'—the top 5% of global industrial performers.",
    outcomes: [
      "Identification of energy-saving opportunities (avg. 12%)",
      "Validation of internal ROI for digital transformation",
      "Strategic gap assessment against top-quartile performers"
    ]
  },
  "Real-Time Sentiment Engine": {
    title: "Real-Time Sentiment Engine",
    content: "We ingest over 10M+ daily data points from industrial trade journals, quarterly earnings, and internal hub communication to map the 'Strategic Mood' of the market before it reflects in the BDI.",
    outcomes: [
      "Early identification of bullish/bearish commodity shifts",
      "Detection of hidden labor or logistical unrest signs",
      "Sentiment-weighted hedge positioning recommendations"
    ]
  }
};
