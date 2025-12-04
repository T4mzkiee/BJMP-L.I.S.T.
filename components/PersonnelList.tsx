
import React, { useState, useMemo, useRef } from 'react';
import { Personnel, Rank, RANK_ORDER, Role, User } from '../types';
import { MOCK_OFFICES, TRAINING_TYPES } from '../constants';
import { Search, Plus, Download, Edit, Trash2, X, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';

interface PersonnelListProps {
  data: Personnel[];
  currentUser: User;
  onAdd: (p: Personnel) => void;
  onEdit: (p: Personnel) => void;
  onDelete: (id: string) => void;
}

const PersonnelList: React.FC<PersonnelListProps> = ({ data, currentUser, onAdd, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Table Ref for manual scrolling
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Filters
  const [rankFilter, setRankFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<string>('');
  const [officeFilter, setOfficeFilter] = useState<string>('');
  const [trainingFilter, setTrainingFilter] = useState<string>('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form State
  const initialFormState: Partial<Personnel> = {
    rank: Rank.JO1,
    lastName: '', firstName: '', middleName: '', extension: '',
    gender: 'Male',
    officeAssignment: [],
    designation: [],
    education: '', eligibility: '',
    dateOfBirth: '', dateOfAppointment: '',
    status: 'Active', remarks: '',
    trainingType: ''
  };
  const [formData, setFormData] = useState<Partial<Personnel>>(initialFormState);

  // Local state for array inputs to handle comma-separated strings
  const [officeInput, setOfficeInput] = useState('');
  const [designationInput, setDesignationInput] = useState('');

  // --- Helpers ---
  const calculateAge = (dob: string): number | string => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return isNaN(age) ? '' : age;
  };

  const calculateRetirement = (dob: string): string => {
    if (!dob) return '';
    const date = new Date(dob);
    if (isNaN(date.getTime())) return '';
    // Rule: Date of Birth + 56 years (Mandatory Retirement Age)
    date.setFullYear(date.getFullYear() + 56);
    return date.toISOString().split('T')[0];
  };

  const scrollTable = (direction: 'left' | 'right') => {
    if (tableContainerRef.current) {
        const scrollAmount = 300;
        const currentScroll = tableContainerRef.current.scrollLeft;
        tableContainerRef.current.scrollTo({
            left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
            behavior: 'smooth'
        });
    }
  };

  // --- Filtering Logic ---
  const filteredData = useMemo(() => {
    return data.filter(p => {
      const matchesSearch = 
        p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRank = rankFilter ? p.rank === rankFilter : true;
      const matchesStatus = statusFilter ? p.status === statusFilter : true;
      const matchesGender = genderFilter ? p.gender === genderFilter : true;
      const matchesOffice = officeFilter ? p.officeAssignment.includes(officeFilter) : true;
      const matchesTraining = trainingFilter ? p.trainingType === trainingFilter : true;

      return matchesSearch && matchesRank && matchesStatus && matchesGender && matchesOffice && matchesTraining;
    }).sort((a, b) => {
        // Sort by Rank Priority
        const idxA = RANK_ORDER.indexOf(a.rank);
        const idxB = RANK_ORDER.indexOf(b.rank);
        return idxA - idxB;
    });
  }, [data, searchTerm, rankFilter, statusFilter, genderFilter, officeFilter, trainingFilter]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const canEdit = currentUser.role === Role.ADMIN || currentUser.role === Role.SUPER_ADMIN;

  const handleOpenModal = (person?: Personnel) => {
    if (person) {
      setEditingId(person.id);
      setFormData(person);
      setOfficeInput(person.officeAssignment.join(', '));
      setDesignationInput(person.designation.join(', '));
    } else {
      setEditingId(null);
      setFormData(initialFormState);
      setOfficeInput('');
      setDesignationInput('');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lastName || !formData.firstName) return;

    const payload = {
        ...formData,
        id: editingId || `p-${Date.now()}`,
        officeAssignment: officeInput.split(',').map(s => s.trim()).filter(s => s !== ''),
        designation: designationInput.split(',').map(s => s.trim()).filter(s => s !== ''),
    } as Personnel;

    if (editingId) {
        onEdit(payload);
    } else {
        onAdd(payload);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 flex flex-col h-full">
      {/* Header & Controls */}
      <div className="p-4 border-b border-slate-700 space-y-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <h2 className="text-xl font-bold text-slate-100">Personnel Masterlist</h2>
          {canEdit && (
            <button 
              onClick={() => handleOpenModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <Plus size={16} /> Add Personnel
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search name or ID..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-md text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none placeholder-slate-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select className="bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-sm text-slate-200 outline-none" value={rankFilter} onChange={e => setRankFilter(e.target.value)}>
            <option value="">All Ranks</option>
            {RANK_ORDER.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select className="bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-sm text-slate-200 outline-none" value={officeFilter} onChange={e => setOfficeFilter(e.target.value)}>
             <option value="">All Offices</option>
             {MOCK_OFFICES.map(o => <option key={o} value={o}>{o}</option>)}
          </select>

          <select className="bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-sm text-slate-200 outline-none" value={trainingFilter} onChange={e => setTrainingFilter(e.target.value)}>
             <option value="">All Trainings</option>
             {TRAINING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select className="bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-sm text-slate-200 outline-none" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Retired">Retired</option>
            <option value="Suspended">Suspended</option>
          </select>

        </div>
      </div>

      {/* Table */}
      <div ref={tableContainerRef} className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar relative">
        <table className="min-w-max w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-900 text-slate-400 font-semibold sticky top-0 z-10 shadow-sm text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 border-b border-slate-700 bg-slate-900">Rank</th>
              <th className="p-4 border-b border-slate-700 bg-slate-900">Last Name</th>
              <th className="p-4 border-b border-slate-700 bg-slate-900">First Name</th>
              <th className="p-4 border-b border-slate-700 bg-slate-900">Middle Name</th>
              <th className="p-4 border-b border-slate-700 bg-slate-900">Ext</th>
              <th className="p-4 border-b border-slate-700 bg-slate-900">Gender</th>
              <th className="p-4 border-b border-slate-700 bg-slate-900">Office/Unit</th>
              <th className="p-4 border-b border-slate-700 bg-slate-900">Designation</th>
              <th className="p-4 border-b border-slate-700 bg-slate-900">Course</th>
              <th className="p-4 border-b border-slate-700 bg-slate-900">Eligibility</th>
              <th className="p-4 border-b border-slate-700 bg-slate-900">Date of Birth</th>
              <th className="p-4 border-b border-slate-700 bg-slate-900">Age</th>
              <th className="p-4 border-b border-slate-700 bg-slate-900">Appt. Date</th>
              <th className="p-4 border-b border-slate-700 bg-slate-900">Retirement</th>
              <th className="p-4 border-b border-slate-700 bg-slate-900">Training</th>
              <th className="p-4 border-b border-slate-700 bg-slate-900">Last Promotion</th>
               <th className="p-4 border-b border-slate-700 bg-slate-900">Remarks</th>
              <th className="p-4 border-b border-slate-700 bg-slate-900">Status</th>
              <th className="p-4 border-b border-slate-700 bg-slate-900 text-right sticky right-0 z-20 shadow-[-4px_0_8px_rgba(0,0,0,0.1)]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 text-slate-300">
            {paginatedData.length > 0 ? (
                paginatedData.map(person => (
                <tr key={person.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="p-4 font-medium text-blue-400">{person.rank}</td>
                    <td className="p-4 font-semibold text-slate-200">{person.lastName}</td>
                    <td className="p-4">{person.firstName}</td>
                    <td className="p-4">{person.middleName || '-'}</td>
                    <td className="p-4">{person.extension || ''}</td>
                    <td className="p-4">{person.gender}</td>
                    
                    {/* Assignments */}
                    <td className="p-4 max-w-[200px] truncate" title={person.officeAssignment.join(', ')}>
                        {person.officeAssignment.join(', ') || '-'}
                    </td>
                    <td className="p-4 max-w-[200px] truncate" title={person.designation.join(', ')}>
                         {person.designation.join(', ') || '-'}
                    </td>

                    {/* Education */}
                    <td className="p-4">{person.education || '-'}</td>
                    <td className="p-4">{person.eligibility || '-'}</td>
                    
                    {/* Dates */}
                    <td className="p-4 font-mono text-slate-400">{person.dateOfBirth}</td>
                    <td className="p-4 font-medium text-slate-200">{calculateAge(person.dateOfBirth)}</td>
                    <td className="p-4 font-mono text-slate-400">{person.dateOfAppointment}</td>
                    <td className="p-4 font-mono text-slate-400">{calculateRetirement(person.dateOfBirth)}</td>
                    
                    <td className="p-4">
                        {person.trainingType ? (
                            <span className="px-2 py-0.5 rounded text-xs bg-slate-700 border border-slate-600 text-slate-300">
                                {person.trainingType}
                            </span>
                        ) : '-'}
                    </td>
                    <td className="p-4 font-mono text-slate-400">{person.dateOfLastPromotion || '-'}</td>

                    <td className="p-4 text-xs italic text-slate-500 max-w-[150px] truncate" title={person.remarks}>
                        {person.remarks}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                         <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                            person.status === 'Active' ? 'bg-blue-900/30 text-blue-400 border border-blue-900' :
                            person.status === 'Retired' ? 'bg-slate-700 text-slate-400 border border-slate-600' :
                            'bg-red-900/20 text-red-400 border border-red-900'
                        }`}>
                            {person.status}
                        </span>
                    </td>

                    <td className="p-4 text-right sticky right-0 bg-slate-800/95 backdrop-blur shadow-[-4px_0_8px_rgba(0,0,0,0.1)]">
                    {canEdit && (
                        <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(person)} className="px-3 py-1.5 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white rounded text-xs font-medium transition-colors border border-yellow-500/30">
                            Update
                        </button>
                         <button onClick={() => { if(confirm('Delete this record?')) onDelete(person.id) }} className="p-1.5 hover:bg-red-900/30 text-red-400 rounded transition-colors">
                            <Trash2 size={16} />
                        </button>
                        </div>
                    )}
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={19} className="p-8 text-center text-slate-500">No personnel found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination & Scrolling */}
      <div className="p-4 border-t border-slate-700 bg-slate-800 rounded-b-lg grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        
        {/* Left: Page Info */}
        <div className="text-sm text-slate-500 text-center md:text-left order-2 md:order-1">
            Page {currentPage} of {totalPages}
        </div>

        {/* Center: Scroll Controls */}
        <div className="flex justify-center items-center gap-2 order-1 md:order-2">
            <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Scroll Table</span>
            <div className="flex gap-1">
                <button 
                    onClick={() => scrollTable('left')} 
                    className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 border border-slate-600 active:scale-95 transition-transform"
                    title="Scroll Left"
                >
                    <ArrowLeft size={16} />
                </button>
                <button 
                    onClick={() => scrollTable('right')} 
                    className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 border border-slate-600 active:scale-95 transition-transform"
                    title="Scroll Right"
                >
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>

        {/* Right: Pagination */}
        <div className="flex justify-center md:justify-end gap-2 order-3">
           <button 
             disabled={currentPage === 1}
             onClick={() => setCurrentPage(p => p - 1)}
             className="p-2 border border-slate-600 text-slate-400 rounded hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-transparent"
           >
             <ChevronLeft size={16} />
           </button>
           <button 
             disabled={currentPage === totalPages || totalPages === 0}
             onClick={() => setCurrentPage(p => p + 1)}
             className="p-2 border border-slate-600 text-slate-400 rounded hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-transparent"
           >
             <ChevronRight size={16} />
           </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-lg shadow-2xl border border-slate-600 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900">
              <h3 className="font-bold text-lg text-slate-200">{editingId ? 'Edit Personnel' : 'Add New Personnel'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="text-slate-400 hover:text-white" /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                
                {/* Personal Info Section */}
                <div>
                    <h4 className="text-sm uppercase tracking-wide text-blue-500 font-bold mb-3 border-b border-slate-700 pb-1">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium mb-1 text-slate-400">Rank *</label>
                            <select required className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-slate-200 outline-none" value={formData.rank} onChange={e => setFormData({...formData, rank: e.target.value as Rank})}>
                                {RANK_ORDER.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium mb-1 text-slate-400">First Name *</label>
                            <input required type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-slate-200 outline-none" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium mb-1 text-slate-400">Middle Name</label>
                            <input type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-slate-200 outline-none" value={formData.middleName || ''} onChange={e => setFormData({...formData, middleName: e.target.value})} />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium mb-1 text-slate-400">Last Name *</label>
                            <input required type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-slate-200 outline-none" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium mb-1 text-slate-400">Ext (Jr, Sr)</label>
                            <input type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-slate-200 outline-none" value={formData.extension} onChange={e => setFormData({...formData, extension: e.target.value})} />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium mb-1 text-slate-400">Gender</label>
                            <select className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-slate-200 outline-none" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium mb-1 text-slate-400">Date of Birth</label>
                            <input type="date" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-slate-200 outline-none scheme-dark" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} />
                        </div>
                         <div className="col-span-1">
                            <label className="block text-sm font-medium mb-1 text-slate-400">Course / Education</label>
                            <input type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-slate-200 outline-none" value={formData.education || ''} onChange={e => setFormData({...formData, education: e.target.value})} />
                        </div>
                    </div>
                </div>

                {/* Service Info */}
                <div>
                    <h4 className="text-sm uppercase tracking-wide text-blue-500 font-bold mb-3 border-b border-slate-700 pb-1">Service Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium mb-1 text-slate-400">Date of Appointment</label>
                            <input required type="date" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-slate-200 outline-none scheme-dark" value={formData.dateOfAppointment} onChange={e => setFormData({...formData, dateOfAppointment: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-400">Date Last Promotion</label>
                            <input type="date" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-slate-200 outline-none scheme-dark" value={formData.dateOfLastPromotion || ''} onChange={e => setFormData({...formData, dateOfLastPromotion: e.target.value})} />
                        </div>
                        
                        <div className="col-span-2">
                             <label className="block text-sm font-medium mb-1 text-slate-400">Office Assignments (Separate multiple with commas)</label>
                             <input 
                                type="text"
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-slate-200 outline-none placeholder-slate-600"
                                placeholder="e.g. Regional Office, Tacloban City Jail"
                                value={officeInput}
                                onChange={e => setOfficeInput(e.target.value)}
                             />
                        </div>
                         <div className="col-span-2">
                             <label className="block text-sm font-medium mb-1 text-slate-400">Designations (Separate multiple with commas)</label>
                             <input 
                                type="text"
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-slate-200 outline-none placeholder-slate-600"
                                placeholder="e.g. Warden, HR Officer"
                                value={designationInput}
                                onChange={e => setDesignationInput(e.target.value)}
                             />
                        </div>
                    </div>
                </div>

                {/* Status & Remarks */}
                <div>
                     <h4 className="text-sm uppercase tracking-wide text-blue-500 font-bold mb-3 border-b border-slate-700 pb-1">Status & Training</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-400">Status</label>
                             <select className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-slate-200 outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                                <option value="Active">Active</option>
                                <option value="Retired">Retired</option>
                                <option value="Suspended">Suspended</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1 text-slate-400">Acquired Training</label>
                            <select 
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-slate-200 outline-none"
                                value={formData.trainingType || ''}
                                onChange={e => setFormData({...formData, trainingType: e.target.value})}
                            >
                                <option value="">SELECT</option>
                                {TRAINING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-400">Eligibility</label>
                            <input type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-slate-200 outline-none" placeholder="e.g. NAPOLCOM, CS Prof" value={formData.eligibility} onChange={e => setFormData({...formData, eligibility: e.target.value})} />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1 text-slate-400">Remarks (Schooling format: ON-TYPE-SCHOOLING(Date))</label>
                            <textarea className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-slate-200 outline-none" rows={2} value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} />
                        </div>
                     </div>
                </div>

            </form>

            <div className="p-4 border-t border-slate-700 bg-slate-900 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
              <button type="submit" onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors">Save Personnel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonnelList;
