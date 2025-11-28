import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Play, RotateCcw, Trash2, Battery, Lightbulb, ToggleLeft, Zap, RotateCw } from 'lucide-react';

interface Element {
  id: string;
  type: 'battery' | 'led' | 'resistor' | 'switch';
  x: number;
  y: number;
  rotation: number; // 0, 90, 180, 270
  properties: {
    isOpen?: boolean; // For switch
    color?: string; // For LED
  };
}

interface Wire {
  id: string;
  start: { x: number, y: number };
  end: { x: number, y: number };
}

// 辅助：获取旋转后的端口坐标
const getTerminals = (el: Element) => {
  const rad = (el.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  // 假设元件宽度大概是 50px (中心到两端各 25px)
  // Battery 稍微窄一点 40px (各 20px)
  const offset = el.type === 'battery' ? 20 : 25;

  // 左端口 (Terminal A)
  const tax = el.x + (-offset * cos);
  const tay = el.y + (-offset * sin);
  
  // 右端口 (Terminal B)
  const tbx = el.x + (offset * cos);
  const tby = el.y + (offset * sin);

  return [
    { x: Math.round(tax), y: Math.round(tay) },
    { x: Math.round(tbx), y: Math.round(tby) }
  ];
};

const Simulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<Element[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [draggedEl, setDraggedEl] = useState<string | null>(null);
  const [mode, setMode] = useState<'move' | 'wire'>('move');
  const [wireStart, setWireStart] = useState<{x:number, y:number} | null>(null);
  const [energizedIds, setEnergizedIds] = useState<Set<string>>(new Set());

  // --- SIMULATION ENGINE ---
  useEffect(() => {
    if (!isSimulating) {
      setEnergizedIds(new Set());
      return;
    }

    // 1. 构建图网络
    const adj = new Map<string, Array<{ id: string, type: 'wire' | 'component', to: string }>>();
    
    const addEdge = (p1: string, p2: string, id: string, type: 'wire' | 'component') => {
      if (!adj.has(p1)) adj.set(p1, []);
      if (!adj.has(p2)) adj.set(p2, []);
      adj.get(p1)!.push({ id, type, to: p2 });
      adj.get(p2)!.push({ id, type, to: p1 });
    };

    // 添加导线
    wires.forEach(w => {
      const p1 = `${w.start.x},${w.start.y}`;
      const p2 = `${w.end.x},${w.end.y}`;
      addEdge(p1, p2, w.id, 'wire');
    });

    // 添加元件
    const batteries: string[] = [];
    elements.forEach(el => {
      const terminals = getTerminals(el);
      const p1 = `${terminals[0].x},${terminals[0].y}`;
      const p2 = `${terminals[1].x},${terminals[1].y}`;

      if (el.type === 'switch' && el.properties.isOpen) {
        // 断开的开关不添加边
        return; 
      }
      
      addEdge(p1, p2, el.id, 'component');
      if (el.type === 'battery') batteries.push(el.id);
    });

    // 2. 电路分析 (简单的闭合回路检测)
    // 算法：从电池正极出发 BFS，从电池负极出发 BFS。
    // 如果一个节点同时被正极和负极访问到（且通过了有效路径），则该路径通电。
    // 简化版：找到所有能同时到达电池两端的节点和边。

    const activeSet = new Set<string>();

    batteries.forEach(batId => {
      const bat = elements.find(e => e.id === batId)!;
      const terms = getTerminals(bat);
      // 假设 Terminal 0 是负极，1 是正极 (基于绘制逻辑: 左负右正)
      // 旋转后依然成立
      const posNode = `${terms[1].x},${terms[1].y}`;
      const negNode = `${terms[0].x},${terms[0].y}`;

      // BFS 寻找所有从正极可达的节点
      const reachableFromPos = new Set<string>();
      const queuePos = [posNode];
      reachableFromPos.add(posNode);
      
      // 记录前驱边以便回溯（可选），这里只需要可达性
      while(queuePos.length > 0) {
        const curr = queuePos.shift()!;
        const neighbors = adj.get(curr) || [];
        neighbors.forEach(n => {
          if (n.id === batId) return; // 不穿过电池本身
          if (!reachableFromPos.has(n.to)) {
            reachableFromPos.add(n.to);
            queuePos.push(n.to);
          }
        });
      }

      // 如果负极不可达，说明开路
      if (!reachableFromPos.has(negNode)) return;

      // 反向搜索：从负极出发，但这只限于 reachableFromPos 中的节点
      // 这样求交集，确定闭合回路
      const inLoopNodes = new Set<string>();
      const queueNeg = [negNode];
      inLoopNodes.add(negNode);

      while(queueNeg.length > 0) {
        const curr = queueNeg.shift()!;
        const neighbors = adj.get(curr) || [];
        neighbors.forEach(n => {
           if (n.id === batId) return;
           // 关键：必须是正极也能到达的节点，才是在回路中
           if (reachableFromPos.has(n.to) && !inLoopNodes.has(n.to)) {
             inLoopNodes.add(n.to);
             queueNeg.push(n.to);
           }
        });
      }

      // 收集所有连接这些有效节点的边
      inLoopNodes.forEach(node => {
        const neighbors = adj.get(node) || [];
        neighbors.forEach(n => {
          if (n.id === batId) return; // 电池单独处理
          if (inLoopNodes.has(n.to)) {
            activeSet.add(n.id);
          }
        });
      });
      activeSet.add(batId); // 电池自己也算通电
    });

    setEnergizedIds(activeSet);

  }, [elements, wires, isSimulating]);


  // --- DRAWING LOGIC ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let x=0; x<canvas.width; x+=20) { ctx.moveTo(x,0); ctx.lineTo(x, canvas.height); }
    for(let y=0; y<canvas.height; y+=20) { ctx.moveTo(0,y); ctx.lineTo(canvas.width, y); }
    ctx.stroke();

    // Wires
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    wires.forEach(w => {
      const isEnergized = energizedIds.has(w.id);
      ctx.strokeStyle = isEnergized ? '#fbbf24' : '#475569'; 
      ctx.lineWidth = isEnergized ? 4 : 3;
      ctx.shadowBlur = isEnergized ? 15 : 0;
      ctx.shadowColor = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(w.start.x, w.start.y);
      ctx.lineTo(w.end.x, w.end.y);
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Preview temp wire
    if (wireStart && mode === 'wire') {
       // We can't easily get mouse pos here without state, but user UX is ok without live preview line for MVP
       // Or we could track mouse move in state, but simpler to mark start point
       ctx.fillStyle = '#fbbf24';
       ctx.beginPath();
       ctx.arc(wireStart.x, wireStart.y, 4, 0, Math.PI*2);
       ctx.fill();
    }

    // Elements
    elements.forEach(el => {
      const isEnergized = energizedIds.has(el.id);
      
      ctx.save();
      ctx.translate(el.x, el.y);
      ctx.rotate((el.rotation * Math.PI) / 180);

      // Highlight if selected/dragged
      if (draggedEl === el.id) {
         ctx.strokeStyle = '#06b6d4';
         ctx.lineWidth = 1;
         ctx.strokeRect(-30, -30, 60, 60);
      }

      // Draw Terminals (Connection points)
      const offset = el.type === 'battery' ? 20 : 25;
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath(); ctx.arc(-offset, 0, 3, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(offset, 0, 3, 0, Math.PI*2); ctx.fill();

      // Draw Component Symbol
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2;
      ctx.fillStyle = '#0f172a';
      
      switch(el.type) {
        case 'battery':
          ctx.beginPath();
          // Wire lines
          ctx.moveTo(-20, 0); ctx.lineTo(-10, 0);
          ctx.moveTo(10, 0); ctx.lineTo(20, 0);
          ctx.stroke();
          // Battery Symbol
          ctx.beginPath();
          ctx.moveTo(-10, -15); ctx.lineTo(-10, 15); // Long
          ctx.lineWidth = 4; ctx.stroke();
          ctx.beginPath(); ctx.lineWidth=2;
          ctx.moveTo(10, -8); ctx.lineTo(10, 8); // Short
          ctx.lineWidth = 4; ctx.stroke();
          // Text
          ctx.fillStyle = '#64748b'; 
          ctx.save(); ctx.rotate(-(el.rotation * Math.PI)/180); // Keep text straight
          ctx.font='10px Inter'; ctx.fillText('9V', -6, -20);
          ctx.restore();
          break;
          
        case 'led':
          // Wires
          ctx.beginPath(); ctx.moveTo(-25,0); ctx.lineTo(-10,0); ctx.moveTo(10,0); ctx.lineTo(25,0); ctx.stroke();
          // Body
          ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI*2);
          ctx.fillStyle = isEnergized ? '#ef4444' : '#334155';
          if(isEnergized) { ctx.shadowBlur = 20; ctx.shadowColor = '#ef4444'; }
          ctx.fill(); ctx.shadowBlur = 0;
          ctx.stroke();
          // Reflection
          if(!isEnergized) {
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.beginPath(); ctx.arc(-3, -3, 3, 0, Math.PI*2); ctx.fill();
          }
          break;

        case 'resistor':
          ctx.beginPath(); ctx.moveTo(-25,0); ctx.lineTo(-15,0); ctx.moveTo(15,0); ctx.lineTo(25,0); ctx.stroke();
          ctx.beginPath();
          ctx.rect(-15, -6, 30, 12);
          ctx.fillStyle = '#1e293b'; ctx.fill(); ctx.stroke();
          // Bands
          ctx.fillStyle = '#b45309'; ctx.fillRect(-10, -6, 4, 12);
          ctx.fillStyle = '#000000'; ctx.fillRect(-3, -6, 4, 12);
          ctx.fillStyle = '#dc2626'; ctx.fillRect(4, -6, 4, 12);
          break;

        case 'switch':
          ctx.beginPath(); ctx.moveTo(-25,0); ctx.lineTo(-15,0); ctx.moveTo(15,0); ctx.lineTo(25,0); ctx.stroke();
          ctx.beginPath(); ctx.arc(-15, 0, 2, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(15, 0, 2, 0, Math.PI*2); ctx.fill();
          
          ctx.beginPath();
          ctx.lineWidth = 3;
          if (el.properties.isOpen) {
            // Open state
            ctx.moveTo(-15, 0); ctx.lineTo(12, -15);
          } else {
            // Closed state
            ctx.moveTo(-15, 0); ctx.lineTo(15, 0);
          }
          ctx.stroke();
          break;
      }
      ctx.restore();
    });

  }, [elements, wires, isSimulating, energizedIds, draggedEl, mode, wireStart]);

  // --- INTERACTION ---
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'move') {
      // Find clicked element (simple radius check)
      const clickedEl = elements.find(el => Math.hypot(el.x - x, el.y - y) < 25);
      
      if (clickedEl) {
        // Toggle Switch on Click (if not dragging)
        if (clickedEl.type === 'switch') {
           // We'll handle toggle in MouseUp to distinguish from drag, 
           // but for simple MVP, toggle here is fine if not moved much.
           // Let's rely on DoubleClick for rotation, Click for select/drag. 
           // Switch toggle logic: Check distance from center? 
        }
        setDraggedEl(clickedEl.id);
      }
    } else if (mode === 'wire') {
      // Snap to nearest 20 grid
      const snapX = Math.round(x/20)*20;
      const snapY = Math.round(y/20)*20;
      
      if (!wireStart) {
        setWireStart({x: snapX, y: snapY});
      } else {
        // Create wire
        if (wireStart.x !== snapX || wireStart.y !== snapY) {
            setWires([...wires, { id: 'w-'+Date.now(), start: wireStart, end: {x:snapX, y:snapY} }]);
        }
        setWireStart(null);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mode === 'move' && draggedEl) {
      const rect = canvasRef.current!.getBoundingClientRect();
      // Snap to grid for cleaner alignment
      const x = Math.round((e.clientX - rect.left)/20)*20; 
      const y = Math.round((e.clientY - rect.top)/20)*20;
      
      setElements(els => els.map(el => el.id === draggedEl ? { ...el, x, y } : el));
    }
  };

  const handleMouseUp = () => {
    setDraggedEl(null);
  };

  const handleClick = (e: React.MouseEvent) => {
     const rect = canvasRef.current!.getBoundingClientRect();
     const x = e.clientX - rect.left;
     const y = e.clientY - rect.top;
     
     // Switch Toggle Logic
     const clickedEl = elements.find(el => Math.hypot(el.x - x, el.y - y) < 25);
     if (clickedEl && clickedEl.type === 'switch') {
        setElements(els => els.map(el => el.id === clickedEl.id ? { 
            ...el, 
            properties: { ...el.properties, isOpen: !el.properties.isOpen } 
        } : el));
     }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickedEl = elements.find(el => Math.hypot(el.x - x, el.y - y) < 25);
    if (clickedEl) {
        setElements(els => els.map(el => el.id === clickedEl.id ? { 
            ...el, 
            rotation: (el.rotation + 90) % 360
        } : el));
    }
  }

  const addElement = (type: Element['type']) => {
    setElements([...elements, { 
      id: 'el-'+Date.now(), 
      type, 
      x: 100 + elements.length * 20, 
      y: 100 + elements.length * 20, 
      rotation: 0,
      properties: { isOpen: true } // Default open for switches
    }]);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <div>
           <h2 className="text-2xl font-bold text-white flex items-center gap-2">
             <Zap className="text-yellow-400" /> 仿真实验室 <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/20">BETA</span>
           </h2>
           <p className="text-xs text-muted mt-1">
             双击元件旋转90° • 点击开关切换状态 • 连接红色LED查看效果
           </p>
        </div>
        <div className="flex gap-4">
           <div className="flex bg-slate-800 rounded-lg p-1 border border-border">
              <button onClick={()=>setMode('move')} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-all ${mode==='move'?'bg-slate-600 text-white shadow':'text-muted hover:text-white'}`}>移动 / 操作</button>
              <button onClick={()=>setMode('wire')} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-all ${mode==='wire'?'bg-slate-600 text-white shadow':'text-muted hover:text-white'}`}>连线模式</button>
           </div>
           <button 
             onClick={() => setIsSimulating(!isSimulating)}
             className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold transition-all shadow-lg ${isSimulating ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20' : 'bg-emerald-500 text-slate-900 hover:bg-emerald-400 shadow-emerald-500/20'}`}
           >
             {isSimulating ? <RotateCcw size={18}/> : <Play size={18}/>}
             {isSimulating ? '停止运行' : '运行仿真'}
           </button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Sidebar */}
        <div className="w-52 bg-surface border border-border rounded-xl p-4 flex flex-col gap-2 shadow-xl z-10">
          <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">电源</div>
          <button onClick={() => addElement('battery')} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700 hover:border-slate-500 transition-all border border-transparent group">
            <Battery className="text-yellow-400 group-hover:scale-110 transition-transform" /> 
            <span className="text-sm font-medium">9V 电池</span>
          </button>
          
          <div className="text-[10px] font-bold text-muted uppercase tracking-wider mt-2 mb-1">输出器件</div>
          <button onClick={() => addElement('led')} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700 hover:border-slate-500 transition-all border border-transparent group">
            <Lightbulb className="text-rose-400 group-hover:scale-110 transition-transform" /> 
            <span className="text-sm font-medium">LED (红)</span>
          </button>

          <div className="text-[10px] font-bold text-muted uppercase tracking-wider mt-2 mb-1">控制与基础</div>
          <button onClick={() => addElement('switch')} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700 hover:border-slate-500 transition-all border border-transparent group">
            <ToggleLeft className="text-slate-300 group-hover:scale-110 transition-transform" /> 
            <span className="text-sm font-medium">开关</span>
          </button>
          <button onClick={() => addElement('resistor')} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700 hover:border-slate-500 transition-all border border-transparent group">
            <div className="w-5 h-2 bg-amber-700 rounded-sm group-hover:scale-110 transition-transform"></div> 
            <span className="text-sm font-medium">电阻</span>
          </button>

          <div className="mt-auto pt-4 border-t border-border">
             <button onClick={()=>{setElements([]); setWires([]); setEnergizedIds(new Set())}} className="flex items-center justify-center gap-2 w-full p-2.5 text-rose-400 hover:bg-rose-950/30 rounded-lg text-sm border border-transparent hover:border-rose-900/50 transition-colors">
               <Trash2 size={16} /> 清空画布
             </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-[#0f172a] rounded-xl border border-border relative overflow-hidden cursor-crosshair shadow-inner group">
           <div className="absolute inset-0 opacity-20 pointer-events-none" 
               style={{ 
                 backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
                 backgroundSize: '20px 20px' 
               }} 
           />
           <canvas 
             ref={canvasRef}
             width={1200}
             height={800}
             className="w-full h-full"
             onMouseDown={handleMouseDown}
             onMouseMove={handleMouseMove}
             onMouseUp={handleMouseUp}
             onClick={handleClick}
             onDoubleClick={handleDoubleClick}
           />
           {mode === 'wire' && (
             <div className="absolute top-4 left-4 bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-lg text-xs border border-yellow-500/20 backdrop-blur font-medium flex items-center gap-2">
               <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
               连线模式：点击起点 -> 点击终点
             </div>
           )}
           {mode === 'move' && (
             <div className="absolute top-4 left-4 bg-slate-700/30 text-slate-300 px-3 py-1.5 rounded-lg text-xs border border-slate-600/30 backdrop-blur">
               操作提示：拖拽移动 • 双击旋转 • 点击开关
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Simulation;