import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { COMPONENTS } from "../constants";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { ComponentCategory } from "../types";
import { ComponentIcon } from "../models/componentIcons";
import { getRecord } from "../services/data";

const ITEMS_PER_PAGE = 9;

const Library: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const categories = ["all", ...Object.values(ComponentCategory)];

  // Filtering Logic
  const filteredComponents = useMemo(() => {
    return COMPONENTS.filter((comp) => {
      const matchesSearch =
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || comp.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredComponents.length / ITEMS_PER_PAGE);
  const currentComponents = filteredComponents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6 pb-10 min-h-[80vh]">
      {/* Header & Controls */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              元器件库
            </h2>
            <p className="text-muted mt-1">
              收录 {COMPONENTS.length} 种核心电子元件
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface p-4 rounded-xl border border-border">
          {/* Category Tabs */}
          <div className="flex overflow-x-auto gap-2 w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                  ${
                    selectedCategory === cat
                      ? "bg-primary text-black shadow-lg shadow-primary/20"
                      : "bg-slate-800 text-muted hover:bg-slate-700 hover:text-white"
                  }
                `}
              >
                {cat === "all" ? "全部" : cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative group w-full md:w-64">
            <input
              type="text"
              placeholder="搜索名称、符号..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner text-white"
            />
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-muted group-hover:text-primary transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      {filteredComponents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {currentComponents.map((comp, index) => (
            <motion.div
              key={comp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: 0.2 + index * 0.05, // 等待页面动画完成后再开始
                ease: [0.22, 1, 0.36, 1]
              }}
              onClick={() => navigate(`/library/${comp.id}`)}
              className="group relative bg-surface border border-border rounded-2xl p-5 cursor-pointer overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] hover:-translate-y-1 flex gap-5 items-start"
            >
              <div className="flex-shrink-0">
                <ComponentIcon type={comp.type} />
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-2">
                    <span className="inline-block px-1.5 py-0.5 bg-slate-800 rounded text-[10px] font-mono text-primary border border-slate-700">
                      {comp.symbol}
                    </span>
                    <span className="inline-block px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-muted border border-slate-700">
                      {comp.category}
                    </span>
                    {(() => {
                      const rec = getRecord(comp.id);
                      const label = rec.status === "completed" ? "已学" : rec.status === "in_progress" ? "在学" : "未学";
                      const color = rec.status === "completed" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : rec.status === "in_progress" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "bg-slate-700 text-muted border-slate-600";
                      return (
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] border ${color}`}>
                          {label}{rec.count ? ` ×${rec.count}` : ""}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-1 leading-tight truncate">
                  {comp.name}
                </h3>
                <p className="text-xs text-muted line-clamp-2 h-8 leading-relaxed">
                  {comp.description}
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted">
          <Filter size={48} className="mx-auto mb-4 opacity-20" />
          <p>没有找到匹配的元器件</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-surface border border-border hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <span className="text-sm font-mono text-muted">
            第 <span className="text-white font-bold">{currentPage}</span> /{" "}
            {totalPages} 页
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-surface border border-border hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Library;
