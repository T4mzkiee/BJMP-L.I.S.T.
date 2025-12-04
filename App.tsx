
import React, { useState, useEffect } from 'react';
import { User, Role, Personnel, AuditLog } from './types';
import { initStorage, getUsers, getPersonnel, savePersonnel, deletePersonnel, saveUser, deleteUser, addLog, getLogs, clearLogs } from './services/storage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PersonnelList from './components/PersonnelList';
import AdminManagement from './components/AdminManagement';
import UserAccount from './components/UserAccount';
import LogsViewer from './components/LogsViewer';
import { LayoutDashboard, Users, UserCog, LogOut, Menu, X, Shield, ChevronLeft, ChevronRight, FileClock } from 'lucide-react';

// --- INITIALIZE STORAGE ON LOAD ---
initStorage();

// --- SIDEBAR COMPONENT ---
const Sidebar = ({ user, activeTab, onChangeTab, isOpen, onClose, isCollapsed, toggleCollapse }: any) => {
  // Define menus strictly by role
  const superAdminMenu = [
    { id: 'manage-users', label: 'Manage Users', icon: Shield },
    { id: 'logs', label: 'Audit Logs', icon: FileClock },
  ];

  const adminMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'personnel', label: 'Personnel List', icon: Users },
    { id: 'account', label: 'User Account', icon: UserCog },
  ];

  const menuItems = user.role === Role.SUPER_ADMIN ? superAdminMenu : adminMenu;

  return (
    <div className={`fixed inset-y-0 left-0 z-40 bg-slate-950 text-slate-300 transform transition-all duration-300 ease-in-out 
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      md:translate-x-0 border-r border-slate-800 
      ${isCollapsed ? 'md:w-20' : 'md:w-64'}
    `}>
      <div className="flex flex-col h-full">
        {/* Logo Area */}
        <div className={`h-16 flex items-center px-4 bg-slate-950 border-b border-slate-800 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div className="flex flex-col">
              <div className="font-bold text-xl tracking-wider text-blue-500 whitespace-nowrap leading-none">
                BJMP<span className="text-white">RO8</span>
              </div>
              <div className="text-[10px] text-slate-500 tracking-[0.3em] font-semibold mt-1">L.I.S.T</div>
            </div>
          )}
          {isCollapsed && (
             <div className="font-bold text-xl text-blue-500">B8</div>
          )}
          
          {/* Mobile Close */}
          <button onClick={onClose} className="md:hidden text-slate-400"><X /></button>
          
          {/* Desktop Toggle */}
          <button onClick={toggleCollapse} className="hidden md:flex text-slate-500 hover:text-white transition-colors">
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* User Info */}
        {!isCollapsed && (
            <div className="px-6 py-4 border-b border-slate-800 mb-2 bg-slate-900 overflow-hidden">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Welcome,</p>
                <p className="font-semibold truncate text-slate-100">{user.rank} {user.lastName}</p>
                <p className="text-xs text-blue-400 font-mono mt-1 uppercase border border-blue-900 inline-block px-1 rounded bg-blue-900/20">{user.role.replace('_', ' ')}</p>
            </div>
        )}

        {/* Menu */}
        <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { onChangeTab(item.id); onClose(); }}
              title={isCollapsed ? item.label : ''}
              className={`w-full flex items-center py-2.5 rounded-lg text-sm font-medium transition-all ${
                isCollapsed ? 'justify-center px-0' : 'px-3'
              } ${
                activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <item.icon className={`${isCollapsed ? 'mr-0' : 'mr-3'} h-5 w-5 min-w-[1.25rem]`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
            <button 
                onClick={() => onChangeTab('logout')} 
                title={isCollapsed ? 'Logout' : ''}
                className={`w-full flex items-center py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-red-900/20 rounded-md transition-colors ${isCollapsed ? 'justify-center' : 'px-3'}`}
            >
                <LogOut className={`${isCollapsed ? 'mr-0' : 'mr-3'} h-5 w-5`} /> 
                {!isCollapsed && "Logout"}
            </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // App Data State
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [adminList, setAdminList] = useState<User[]>([]);
  const [logsList, setLogsList] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Effects ---
  useEffect(() => {
    const storedSession = localStorage.getItem('bjmp_session');
    if (storedSession) {
        const u = JSON.parse(storedSession);
        setUser(u);
        // Set initial tab based on role
        if (u.role === Role.SUPER_ADMIN) setActiveTab('manage-users');
        else setActiveTab('dashboard');
    }
    refreshData();
    setLoading(false);
  }, []);

  const refreshData = () => {
    setPersonnelList(getPersonnel());
    setAdminList(getUsers());
    setLogsList(getLogs());
  };

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('bjmp_session', JSON.stringify(u));
    addLog('LOGIN', 'User logged in', u.email);
    refreshData();
    if (u.role === Role.SUPER_ADMIN) setActiveTab('manage-users');
    else setActiveTab('dashboard');
  };

  const handleLogout = () => {
    if (user) addLog('LOGOUT', 'User logged out', user.email);
    setUser(null);
    localStorage.removeItem('bjmp_session');
  };

  // --- Personnel Actions (Admin Only) ---
  const handleAddPersonnel = (p: Personnel) => {
    savePersonnel(p);
    addLog('CREATE', `Added New Personnel: ${p.rank} ${p.lastName}, ${p.firstName}`, user?.email || 'System');
    refreshData();
  };

  const handleEditPersonnel = (p: Personnel) => {
    // Determine changes for log
    const oldP = personnelList.find(item => item.id === p.id);
    let changeDetails = '';

    if (oldP) {
      const changes: string[] = [];

      const compare = (label: string, oldVal: any, newVal: any) => {
          // Normalize to strings for comparison and display
          const o = oldVal === undefined || oldVal === null ? '' : String(oldVal);
          const n = newVal === undefined || newVal === null ? '' : String(newVal);
          if (o !== n) {
              changes.push(`${label}: "${o}" → "${n}"`);
          }
      };

      compare('Rank', oldP.rank, p.rank);
      compare('Last Name', oldP.lastName, p.lastName);
      compare('First Name', oldP.firstName, p.firstName);
      compare('Middle Name', oldP.middleName, p.middleName);
      compare('Extension', oldP.extension, p.extension);
      compare('Gender', oldP.gender, p.gender);
      
      const oldOffice = oldP.officeAssignment.join(', ');
      const newOffice = p.officeAssignment.join(', ');
      if (oldOffice !== newOffice) changes.push(`Office Assignment: "${oldOffice}" → "${newOffice}"`);

      const oldDesig = oldP.designation.join(', ');
      const newDesig = p.designation.join(', ');
      if (oldDesig !== newDesig) changes.push(`Designation: "${oldDesig}" → "${newDesig}"`);

      compare('Education', oldP.education, p.education);
      compare('Eligibility', oldP.eligibility, p.eligibility);
      compare('Date of Birth', oldP.dateOfBirth, p.dateOfBirth);
      compare('Date of Appointment', oldP.dateOfAppointment, p.dateOfAppointment);
      compare('Date Last Promotion', oldP.dateOfLastPromotion, p.dateOfLastPromotion);
      compare('Training', oldP.trainingType, p.trainingType);
      compare('Status', oldP.status, p.status);
      compare('Remarks', oldP.remarks, p.remarks);
      
      const fullName = `${oldP.firstName} ${oldP.middleName ? oldP.middleName + ' ' : ''}${oldP.lastName}`;

      if (changes.length > 0) {
        changeDetails = `${fullName} | ${changes.join(' | ')}`;
      } else {
        changeDetails = `${fullName} | No specific changes detected`;
      }
    } else {
      changeDetails = `Updated personnel ID ${p.id}`;
    }

    savePersonnel(p);
    addLog('UPDATE', changeDetails, user?.email || 'System');
    refreshData();
  };

  const handleDeletePersonnel = (id: string) => {
    const p = personnelList.find(item => item.id === id);
    const details = p ? `Deleted Personnel: ${p.rank} ${p.lastName}, ${p.firstName}` : `Deleted personnel ID ${id}`;

    deletePersonnel(id);
    addLog('DELETE', details, user?.email || 'System');
    refreshData();
  };

  // --- User Management Actions (Super Admin Only) ---
  const handleSaveUser = (u: User) => {
      const uWithPass = u as User & { password?: string };
      const existing = adminList.find(a => a.id === u.id);
      const action = existing ? 'USER_UPDATE' : 'USER_CREATE';
      let details = '';

      if (existing) {
         const changes: string[] = [];
         
         if (existing.rank !== u.rank) changes.push(`Rank: "${existing.rank}" → "${u.rank}"`);
         if (existing.firstName !== u.firstName) changes.push(`First Name: "${existing.firstName}" → "${u.firstName}"`);
         if (existing.lastName !== u.lastName) changes.push(`Last Name: "${existing.lastName}" → "${u.lastName}"`);
         if (existing.email !== u.email) changes.push(`Email: "${existing.email}" → "${u.email}"`);
         if (existing.role !== u.role) changes.push(`Role: "${existing.role}" → "${u.role}"`);
         if (existing.isActive !== u.isActive) changes.push(`Active Status: "${existing.isActive}" → "${u.isActive}"`);
         
         if (uWithPass.password) changes.push(`Password: (Updated)`);

         if (changes.length > 0) details = changes.join(' | ');
         else details = `Updated user profile for ${u.email} (No changes detected)`;
      } else {
         details = `Created new user: ${u.rank} ${u.lastName} (${u.email})`;
      }

      saveUser(u);
      addLog(action, details, user?.email || 'System');
      refreshData();
  };

  const handleToggleUserStatus = (u: User) => {
      const updated = { ...u, isActive: !u.isActive };
      saveUser(updated);
      addLog('USER_STATUS', `Changed status of ${u.email} to ${updated.isActive ? 'Active' : 'Inactive'}`, user?.email || 'System');
      refreshData();
  };

  const handleDeleteUser = (id: string) => {
      const u = adminList.find(a => a.id === id);
      const details = u ? `Deleted User: ${u.rank} ${u.lastName} (${u.email})` : `Deleted user ID ${id}`;
      deleteUser(id);
      addLog('USER_DELETE', details, user?.email || 'System');
      refreshData();
  };

  const handleClearLogs = () => {
    clearLogs();
    // Add a single log entry noting the clear action
    addLog('SYSTEM', 'Audit logs cleared manually', user?.email || 'System');
    refreshData();
  };

  // --- User Account Actions (Admin Only) ---
  const handleUpdateSelf = (u: User) => {
      saveUser(u);
      setUser(u); // Update session
      localStorage.setItem('bjmp_session', JSON.stringify(u));
      addLog('SELF_UPDATE', `User updated own profile details`, u.email);
      refreshData();
  };


  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-900 text-slate-400">Loading L.I.S.T...</div>;

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Define Header Title
  let title = '';
  if (activeTab === 'dashboard') title = 'Dashboard';
  else if (activeTab === 'personnel') title = 'Personnel Masterlist';
  else if (activeTab === 'account') title = 'My Account';
  else if (activeTab === 'manage-users') title = 'System User Management';
  else if (activeTab === 'logs') title = 'System Logs';

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
        {/* Mobile Overlay */}
        {sidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <Sidebar 
            user={user} 
            activeTab={activeTab} 
            onChangeTab={(t: string) => {
                if(t === 'logout') handleLogout();
                else setActiveTab(t);
            }} 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            isCollapsed={isSidebarCollapsed}
            toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main Content */}
        <div className={`flex-1 flex flex-col h-screen bg-slate-900 transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
            <header className="bg-slate-800 border-b border-slate-700 shadow-sm h-16 flex items-center justify-between px-6 z-20">
                <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-400">
                    <Menu />
                </button>
                <h1 className="text-xl font-bold text-slate-100 ml-2 md:ml-0">
                    {title}
                </h1>
                <div className="hidden md:block text-sm text-slate-400">
                    {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </header>

            <main className="flex-1 overflow-auto p-6 bg-slate-900">
                {/* --- SUPER ADMIN VIEWS --- */}
                {activeTab === 'manage-users' && user.role === Role.SUPER_ADMIN && (
                    <AdminManagement 
                        admins={adminList}
                        onSave={handleSaveUser}
                        onToggleStatus={handleToggleUserStatus}
                        onDelete={handleDeleteUser}
                    />
                )}

                {activeTab === 'logs' && user.role === Role.SUPER_ADMIN && (
                    <LogsViewer logs={logsList} onClear={handleClearLogs} />
                )}

                {/* --- ADMIN VIEWS --- */}
                {activeTab === 'dashboard' && user.role === Role.ADMIN && (
                    <Dashboard personnel={personnelList} currentUser={user} />
                )}
                
                {activeTab === 'personnel' && user.role === Role.ADMIN && (
                    <PersonnelList 
                        data={personnelList} 
                        currentUser={user}
                        onAdd={handleAddPersonnel}
                        onEdit={handleEditPersonnel}
                        onDelete={handleDeletePersonnel}
                    />
                )}

                {activeTab === 'account' && user.role === Role.ADMIN && (
                    <UserAccount currentUser={user} onUpdate={handleUpdateSelf} />
                )}
            </main>
        </div>
    </div>
  );
};

export default App;
