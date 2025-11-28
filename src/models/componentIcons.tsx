import React from "react";
import { ComponentType } from "../types";

interface ComponentIconProps {
  type: ComponentType;
}

export const ComponentIcon: React.FC<ComponentIconProps> = ({ type }) => {
  const containerClass =
    "w-20 h-20 rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.5)] transform transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_20px_40px_rgba(6,182,212,0.3)] flex items-center justify-center relative overflow-hidden border border-white/5";

  let bgStyle: React.CSSProperties = {};
  let content = null;
  const gloss = (
    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-2xl z-20" />
  );

  switch (type) {
    case ComponentType.RESISTOR:
      bgStyle = {
        background: "radial-gradient(circle at 30% 30%, #fcd34d, #92400e)"
      };
      content = (
        <div className="w-14 h-5 bg-[#8B4513] rounded-full shadow-lg relative flex items-center justify-center z-10 border border-white/10">
          <div className="w-1.5 h-full bg-[#000] absolute left-3"></div>
          <div className="w-1.5 h-full bg-red-600 absolute right-5"></div>
        </div>
      );
      break;
    case ComponentType.CAPACITOR:
      bgStyle = {
        background: "radial-gradient(circle at 30% 30%, #38bdf8, #0c4a6e)"
      };
      content = (
        <div className="w-10 h-12 bg-slate-800 rounded-sm rounded-b-xl border-t-2 border-slate-400 shadow-xl z-10 flex justify-center">
          <div className="w-2 h-full bg-white/10 absolute right-0"></div>
        </div>
      );
      break;
    case ComponentType.MOSFET:
    case ComponentType.TRANSISTOR:
      bgStyle = {
        background: "radial-gradient(circle at 30% 30%, #d6d3d1, #44403c)"
      };
      content = (
        <div className="w-10 h-10 bg-[#111] rounded-t-md shadow-xl border-b-4 border-slate-600 z-10 flex items-center justify-center text-[6px] text-white">
          TO-220
        </div>
      );
      break;
    case ComponentType.IC:
    case ComponentType.OPTOCOUPLER:
      bgStyle = {
        background: "radial-gradient(circle at 30% 30%, #64748b, #1e293b)"
      };
      content = (
        <div className="w-14 h-10 bg-[#111] rounded-sm shadow-xl z-10 border border-slate-800 flex justify-between px-1 py-1">
          <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
        </div>
      );
      break;
    case ComponentType.LED:
      bgStyle = {
        background: "radial-gradient(circle at 30% 30%, #fca5a5, #991b1b)"
      };
      content = (
        <div className="w-8 h-10 bg-red-600 rounded-t-full rounded-b-md shadow-[0_0_15px_rgba(255,0,0,0.8)] z-10 border border-red-400"></div>
      );
      break;
    case ComponentType.ZENER_DIODE:
    case ComponentType.DIODE:
      bgStyle = {
        background: "radial-gradient(circle at 30% 30%, #f87171, #7f1d1d)"
      };
      content = (
        <div className="w-14 h-5 bg-black rounded-full border border-slate-800 z-10 relative overflow-hidden">
          <div className="absolute right-3 w-2 h-full bg-slate-300"></div>
        </div>
      );
      break;
    case ComponentType.VARISTOR:
      bgStyle = {
        background: "radial-gradient(circle at 30% 30%, #60a5fa, #1d4ed8)"
      };
      content = (
        <div className="w-12 h-12 bg-blue-600 rounded-full shadow-lg z-10 border border-blue-400"></div>
      );
      break;
    case ComponentType.INDUCTOR:
      bgStyle = {
        background: "radial-gradient(circle at 30% 30%, #a78bfa, #5b21b6)"
      };
      content = (
        <div className="w-12 h-12 relative z-10">
          <div className="w-full h-full rounded-full border-4 border-purple-400 shadow-lg"></div>
          <div className="absolute inset-0 rounded-full border-2 border-purple-300 opacity-50"></div>
        </div>
      );
      break;
    case ComponentType.POTENTIOMETER:
      bgStyle = {
        background: "radial-gradient(circle at 30% 30%, #fbbf24, #92400e)"
      };
      content = (
        <div className="w-12 h-12 bg-amber-600 rounded-full shadow-lg z-10 border border-amber-400 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-3 bg-amber-300 rounded-t-full"></div>
        </div>
      );
      break;
    case ComponentType.TRANSFORMER:
      bgStyle = {
        background: "radial-gradient(circle at 30% 30%, #f59e0b, #78350f)"
      };
      content = (
        <div className="w-14 h-12 relative z-10">
          <div className="w-6 h-full bg-slate-800 border-2 border-amber-400 rounded shadow-xl"></div>
          <div className="absolute right-0 top-0 w-6 h-full bg-slate-800 border-2 border-amber-400 rounded shadow-xl"></div>
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-1 h-full bg-amber-500"></div>
        </div>
      );
      break;
    case ComponentType.FUSE:
      bgStyle = {
        background: "radial-gradient(circle at 30% 30%, #f97316, #9a3412)"
      };
      content = (
        <div className="w-10 h-14 bg-slate-200 rounded-full shadow-lg z-10 border-2 border-orange-400 relative">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-1 bg-orange-600 rounded"></div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-6 h-1 bg-orange-600 rounded"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 bg-orange-500"></div>
        </div>
      );
      break;
    case ComponentType.CRYSTAL:
      bgStyle = {
        background: "radial-gradient(circle at 30% 30%, #cbd5e1, #475569)"
      };
      content = (
        <div className="w-12 h-8 bg-slate-300 rounded-full shadow-lg z-10 border-2 border-slate-400 relative">
          <div className="absolute top-1 left-1 w-2 h-2 bg-slate-500 rounded-full"></div>
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-slate-500 rounded-full"></div>
        </div>
      );
      break;
    case ComponentType.THERMISTOR:
      bgStyle = {
        background: "radial-gradient(circle at 30% 30%, #dc2626, #991b1b)"
      };
      content = (
        <div className="w-12 h-6 bg-red-800 rounded-full shadow-lg relative flex items-center justify-center z-10 border border-red-400">
          <div className="w-1.5 h-full bg-red-600 absolute left-3"></div>
          <div className="w-1.5 h-full bg-red-600 absolute right-3"></div>
        </div>
      );
      break;
    case ComponentType.THYRISTOR:
      bgStyle = {
        background: "radial-gradient(circle at 30% 30%, #e879f9, #86198f)"
      };
      content = (
        <div className="w-10 h-10 bg-purple-800 rounded-full shadow-xl z-10 border-2 border-purple-400 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 border-2 border-purple-300 rounded-full"></div>
        </div>
      );
      break;
    case ComponentType.RELAY:
      bgStyle = {
        background: "radial-gradient(circle at 30% 30%, #34d399, #065f46)"
      };
      content = (
        <div className="w-14 h-10 bg-slate-100 rounded shadow-xl z-10 border-2 border-emerald-400 relative">
          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-600 rounded-full"></div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-6 bg-slate-400 rounded"></div>
        </div>
      );
      break;
    case ComponentType.SPEAKER:
      bgStyle = {
        background: "radial-gradient(circle at 30% 30%, #f472b6, #9f1239)"
      };
      content = (
        <div className="w-12 h-12 bg-pink-600 rounded-full shadow-lg z-10 border-2 border-pink-400 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-pink-300 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-pink-100 rounded-full"></div>
        </div>
      );
      break;
    case ComponentType.SWITCH:
      bgStyle = {
        background: "radial-gradient(circle at 30% 30%, #84cc16, #365314)"
      };
      content = (
        <div className="w-12 h-8 bg-lime-600 rounded shadow-lg z-10 border-2 border-lime-400 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-4 bg-lime-300 rounded"></div>
        </div>
      );
      break;
    default:
      bgStyle = {
        background: "radial-gradient(circle at 30% 30%, #94a3b8, #475569)"
      };
      content = (
        <div className="z-10 w-8 h-8 bg-white/20 rounded shadow-inner" />
      );
  }

  return (
    <div style={bgStyle} className={containerClass}>
      {gloss}
      {content}
    </div>
  );
};
