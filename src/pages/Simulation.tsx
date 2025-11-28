import React, { useRef, useEffect, useState } from "react";
import {
  Play,
  RotateCcw,
  Battery,
  Lightbulb,
  ToggleLeft,
  Zap,
  XCircle,
  MousePointer2,
  Trash2
} from "lucide-react";

interface Element {
  id: string;
  type: "battery" | "led" | "resistor" | "switch";
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
  start: { x: number; y: number };
  end: { x: number; y: number };
}

// --- CONFIGURATION ---
const SCALE = 2.0;
const GRID_SIZE = 20 * SCALE; // 40px
// 让端口偏移量等于网格大小，这样旋转后端口依然在网格点上
const TERMINAL_OFFSET = GRID_SIZE * 1;
const HIT_RADIUS = 25 * SCALE;
const WIRE_HIT_TOLERANCE = 15; // 导线点击容差

// 辅助：获取鼠标在 Canvas 内部的真实坐标
const getCanvasCoordinates = (
  e: React.MouseEvent | MouseEvent,
  canvas: HTMLCanvasElement
) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
};

// 辅助：获取旋转后的端口坐标
const getTerminals = (el: Element) => {
  const rad = (el.rotation * Math.PI) / 180;
  // Math.cos/sin for 90 degree increments can have floating point errors, round them
  const cos = Math.round(Math.cos(rad));
  const sin = Math.round(Math.sin(rad));

  const offset = TERMINAL_OFFSET;

  // 左端口 (Terminal A)
  const tax = el.x + -offset * cos;
  const tay = el.y + -offset * sin;

  // 右端口 (Terminal B)
  const tbx = el.x + offset * cos;
  const tby = el.y + offset * sin;

  return [
    { x: tax, y: tay },
    { x: tbx, y: tby }
  ];
};

// 辅助：点到线段的距离（用于选中导线）
const distToSegment = (
  p: { x: number; y: number },
  v: { x: number; y: number },
  w: { x: number; y: number }
) => {
  const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(
    p.x - (v.x + t * (w.x - v.x)),
    p.y - (v.y + t * (w.y - v.y))
  );
};

const Simulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<Element[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [draggedEl, setDraggedEl] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null); // 新增：选中项 ID

  const [mode, setMode] = useState<"move" | "wire">("move");
  const [wireStart, setWireStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null
  ); // 用于预览

  const [energizedIds, setEnergizedIds] = useState<Set<string>>(new Set());
  const [cursor, setCursor] = useState("default");

  // 当进入仿真模式时，取消所有选择和连线状态
  useEffect(() => {
    if (isSimulating) {
      setSelectedId(null);
      setDraggedEl(null);
      setWireStart(null);
      setMode("move");
    }
  }, [isSimulating]);

  // --- KEYBOARD LISTENERS (DELETE) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 仿真运行时禁止删除
      if (isSimulating) return;

      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        deleteItem(selectedId);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, elements, wires, isSimulating]);

  const deleteItem = (id: string) => {
    setElements((prev) => prev.filter((e) => e.id !== id));
    setWires((prev) => prev.filter((w) => w.id !== id));
    setSelectedId(null);
    setEnergizedIds(new Set()); // Reset sim visual
  };

  // --- SIMULATION ENGINE ---
  useEffect(() => {
    if (!isSimulating) {
      setEnergizedIds(new Set());
      return;
    }

    const adj = new Map<
      string,
      Array<{ id: string; type: "wire" | "component"; to: string }>
    >();

    const addEdge = (
      p1: string,
      p2: string,
      id: string,
      type: "wire" | "component"
    ) => {
      if (!adj.has(p1)) adj.set(p1, []);
      if (!adj.has(p2)) adj.set(p2, []);
      adj.get(p1)!.push({ id, type, to: p2 });
      adj.get(p2)!.push({ id, type, to: p1 });
    };

    wires.forEach((w) => {
      const p1 = `${w.start.x},${w.start.y}`;
      const p2 = `${w.end.x},${w.end.y}`;
      addEdge(p1, p2, w.id, "wire");
    });

    const batteries: string[] = [];
    elements.forEach((el) => {
      const terminals = getTerminals(el);
      const p1 = `${terminals[0].x},${terminals[0].y}`;
      const p2 = `${terminals[1].x},${terminals[1].y}`;

      if (el.type === "switch" && el.properties.isOpen) {
        return;
      }

      addEdge(p1, p2, el.id, "component");
      if (el.type === "battery") batteries.push(el.id);
    });

    const activeSet = new Set<string>();

    batteries.forEach((batId) => {
      const bat = elements.find((e) => e.id === batId)!;
      const terms = getTerminals(bat);
      const posNode = `${terms[1].x},${terms[1].y}`;
      const negNode = `${terms[0].x},${terms[0].y}`;

      // Check connectivity from Positive
      const reachableFromPos = new Set<string>();
      const queuePos = [posNode];
      reachableFromPos.add(posNode);

      while (queuePos.length > 0) {
        const curr = queuePos.shift()!;
        const neighbors = adj.get(curr) || [];
        neighbors.forEach((n) => {
          if (n.id === batId) return;
          if (!reachableFromPos.has(n.to)) {
            reachableFromPos.add(n.to);
            queuePos.push(n.to);
          }
        });
      }

      // Check if Negative is reachable from Positive (Closed Loop)
      if (!reachableFromPos.has(negNode)) return;

      // Backtrack / Find loop path
      const inLoopNodes = new Set<string>();
      const queueNeg = [negNode];
      inLoopNodes.add(negNode);

      while (queueNeg.length > 0) {
        const curr = queueNeg.shift()!;
        const neighbors = adj.get(curr) || [];
        neighbors.forEach((n) => {
          if (n.id === batId) return;
          if (reachableFromPos.has(n.to) && !inLoopNodes.has(n.to)) {
            inLoopNodes.add(n.to);
            queueNeg.push(n.to);
          }
        });
      }

      // Mark components in loop as energized
      inLoopNodes.forEach((node) => {
        const neighbors = adj.get(node) || [];
        neighbors.forEach((n) => {
          if (n.id === batId) return;
          if (inLoopNodes.has(n.to)) {
            activeSet.add(n.id);
          }
        });
      });
      activeSet.add(batId);
    });

    setEnergizedIds(activeSet);
  }, [elements, wires, isSimulating]);

  // --- DRAWING LOGIC ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x += GRID_SIZE) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
    }
    for (let y = 0; y < canvas.height; y += GRID_SIZE) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    // Wires
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    wires.forEach((w) => {
      const isEnergized = energizedIds.has(w.id);
      const isSelected = selectedId === w.id;

      ctx.beginPath();
      ctx.moveTo(w.start.x, w.start.y);
      ctx.lineTo(w.end.x, w.end.y);

      // Selection Glow
      if (isSelected) {
        ctx.shadowColor = "#06b6d4";
        ctx.shadowBlur = 10;
        ctx.strokeStyle = "#06b6d4";
        ctx.lineWidth = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Main Wire
      ctx.strokeStyle = isEnergized
        ? "#fbbf24"
        : isSelected
        ? "#06b6d4"
        : "#475569";
      ctx.lineWidth = isEnergized ? 6 : 4;

      if (isEnergized) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#fbbf24";
      }

      ctx.stroke();
      ctx.shadowBlur = 0;

      // Wire Endpoints (Joints)
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath();
      ctx.arc(w.start.x, w.start.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w.end.x, w.end.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Preview temp wire (L-Shape Orthogonal)
    if (wireStart && mode === "wire" && mousePos) {
      // Snap mousePos for preview
      const snapX = Math.round(mousePos.x / GRID_SIZE) * GRID_SIZE;
      const snapY = Math.round(mousePos.y / GRID_SIZE) * GRID_SIZE;

      ctx.strokeStyle = "rgba(251, 191, 36, 0.6)"; // Yellow translucent
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);

      ctx.beginPath();
      ctx.moveTo(wireStart.x, wireStart.y);

      // Orthogonal Routing: Move Horizontal first, then Vertical
      ctx.lineTo(snapX, wireStart.y); // Corner
      ctx.lineTo(snapX, snapY); // End

      ctx.stroke();
      ctx.setLineDash([]);

      // Start Point Dot
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(wireStart.x, wireStart.y, 5, 0, Math.PI * 2);
      ctx.fill();
      // Corner Point
      ctx.beginPath();
      ctx.arc(snapX, wireStart.y, 3, 0, Math.PI * 2);
      ctx.fill();
      // End Point Target
      ctx.beginPath();
      ctx.arc(snapX, snapY, 5, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Elements
    elements.forEach((el) => {
      const isEnergized = energizedIds.has(el.id);
      const isSelected = selectedId === el.id;

      ctx.save();
      ctx.translate(el.x, el.y);
      ctx.rotate((el.rotation * Math.PI) / 180);

      // Selection Box
      if (isSelected || draggedEl === el.id) {
        ctx.strokeStyle = "#06b6d4";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        const boxSize = 35 * SCALE;
        ctx.strokeRect(-boxSize, -boxSize, boxSize * 2, boxSize * 2);
        ctx.setLineDash([]);
      }

      // Draw Terminals
      const offset = TERMINAL_OFFSET;
      ctx.fillStyle = "#94a3b8";
      const termRadius = 5;
      ctx.beginPath();
      ctx.arc(-offset, 0, termRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(offset, 0, termRadius, 0, Math.PI * 2);
      ctx.fill();

      // Component Visuals
      ctx.strokeStyle = "#f8fafc";
      ctx.lineWidth = 3;
      ctx.fillStyle = "#0f172a";

      switch (el.type) {
        case "battery":
          const batW = 10 * SCALE;
          const batH_L = 15 * SCALE;
          const batH_S = 8 * SCALE;

          ctx.beginPath();
          // Wire lines
          ctx.moveTo(-offset, 0);
          ctx.lineTo(-batW, 0);
          ctx.moveTo(batW, 0);
          ctx.lineTo(offset, 0);
          ctx.stroke();
          // Battery Symbol
          ctx.beginPath();
          ctx.moveTo(-batW, -batH_L);
          ctx.lineTo(-batW, batH_L); // Long
          ctx.lineWidth = 5;
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(batW, -batH_S);
          ctx.lineTo(batW, batH_S); // Short
          ctx.lineWidth = 5;
          ctx.stroke();
          // Text
          ctx.fillStyle = "#64748b";
          ctx.save();
          ctx.rotate(-(el.rotation * Math.PI) / 180);
          ctx.font = `bold ${12 * SCALE}px Inter`;
          ctx.fillText("9V", -6 * SCALE, -20 * SCALE);
          ctx.restore();
          break;

        case "led":
          const ledR = 10 * SCALE;
          ctx.beginPath();
          ctx.moveTo(-offset, 0);
          ctx.lineTo(-ledR, 0);
          ctx.moveTo(ledR, 0);
          ctx.lineTo(offset, 0);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 0, ledR, 0, Math.PI * 2);
          ctx.fillStyle = isEnergized ? "#ef4444" : "#334155";
          if (isEnergized) {
            ctx.shadowBlur = 30;
            ctx.shadowColor = "#ef4444";
          }
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.stroke();
          break;

        case "resistor":
          const resW = 15 * SCALE;
          const resH = 6 * SCALE;
          ctx.beginPath();
          ctx.moveTo(-offset, 0);
          ctx.lineTo(-resW, 0);
          ctx.moveTo(resW, 0);
          ctx.lineTo(offset, 0);
          ctx.stroke();
          ctx.beginPath();
          ctx.rect(-resW, -resH, resW * 2, resH * 2);
          ctx.fillStyle = "#1e293b";
          ctx.fill();
          ctx.stroke();
          // Bands
          const bandW = 4 * SCALE;
          ctx.fillStyle = "#b45309";
          ctx.fillRect(-10 * SCALE, -resH, bandW, resH * 2);
          ctx.fillStyle = "#000000";
          ctx.fillRect(-3 * SCALE, -resH, bandW, resH * 2);
          ctx.fillStyle = "#dc2626";
          ctx.fillRect(4 * SCALE, -resH, bandW, resH * 2);
          break;

        case "switch":
          const swR = 2 * SCALE;
          const swGap = 15 * SCALE;
          ctx.beginPath();
          ctx.moveTo(-offset, 0);
          ctx.lineTo(-swGap, 0);
          ctx.moveTo(swGap, 0);
          ctx.lineTo(offset, 0);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(-swGap, 0, swR, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(swGap, 0, swR, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.lineWidth = 3 * SCALE;
          if (el.properties.isOpen) {
            ctx.moveTo(-swGap, 0);
            ctx.lineTo(12 * SCALE, -15 * SCALE);
          } else {
            ctx.moveTo(-swGap, 0);
            ctx.lineTo(swGap, 0);
          }
          ctx.stroke();
          break;
      }
      ctx.restore();
    });
  }, [
    elements,
    wires,
    isSimulating,
    energizedIds,
    draggedEl,
    mode,
    wireStart,
    mousePos,
    selectedId
  ]);

  // --- INTERACTION ---
  const handleMouseDown = (e: React.MouseEvent) => {
    // 仿真运行时禁止选中和开始连线
    if (isSimulating) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCanvasCoordinates(e, canvas);

    if (mode === "move") {
      // 1. Check Element Hit
      // 使用 reverse() 倒序查找，优先选中最上层（最后绘制）的元件
      const clickedEl = [...elements]
        .reverse()
        .find((el) => Math.hypot(el.x - x, el.y - y) < HIT_RADIUS);
      if (clickedEl) {
        setSelectedId(clickedEl.id);
        setDraggedEl(clickedEl.id);
        return;
      }

      // 2. Check Wire Hit
      const clickedWire = wires.find(
        (w) => distToSegment({ x, y }, w.start, w.end) < WIRE_HIT_TOLERANCE
      );
      if (clickedWire) {
        setSelectedId(clickedWire.id);
        return;
      }

      // 3. Click Empty -> Deselect
      setSelectedId(null);
    } else if (mode === "wire") {
      // Snap to grid
      const snapX = Math.round(x / GRID_SIZE) * GRID_SIZE;
      const snapY = Math.round(y / GRID_SIZE) * GRID_SIZE;

      if (!wireStart) {
        setWireStart({ x: snapX, y: snapY });
      } else {
        if (wireStart.x !== snapX || wireStart.y !== snapY) {
          const newWires = [...wires];

          // Implement L-Shape Routing (Horizontal First)
          // If we are diagonal, we split into 2 wires.
          // Point A (wireStart) -> Corner (snapX, wireStart.y) -> Point B (snapX, snapY)

          // Segment 1: Horizontal
          if (wireStart.x !== snapX) {
            newWires.push({
              id: "w-" + Date.now() + "-1",
              start: { x: wireStart.x, y: wireStart.y },
              end: { x: snapX, y: wireStart.y }
            });
          }

          // Segment 2: Vertical
          if (wireStart.y !== snapY) {
            newWires.push({
              id: "w-" + Date.now() + "-2",
              start: { x: snapX, y: wireStart.y },
              end: { x: snapX, y: snapY }
            });
          }

          setWires(newWires);
        }
        setWireStart(null);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCanvasCoordinates(e, canvas);

    setMousePos({ x, y }); // Update for wire preview

    // Cursor update
    if (isSimulating) {
      // 仿真时：如果是开关则显示手型，否则默认
      const elHover = elements.some(
        (el) => Math.hypot(el.x - x, el.y - y) < HIT_RADIUS
      );
      const switchHover =
        elements.find((el) => Math.hypot(el.x - x, el.y - y) < HIT_RADIUS)
          ?.type === "switch";
      setCursor(switchHover ? "pointer" : "default");
      return;
    }

    if (mode === "move") {
      const elHover = elements.some(
        (el) => Math.hypot(el.x - x, el.y - y) < HIT_RADIUS
      );
      const wireHover = wires.some(
        (w) => distToSegment({ x, y }, w.start, w.end) < WIRE_HIT_TOLERANCE
      );
      setCursor(
        elHover || wireHover ? (draggedEl ? "grabbing" : "pointer") : "default"
      );
    } else {
      setCursor("crosshair");
    }

    // Drag Element
    if (mode === "move" && draggedEl && !isSimulating) {
      // Snap to grid
      const snapX = Math.round(x / GRID_SIZE) * GRID_SIZE;
      const snapY = Math.round(y / GRID_SIZE) * GRID_SIZE;

      setElements((els) =>
        els.map((el) =>
          el.id === draggedEl ? { ...el, x: snapX, y: snapY } : el
        )
      );
    }
  };

  const handleMouseUp = () => {
    setDraggedEl(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (draggedEl || mode === "wire") return; // Don't toggle switch if dragging or wiring

    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCanvasCoordinates(e, canvas);

    // 允许在仿真状态下点击开关
    const clickedEl = [...elements]
      .reverse()
      .find((el) => Math.hypot(el.x - x, el.y - y) < HIT_RADIUS);
    if (clickedEl && clickedEl.type === "switch") {
      setElements((els) =>
        els.map((el) =>
          el.id === clickedEl.id
            ? {
                ...el,
                properties: { ...el.properties, isOpen: !el.properties.isOpen }
              }
            : el
        )
      );
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    // 仿真运行时禁止旋转
    if (isSimulating) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCanvasCoordinates(e, canvas);

    const clickedEl = [...elements]
      .reverse()
      .find((el) => Math.hypot(el.x - x, el.y - y) < HIT_RADIUS);
    if (clickedEl) {
      setElements((els) =>
        els.map((el) =>
          el.id === clickedEl.id
            ? {
                ...el,
                rotation: (el.rotation + 90) % 360
              }
            : el
        )
      );
    }
  };

  const addElement = (type: Element["type"]) => {
    // 仿真运行时禁止添加
    if (isSimulating) return;

    const baseXY = 200; // 初始位置
    // 简单的偏移避免重叠
    const offset = (elements.length % 5) * GRID_SIZE;

    setElements([
      ...elements,
      {
        id: "el-" + Date.now(),
        type,
        x: baseXY + offset,
        y: baseXY + offset,
        rotation: 0,
        properties: { isOpen: true }
      }
    ]);
    setMode("move"); // Add 后切换回移动模式方便调整
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col select-none">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="text-yellow-400" /> 仿真实验室{" "}
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/20">
              BETA
            </span>
          </h2>
          <p className="text-xs text-muted mt-1">
            <span className="text-primary font-bold">移动模式:</span>{" "}
            点击选中/拖拽/双击旋转 •{" "}
            <span className="text-yellow-400 font-bold">连线模式:</span>{" "}
            点击起点-&lt;点击终点
          </p>
        </div>
        <div className="flex items-center gap-4">
          {selectedId && !isSimulating && (
            <button
              onClick={() => deleteItem(selectedId)}
              className="flex items-center gap-2 px-3 py-1.5 bg-rose-950/40 text-rose-400 border border-rose-900 rounded-md hover:bg-rose-900/60 transition-colors text-sm"
            >
              <XCircle size={16} /> 删除选中项 (Del)
            </button>
          )}
          <div className="flex bg-slate-800 rounded-lg p-1 border border-border">
            <button
              onClick={() => !isSimulating && setMode("move")}
              className={`flex items-center gap-2 px-4 py-1.5 text-sm rounded-md font-medium transition-all ${
                mode === "move"
                  ? "bg-slate-600 text-white shadow"
                  : "text-muted hover:text-white"
              } ${isSimulating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <MousePointer2 size={16} /> 移动/选择
            </button>
            <button
              onClick={() => {
                if (!isSimulating) {
                  setMode("wire");
                  setSelectedId(null);
                }
              }}
              className={`flex items-center gap-2 px-4 py-1.5 text-sm rounded-md font-medium transition-all ${
                mode === "wire"
                  ? "bg-slate-600 text-white shadow"
                  : "text-muted hover:text-white"
              } ${isSimulating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Zap size={16} /> 连线模式
            </button>
          </div>
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold transition-all shadow-lg ${
              isSimulating
                ? "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20"
                : "bg-emerald-500 text-slate-900 hover:bg-emerald-400 shadow-emerald-500/20"
            }`}
          >
            {isSimulating ? <RotateCcw size={18} /> : <Play size={18} />}
            {isSimulating ? "停止运行" : "运行仿真"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`w-52 bg-surface border border-border rounded-xl p-4 flex flex-col gap-2 shadow-xl z-10 shrink-0 h-full overflow-y-auto custom-scrollbar transition-opacity ${
            isSimulating ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <div className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">
            电源
          </div>
          <button
            onClick={() => addElement("battery")}
            className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700 hover:border-slate-500 transition-all border border-transparent group"
          >
            <Battery className="text-yellow-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">9V 电池</span>
          </button>

          <div className="text-[10px] font-bold text-muted uppercase tracking-wider mt-2 mb-1">
            输出器件
          </div>
          <button
            onClick={() => addElement("led")}
            className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700 hover:border-slate-500 transition-all border border-transparent group"
          >
            <Lightbulb className="text-rose-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">LED (红)</span>
          </button>

          <div className="text-[10px] font-bold text-muted uppercase tracking-wider mt-2 mb-1">
            控制与基础
          </div>
          <button
            onClick={() => addElement("switch")}
            className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700 hover:border-slate-500 transition-all border border-transparent group"
          >
            <ToggleLeft className="text-slate-300 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">开关</span>
          </button>
          <button
            onClick={() => addElement("resistor")}
            className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700 hover:border-slate-500 transition-all border border-transparent group"
          >
            <div className="w-5 h-2 bg-amber-700 rounded-sm group-hover:scale-110 transition-transform"></div>
            <span className="text-sm font-medium">电阻</span>
          </button>

          <div className="mt-auto pt-4 border-t border-border">
            <button
              onClick={() => {
                setElements([]);
                setWires([]);
                setEnergizedIds(new Set());
                setSelectedId(null);
              }}
              className="flex items-center justify-center gap-2 w-full p-2.5 text-rose-400 hover:bg-rose-950/30 rounded-lg text-sm border border-transparent hover:border-rose-900/50 transition-colors"
            >
              <Trash2 size={16} /> 清空画布
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-[#0f172a] rounded-xl border border-border relative overflow-hidden shadow-inner group flex justify-center items-center">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#334155 1px, transparent 1px)",
              backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`
            }}
          />
          <canvas
            ref={canvasRef}
            width={1600}
            height={1000}
            className="w-full h-full touch-none block"
            style={{ cursor }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
          />
          {mode === "wire" && (
            <div className="absolute top-4 left-4 bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-lg text-xs border border-yellow-500/20 backdrop-blur font-medium flex items-center gap-2 pointer-events-none">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              连线进行中... 再次点击空白处结束
            </div>
          )}
          {isSimulating && (
            <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg text-xs border border-emerald-500/20 backdrop-blur font-bold flex items-center gap-2 pointer-events-none animate-pulse">
              <ActivityIcon /> 仿真运行中 - 编辑已锁定
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ActivityIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

export default Simulation;
