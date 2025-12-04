
import React, { useState } from 'react';
import { User, Role, Rank, RANK_ORDER } from '../types';
import { Trash2, Shield, Plus, X, Edit, Power, CheckCircle, XCircle } from 'lucide-react';

interface AdminManagementProps {
  admins: User[];
  onSave: (u: User) => void;
  onToggleStatus: (u: User) => void;
  onDelete: (id: string) => void;
}

const AdminManagement: React.FC<AdminManagementProps> = ({ admins, onSave, onToggleStatus, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialFormState = {
    firstName: '', lastName: '', email: '', password: '', confirmPass: '',
    role: Role.ADMIN, rank: Rank.JO1
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');

  const handleOpenModal = (user?: User) => {
    setError('');
    if (user) {
        setEditingId(user.id);
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: '', // Leave blank to keep current
            confirmPass: '',
            role: user.role,
            rank: user.rank
        });
    } else {
        setEditingId(null);
        setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password && formData.password !== formData.confirmPass) {
        setError("Passwords do not match.");
        return;
    }
    
    // Validate password only if creating new or changing existing
    if (formData.password) {
        if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.test(formData.password)) {
            setError("Password must be at least 8 chars, 1 uppercase, 1 lowercase, 1 number.");
            return;
        }
    } else if (!editingId) {
        setError("Password is required for new users.");
        return;
    }

    const baseData = editingId ? admins.find(a => a.id === editingId)! : {
        id: `user-${Date.now()}`,
        isActive: true,
        createdAt: new Date().toISOString(),
        mustChangePassword: true
    };

    const payload: User = {
        ...baseData,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        rank: formData.rank,
        // Only update password if provided
        ...(formData.password ? { password: formData.password, mustChangePassword: true } : {})
    } as User;

    onSave(payload);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <Shield className="text-blue-500" /> Manage Users
        </h2>
        <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-3 py-2 rounded text-sm flex items-center gap-2 hover:bg-blue-500 transition-colors">
            <Plus size={16} /> Add New User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-700">
                <tr>
                    <th className="p-4">Rank/Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
                {admins.map(admin => (
                    <tr key={admin.id} className="hover:bg-slate-700/50 transition-colors">
                        <td className="p-4">
                            <span className="font-bold text-blue-400 mr-2">{admin.rank}</span>
                            <span className="text-slate-200">{admin.lastName}, {admin.firstName}</span>
                        </td>
                        <td className="p-4 text-slate-400">{admin.email}</td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                admin.role === Role.SUPER_ADMIN ? 'bg-blue-900/40 text-blue-300 border border-blue-800' :
                                'bg-slate-700 text-slate-300 border border-slate-600'
                            }`}>
                                {admin.role.replace('_', ' ')}
                            </span>
                        </td>
                        <td className="p-4">
                            <span className={`flex items-center gap-1 text-xs font-medium ${admin.isActive ? 'text-green-400' : 'text-red-400'}`}>
                                {admin.isActive ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                                {admin.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </td>
                        <td className="p-4 text-right">
                           <div className="flex justify-end gap-2">
                                <button onClick={() => onToggleStatus(admin)} title={admin.isActive ? "Deactivate" : "Activate"} className={`p-1 rounded transition-colors ${admin.isActive ? 'text-green-400 hover:bg-green-900/20' : 'text-red-400 hover:bg-red-900/20'}`}>
                                    <Power size={16} />
                                </button>
                                <button onClick={() => handleOpenModal(admin)} title="Edit User" className="p-1 text-blue-400 hover:bg-blue-900/20 rounded transition-colors">
                                    <Edit size={16} />
                                </button>
                                {/* Prevent deleting self or primary superadmin in this simple demo if needed, but keeping generic */}
                                <button onClick={() => { if(confirm('Permanently delete this user?')) onDelete(admin.id) }} title="Delete User" className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

       {/* Add/Edit User Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-lg shadow-2xl border border-slate-600 w-full max-w-md">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900">
              <h3 className="font-bold text-lg text-slate-200">{editingId ? 'Edit User' : 'Create New User'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="text-slate-400 hover:text-white" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && <div className="bg-red-900/20 text-red-400 p-2 text-sm rounded border border-red-900">{error}</div>}
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium mb-1 text-slate-400">Rank</label>
                        <select className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-slate-200 outline-none" value={formData.rank} onChange={e => setFormData({...formData, rank: e.target.value as Rank})}>
                            {RANK_ORDER.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1 text-slate-400">Role</label>
                        <select className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-slate-200 outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as Role})}>
                            <option value={Role.ADMIN}>ADMIN</option>
                            <option value={Role.SUPER_ADMIN}>SUPER ADMIN</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                         <label className="block text-xs font-medium mb-1 text-slate-400">First Name</label>
                         <input required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-slate-200 outline-none" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                    </div>
                    <div>
                         <label className="block text-xs font-medium mb-1 text-slate-400">Last Name</label>
                         <input required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-slate-200 outline-none" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium mb-1 text-slate-400">Email</label>
                    <input required type="email" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-slate-200 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>

                <div className="border-t border-slate-700 pt-4">
                    <p className="text-xs text-slate-500 mb-2 uppercase">{editingId ? 'Change Password (Optional)' : 'Set Password'}</p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium mb-1 text-slate-400">Password</label>
                            <input 
                                type={editingId ? "text" : "password"} // Show text for ease if editing reset, or keep hidden. Using text/password logic
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-slate-200 outline-none" 
                                placeholder={editingId ? "Leave blank to keep current" : ""}
                                value={formData.password} 
                                onChange={e => setFormData({...formData, password: e.target.value})} 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1 text-slate-400">Confirm Password</label>
                            <input 
                                type={editingId ? "text" : "password"} 
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-slate-200 outline-none" 
                                placeholder={editingId ? "Leave blank to keep current" : ""}
                                value={formData.confirmPass} 
                                onChange={e => setFormData({...formData, confirmPass: e.target.value})} 
                            />
                        </div>
                    </div>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-500 transition-colors mt-4">
                    {editingId ? 'Update User' : 'Create User'}
                </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
