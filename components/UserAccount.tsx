
import React, { useState } from 'react';
import { User } from '../types';
import { UserCog, Mail, Lock, CheckCircle } from 'lucide-react';

interface UserAccountProps {
  currentUser: User;
  onUpdate: (u: User) => void;
}

const UserAccount: React.FC<UserAccountProps> = ({ currentUser, onUpdate }) => {
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (password && password !== confirmPass) {
        setMessage({ type: 'error', text: 'Passwords do not match.' });
        return;
    }

    if (password && !/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.test(password)) {
        setMessage({ type: 'error', text: 'Password must be 8+ chars, 1 Upper, 1 Lower, 1 Number.' });
        return;
    }

    const updatedUser = {
        ...currentUser,
        email: email,
        ...(password ? { password: password } : {})
    };

    onUpdate(updatedUser);
    setPassword('');
    setConfirmPass('');
    setMessage({ type: 'success', text: 'Account updated successfully.' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6">
            <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
                <UserCog className="text-blue-500" /> My Account Settings
            </h2>

            {message.text && (
                <div className={`p-3 rounded mb-4 text-sm ${message.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-900' : 'bg-red-900/20 text-red-400 border border-red-900'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-6">
                
                {/* Read Only Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-900 rounded border border-slate-700">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase">Rank</label>
                        <div className="text-slate-200 font-medium">{currentUser.rank}</div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase">Full Name</label>
                        <div className="text-slate-200 font-medium">{currentUser.lastName}, {currentUser.firstName}</div>
                    </div>
                    <div>
                         <label className="block text-xs font-medium text-slate-500 uppercase">Role</label>
                         <div className="text-blue-400 font-mono text-sm">{currentUser.role}</div>
                    </div>
                     <div>
                         <label className="block text-xs font-medium text-slate-500 uppercase">Status</label>
                         <div className="text-green-400 flex items-center gap-1"><CheckCircle size={12}/> Active</div>
                    </div>
                </div>

                <hr className="border-slate-700" />

                {/* Editable */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 text-slate-500" size={18} />
                        <input 
                            type="email" 
                            required 
                            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded text-slate-200 outline-none focus:border-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">New Password <span className="text-slate-500 text-xs font-normal">(Leave blank to keep current)</span></label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 text-slate-500" size={18} />
                        <input 
                            type="password" 
                            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded text-slate-200 outline-none focus:border-blue-500"
                            placeholder="Set new password..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Confirm New Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 text-slate-500" size={18} />
                        <input 
                            type="password" 
                            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded text-slate-200 outline-none focus:border-blue-500"
                            placeholder="Confirm new password..."
                            value={confirmPass}
                            onChange={(e) => setConfirmPass(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default UserAccount;
