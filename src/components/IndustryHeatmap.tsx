import React from 'react';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const IndustryHeatmap = () => {
  const getSectorColor = (score: number) => {
    if (score >= 90) return "bg-emerald-600";
    if (score >= 70) return "bg-emerald-400";
    if (score >= 50) return "bg-amber-500";
    if (score >= 30) return "bg-red-400";
    return "bg-red-600";
  };

  const sectors = [
    { name: "Energy", score: 85, trend: "up", url: "https://www.iea.org/reports/world-energy-outlook-2023" },
    { name: "Cement", score: 42, trend: "down", url: "https://www.globalcement.com/news" },
    { name: "Steel", score: 68, trend: "up", url: "https://worldsteel.org/steel-topics/statistics/" },
    { name: "Logistics", score: 55, trend: "stable", url: "https://www.dhl.com/global-en/home/insights-and-innovation/thought-leadership/trend-reports.html" },
    { name: "Chemicals", score: 72, trend: "up", url: "https://www.americanchemistry.com/chemistry-in-america/data-statistics" },
    { name: "Rare Earths", score: 91, trend: "up", url: "https://www.usgs.gov/centers/national-minerals-information-center/rare-earths-statistics-and-information" },
    { name: "Defense", score: 89, trend: "up", url: "https://www.defenseaerospace.com/news" },
    { name: "Pharma", score: 63, trend: "stable", url: "https://www.iqvia.com/insights/the-iqvia-institute/reports" },
    { name: "Agri", score: 38, trend: "down", url: "https://www.fao.org/worldfoodsituation/foodpricesindex/en/" },
    { name: "Shipping", score: 77, trend: "up", url: "https://www.balticexchange.com/en/data-services/market-information0/indices.html" },
    { name: "AI", score: 95, trend: "up", url: "https://aiindex.stanford.edu/report/" },
  ].map(s => ({ ...s, color: getSectorColor(s.score) }));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-4">
      {sectors.map((sector, i) => (
        <motion.a
          key={i}
          href={sector.url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="p-6 bg-surface border border-text/10 rounded-2xl hover:border-accent/40 transition-all group relative overflow-hidden block"
        >
          <div className={cn("absolute top-0 left-0 w-1 h-full opacity-40", sector.color)} />
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text/40">{sector.name}</span>
            {sector.trend === 'up' ? <ArrowUpRight className="w-3 h-3 text-emerald-400" /> : sector.trend === 'down' ? <ArrowDownRight className="w-3 h-3 text-red-400" /> : <ArrowRight className="w-3 h-3 text-text/20" />}
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold">{sector.score}</span>
            <span className="text-[10px] text-text/20 mb-1 font-bold">IDX</span>
          </div>
          <div className="mt-4 h-1 w-full bg-surface rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${sector.score}%` }}
              className={cn("h-full", sector.color)}
            />
          </div>
        </motion.a>
      ))}
    </div>
  );
};

