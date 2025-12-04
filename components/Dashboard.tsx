import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { User, Personnel, Rank, RANK_ORDER } from '../types';
import { Users, UserCheck, UserX, AlertCircle } from 'lucide-react';

interface DashboardProps {
  personnel: Personnel[];
  currentUser: User;
}

// Dark theme blues
const PIE_COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#1d4ed8', '#1e3a8a', '#bfdbfe'];

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700 flex items-center space-x-4 transition-transform hover:scale-[1.01]">
    <div className={`p-3 rounded-full ${color} bg-opacity-20`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-sm text-slate-400 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-100">{value}</h3>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ personnel, currentUser }) => {
  
  const stats = useMemo(() => {
    return {
      total: personnel.length,
      active: personnel.filter(p => p.status === 'Active').length,
      retired: personnel.filter(p => p.status === 'Retired').length,
      suspended: personnel.filter(p => p.status === 'Suspended').length,
    };
  }, [personnel]);

  const rankData = useMemo(() => {
    const counts: Record<string, number> = {};
    RANK_ORDER.forEach(r => counts[r] = 0);
    personnel.forEach(p => {
      if (counts[p.rank] !== undefined) counts[p.rank]++;
    });
    return RANK_ORDER.map(r => ({ name: r, count: counts[r] })).filter(d => d.count > 0);
  }, [personnel]);

  const genderData = useMemo(() => {
    const male = personnel.filter(p => p.gender === 'Male').length;
    const female = personnel.filter(p => p.gender === 'Female').length;
    return [
      { name: 'Male', value: male },
      { name: 'Female', value: female },
    ];
  }, [personnel]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Personnel" value={stats.total} icon={Users} color="bg-blue-500" />
        <StatCard title="Active Duty" value={stats.active} icon={UserCheck} color="bg-blue-400" />
        <StatCard title="Retired/Separated" value={stats.retired} icon={UserX} color="bg-slate-500" />
        <StatCard title="Suspended" value={stats.suspended} icon={AlertCircle} color="bg-blue-900" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rank Distribution Chart */}
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
          <h3 className="text-lg font-bold text-slate-200 mb-4">Personnel by Rank</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rankData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} interval={0} fontSize={12} stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }}
                    itemStyle={{ color: '#93c5fd' }}
                />
                <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                <Bar dataKey="count" fill="#3b82f6" name="Personnel Count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Distribution Chart */}
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
          <h3 className="text-lg font-bold text-slate-200 mb-4">Gender Distribution</h3>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#93c5fd'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#cbd5e1' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

       {/* Quick Lists / Upcoming */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
             <h3 className="text-lg font-bold text-slate-200 mb-4">Recent Appointments</h3>
             <ul className="space-y-3">
                {personnel
                  .sort((a,b) => new Date(b.dateOfAppointment).getTime() - new Date(a.dateOfAppointment).getTime())
                  .slice(0, 5)
                  .map(p => (
                    <li key={p.id} className="flex justify-between items-center border-b border-slate-700 pb-2 last:border-0">
                       <span className="font-medium text-slate-300">{p.rank} {p.lastName}, {p.firstName}</span>
                       <span className="text-sm text-slate-500">{p.dateOfAppointment}</span>
                    </li>
                  ))}
                  {personnel.length === 0 && <p className="text-slate-500 text-sm">No records found.</p>}
             </ul>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
             <h3 className="text-lg font-bold text-slate-200 mb-4">Personnel on Mandatory Schooling</h3>
             <ul className="space-y-3">
                {personnel
                  .filter(p => p.remarks?.includes('SCHOOLING') || p.remarks?.includes('TRAINING'))
                  .slice(0, 5)
                  .map(p => (
                    <li key={p.id} className="flex justify-between items-center border-b border-slate-700 pb-2 last:border-0">
                       <div className="flex flex-col">
                         <span className="font-medium text-slate-300">{p.rank} {p.lastName}</span>
                         <span className="text-xs text-blue-400">{p.remarks}</span>
                       </div>
                       <span className="text-sm text-slate-500">{p.officeAssignment[0] || 'N/A'}</span>
                    </li>
                  ))}
                  {personnel.filter(p => p.remarks?.includes('SCHOOLING')).length === 0 && 
                    <p className="text-slate-500 text-sm">No personnel currently on schooling.</p>
                  }
             </ul>
          </div>
       </div>
    </div>
  );
};

export default Dashboard;