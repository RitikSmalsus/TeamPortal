
import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Plus, Trash2, Search, User as UserIcon, Check, DollarSign, ShieldCheck, Clock, Edit2, RefreshCw, Globe, ChevronRight, KeyRound, Layers, Monitor, FileText, Lock, Unlock, History, MessageSquare } from 'lucide-react';
import { Asset, User, AssetType, AssetStatus, LicenseType, AssetFamily, SoftwareProfile, LicenseVariant, HardwareProduct, ComplianceStatus, HardwareCondition, Config, TabDefinition, Vendor, AssignmentHistory } from '../types';

type ModalMode = 'family' | 'instance';

interface AssetFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveFamily: (family: AssetFamily) => void;
    onSaveAsset: (asset: Asset) => void;
    family: AssetFamily | null;
    asset: Asset | null;
    mode: ModalMode;
    assetType: AssetType;
    allUsers: User[];
    allAssets: Asset[];
    config: Config;
    vendors?: Vendor[];
}

const formatDateForInput = (dateString: string | undefined): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    } catch (e) {
        return '';
    }
};

const getMockExchangeRate = (currency: string, dateStr: string): number => {
    if (currency === 'EUR') return 1;
    const date = new Date(dateStr || new Date());
    const seed = date.getDate() + date.getMonth();
    const baseRates: Record<string, number> = { 'USD': 0.92, 'INR': 0.011, 'GBP': 1.17, 'JPY': 0.006 };
    const base = baseRates[currency] || 1;
    const fluctuation = (seed % 10) / 1000;
    return base + fluctuation;
};

const FormRadioGroup: React.FC<{ label: string; name: string; value?: string; options: { value: string; label: string }[]; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; }> = ({ label, name, value, options, onChange, required = false }) => (
    <div className="mb-3">
        <label className="form-label small fw-bold text-secondary text-uppercase">{label}{required && <span className="text-danger ms-1">*</span>}</label>
        <div className="d-flex flex-wrap gap-2">
            {options.map((option) => (
                <div key={option.value}>
                    <input type="radio" className="btn-check" name={name} id={`${name}-${option.value}`} value={option.value} checked={value === option.value} onChange={onChange} required={required} />
                    <label className="btn btn-sm btn-outline-primary rounded-pill px-3" htmlFor={`${name}-${option.value}`}>{option.label}</label>
                </div>
            ))}
        </div>
    </div>
);

const FormInput: React.FC<{ label: string; name: string; value?: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; required?: boolean; placeholder?: string, step?: string, readOnly?: boolean }> = ({ label, name, value, onChange, type = 'text', required = false, placeholder, step, readOnly = false }) => (
    <div className="mb-3">
        <label htmlFor={name} className="form-label small fw-bold text-secondary text-uppercase">{label} {required && <span className="text-danger ms-1">*</span>}</label>
        <div className="input-group input-group-sm">
            {type === 'number' && name === 'cost' && <span className="input-group-text bg-light border-light-subtle"><DollarSign size={14} className="text-secondary" /></span>}
            <input type={type} name={name} id={name} value={value || ''} onChange={onChange} required={required} placeholder={placeholder} step={step} readOnly={readOnly} className={`form-control ${readOnly ? 'bg-light text-secondary' : ''}`} />
        </div>
    </div>
);

const FormSelect: React.FC<{ label: string; name: string; value?: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; required?: boolean; children: React.ReactNode; }> = ({ label, name, value, onChange, required = false, children }) => (
    <div className="mb-3">
        <label htmlFor={name} className="form-label small fw-bold text-secondary text-uppercase">{label} {required && <span className="text-danger ms-1">*</span>}</label>
        <select name={name} id={name} value={value || ''} onChange={onChange} required={required} className="form-select form-select-sm">{children}</select>
    </div>
);

