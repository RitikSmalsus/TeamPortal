
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
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1060 }} onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-bottom bg-white p-4">
            <div>
              <h5 className="modal-title fw-bold text-dark">New Asset Request{category && `: ${category}`}</h5>
              <p className="text-secondary small mb-0 mt-1">Submit a request for <span className="fw-bold">{user.fullName}</span></p>
            </div>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 bg-light-subtle">
            <div className="card border-0 shadow-sm p-4 mb-4">
              <div className="relative mb-4">
                <label className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '11px' }}>Search Asset Type</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white border-light-subtle"><Search size={14} className="text-secondary" /></span>
                  <input
                    type="text"
                    placeholder="Search for an asset type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control border-light-subtle"
                  />
                </div>
              </div>

              <div className="list-group list-group-flush border rounded-3 overflow-auto pr-2 mb-4" style={{ maxHeight: '300px' }}>
                {searchedFamilies.length > 0 ? searchedFamilies.map(family => (
                  <button
                    key={family.id}
                    onClick={() => setSelectedFamilyId(family.id)}
                    className={`list-group-item list-group-item-action border-bottom p-3 text-start ${selectedFamilyId === family.id ? 'active bg-primary-subtle border-primary' : ''}`}
                    type="button"
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <p className={`fw-bold mb-0 ${selectedFamilyId === family.id ? 'text-primary' : 'text-dark'}`}>{family.name}</p>
                      <span className={`badge ${family.assetType === AssetType.LICENSE ? 'text-bg-info' : 'text-bg-warning'} text-white`}>{family.assetType}</span>
                    </div>
                    <p className={`small mb-0 ${selectedFamilyId === family.id ? 'text-primary' : 'text-secondary'}`} style={{ fontSize: '12px' }}>
                      {family.description || `${family.category} - ${family.assetType === AssetType.HARDWARE ? (family as HardwareProduct).manufacturer : (family as SoftwareProfile).vendor}`}
                    </p>
                  </button>
                )) : (
                  <div className="text-center py-5 text-secondary small fst-italic">
                    <p className="mb-0">No asset families found{category && ` in the ${category} category`}.</p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="request-notes" className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '11px' }}>Notes (Optional)</label>
                <textarea
                  id="request-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Provide a reason for your request..."
                  className="form-control"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer border-top-0 bg-white p-4">
            <button type="button" onClick={onClose} className="btn btn-light fw-bold px-4">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedFamilyId}
              className="btn btn-primary fw-bold px-4 shadow-sm"
            >
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestAssetModal;