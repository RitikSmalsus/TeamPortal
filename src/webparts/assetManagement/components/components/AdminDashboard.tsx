
import React, { useState } from 'react';
import { Plus, Database, List, Hash, Upload, Download, Eye, Edit2, Save, ExternalLink, Sliders, RefreshCw, Trash2, Building, Wrench, BarChart3 } from 'lucide-react';
import { Asset, User, AssetFamily, Config, AssetType, IdSection, IdSectionType, SoftwareProfile, HardwareProduct, Vendor } from '../types';
import DataImportModal, { ImportType } from './DataImportModal';
import DataTable from './DataTable';
import ModalSettingsEditor from './ModalSettingsEditor';
import VendorFormModal from './VendorFormModal';

interface AdminDashboardProps {
    config: Config;
    onUpdateConfig: (newConfig: Config) => void;
    users: User[];
    assets: Asset[];
    families: AssetFamily[];
    vendors: Vendor[];
    onUpdateVendors: (vendors: Vendor[]) => void;
    onImportData?: (type: ImportType, data: any[]) => void;
    onNavigateToFamily?: (family: AssetFamily) => void;
    onEditFamily?: (family: AssetFamily) => void;
    onAddFamily?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ config, onUpdateConfig, users, assets, families, vendors, onUpdateVendors, onImportData, onNavigateToFamily, onEditFamily, onAddFamily }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'picklists' | 'ids' | 'data' | 'modals' | 'reports'>('picklists');
    const [metadataSubTab, setMetadataSubTab] = useState<'types' | 'products' | 'sites' | 'departments' | 'vendors'>('types');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

    const handleAddSimpleItem = (key: keyof Config, item: string) => {
        if (Array.isArray(config[key]) && !(config[key] as string[]).includes(item)) {
            onUpdateConfig({ ...config, [key]: [...(config[key] as string[]), item] });
        }
    };
    const handleRemoveSimpleItem = (key: keyof Config, item: string) => {
        if (Array.isArray(config[key])) {
            onUpdateConfig({ ...config, [key]: (config[key] as string[]).filter(i => i !== item) });
        }
    };

    const handleAddVendor = () => {
        setEditingVendor(null);
        setIsVendorModalOpen(true);
    };
    const handleEditVendor = (vendor: Vendor) => {
        setEditingVendor(vendor);
        setIsVendorModalOpen(true);
    };
    const handleSaveVendor = (vendorData: Partial<Vendor>) => {
        if (editingVendor) {
            onUpdateVendors(vendors.map(v => v.id === editingVendor.id ? { ...v, ...vendorData } as Vendor : v));
        } else {
            onUpdateVendors([...vendors, { id: `v-${Date.now()}`, ...vendorData } as Vendor]);
        }
        setIsVendorModalOpen(false);
    };
    const handleDeleteVendor = (id: string) => { if (confirm("Delete this vendor?")) onUpdateVendors(vendors.filter(v => v.id !== id)); };

    const siteData = config.sites.map(s => ({ id: s, name: s }));
    const deptData = config.departments.map(d => ({ id: d, name: d }));
    const assetTypesData = config.assetTypes || [];

    const downloadData = () => {
        const blob = new Blob([JSON.stringify({ users, assets, families, vendors, config }, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `backup.json`; a.click();
    };

    return (
        <div className="d-flex flex-column gap-4">
            <div className="card border-0 shadow-sm p-2 bg-white">
                <nav className="nav nav-pills gap-2 flex-nowrap overflow-auto">
                    <button onClick={() => setActiveTab('general')} className={`nav-link btn-sm fw-bold border-0 ${activeTab === 'general' ? 'active' : 'text-secondary'}`}><Wrench size={16} className="me-2" /> General</button>
                    <button onClick={() => setActiveTab('picklists')} className={`nav-link btn-sm fw-bold border-0 ${activeTab === 'picklists' ? 'active' : 'text-secondary'}`}><List size={16} className="me-2" /> Picklists</button>
                    <button onClick={() => setActiveTab('ids')} className={`nav-link btn-sm fw-bold border-0 ${activeTab === 'ids' ? 'active' : 'text-secondary'}`}><Hash size={16} className="me-2" /> ID Config</button>
                    <button onClick={() => setActiveTab('modals')} className={`nav-link btn-sm fw-bold border-0 ${activeTab === 'modals' ? 'active' : 'text-secondary'}`}><Sliders size={16} className="me-2" /> Modals</button>
                    <button onClick={() => setActiveTab('data')} className={`nav-link btn-sm fw-bold border-0 ${activeTab === 'data' ? 'active' : 'text-secondary'}`}><Database size={16} className="me-2" /> Data</button>
                    <button onClick={() => setActiveTab('reports')} className={`nav-link btn-sm fw-bold border-0 ${activeTab === 'reports' ? 'active' : 'text-secondary'}`}><BarChart3 size={16} className="me-2" /> Reports</button>
                </nav>
            </div>

            {activeTab === 'general' && (
                <div className="card border-0 shadow-sm p-4" style={{ maxWidth: '800px' }}>
                    <h5 className="fw-bold mb-4">System Configuration</h5>
                    <div className="list-group list-group-flush">
                        <div className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center">
                            <div><p className="fw-bold mb-0">Assignment (Software)</p><p className="small text-secondary mb-0">Default behavior for new licenses</p></div>
                            <select className="form-select form-select-sm w-auto"><option>Multiple Users</option><option>Single User</option></select>
                        </div>
                        <div className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center">
                            <div><p className="fw-bold mb-0">Assignment (Hardware)</p><p className="small text-secondary mb-0">Default behavior for new hardware</p></div>
                            <select className="form-select form-select-sm w-auto"><option>Single User</option><option>Multiple Users</option></select>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'picklists' && (
                <div className="card border-0 shadow-sm overflow-hidden d-flex flex-column h-100" style={{ minHeight: '600px' }}>
                    <div className="card-header bg-light-subtle px-4 border-0">
                        <nav className="nav nav-underline small fw-bold text-uppercase gap-4">
                            <button onClick={() => setMetadataSubTab('types')} className={`nav-link py-3 ${metadataSubTab === 'types' ? 'active' : 'text-secondary'}`}>Types</button>
                            <button onClick={() => setMetadataSubTab('products')} className={`nav-link py-3 ${metadataSubTab === 'products' ? 'active' : 'text-secondary'}`}>Products</button>
                            <button onClick={() => setMetadataSubTab('vendors')} className={`nav-link py-3 ${metadataSubTab === 'vendors' ? 'active' : 'text-secondary'}`}>Vendors</button>
                            <button onClick={() => setMetadataSubTab('sites')} className={`nav-link py-3 ${metadataSubTab === 'sites' ? 'active' : 'text-secondary'}`}>Sites</button>
                            <button onClick={() => setMetadataSubTab('departments')} className={`nav-link py-3 ${metadataSubTab === 'departments' ? 'active' : 'text-secondary'}`}>Depts</button>
                        </nav>
                    </div>
                    <div className="card-body p-4 flex-grow-1 overflow-auto">
                        {metadataSubTab === 'types' && <DataTable columns={[{ accessorKey: 'name', header: 'Name' }, { accessorKey: 'prefix', header: 'Prefix' }]} data={assetTypesData} />}
                        {metadataSubTab === 'products' && <DataTable columns={[{ accessorKey: 'name', header: 'Product', cell: ({ row }) => <button onClick={() => onNavigateToFamily?.(row.original)} className="btn btn-link btn-sm p-0 fw-bold">{row.original.name}</button> }, { accessorKey: 'assetType', header: 'Type' }, { accessorKey: 'actions', header: '', cell: ({ row }) => <button onClick={() => onEditFamily?.(row.original)} className="btn btn-sm btn-light p-1 text-secondary"><Edit2 size={16} /></button> }]} data={families} addButton={<button className="btn btn-sm btn-primary fw-bold" onClick={onAddFamily}>+ Add</button>} />}
                        {metadataSubTab === 'vendors' && <DataTable columns={[
                            { accessorKey: 'name', header: 'Vendor' },
                            { accessorKey: 'website', header: 'URL', cell: ({ row }) => row.original.website ? <a href={row.original.website} target="_blank" className="small text-truncate d-block" style={{ maxWidth: '150px' }}>{row.original.website}</a> : '-' },
                            { accessorKey: 'contactName', header: 'Contact' },
                            { accessorKey: 'email', header: 'Email', cell: ({ row }) => row.original.email ? <span className="small">{row.original.email}</span> : '-' },
                            {
                                accessorKey: 'actions', header: '', cell: ({ row }) => (
                                    <div className="d-flex gap-1">
                                        <button onClick={() => handleEditVendor(row.original)} className="btn btn-sm btn-light text-secondary p-1"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDeleteVendor(row.original.id)} className="btn btn-sm btn-light text-danger p-1"><Trash2 size={16} /></button>
                                    </div>
                                )
                            }
                        ]} data={vendors} addButton={<button className="btn btn-sm btn-primary fw-bold" onClick={handleAddVendor}>+ Add</button>} />}
                        {metadataSubTab === 'sites' && <DataTable columns={[{ accessorKey: 'name', header: 'Site' }, { accessorKey: 'actions', header: '', cell: ({ row }) => <button onClick={() => handleRemoveSimpleItem('sites', row.original.name)} className="btn btn-sm btn-light text-danger p-1"><Trash2 size={16} /></button> }]} data={siteData} addButton={<button className="btn btn-sm btn-primary fw-bold" onClick={() => { const s = prompt('New Site:'); if (s) handleAddSimpleItem('sites', s); }}>+ Add</button>} />}
                        {metadataSubTab === 'departments' && <DataTable columns={[{ accessorKey: 'name', header: 'Department' }, { accessorKey: 'actions', header: '', cell: ({ row }) => <button onClick={() => handleRemoveSimpleItem('departments', row.original.name)} className="btn btn-sm btn-light text-danger p-1"><Trash2 size={16} /></button> }]} data={deptData} addButton={<button className="btn btn-sm btn-primary fw-bold" onClick={() => { const d = prompt('New Dept:'); if (d) handleAddSimpleItem('departments', d); }}>+ Add</button>} />}
                    </div>
                </div>
            )}

            {activeTab === 'modals' && <div className="card border-0 shadow-sm" style={{ height: '600px' }}><ModalSettingsEditor config={config} onUpdateConfig={onUpdateConfig} /></div>}
            {activeTab === 'data' && (
                <div className="card border-0 shadow-sm p-5 text-center">
                    <h5 className="fw-bold mb-4">Database Operations</h5>
                    <div className="d-flex justify-content-center gap-3">
                        <button onClick={downloadData} className="btn btn-dark d-flex align-items-center gap-2 px-4 py-2"><Download size={18} /> Export JSON</button>
                        <button onClick={() => setIsImportModalOpen(true)} className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2"><Upload size={18} /> Bulk Import</button>
                    </div>
                </div>
            )}
            {activeTab === 'reports' && <div className="card border-0 shadow-sm p-5 text-center bg-light-subtle"><h2 className="fw-bold text-secondary">Advanced Reporting</h2><p className="text-secondary mt-2">Analytics modules for cost optimization and lifecycle tracking coming soon.</p></div>}
            <VendorFormModal isOpen={isVendorModalOpen} onClose={() => setIsVendorModalOpen(false)} onSave={handleSaveVendor} vendor={editingVendor} />
            {onImportData && <DataImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={onImportData} existingFamilies={families.map(f => ({ id: f.id, name: f.name, type: f.assetType }))} />}
        </div>
    );
};

export default AdminDashboard;
