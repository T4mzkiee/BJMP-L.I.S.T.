
import React, { useState } from 'react';
import { User } from '../types';
import { getUserWithAuth, saveUser } from '../services/storage';
import { Lock, Mail, ShieldAlert } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  
  // New Password State
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [tempUser, setTempUser] = useState<any>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = getUserWithAuth(email);
    
    // In a real app, hash checking happens on backend. 
    // Here we check the plain mock password or the stored object
    if (!user || user.password !== password) {
        setError('Invalid credentials.');
        return;
    }

    if (!user.isActive) {
        setError('Account is disabled. Contact Super Admin.');
        return;
    }

    if (user.mustChangePassword) {
        setTempUser(user);
        setIsChangingPass(true);
        return;
    }

    // Success
    onLogin(user);
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
        setError("Passwords do not match");
        return;
    }
    // Simple password check
    if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.test(newPass)) {
        setError("Password must be at least 8 chars, 1 uppercase, 1 lowercase, 1 number.");
        return;
    }

    // Update user
    const updatedUser = { 
        ...tempUser, 
        password: newPass, 
        mustChangePassword: false 
    };
    saveUser(updatedUser);
    onLogin(updatedUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="flex flex-col md:flex-row w-full max-w-6xl bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        
        {/* Left Side: Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-slate-800 flex flex-col justify-center">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-blue-500 tracking-tight mb-2">BJMP<span className="text-white">RO8</span></h1>
                <p className="text-slate-400 font-medium tracking-[0.2em] text-xs uppercase">LINEAL LIST, INFO SYSTEM, SENIORITY, TRACKER</p>
            </div>

            {error && (
                <div className="mb-6 bg-red-900/20 border-l-4 border-red-600 p-4 flex items-center text-red-400 text-sm rounded-r">
                    <ShieldAlert className="mr-3 shrink-0" size={20} /> {error}
                </div>
            )}

            {!isChangingPass ? (
                <form onSubmit={handleLoginSubmit} className="space-y-6 max-w-sm mx-auto w-full">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-3 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input 
                                type="email" 
                                required 
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-600"
                                placeholder="officer@bjmp.gov.ph"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-3 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input 
                                type="password" 
                                required 
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-600"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 mt-2"
                    >
                        Sign In
                    </button>
                    
                    <div className="text-center text-xs text-slate-500 mt-6">
                        Restricted Access. Authorized Personnel Only.
                    </div>
                </form>
            ) : (
                <form onSubmit={handleChangePasswordSubmit} className="space-y-6 max-w-sm mx-auto w-full">
                    <div className="text-center mb-6">
                        <p className="text-sm text-blue-300 font-semibold bg-blue-900/20 p-3 rounded-lg border border-blue-900">
                            Security Alert: You must change your password on first login.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                        <input 
                            type="password" 
                            required 
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                        <input 
                            type="password" 
                            required 
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={confirmPass}
                            onChange={(e) => setConfirmPass(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-500 transition-all mt-2"
                    >
                        Update Password & Login
                    </button>
                </form>
            )}
        </div>

        {/* Right Side: Information Panel */}
        <div className="w-full md:w-1/2 bg-slate-900 p-8 md:p-12 flex flex-col justify-center border-l border-slate-700 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400"></div>
            
            <h2 className="text-2xl font-bold text-white mb-6 leading-tight">
                Lineal List Information System <br /> & Seniority Tracker
            </h2>
            
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
                A comprehensive database and tracking system designed specifically for Jail Officers. It serves as a critical tool for managing and visualizing the seniority, rank progression, and Mandatory schooling of Jail Officers. The system organizes officers based on their ranks ensuring a clear, structured representation of the hierarchy within the organization.
            </p>

            <div className="space-y-4 mb-8">
                <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded bg-blue-900/30 border border-blue-900 flex items-center justify-center shrink-0">
                        <span className="font-bold text-blue-500">L</span>
                    </div>
                    <div>
                        <p className="text-sm text-slate-300 leading-snug"><span className="font-semibold text-slate-100">Lineal List:</span> Provides a structured, chronological list of officers based on rank and entry dates.</p>
                    </div>
                </div>
                <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded bg-blue-900/30 border border-blue-900 flex items-center justify-center shrink-0">
                        <span className="font-bold text-blue-500">I</span>
                    </div>
                    <div>
                        <p className="text-sm text-slate-300 leading-snug"><span className="font-semibold text-slate-100">Information System:</span> A robust database to store, update, and retrieve critical officer information.</p>
                    </div>
                </div>
                <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded bg-blue-900/30 border border-blue-900 flex items-center justify-center shrink-0">
                        <span className="font-bold text-blue-500">S</span>
                    </div>
                    <div>
                        <p className="text-sm text-slate-300 leading-snug"><span className="font-semibold text-slate-100">Seniority:</span> Emphasizes rank order, ensuring accurate representation of each officer's standing.</p>
                    </div>
                </div>
                <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded bg-blue-900/30 border border-blue-900 flex items-center justify-center shrink-0">
                        <span className="font-bold text-blue-500">T</span>
                    </div>
                    <div>
                        <p className="text-sm text-slate-300 leading-snug"><span className="font-semibold text-slate-100">Tracker:</span> Continuously monitors and updates timelines for Mandatory schooling.</p>
                    </div>
                </div>
            </div>

            <p className="text-xs text-slate-500 italic border-t border-slate-800 pt-6 mt-auto">
                This system supports effective management and planning by The BJMP Regional Office 8, giving insight into personnel transitions and help maintaining an organized and up-to-date officer hierarchy.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
