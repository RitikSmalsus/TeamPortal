
import React, { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { User, AssetFamily, AssetType, HardwareProduct, SoftwareProfile } from '../types';

interface RequestAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (familyId: string, notes: string) => void;
  user: User;
  assetFamilies: AssetFamily[];
  category: 'Microsoft' | 'External' | 'Hardware' | null;
}

const RequestAssetModal: React.FC<RequestAssetModalProps> = ({ isOpen, onClose, onSubmit, user, assetFamilies, category }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const availableFamilies = useMemo(() => {
    if (!category) return assetFamilies;

    const categoryMap = {
        'Microsoft': { type: AssetType.LICENSE, category: 'Microsoft' },
        'External': { type: AssetType.LICENSE, category: 'External' },
        'Hardware': { type: AssetType.HARDWARE, category: null }
    };
    
    const catDetails = categoryMap[category];
    
    return assetFamilies.filter(family => {
        if (catDetails.type === AssetType.HARDWARE) {
            return family.assetType === AssetType.HARDWARE;
        }
        return family.assetType === catDetails.type && family.category === catDetails.category;
    });
  }, [assetFamilies, category]);

  const searchedFamilies = useMemo(() => {
    if (!searchTerm) {
      return availableFamilies;
    }
    return availableFamilies.filter(family =>
      family.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableFamilies, searchTerm]);


  const handleSubmit = () => {
    if (selectedFamilyId) {
      onSubmit(selectedFamilyId, notes);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-800">New Asset Request{category && `: ${category}`}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
            <p className="text-sm text-slate-600 mb-4">Select an asset type from the list below to submit a request for <span className="font-semibold">{user.fullName}</span>.</p>
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                type="text"
                placeholder="Search for an asset type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 mb-4">
                {searchedFamilies.length > 0 ? searchedFamilies.map(family => (
                    <div 
                        key={family.id} 
                        onClick={() => setSelectedFamilyId(family.id)}
                        className={`p-3 rounded-md border cursor-pointer transition-all duration-150 ${selectedFamilyId === family.id ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-300' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                    >
                        <p className="font-semibold text-sm text-slate-800">{family.name}</p>
                        <p className="text-xs text-slate-500">{family.description || `${family.category} - ${family.assetType === AssetType.HARDWARE ? (family as HardwareProduct).manufacturer : (family as SoftwareProfile).vendor}`}</p>
                    </div>
                )) : (
                    <div className="text-center py-8 text-slate-500">
                        <p>No asset families found{category && ` in the ${category} category`}.</p>
                    </div>
                )}
            </div>
            
            <div>
              <label htmlFor="request-notes" className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
              <textarea
                id="request-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Provide a reason for your request..."
                className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end items-center gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Cancel
            </button>
            <button 
                type="button" 
                onClick={handleSubmit} 
                disabled={!selectedFamilyId}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              Submit Request
            </button>
          </div>
      </div>
    </div>
  );
};

export default RequestAssetModal;