const FormDateInput: React.FC<{ label: string; name: string; value?: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; children?: React.ReactNode }> = ({ label, name, value, onChange, required = false, children }) => (
    <div className="mb-3">
        <label htmlFor={name} className="form-label small fw-bold text-secondary text-uppercase">{label} {required && <span className="text-danger ms-1">*</span>}</label>
        <div className="d-flex align-items-center gap-2">
            <div className="input-group input-group-sm">
                <input type="date" name={name} id={name} value={value || ''} onChange={onChange} required={required} className="form-control" />
                <span className="input-group-text bg-light border-light-subtle"><Calendar size={14} className="text-secondary" /></span>
            </div>
            {children}
        </div>
    </div>
);

interface UserPickerProps {
    users: User[];
    selectedUserIds: (number | string)[];
    onChange: (userIds: (number | string)[]) => void;
    multiple?: boolean;
    label?: string;
}

const UserPicker: React.FC<UserPickerProps> = ({ users, selectedUserIds, onChange, multiple = false, label }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const filteredUsers = useMemo(() => {
        return users.filter(u => u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [users, searchTerm]);
    const handleSelect = (userId: number | string) => {
        if (multiple) {
            if (selectedUserIds.includes(userId)) onChange(selectedUserIds.filter(id => id !== userId));
            else onChange([...selectedUserIds, userId]);
        } else {
            onChange(selectedUserIds.includes(userId) ? [] : [userId]);
            setIsOpen(false);
        }
    };
    const selectedUsers = users.filter(u => selectedUserIds.includes(u.id));

    return (
        <div className="mb-3">
            {label && <label className="form-label small fw-bold text-secondary text-uppercase">{label}</label>}
            <div className="d-flex flex-wrap gap-2 mb-2">
                {selectedUsers.map(u => (
                    <div key={u.id} className="badge rounded-pill text-bg-primary d-flex align-items-center gap-2 py-1 px-2 border border-primary-subtle">
                        <img src={u.avatarUrl} className="rounded-circle" style={{ width: '16px', height: '16px' }} />
                        <span className="small">{u.fullName}</span>
                        <button type="button" onClick={() => handleSelect(u.id)} className="btn btn-sm p-0 text-white"><X size={12} /></button>
                    </div>
                ))}
                <button type="button" onClick={() => setIsOpen(!isOpen)} className="btn btn-sm btn-outline-primary rounded-pill py-1 px-3 d-flex align-items-center gap-1 small fw-bold">
                    <Plus size={14} /> {selectedUsers.length > 0 ? 'Add' : 'Select User'}
                </button>
            </div>
            {isOpen && (
                <div className="card shadow-lg border-light position-absolute z-3 mt-1" style={{ width: '300px' }}>
                    <div className="card-header bg-light d-flex align-items-center gap-2 py-2">
                        <Search size={14} className="text-secondary" />
                        <input type="text" autoFocus value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Filter users..." className="form-control form-control-sm border-0 bg-transparent shadow-none" />
                        <button type="button" onClick={() => setIsOpen(false)} className="btn btn-sm p-0 text-secondary"><X size={14} /></button>
                    </div>
                    <div className="list-group list-group-flush overflow-auto" style={{ maxHeight: '250px' }}>
                        {filteredUsers.map(user => {
                            const isSelected = selectedUserIds.includes(user.id);
                            return (
                                <button key={user.id} type="button" onClick={() => handleSelect(user.id)} className={`list-group-item list-group-item-action d-flex align-items-center gap-3 py-2 px-3 ${isSelected ? 'active' : ''}`}>
                                    <img src={user.avatarUrl} alt={user.fullName} className="rounded-circle" style={{ width: '32px', height: '32px' }} />
                                    <div className="text-truncate">
                                        <p className="small fw-bold mb-0 text-truncate">{user.fullName}</p>
                                        <p className={`mb-0 text-truncate ${isSelected ? 'text-white-50' : 'text-secondary'}`} style={{ fontSize: '11px' }}>{user.email}</p>
                                    </div>
                                    {isSelected && <Check size={14} className="ms-auto text-white" />}
                                </button>
                            );
                        })}
                        {filteredUsers.length === 0 && <div className="p-3 text-center small text-secondary">No matching users</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

const AssetFormModal: React.FC<AssetFormModalProps> = ({ isOpen, onClose, onSaveFamily, onSaveAsset, family, asset, mode, assetType, allUsers, allAssets, config, vendors = [] }) => {
    const [formData, setFormData] = useState<Partial<Asset & AssetFamily>>({});
    const [activeTab, setActiveTab] = useState('');
    const [currentTabs, setCurrentTabs] = useState<TabDefinition[]>([]);
    const [showAssignmentPopup, setShowAssignmentPopup] = useState(false);
    const [currency, setCurrency] = useState('EUR');
    const [availableCurrencies, setAvailableCurrencies] = useState(['EUR', 'USD', 'INR']);
    const [originalCost, setOriginalCost] = useState<number | string>('');
    const [exchangeRate, setExchangeRate] = useState(1);
    const [isAssetIdLocked, setIsAssetIdLocked] = useState(true);

    const isEditMode = !!asset;
    const isFamilySoftware = formData.assetType === AssetType.LICENSE;
    const isInstanceSoftware = assetType === AssetType.LICENSE;

    useEffect(() => {
        if (isOpen) {
            let contextKey: 'licenseFamily' | 'hardwareFamily' | 'licenseInstance' | 'hardwareInstance';
            if (mode === 'family') contextKey = assetType === AssetType.LICENSE ? 'licenseFamily' : 'hardwareFamily';
            else contextKey = assetType === AssetType.LICENSE ? 'licenseInstance' : 'hardwareInstance';
            const layout = config.modalLayouts?.[contextKey] || { tabs: [] };
            setCurrentTabs(layout.tabs);
            if (layout.tabs.length > 0) setActiveTab(layout.tabs[0].id);
            setShowAssignmentPopup(false);
            setIsAssetIdLocked(true);

            if (mode === 'family') {
                const initialFamilyData: Partial<AssetFamily> = family ? { ...family } : { assetType };
                if (initialFamilyData.assetType === AssetType.LICENSE && !(initialFamilyData as any).variants) (initialFamilyData as any).variants = [];
                if (!initialFamilyData.assignmentModel) initialFamilyData.assignmentModel = assetType === AssetType.LICENSE ? 'Multiple' : 'Single';
                setFormData(initialFamilyData);
            } else {
                if (asset) {
                    setFormData({
                        ...asset,
                        purchaseDate: formatDateForInput(asset.purchaseDate),
                        renewalDate: formatDateForInput(asset.renewalDate),
                        warrantyExpiryDate: formatDateForInput(asset.warrantyExpiryDate),
                    });
                    setCurrency('EUR');
                    setOriginalCost(asset.cost || 0);
                    setExchangeRate(1);
                } else if (family) {
                    const familyPrefix = family.assetType === AssetType.LICENSE ? 'SOFT' : 'HARD';
                    const productCode = (family as any).productCode || 'GEN';
                    const sequenceNumber = String(allAssets.filter(a => a.familyId === family.id).length + 1).padStart(4, '0');
                    setFormData({ familyId: family.id, assetType: family.assetType, status: AssetStatus.AVAILABLE, purchaseDate: new Date().toISOString().split('T')[0], assetId: `${familyPrefix}-${productCode}-${sequenceNumber}`, title: `${family.name} ${sequenceNumber.replace(/^0+/, '')}` });
                    setCurrency('EUR'); setOriginalCost(''); setExchangeRate(1);
                }
            }
        }
    }, [family, asset, mode, assetType, isOpen, allAssets, config.modalLayouts]);

    useEffect(() => {
        const date = formData.purchaseDate || new Date().toISOString().split('T')[0];
        setExchangeRate(getMockExchangeRate(currency, date));
    }, [currency, formData.purchaseDate]);

    useEffect(() => {
        if (originalCost === '') setFormData(prev => ({ ...prev, cost: 0 }));
        else {
            const numCost = parseFloat(String(originalCost));
            if (!isNaN(numCost)) setFormData(prev => ({ ...prev, cost: parseFloat((numCost * exchangeRate).toFixed(2)) }));
        }
    }, [originalCost, exchangeRate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleVariantChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.currentTarget;
        const variants = [...((formData as SoftwareProfile).variants || [])];
        (variants[index] as any)[name] = name === 'cost' ? parseFloat(value) || 0 : value;
        setFormData(prev => ({ ...prev, variants }));
    };
    const addVariant = () => setFormData(prev => ({ ...prev, variants: [...((prev as SoftwareProfile).variants || []), { id: `var-${Date.now()}`, name: '', licenseType: LicenseType.SUBSCRIPTION, cost: 0 }] }));
    const removeVariant = (index: number) => {
        const variants = [...((formData as SoftwareProfile).variants || [])];
        variants.splice(index, 1);
        setFormData(prev => ({ ...prev, variants }));
    };
    const handleUserSelectionChange = (userIds: (number | string)[]) => {
        const selectedUsers = allUsers.filter(u => userIds.includes(u.id));
        const am = family?.assignmentModel || (assetType === AssetType.LICENSE ? 'Multiple' : 'Single');
        if (am === 'Multiple') setFormData(prev => ({ ...prev, assignedUsers: selectedUsers }));
        else setFormData(prev => ({ ...prev, assignedUser: selectedUsers[0] || null }));
        if (showAssignmentPopup && am === 'Single') setShowAssignmentPopup(false);
    };
    const handleActiveUsersChange = (userIds: (number | string)[]) => setFormData(prev => ({ ...prev, activeUsers: allUsers.filter(u => userIds.includes(u.id)) }));
    const setRenewalPeriod = (months: number) => {
        const base = new Date(formData.purchaseDate || new Date().toISOString().split('T')[0]);
        setFormData(prev => ({ ...prev, renewalDate: formatDateForInput(new Date(base.setMonth(base.getMonth() + months)).toISOString()) }));
    };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (mode === 'family') onSaveFamily(formData as AssetFamily); else onSaveAsset(formData as Asset); };

    const renderField = (fieldKey: string) => {
        switch (fieldKey) {
            case 'name': return <FormInput label={isFamilySoftware ? "License Name" : "Product Name"} name="name" value={(formData as any).name} onChange={handleChange} required />;
            case 'productCode': return <FormInput label="Product Code" name="productCode" value={(formData as any).productCode} onChange={handleChange} required />;
            case 'vendor':
            case 'manufacturer': return <FormSelect label={fieldKey === 'vendor' ? 'Vendor' : 'Manufacturer'} name={fieldKey} value={(formData as any)[fieldKey]} onChange={handleChange} required><option value="">Select...</option>{vendors.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}</FormSelect>;
            case 'modelNumber': return <FormInput label="Model No" name="modelNumber" value={(formData as HardwareProduct).modelNumber} onChange={handleChange} />;
            case 'category': return <FormRadioGroup label="Category" name="category" value={(formData as any).category} onChange={handleChange as any} required options={isFamilySoftware ? config.softwareCategories.map(c => ({ value: c, label: c })) : config.hardwareCategories.map(c => ({ value: c, label: c }))} />;
            case 'description': return <div className="mb-3"><label className="form-label small fw-bold text-secondary text-uppercase">Description</label><textarea name="description" value={(formData as any).description || ''} onChange={handleChange} rows={3} className="form-control form-control-sm"></textarea></div>;
            case 'variants': return renderSoftwareProfileForm_VariantsTab();
            case 'assignmentModel': return <FormRadioGroup label="Model" name="assignmentModel" value={(formData as AssetFamily).assignmentModel} onChange={handleChange as any} required options={[{ value: 'Single', label: 'Single' }, { value: 'Multiple', label: 'Multiple' }]} />;
            case 'title': return <FormInput label="Title" name="title" value={formData.title} onChange={handleChange} required />;
            case 'assetId': return (
                <div className="mb-3">
                    <label htmlFor="assetId" className="form-label small fw-bold text-secondary text-uppercase">Asset ID</label>
                    <div className="input-group input-group-sm">
                        <input type="text" name="assetId" value={formData.assetId} onChange={handleChange} readOnly={isAssetIdLocked} className={`form-control font-monospace ${isAssetIdLocked ? 'bg-light' : ''}`} />
                        <button type="button" onClick={() => setIsAssetIdLocked(!isAssetIdLocked)} className={`btn btn-outline-secondary d-flex align-items-center`}>
                            {isAssetIdLocked ? <Lock size={14} /> : <Unlock size={14} />}
                        </button>
                    </div>
                </div>
            );
            case 'status': return <FormSelect label="Status" name="status" value={formData.status} onChange={handleChange} required>{Object.values(AssetStatus).map(s => <option key={s} value={s}>{s}</option>)}</FormSelect>;
            case 'variantType': return <FormSelect label="Variant" name="variantType" value={formData.variantType} onChange={handleChange}><option value="">Select...</option>{(family as SoftwareProfile)?.variants?.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}</FormSelect>;
            case 'licenseKey': return <FormInput label="License Key" name="licenseKey" value={formData.licenseKey} onChange={handleChange} />;
            case 'email': return <FormInput label="Registration Email" name="email" value={formData.email} onChange={handleChange} type="email" />;
            case 'serialNumber': return <FormInput label="Serial Number" name="serialNumber" value={formData.serialNumber} onChange={handleChange} />;
            case 'macAddress': return <FormInput label="MAC Address" name="macAddress" value={formData.macAddress} onChange={handleChange} />;
            case 'location': return <FormInput label="Location" name="location" value={formData.location} onChange={handleChange} />;
            case 'condition': return <FormRadioGroup label="Condition" name="condition" value={formData.condition} onChange={handleChange as any} options={Object.values(HardwareCondition).map(s => ({ value: s, label: s }))} />;
            case 'assignedUsers':
            case 'assignedUser':
                const am = family?.assignmentModel || (assetType === AssetType.LICENSE ? 'Multiple' : 'Single');
                const currentIds = am === 'Multiple' ? formData.assignedUsers?.map(u => u.id) || [] : formData.assignedUser ? [formData.assignedUser.id] : [];
                return <UserPicker users={allUsers} selectedUserIds={currentIds} onChange={handleUserSelectionChange} multiple={am === 'Multiple'} label="Ownership" />;
            case 'activeUsers': return <UserPicker users={allUsers} selectedUserIds={formData.activeUsers?.map(u => u.id) || []} onChange={handleActiveUsersChange} multiple={true} label="Active Users" />;
            case 'currencyTool': return renderCurrencyTool();
            case 'purchaseDate': return <FormDateInput label="Purchase Date" name="purchaseDate" value={formatDateForInput(formData.purchaseDate)} onChange={handleChange} />;
            case 'renewalDate': return <FormDateInput label="Renewal Date" name="renewalDate" value={formatDateForInput(formData.renewalDate)} onChange={handleChange}><div className="btn-group btn-group-sm"><button type="button" onClick={() => setRenewalPeriod(1)} className="btn btn-outline-primary">+1M</button><button type="button" onClick={() => setRenewalPeriod(12)} className="btn btn-outline-primary">+1Y</button></div></FormDateInput>;
            case 'warrantyExpiryDate': return <FormDateInput label="Warranty Expiry" name="warrantyExpiryDate" value={formatDateForInput(formData.warrantyExpiryDate)} onChange={handleChange} />;
            case 'complianceStatus': return <FormRadioGroup label="Compliance" name="complianceStatus" value={formData.complianceStatus} onChange={handleChange as any} options={Object.values(ComplianceStatus).map(s => ({ value: s, label: s }))} />;
            case 'assignmentHistory': return renderHistory();
            default: return null;
        }
    };

    const renderCurrencyTool = () => (
        <div className="mb-3">
            <label className="form-label small fw-bold text-secondary text-uppercase">Financials</label>
            <div className="card bg-light-subtle border p-3">
                <div className="row g-2 mb-3">
                    <div className="col-6">
                        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="form-select form-select-sm">
                            {availableCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="col-6">
                        <input type="number" value={originalCost} onChange={(e) => setOriginalCost(e.target.value)} className="form-control form-control-sm" placeholder="Original Cost" step="0.01" />
                    </div>
                </div>
                <div className="d-flex align-items-center justify-content-between p-2 bg-white rounded border border-light-subtle shadow-sm">
                    <div className="d-flex align-items-center gap-2">
                        <div className="bg-primary-subtle p-2 rounded-circle text-primary"><Globe size={14} /></div>
                        <div>
                            <p className="small text-secondary fw-bold mb-0" style={{ fontSize: '10px' }}>Value in EUR</p>
                            <p className="fw-bold text-dark mb-0">€{formData.cost?.toFixed(2) || '0.00'}</p>
                        </div>
                    </div>
                    <div className="text-end">
                        <p className="text-secondary mb-0" style={{ fontSize: '9px' }}>Rate: {exchangeRate.toFixed(4)}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSoftwareProfileForm_VariantsTab = () => (
        <div className="card p-3 border-light shadow-sm bg-white mb-3">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                <h6 className="fw-bold text-dark mb-0">License Variants</h6>
                <button type="button" onClick={addVariant} className="btn btn-sm btn-link text-decoration-none fw-bold p-0 d-flex align-items-center gap-1"><Plus size={14} />Add Variant</button>
            </div>
            <div className="d-flex flex-column gap-3">
                {((formData as SoftwareProfile).variants || []).map((variant, index) => (
                    <div key={variant.id} className="row g-2 p-2 bg-light rounded border border-light-subtle align-items-end">
                        <div className="col-md-5"><label className="small fw-bold text-secondary text-uppercase mb-1" style={{ fontSize: '10px' }}>Name</label><input className="form-control form-control-sm" name="name" value={variant.name} onChange={(e) => handleVariantChange(index, e)} /></div>
                        <div className="col-md-4"><label className="small fw-bold text-secondary text-uppercase mb-1" style={{ fontSize: '10px' }}>Type</label><select className="form-select form-select-sm" name="licenseType" value={variant.licenseType} onChange={(e) => handleVariantChange(index, e)}>{Object.values(LicenseType).map(lt => <option key={lt} value={lt}>{lt}</option>)}</select></div>
                        <div className="col-md-2"><label className="small fw-bold text-secondary text-uppercase mb-1" style={{ fontSize: '10px' }}>Cost</label><input className="form-control form-control-sm" name="cost" value={variant.cost} onChange={(e) => handleVariantChange(index, e)} type="number" /></div>
                        <div className="col-md-1"><button type="button" onClick={() => removeVariant(index)} className="btn btn-sm btn-outline-danger p-1"><Trash2 size={14} /></button></div>
                    </div>
                ))}
                {((formData as SoftwareProfile).variants || []).length === 0 && <div className="text-center py-4 text-secondary small fst-italic">No tiers defined</div>}
            </div>
        </div>
    );

    const renderHistory = () => {
        const fullHistory = (formData as Asset).assignmentHistory || [];
        const sorted = [...fullHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return (
            <div className="d-flex flex-column gap-4">
                <div>
                    <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2"><Clock size={16} className="text-primary" /> Assignment History</h6>
                    <div className="table-responsive rounded border">
                        <table className="table table-sm table-striped mb-0 small">
                            <thead className="table-light"><tr><th>Date</th><th>Type</th><th>Target</th><th>Note</th></tr></thead>
                            <tbody>
                                {sorted.map((h, i) => (
                                    <tr key={i}>
                                        <td className="text-secondary">{h.date}</td>
                                        <td><span className="badge text-bg-info text-white">{h.type}</span></td>
                                        <td className="fw-bold">{h.assignedTo || h.assignedFrom || '-'}</td>
                                        <td className="text-secondary">{h.notes}</td>
                                    </tr>
                                ))}
                                {sorted.length === 0 && <tr><td colSpan={4} className="text-center py-3 fst-italic text-secondary">No log entries</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1060 }} onClick={onClose}>
            <div className="modal-dialog modal-xl modal-dialog-scrollable modal-dialog-centered" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="modal-content border-0 shadow-lg">
                    <div className="modal-header border-bottom-0 bg-white p-4">
                        <div className="d-flex flex-column">
                            <h5 className="modal-title fw-bold text-dark">{mode === 'family' ? 'Asset Product Profile' : 'Asset Instance Profile'}</h5>
                            <p className="text-secondary small fw-bold font-monospace mb-0 mt-1">{mode === 'instance' ? formData.assetId : 'Global Template'}</p>
                        </div>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="px-4 border-bottom bg-white overflow-auto">
                        <nav className="nav nav-underline flex-nowrap">
                            {currentTabs.map(tab => (
                                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`nav-link small fw-bold text-uppercase py-3 ${activeTab === tab.id ? 'active' : 'text-secondary'}`}>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="modal-body bg-light-subtle p-4">
                        {isEditMode && mode === 'instance' && activeTab === 'general' && (
                            <div className="card shadow-sm border-0 p-4 mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="fw-bold text-dark text-uppercase small mb-0">Primary Assignment</h6>
                                    <button type="button" onClick={() => setShowAssignmentPopup(!showAssignmentPopup)} className="btn btn-sm btn-light border p-1 rounded"><Edit2 size={14} /></button>
                                </div>
                                {(isInstanceSoftware ? formData.assignedUsers : [formData.assignedUser])?.filter(Boolean).length ? (
                                    <div className="d-flex flex-column gap-2">
                                        {(isInstanceSoftware ? formData.assignedUsers : [formData.assignedUser])?.filter((u): u is User => !!u).map(u => (
                                            <div key={u.id} className="d-flex align-items-center justify-content-between bg-light p-3 rounded border">
                                                <div className="d-flex align-items-center gap-3">
                                                    <img src={u.avatarUrl} alt={u.fullName} className="rounded-circle border" style={{ width: '32px', height: '32px' }} />
                                                    <div>
                                                        <p className="small fw-bold text-dark mb-0">{u.fullName}</p>
                                                        <p className="small text-secondary mb-0" style={{ fontSize: '11px' }}><Calendar size={10} className="me-1" /> Assigned: {formData.modified?.split('T')[0] || '-'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 bg-light border border-dashed rounded text-secondary small fst-italic">Currently in Inventory</div>
                                )}
                                {showAssignmentPopup && (
                                    <div className="position-absolute end-0 top-0 mt-5 me-5 z-3 shadow-lg p-1 bg-white border rounded">
                                        <UserPicker users={allUsers} selectedUserIds={(isInstanceSoftware ? formData.assignedUsers?.map(u => u.id) : [formData.assignedUser?.id])?.filter((id): id is string | number => id !== undefined && id !== null) || []} onChange={handleUserSelectionChange} multiple={isInstanceSoftware} />
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="d-flex flex-column gap-4">
                            {currentTabs.find(t => t.id === activeTab)?.sections.map(section => (
                                <div key={section.id} className="card border-0 shadow-sm p-4">
                                    <h6 className="fw-bold text-primary text-uppercase mb-4 pb-2 border-bottom">{section.title}</h6>
                                    <div className="row g-4">
                                        {section.fields.map(fieldKey => (
                                            <div key={fieldKey} className={`col-md-${12 / section.columns}`}>
                                                {renderField(fieldKey)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="modal-footer border-top-0 bg-white p-4 justify-content-between">
                        <div className="small text-secondary" style={{ fontSize: '10px' }}>
                            {asset && (<> <p className="mb-0">Created: {new Date(asset.created).toLocaleString()}</p> <p className="mb-0">Modified: {new Date(asset.modified).toLocaleString()}</p> </>)}
                        </div>
                        <div className="d-flex gap-2">
                            <button type="button" onClick={onClose} className="btn btn-light fw-bold px-4">Cancel</button>
                            <button type="submit" className="btn btn-primary fw-bold px-4">{isEditMode || family ? 'Update Records' : 'Create New'}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssetFormModal;
