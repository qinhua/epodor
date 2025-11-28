import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend 
} from 'recharts';
import { Trophy, Clock, Star, Zap } from 'lucide-react';

const skillData = [
  { subject: '理论基础', A: 120, fullMark: 150 },
  { subject: '元件识别', A: 98, fullMark: 150 },
  { subject: '电路设计', A: 86, fullMark: 150 },
  { subject: '故障排查', A: 99, fullMark: 150 },
  { subject: '安全规范', A: 85, fullMark: 150 },
  { subject: '焊接工艺', A: 65, fullMark: 150 },
];

const categoryData = [
  { name: '无源元件', value: 8 },
  { name: '有源元件', value: 7 },
  { name: '机电/传感器', value: 3 },
];

const COLORS = ['#06b6d4', '#6366f1', '#f43f5e', '#10b981'];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">工程师控制台</h2>
        <p className="text-muted">实时监控你的学习进度与技能树。</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: '总体掌握度', value: '42%', icon: Trophy, color: 'text-yellow-500' },
          { title: '累计学习时长', value: '12.5h', icon: Clock, color: 'text-primary' },
          { title: '已解锁元件', value: '18/25', icon: Zap, color: 'text-emerald-500' },
          { title: '成就勋章', value: '3', icon: Star, color: 'text-rose-500' },
        ].map((stat, i) => (
           <div key={i} className="bg-surface border border-border p-6 rounded-2xl relative overflow-hidden group hover:border-primary/30 transition-colors">
              <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${stat.color}`}>
                <stat.icon size={80} />
              </div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-sm font-medium text-muted">{stat.title}</h3>
                <stat.icon size={20} className={stat.color} />
              </div>
              <div className="text-3xl font-bold text-white relative z-10">{stat.value}</div>
           </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radar Chart: Skills */}
        <div className="bg-surface border border-border p-6 rounded-2xl">
          <h3 className="text-xl font-semibold mb-6">工程技能六维图</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="我的能力" dataKey="A" stroke="#06b6d4" strokeWidth={3} fill="#06b6d4" fillOpacity={0.3} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Categories */}
        <div className="bg-surface border border-border p-6 rounded-2xl">
          <h3 className="text-xl font-semibold mb-6">元器件知识分布</h3>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
               <div className="text-center">
                 <div className="text-3xl font-bold text-white">18</div>
                 <div className="text-xs text-muted">已学总数</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
