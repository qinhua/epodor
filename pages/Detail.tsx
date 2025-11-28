import React, { useState } from 'react';
import { ComponentData } from '../types';
import ThreeViewer from '../components/ThreeViewer';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Box, BookOpen, PenTool, MessageSquare, Send, Rotate3d } from 'lucide-react';
import { getAIResponse } from '../services/geminiService';

interface DetailProps {
  component: ComponentData;
  onBack: () => void;
}

const Detail: React.FC<DetailProps> = ({ component, onBack }) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'principle' | 'test'>('visual');
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'model', text: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleChat = async () => {
    if (!chatQuery.trim()) return;
    const userMsg = chatQuery;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatQuery('');
    setIsTyping(true);

    const response = await getAIResponse(userMsg, component);
    
    setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    setIsTyping(false);
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-6">
      
      {/* Left Column: Visuals & Info */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-10">
        <button onClick={onBack} className="flex items-center text-muted hover:text-white transition-colors w-fit group">
          <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 返回元件库
        </button>

        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{component.name}</h1>
            <p className="text-primary font-mono mt-1 text-sm">{component.type} // {component.symbol}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          {[
            { id: 'visual', label: '3D 结构', icon: Box },
            { id: 'principle', label: '工作原理', icon: BookOpen },
            { id: 'test', label: '检测指南', icon: PenTool },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2
                ${activeTab === tab.id 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted hover:text-text'}
              `}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-surface border border-border rounded-xl p-6 min-h-[450px] relative overflow-hidden flex-1 shadow-lg">
          <AnimatePresence mode="wait">
            {activeTab === 'visual' && (
              <motion.div 
                key="visual"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full w-full flex flex-col"
              >
                 <div className="flex-1 rounded-lg overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border border-border/50 relative group min-h-[300px]">
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-2 px-2 py-1 bg-black/40 backdrop-blur rounded text-xs text-muted/80 pointer-events-none border border-white/5">
                        <Rotate3d size={14} /> 拖拽旋转视角
                    </div>
                    <ThreeViewer type={component.type} />
                 </div>
                 <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {component.specs.map((spec, idx) => (
                      <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="text-xs text-muted mb-1">{spec.label}</div>
                        <div className="font-mono text-sm font-semibold text-slate-200">{spec.value}</div>
                      </div>
                    ))}
                 </div>
              </motion.div>
            )}

            {activeTab === 'principle' && (
              <motion.div 
                key="principle"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="prose prose-invert max-w-none"
              >
                <h3 className="text-xl font-bold mb-4 text-primary">它是如何工作的？</h3>
                <p className="text-lg leading-relaxed text-slate-300">{component.workingPrinciple}</p>
                
                <h4 className="text-lg font-bold mt-8 mb-4 text-white">常见应用场景</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {component.applications.map((app, i) => (
                    <div key={i} className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 hover:border-primary/30 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                      <span className="text-slate-200">{app}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'test' && (
              <motion.div 
                 key="test"
                 initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                      <PenTool size={20} /> 万用表测试步骤
                    </h3>
                    <div className="space-y-4">
                      {component.multimeterGuide.steps.map((step, i) => (
                        <div key={i} className="flex gap-4 group">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-primary flex items-center justify-center font-bold font-mono group-hover:bg-primary group-hover:text-black transition-colors shadow-lg">
                            {i + 1}
                          </div>
                          <p className="text-slate-300 pt-1 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-full md:w-1/3 space-y-4">
                     <div className="bg-slate-950 p-5 rounded-xl border border-border shadow-inner">
                       <div className="text-xs text-muted uppercase tracking-wider mb-3">预期结果</div>
                       <div className="font-mono text-emerald-400 text-sm leading-relaxed border-l-2 border-emerald-500 pl-3">
                         {component.multimeterGuide.expectedReading}
                       </div>
                     </div>
                     <div className="bg-rose-950/20 p-4 rounded-xl border border-rose-900/30">
                        <div className="text-xs text-rose-400 uppercase tracking-wider mb-1">⚠️ 安全警告</div>
                        <p className="text-xs text-rose-300 leading-relaxed">测试前请务必断电。测量高压电容（如微波炉电容）前必须先人工短接放电，否则有触电危险！</p>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Column: AI Tutor */}
      <div className="w-full lg:w-96 flex flex-col bg-surface border border-border rounded-xl overflow-hidden h-[600px] lg:h-auto shadow-xl">
        <div className="p-4 border-b border-border bg-slate-900/80 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-2 text-primary font-bold">
            <MessageSquare size={18} /> Epodor AI 导师
          </div>
          <p className="text-xs text-muted mt-1">关于 {component.name} 的任何疑问，随时提问。</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
          {chatHistory.length === 0 && (
            <div className="text-center text-muted text-sm py-10 px-6">
              <p>你可以尝试问：</p>
              <div className="mt-4 space-y-2">
                <p className="bg-slate-800/50 p-2 rounded cursor-pointer hover:bg-slate-800 transition-colors border border-white/5" onClick={() => setChatQuery(`如何判断 ${component.name} 是否损坏？`)}>"如何判断它是否损坏？"</p>
                <p className="bg-slate-800/50 p-2 rounded cursor-pointer hover:bg-slate-800 transition-colors border border-white/5" onClick={() => setChatQuery(`${component.name} 在电路中起什么作用？`)}>"它在电路中起什么作用？"</p>
              </div>
            </div>
          )}
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-primary text-slate-950 rounded-br-sm font-medium' 
                  : 'bg-slate-800 text-slate-200 rounded-bl-sm'}
              `}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex justify-start">
               <div className="bg-slate-800 rounded-2xl rounded-bl-sm p-3 flex gap-1 items-center">
                 <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                 <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                 <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
               </div>
             </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-slate-900">
          <div className="flex gap-2">
            <input 
              type="text" 
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-white transition-colors placeholder:text-slate-600"
              placeholder="输入你的问题..."
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChat()}
            />
            <button 
              onClick={handleChat}
              disabled={isTyping || !chatQuery.trim()}
              className="bg-primary text-slate-950 p-2 rounded-lg hover:bg-cyan-400 disabled:opacity-50 transition-colors shadow-lg shadow-primary/20"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Detail;