
import React, { useState, useEffect, useMemo } from 'react';
import { Asset, User, ColumnDef, AssetType, AssetStatus, Request, RequestStatus, AssetFamily, SoftwareProfile, Config, Task, TaskStatus, Vendor, AssignmentHistory } from './types';
import { getMockAssets, getMockUsers, getMockRequests, getMockAssetFamilies, getMockVendors } from './services/mockData';
import DataTable from './components/DataTable';
import UserProfile from './components/UserProfile';
import AssetFormModal from './components/AssetFormModal';
import EditProfileModal from './components/EditProfileModal';
import RequestAssetModal from './components/RequestAssetModal';
import AssetProfile from './components/AssetProfile';
import AdminDashboard from './components/AdminDashboard';
import TaskModal from './components/TaskModal';
import { ImportType } from './components/DataImportModal';
import { Plus, Edit, FileText, Package, UserCheck, PackageOpen, Clock, Users, Tv, KeyRound, ArrowRight, User as UserIcon, ThumbsUp, ThumbsDown, Check, X, Folder, Layers, LineChart, Settings, LayoutDashboard, FileSpreadsheet, Monitor, UserSquare2, ClipboardList, BarChart3, ShieldAlert, List, ChevronDown, LogOut, Briefcase, UserPlus, AlertCircle, TrendingUp, CheckSquare, ListTodo, Search } from 'lucide-react';

type View = 'dashboard' | 'licenses' | 'hardware' | 'users' | 'requests' | 'reports' | 'admin';
type ModalMode = 'family' | 'instance';
type RequestCategory = 'Microsoft' | 'External' | 'Hardware';

const StatCard: React.FC<{ icon: React.ElementType, title: string, value: string | number, color: string, subtext?: string, onClick?: () => void }> = ({ icon: Icon, title, value, color, subtext, onClick }) => (
    <div
        onClick={onClick}
        className={`card h-100 shadow-sm border-0 transition-all ${onClick ? 'cursor-pointer' : ''}`}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
        <div className="card-body d-flex align-items-start justify-content-between">
            <div>
                <p className="text-secondary small fw-medium mb-1">{title}</p>
                <p className="h3 fw-bold text-dark mb-0">{value}</p>
                {subtext && <p className="text-muted small mt-1 mb-0" style={{ fontSize: '0.75rem' }}>{subtext}</p>}
            </div>
            <div className="p-3 rounded-3" style={{ backgroundColor: `${color}1A` }}>
                <Icon size={24} style={{ color }} />
            </div>
        </div>
    </div>
);

const UserSwitcher: React.FC<{ users: User[], currentUser: User | null, onSwitch: (user: User) => void }> = ({ users, currentUser, onSwitch }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="dropdown">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-light rounded-pill border d-flex align-items-center gap-2 px-3 py-1"
            >
                <div className="rounded-circle bg-secondary-subtle d-flex align-items-center justify-content-center overflow-hidden" style={{ width: '32px', height: '32px' }}>
                    {currentUser ? <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-100 h-100 object-fit-cover" /> : <UserIcon size={18} className="text-secondary" />}
                </div>
                <div className="text-start d-none d-sm-block">
                    <p className="small fw-semibold mb-0 text-dark" style={{ lineHeight: '1.2' }}>{currentUser?.fullName || 'Select User'}</p>
                    <p className="mb-0 text-secondary text-uppercase fw-bold" style={{ fontSize: '10px' }}>{currentUser?.role || 'Guest'}</p>
                </div>
                <ChevronDown size={14} className="text-secondary" />
            </button>

            {isOpen && (
                <div className="dropdown-menu show end-0 shadow-lg border-light py-2" style={{ width: '350px', position: 'absolute' }}>
                    <div className="dropdown-header text-uppercase small fw-bold text-secondary mb-1">
                        Switch Account (Mock)
                    </div>
                    <div className="row g-0 overflow-auto" style={{ maxHeight: '400px' }}>
                        {users.map(user => (
                            <div key={user.id} className="col-6">
                                <button
                                    onClick={() => { onSwitch(user); setIsOpen(false); }}
                                    className={`dropdown-item d-flex align-items-center gap-2 py-2 px-3 border-bottom border-transparent ${currentUser?.id === user.id ? 'bg-primary-subtle' : ''}`}
                                >
                                    <img src={user.avatarUrl} alt={user.fullName} className="rounded-circle object-fit-cover" style={{ width: '24px', height: '24px' }} />
                                    <div className="text-truncate">
                                        <p className={`small fw-medium mb-0 text-truncate ${currentUser?.id === user.id ? 'text-primary' : 'text-dark'}`}>{user.fullName}</p>
                                    </div>
                                    {currentUser?.id === user.id && <Check size={12} className="ms-auto text-primary" />}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const GlobalSearch: React.FC<{ users: User[], assets: Asset[], families: AssetFamily[], onSelect: (type: 'user' | 'asset' | 'family', item: any) => void }> = ({ users, assets, families, onSelect }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filteredResults = useMemo(() => {
        if (!query) return { users: [], assets: [], families: [] };
        const q = query.toLowerCase();
        return {
            users: users.filter(u => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)).slice(0, 3),
            assets: assets.filter(a => a.title.toLowerCase().includes(q) || a.assetId.toLowerCase().includes(q)).slice(0, 3),
            families: families.filter(f => f.name.toLowerCase().includes(q)).slice(0, 3)
        }
    }, [query, users, assets, families]);

    const hasResults = filteredResults.users.length > 0 || filteredResults.assets.length > 0 || filteredResults.families.length > 0;

    return (
        <div className="position-relative w-100 d-none d-lg-block" style={{ maxWidth: '450px' }}>
            <div className="input-group">
                <span className="input-group-text bg-light border-0"><Search size={16} className="text-secondary" /></span>
                <input
                    type="text"
                    placeholder="Search users, assets, products..."
                    value={query}
                    onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    className="form-control form-control-sm bg-light border-0 py-2"
                />
            </div>
            {isOpen && query && hasResults && (
                <div className="dropdown-menu show w-100 shadow border-light py-2 position-absolute mt-1">
                    {filteredResults.users.length > 0 && (
                        <div>
                            <div className="dropdown-header text-uppercase small fw-bold bg-light py-2">Users</div>
                            {filteredResults.users.map(u => (
                                <button key={u.id} onMouseDown={() => onSelect('user', u)} className="dropdown-item d-flex align-items-center gap-2 py-2">
                                    <img src={u.avatarUrl} className="rounded-circle" style={{ width: '24px', height: '24px' }} />
                                    <span className="small text-dark">{u.fullName}</span>
                                </button>
                            ))}
                        </div>
                    )}
                    {filteredResults.assets.length > 0 && (
                        <div>
                            <div className="dropdown-header text-uppercase small fw-bold bg-light py-2 border-top">Assets</div>
                            {filteredResults.assets.map(a => (
                                <button key={a.id} onMouseDown={() => onSelect('asset', a)} className="dropdown-item py-2">
                                    <p className="small fw-medium mb-0 text-dark">{a.title}</p>
                                    <p className="mb-0 text-secondary font-monospace" style={{ fontSize: '11px' }}>{a.assetId}</p>
                                </button>
                            ))}
                        </div>
                    )}
                    {filteredResults.families.length > 0 && (
                        <div>
                            <div className="dropdown-header text-uppercase small fw-bold bg-light py-2 border-top">Products</div>
                            {filteredResults.families.map(f => (
                                <button key={f.id} onMouseDown={() => onSelect('family', f)} className="dropdown-item py-2">
                                    <p className="small fw-medium mb-0 text-dark">{f.name}</p>
                                    <p className="mb-0 text-secondary" style={{ fontSize: '11px' }}>{f.assetType}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const App: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [assetFamilies, setAssetFamilies] = useState<AssetFamily[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [requests, setRequests] = useState<Request[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);

    const [config, setConfig] = useState<Config>({
        softwareCategories: ['Microsoft', 'External'],
        hardwareCategories: ['Laptop', 'Monitor', 'Keyboard', 'Mac Mini', 'Accessory'],
        sites: ['HR', 'GMBH', 'SMALSUS'],
        departments: ['SharePoint Framework (SPFx)', 'Cloud Services', 'Testing', 'Design', 'Infrastructure', 'Management'],
        idConfiguration: [
            { id: 'sec-1', type: 'attribute', value: 'prefix', label: 'Prefix', length: 4, uppercase: true },
            { id: 'sec-3', type: 'attribute', value: 'productCode', label: 'Product Code', length: 4, uppercase: true },
            { id: 'sec-5', type: 'attribute', value: 'version', label: 'Version Code', length: 3, uppercase: true },
            { id: 'sec-7', type: 'sequence', value: 'sequence', label: 'Sequence', length: 4, paddingChar: '0' },
        ],
        idSeparator: '-',
        assetTypes: [
            { id: 'at-1', name: 'License', prefix: 'LIC' },
            { id: 'at-2', name: 'Hardware', prefix: 'HW' },
            { id: 'at-3', name: 'Platform Accounts', prefix: 'ACC' },
        ],
        modalLayouts: {
            licenseFamily: {
                tabs: [
                    {
                        id: 'profile',
                        label: 'Profile Information',
                        sections: [
                            { id: 'sec-ident', title: 'Identity', columns: 2, fields: ['name', 'productCode', 'vendor', 'assignmentModel'] },
                            { id: 'sec-class', title: 'Classification', columns: 2, fields: ['category', 'description'] }
                        ]
                    },
                    {
                        id: 'variants',
                        label: 'Variants',
                        sections: [
                            { id: 'sec-var', title: 'Tier Configuration', columns: 1, fields: ['variants'] }
                        ]
                    }
                ]
            },
            hardwareFamily: {
                tabs: [
                    {
                        id: 'profile',
                        label: 'General Details',
                        sections: [
                            { id: 'sec-hw-ident', title: 'Identity', columns: 2, fields: ['name', 'productCode', 'modelNumber', 'manufacturer', 'assignmentModel'] },
                            { id: 'sec-hw-class', title: 'Classification', columns: 2, fields: ['category', 'description'] }
                        ]
                    }
                ]
            },
            licenseInstance: {
                tabs: [
                    {
                        id: 'general',
                        label: 'General Details',
                        sections: [
                            { id: 'sec-li-gen', title: 'Core Info', columns: 2, fields: ['title', 'assetId', 'status', 'variantType', 'licenseKey', 'email'] }
                        ]
                    },
                    {
                        id: 'assignment',
                        label: 'Assignments',
                        sections: [
                            { id: 'sec-li-assign', title: 'Ownership & Active Users', columns: 2, fields: ['assignedUsers', 'activeUsers'] }
                        ]
                    },
                    {
                        id: 'financials',
                        label: 'Financials & Compliance',
                        sections: [
                            { id: 'sec-li-fin', title: 'Costing', columns: 1, fields: ['currencyTool'] },
                            { id: 'sec-li-dates', title: 'Dates & Status', columns: 2, fields: ['purchaseDate', 'renewalDate', 'complianceStatus'] }
                        ]
                    },
                    {
                        id: 'history',
                        label: 'History',
                        sections: [
                            { id: 'sec-li-hist', title: 'Assignment & Usage Log', columns: 1, fields: ['assignmentHistory'] }
                        ]
                    }
                ]
            },
            hardwareInstance: {
                tabs: [
                    {
                        id: 'general',
                        label: 'General Details',
                        sections: [
                            { id: 'sec-hi-gen', title: 'Core Info', columns: 2, fields: ['title', 'assetId', 'status', 'serialNumber', 'macAddress', 'location', 'condition'] }
                        ]
                    },
                    {
                        id: 'assignment',
                        label: 'Assignments',
                        sections: [
                            { id: 'sec-hi-assign', title: 'Ownership & Active Users', columns: 2, fields: ['assignedUser', 'activeUsers'] }
                        ]
                    },
                    {
                        id: 'financials',
                        label: 'Financials & Dates',
                        sections: [
                            { id: 'sec-hi-fin', title: 'Costing', columns: 1, fields: ['currencyTool'] },
                            { id: 'sec-hi-dates', title: 'Dates', columns: 2, fields: ['purchaseDate', 'warrantyExpiryDate'] }
                        ]
                    },
                    {
                        id: 'history',
                        label: 'History',
                        sections: [
                            { id: 'sec-hi-hist', title: 'Assignment & Usage Log', columns: 1, fields: ['assignmentHistory'] }
                        ]
                    }
                ]
            },
            userProfile: {
                tabs: [
                    {
                        id: 'basic',
                        label: 'Basic Information',
                        sections: [
                            { id: 'sec-u-gen', title: 'General', columns: 3, fields: ['firstName', 'lastName', 'suffix', 'jobTitle', 'department', 'site', 'typeOfContact'] },
                            { id: 'sec-u-soc', title: 'Social Media Accounts', columns: 2, fields: ['linkedin', 'twitter', 'facebook', 'instagram'] },
                            { id: 'sec-u-con', title: 'Contacts', columns: 2, fields: ['businessPhone', 'mobileNo', 'email', 'nonPersonalEmail', 'homePhone', 'skype', 'address', 'city'] },
                            { id: 'sec-u-com', title: 'Comments', columns: 1, fields: ['notes'] }
                        ]
                    },
                    {
                        id: 'image',
                        label: 'Image Information',
                        sections: [
                            { id: 'sec-u-img', title: 'Avatar', columns: 1, fields: ['avatarUpload'] }
                        ]
                    }
                ]
            }
        }
    });

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);

    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('instance');
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [editingFamily, setEditingFamily] = useState<AssetFamily | null>(null);

    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [requestingUser, setRequestingUser] = useState<User | null>(null);
    const [requestCategory, setRequestCategory] = useState<RequestCategory | null>(null);

    // Task Modal State
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [requestForTask, setRequestForTask] = useState<Request | null>(null);

    const [activeView, setActiveView] = useState<View>('dashboard');
    const [assetViewMode, setAssetViewMode] = useState<'families' | 'items'>('items');

    useEffect(() => {
        const mockUsers = getMockUsers();
        setUsers(mockUsers);
        setAssetFamilies(getMockAssetFamilies());
        setAssets(getMockAssets());
        setRequests(getMockRequests());
        setVendors(getMockVendors());

        // Set default user (Admin)
        if (mockUsers.length > 0) {
            setCurrentUser(mockUsers[0]);
        }
    }, []);

    // Update view mode when switching users to avoid restricted views
    useEffect(() => {
        if (currentUser && currentUser.role !== 'admin') {
            if (['users', 'admin', 'reports'].includes(activeView)) {
                setActiveView('dashboard');
            }
            // Normal users default to Item view
            setAssetViewMode('items');
        }
    }, [currentUser, activeView]);

    const isAdmin = currentUser?.role === 'admin';
    const adminUsers = useMemo(() => users.filter(u => u.role === 'admin'), [users]);

    const handleNavigation = (view: View) => {
        setActiveView(view);
        setSelectedUser(null);
        setSelectedFamilyId(null);
        // Admins default to Items view as per request, with toggle available
        if (view === 'licenses' || view === 'hardware') {
            setAssetViewMode('items');
        }
    };

    const handleUserClick = (user: User) => {
        // Only admins can view other profiles
        if (isAdmin || user.id === currentUser?.id) {
            setSelectedUser(user);
            setSelectedFamilyId(null);
        }
    };

    const handleFamilyClick = (family: AssetFamily) => {
        setSelectedFamilyId(family.id);
        setSelectedUser(null);
    };

    const handleBackToList = () => {
        setSelectedUser(null);
        setSelectedFamilyId(null);
    };

    const handleGlobalSearchSelect = (type: 'user' | 'asset' | 'family', item: any) => {
        if (type === 'user') {
            handleUserClick(item);
        } else if (type === 'asset') {
            if (isAdmin) {
                handleEditAsset(item);
            } else {
                alert(`Selected Asset: ${item.title}`);
            }
        } else if (type === 'family') {
            if (isAdmin) {
                handleFamilyClick(item);
            }
        }
    };

    const handleSaveFamily = (family: AssetFamily) => {
        if (editingFamily) {
            setAssetFamilies(assetFamilies.map(f => f.id === family.id ? { ...family, lastModifiedDate: new Date().toISOString() } : f));
        } else {
            const productCode = family.name.substring(0, 4).toUpperCase();
            const newFamily = { ...family, id: `fam-${new Date().toISOString()}`, productCode, createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() };
            setAssetFamilies([...assetFamilies, newFamily as AssetFamily]);
        }
        closeAssetModal();
    };

    const handleBulkCreate = (family: AssetFamily, variantName: string, quantity: number, commonData: Partial<Asset>) => {
        const newAssets: Asset[] = [];
        const familyPrefix = family.assetType === AssetType.LICENSE ? 'SOFT' : 'HARD';
        const productCode = (family as any).productCode || 'GEN';
        const familyInstances = assets.filter(a => a.familyId === family.id);
        let sequenceStart = familyInstances.length + 1;

        for (let i = 0; i < quantity; i++) {
            const sequenceNumber = String(sequenceStart + i).padStart(4, '0');
            const assetId = `${familyPrefix}-${productCode}-${sequenceNumber}`;
            const newAsset: Asset = {
                purchaseDate: new Date().toISOString().split('T')[0],
                cost: 0,
                ...commonData,
                id: `inst-${new Date().getTime() + i}`,
                assetId,
                familyId: family.id,
                title: `${family.name} ${sequenceStart + i}`,
                status: AssetStatus.AVAILABLE,
                assetType: family.assetType,
                variantType: variantName,
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                createdBy: 'Admin (Bulk)',
                modifiedBy: 'Admin (Bulk)',
            };
            newAssets.push(newAsset);
        }
        setAssets(prev => [...prev, ...newAssets]);
    };

    const handleSaveAsset = (asset: Asset) => {
        let finalAsset = { ...asset };
        const today = new Date().toISOString().split('T')[0];
        let newHistoryEntries: AssignmentHistory[] = [];

        if (editingAsset) {
            const oldUser = editingAsset.assignedUser;
            const newUser = asset.assignedUser;
            const oldUsers = editingAsset.assignedUsers || [];
            const newUsers = asset.assignedUsers || [];

            if (oldUser?.id !== newUser?.id) {
                if (oldUser) {
                    newHistoryEntries.push({
                        id: `hist-${Date.now()}-1`,
                        assetId: asset.assetId,
                        assetName: asset.title,
                        date: today,
                        type: 'Reassigned',
                        assignedFrom: oldUser.fullName,
                        assignedTo: newUser?.fullName || 'Unassigned',
                        notes: `Reassigned from ${oldUser.fullName} to ${newUser ? newUser.fullName : 'Inventory'}`
                    });
                } else if (newUser) {
                    newHistoryEntries.push({
                        id: `hist-${Date.now()}-1`,
                        assetId: asset.assetId,
                        assetName: asset.title,
                        date: today,
                        type: 'Assigned',
                        assignedTo: newUser.fullName,
                        notes: `Assigned to ${newUser.fullName}`
                    });
                }
            }

            const oldIds = oldUsers.map(u => u.id).sort().join(',');
            const newIds = newUsers.map(u => u.id).sort().join(',');
            if (oldIds !== newIds && newUsers.length > 0) {
                newHistoryEntries.push({
                    id: `hist-${Date.now()}-2`,
                    assetId: asset.assetId,
                    assetName: asset.title,
                    date: today,
                    type: 'Reassigned',
                    notes: `License assignment updated. Now assigned to ${newUsers.length} users.`
                });
            }

            const oldActive = (editingAsset.activeUsers || []).map(u => u.id).sort().join(',');
            const newActive = (asset.activeUsers || []).map(u => u.id).sort().join(',');

            if (oldActive !== newActive) {
                const added = (asset.activeUsers || []).filter(u => !editingAsset.activeUsers?.some(old => old.id === u.id));
                const removed = (editingAsset.activeUsers || []).filter(u => !asset.activeUsers?.some(newU => newU.id === u.id));

                const changes: string[] = [];
                if (added.length) changes.push(`Added: ${added.map(u => u.fullName).join(', ')}`);
                if (removed.length) changes.push(`Removed: ${removed.map(u => u.fullName).join(', ')}`);

                newHistoryEntries.push({
                    id: `hist-usage-${Date.now()}`,
                    assetId: asset.assetId,
                    assetName: asset.title,
                    date: today,
                    type: 'Usage Update',
                    notes: `Active users updated. ${changes.join('; ')}`
                });
            }

            if (newHistoryEntries.length > 0) {
                finalAsset.assignmentHistory = [...(finalAsset.assignmentHistory || []), ...newHistoryEntries];
            }

            finalAsset = { ...finalAsset, modified: new Date().toISOString(), modifiedBy: 'Admin' };
            setAssets(assets.map(a => a.id === asset.id ? finalAsset : a));
        } else {
            const family = assetFamilies.find(f => f.id === asset.familyId);
            const familyPrefix = family?.assetType === AssetType.LICENSE ? 'SOFT' : 'HARD';
            const productCode = (family as any)?.productCode || 'GEN';
            const sequenceNumber = String(assets.filter(a => a.familyId === asset.familyId).length + 1).padStart(4, '0');
            const assetId = `${familyPrefix}-${productCode}-${sequenceNumber}`;

            const newAsset = { ...asset, id: `inst-${new Date().toISOString()}`, assetId: asset.assetId || assetId, created: new Date().toISOString(), modified: new Date().toISOString(), createdBy: 'Admin', modifiedBy: 'Admin' };

            if (newAsset.assignedUser || (newAsset.assignedUsers && newAsset.assignedUsers.length > 0)) {
                newHistoryEntries.push({
                    id: `hist-${Date.now()}`,
                    assetId: newAsset.assetId,
                    assetName: newAsset.title,
                    date: new Date().toISOString().split('T')[0],
                    type: 'Assigned',
                    assignedTo: newAsset.assignedUser?.fullName || 'Multiple Users',
                    notes: 'Initial Assignment'
                });
            }

            if (newAsset.activeUsers && newAsset.activeUsers.length > 0) {
                newHistoryEntries.push({
                    id: `hist-usage-${Date.now()}`,
                    assetId: newAsset.assetId,
                    assetName: newAsset.title,
                    date: new Date().toISOString().split('T')[0],
                    type: 'Usage Update',
                    notes: `Initial active users: ${newAsset.activeUsers.map(u => u.fullName).join(', ')}`
                });
            }

            newAsset.assignmentHistory = newHistoryEntries;
            setAssets([...assets, newAsset as Asset]);
        }
        closeAssetModal();
    };

    const handleDataImport = (type: ImportType, data: any[]) => {
        if (type === 'users') {
            const newUsers: User[] = data.map((row, index) => ({
                id: Math.max(...users.map(u => Number(u.id) || 0), 0) + index + 1,
                fullName: row.fullName || 'Unknown',
                email: row.email,
                firstName: row.fullName?.split(' ')[0] || '',
                lastName: row.fullName?.split(' ').slice(1).join(' ') || '',
                avatarUrl: `https://i.pravatar.cc/150?u=${Math.random()}`,
                role: 'user',
                isVerified: false,
                jobTitle: row.jobTitle || 'Staff',
                department: row.department || 'General',
                organization: 'Company',
                dateOfJoining: new Date().toISOString().split('T')[0],
                dateOfExit: null,
                businessPhone: row.businessPhone || '',
                mobileNo: '',
                address: row.location || '',
                city: '',
                postalCode: '',
                linkedin: '',
                twitter: '',
                userType: 'Internal',
                extension: '',
                permissionGroups: [],
                principalName: row.email,
                userStatus: 'Active',
                userTypeDetail: '',
                createdDate: new Date().toISOString(),
                modifiedDate: new Date().toISOString(),
                createdBy: 'Import',
                modifiedBy: 'Import',
                site: row.location ? [row.location] : [],
                typeOfContact: ['Employee'],
                platformAccounts: []
            }));
            const existingEmails = new Set(users.map(u => u.email.toLowerCase()));
            const filteredNewUsers = newUsers.filter(u => !existingEmails.has(u.email.toLowerCase()));
            setUsers(prev => [...prev, ...filteredNewUsers]);
            alert(`Imported ${filteredNewUsers.length} new users.`);
        } else {
            const isHardware = type === 'hardware';
            const assetType = isHardware ? AssetType.HARDWARE : AssetType.LICENSE;
            let updatedFamilies = [...assetFamilies];
            const newAssets: Asset[] = [];
            data.forEach((row, index) => {
                const familyName = row.familyName || (isHardware ? 'Imported Hardware' : 'Imported Software');
                let family = updatedFamilies.find(f => f.name.toLowerCase() === familyName.toLowerCase() && f.assetType === assetType);
                if (!family) {
                    const newFamilyId = `fam-imp-${Date.now()}-${index}`;
                    const newFamily: any = {
                        id: newFamilyId,
                        assetType,
                        name: familyName,
                        productCode: familyName.substring(0, 3).toUpperCase(),
                        category: isHardware ? 'Accessory' : 'External',
                        vendor: row.manufacturer || 'Unknown',
                        manufacturer: row.manufacturer || 'Unknown',
                        description: 'Imported via Excel',
                        createdDate: new Date().toISOString(),
                        lastModifiedDate: new Date().toISOString(),
                        variants: !isHardware ? [{ id: `var-${Date.now()}`, name: 'Standard', licenseType: 'Subscription', cost: 0 }] : undefined,
                        responsibleUser: currentUser,
                        assignmentModel: isHardware ? 'Single' : 'Multiple'
                    };
                    updatedFamilies.push(newFamily);
                    family = newFamily;
                }
                let assignedUser: User | null = null;
                let assignedUsers: User[] = [];
                if (row.assignedUserEmail) {
                    const foundUser = users.find(u => u.email.toLowerCase() === row.assignedUserEmail.toLowerCase());
                    if (foundUser) { assignedUser = foundUser; assignedUsers = [foundUser]; }
                }
                const prefix = isHardware ? 'HARD' : 'SOFT';
                const code = (family as any).productCode || 'IMP';
                const seq = String(assets.length + newAssets.length + 1).padStart(4, '0');
                const assetId = `${prefix}-${code}-${seq}`;
                const newAsset: Asset = {
                    id: `inst-imp-${Date.now()}-${index}`,
                    assetId,
                    familyId: family!.id,
                    title: row.title || `${family!.name} ${seq}`,
                    assetType,
                    status: row.status || AssetStatus.AVAILABLE,
                    purchaseDate: row.purchaseDate || new Date().toISOString().split('T')[0],
                    cost: row.cost || 0,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    createdBy: 'Import',
                    modifiedBy: 'Import',
                    serialNumber: row.serialNumber,
                    modelNumber: row.modelNumber,
                    manufacturer: row.manufacturer,
                    location: row.location,
                    assignedUser,
                    licenseKey: row.licenseKey,
                    renewalDate: row.renewalDate,
                    variantType: row.variantType || 'Standard',
                    assignedUsers: assignedUsers.length > 0 ? assignedUsers : undefined,
                    email: row.assignedUserEmail
                };
                newAssets.push(newAsset);
            });
            setAssetFamilies(updatedFamilies);
            setAssets(prev => [...prev, ...newAssets]);
            alert(`Imported ${newAssets.length} assets.`);
        }
    };

    const closeAssetModal = () => {
        setIsAssetModalOpen(false);
        setEditingAsset(null);
        setEditingFamily(null);
    };

    const closeRequestModal = () => {
        setIsRequestModalOpen(false);
        setRequestingUser(null);
        setRequestCategory(null);
    };

    const handleEditAsset = (asset: Asset) => {
        setEditingAsset(asset);
        setModalMode('instance');
        setIsAssetModalOpen(true);
    };

    const handleEditFamily = (family: AssetFamily) => {
        setEditingFamily(family);
        setModalMode('family');
        setIsAssetModalOpen(true);
    }

    const handleAddFamily = () => {
        setEditingFamily(null);
        setModalMode('family');
        setIsAssetModalOpen(true);
    }

    const handleAddInstance = (family: AssetFamily) => {
        setEditingAsset(null);
        setEditingFamily(family);
        setModalMode('instance');
        setIsAssetModalOpen(true);
    }

    const handleSaveUser = (user: User) => {
        const updatedUsers = users.map(u => u.id === user.id ? user : u);
        setUsers(updatedUsers);

        setAssets(prevAssets => prevAssets.map(asset => {
            if (asset.assetType === AssetType.LICENSE && asset.assignedUsers?.some(u => u.id === user.id)) {
                return { ...asset, assignedUsers: asset.assignedUsers.map(u => u.id === user.id ? user : u) };
            }
            if (asset.assetType === AssetType.HARDWARE && asset.assignedUser?.id === user.id) {
                return { ...asset, assignedUser: user };
            }
            return asset;
        }));

        if (selectedUser?.id === user.id) setSelectedUser(user);
        if (currentUser?.id === user.id) setCurrentUser(user);
        setIsProfileModalOpen(false);
    };

    const handleSubmitRequest = (familyId: string, notes: string) => {
        const family = assetFamilies.find(f => f.id === familyId);
        const user = requestingUser;

        if (!family || !user) {
            closeRequestModal();
            return;
        }

        const newRequest: Request = {
            id: `req-${new Date().getTime()}`,
            type: family.assetType === AssetType.HARDWARE ? 'Hardware' : 'Software',
            item: family.name,
            requestedBy: user,
            status: RequestStatus.PENDING,
            requestDate: new Date().toLocaleDateString('en-CA'),
            notes: notes,
            familyId: family.id
        };

        setRequests(prev => [newRequest, ...prev]);
        closeRequestModal();
    };

    const handleNewRequest = (category: RequestCategory) => {
        setRequestingUser(currentUser);
        setRequestCategory(category);
        setIsRequestModalOpen(true);
    };

    const handleQuickRequest = (assetId: string) => {
        console.log("Quick request for assetId:", assetId);
    };

    const handleCreateTask = (request: Request) => {
        setRequestForTask(request);
        setIsTaskModalOpen(true);
    };

    const handleRequestAction = (requestId: string, newStatus: RequestStatus) => {
        if (newStatus === RequestStatus.APPROVED) {
            const req = requests.find(r => r.id === requestId);
            if (req) {
                handleCreateTask(req);
            }
        } else {
            setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
        }
    };

    const handleTaskSubmit = (newTask: Task) => {
        setTasks(prev => [newTask, ...prev]);
        setRequests(prev => prev.map(r => r.id === newTask.requestId ? { ...r, status: RequestStatus.IN_PROGRESS, linkedTaskId: newTask.id } : r));
        setIsTaskModalOpen(false);
        setRequestForTask(null);
    };

    const visibleAssets = useMemo(() => {
        if (isAdmin) return assets;
        return assets.filter(a =>
            (a.assignedUser?.id === currentUser?.id) ||
            (a.assignedUsers?.some(u => u.id === currentUser?.id))
        );
    }, [assets, currentUser, isAdmin]);

    const visibleRequests = useMemo(() => {
        if (isAdmin) return requests;
        return requests.filter(r => r.requestedBy.id === currentUser?.id);
    }, [requests, currentUser, isAdmin]);

    const userColumns: ColumnDef<User>[] = [
        { accessorKey: 'fullName', header: 'Name', width: 250, cell: ({ row }) => (<button onClick={() => handleUserClick(row.original)} className="btn btn-link p-0 text-decoration-none d-flex align-items-center gap-2 text-start"> <img src={row.original.avatarUrl} alt={row.original.fullName} className="rounded-circle" style={{ width: '32px', height: '32px' }} /> <span className="fw-medium text-dark">{row.original.fullName}</span> </button>) },
        { accessorKey: 'email', header: 'Email', width: 250 },
        { accessorKey: 'role', header: 'Role', width: 100, cell: ({ row }) => <span className={`badge ${row.original.role === 'admin' ? 'text-bg-primary' : 'text-bg-light border'}`}>{row.original.role}</span> },
        { accessorKey: 'jobTitle', header: 'Job Title', width: 200 },
        { accessorKey: 'department', header: 'Department', width: 200 },
        {
            accessorKey: 'assets', header: 'Assigned', width: 100, cell: ({ row }) => {
                const count = assets.filter(a => a.assignedUser?.id === row.original.id || a.assignedUsers?.some(u => u.id === row.original.id)).length;
                return <span className="badge rounded-pill text-bg-info text-white">{count}</span>
            }
        },
        { accessorKey: 'view', header: '', width: 100, cell: ({ row }) => (<button onClick={() => handleUserClick(row.original)} className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 border-0"> View <ArrowRight size={14} /> </button>) }
    ];

    const requestColumns: ColumnDef<Request>[] = [
        { accessorKey: 'item', header: 'Item', width: 300, cell: ({ row }) => (<div> <p className="fw-medium text-dark mb-0">{row.original.item}</p> <p className="small text-secondary mb-0">{row.original.type}</p> </div>) },
        { accessorKey: 'requestedBy.fullName', header: 'Requested By', width: 200, cell: ({ row }) => (<button disabled={!isAdmin} onClick={() => handleUserClick(row.original.requestedBy)} className={`btn btn-link p-0 text-decoration-none d-flex align-items-center gap-2 text-start ${!isAdmin ? 'disabled text-dark' : 'text-primary'}`}> <img src={row.original.requestedBy.avatarUrl} alt={row.original.requestedBy.fullName} className="rounded-circle" style={{ width: '24px', height: '24px' }} /> <span className="small fw-medium text-truncate">{row.original.requestedBy.fullName}</span> </button>) },
        { accessorKey: 'requestDate', header: 'Request Date', width: 150 },
        {
            accessorKey: 'status', header: 'Status', width: 180, cell: ({ row }) => {
                const status = row.original.status;
                const colorClasses = { [RequestStatus.PENDING]: 'text-bg-warning text-dark', [RequestStatus.APPROVED]: 'text-bg-success', [RequestStatus.REJECTED]: 'text-bg-danger', [RequestStatus.FULFILLED]: 'text-bg-info text-white', [RequestStatus.IN_PROGRESS]: 'text-bg-primary' };
                const linkedTask = row.original.linkedTaskId ? tasks.find(t => t.id === row.original.linkedTaskId) : null;

                return (
                    <div className="d-flex flex-column align-items-start gap-1">
                        <span className={`badge ${colorClasses[status]}`}>{status}</span>
                        {status === RequestStatus.IN_PROGRESS && linkedTask && (
                            <div className="d-flex align-items-center gap-1 bg-light border p-1 rounded small" style={{ fontSize: '10px' }}>
                                <ListTodo size={12} className="text-primary" />
                                <span className="fw-medium">Task: {linkedTask.assignedTo?.fullName || 'Unassigned'}</span>
                            </div>
                        )}
                    </div>
                );
            }
        },
        { accessorKey: 'actions', header: '', width: 120, cell: ({ row }) => (isAdmin && row.original.status === RequestStatus.PENDING) ? (<div className="d-flex gap-2"> <button onClick={() => handleRequestAction(row.original.id, RequestStatus.APPROVED)} className="btn btn-sm btn-success p-1" title="Approve"><Check size={16} /></button> <button onClick={() => handleRequestAction(row.original.id, RequestStatus.REJECTED)} className="btn btn-sm btn-danger p-1" title="Reject"><X size={16} /></button> </div>) : null, },
    ];

    const assetInstanceColumns: ColumnDef<Asset>[] = [
        { accessorKey: 'assetId', header: 'ID', width: 140, cell: ({ row }) => <span className="font-monospace small text-secondary">{row.original.assetId}</span> },
        { accessorKey: 'title', header: 'Title', width: 200, cell: ({ row }) => <span className="fw-medium text-dark">{row.original.title}</span> },
        {
            accessorKey: 'familyId', header: 'Product', width: 180, cell: ({ row }) => {
                const fam = assetFamilies.find(f => f.id === row.original.familyId);
                return <span className="small text-secondary">{fam?.name || '-'}</span>
            }
        },
        {
            accessorKey: 'assignedUser', header: 'Assigned To', width: 200, cell: ({ row }) => {
                const users = row.original.assignedUsers && row.original.assignedUsers.length > 0
                    ? row.original.assignedUsers
                    : (row.original.assignedUser ? [row.original.assignedUser] : []);

                if (users.length === 0) return <span className="text-muted small">-</span>;

                return (
                    <div className="d-flex flex-column gap-1">
                        {users.map(u => (
                            <button key={u.id} disabled={!isAdmin} onClick={(e) => { e.stopPropagation(); handleUserClick(u); }} className={`btn btn-link p-0 text-start small text-truncate ${isAdmin ? 'text-primary' : 'text-dark disabled text-decoration-none'}`}>
                                {u.fullName}
                            </button>
                        ))}
                    </div>
                );
            }
        },
        {
            accessorKey: 'status', header: 'Status', width: 120, cell: ({ row }) => {
                let bgClass = 'text-bg-light';
                if (row.original.status === AssetStatus.ACTIVE) bgClass = 'text-bg-success';
                if (row.original.status === AssetStatus.AVAILABLE) bgClass = 'text-bg-info text-white';
                if (row.original.status === AssetStatus.EXPIRED || row.original.status === AssetStatus.RETIRED) bgClass = 'text-bg-danger';
                if (row.original.status === AssetStatus.IN_REPAIR || row.original.status === AssetStatus.PENDING) bgClass = 'text-bg-warning text-dark';
                return <span className={`badge ${bgClass}`}>{row.original.status}</span>
            }
        },
        {
            accessorKey: 'actions', header: '', width: 60, cell: ({ row }) => isAdmin && (
                <button onClick={() => handleEditAsset(row.original)} className="btn btn-sm btn-light p-1 text-secondary"><Edit size={16} /></button>
            )
        },
    ];

    const dashboardStats = useMemo(() => {
        if (isAdmin) {
            const total = assets.length;
            const totalUsers = users.length;
            const pendingRequests = requests.filter(r => r.status === RequestStatus.PENDING).length;

            const now = new Date();
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(now.getDate() + 30);
            const expiringSoon = assets.filter(asset => {
                if (asset.renewalDate) {
                    try { const expiry = new Date(asset.renewalDate); return expiry > now && expiry <= thirtyDaysFromNow; } catch (e) { return false; }
                }
                return false;
            }).length;
            return { total, totalUsers, pendingRequests, expiringSoon };
        } else {
            const myAssets = visibleAssets.length;
            const myRequests = visibleRequests.length;
            const myLicenses = visibleAssets.filter(a => a.assetType === AssetType.LICENSE).length;
            const myHardware = visibleAssets.filter(a => a.assetType === AssetType.HARDWARE).length;
            return { myAssets, myRequests, myLicenses, myHardware };
        }
    }, [assets, visibleAssets, visibleRequests, isAdmin, users, requests]);

    const assetTypeCounts = useMemo(() => ({ licenses: assetFamilies.filter(a => a.assetType === AssetType.LICENSE).length, hardware: assetFamilies.filter(a => a.assetType === AssetType.HARDWARE).length }), [assetFamilies]);

    const departmentStats = useMemo(() => {
        const depts: Record<string, number> = {};
        users.forEach(u => {
            const d = u.department || 'Unassigned';
            depts[d] = (depts[d] || 0) + 1;
        });
        return Object.entries(depts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }, [users]);

    const familiesWithCounts = useMemo(() => {
        return assetFamilies.map(family => {
            const instances = assets.filter(a => a.familyId === family.id);
            const assignedCount = instances.filter(i => (i.assignedUser || (i.assignedUsers && i.assignedUsers.length > 0))).length;
            return { ...family, total: instances.length, assigned: assignedCount, available: instances.length - assignedCount };
        });
    }, [assetFamilies, assets]);

    const assetFamilyColumns: ColumnDef<AssetFamily & { total: number; assigned: number; available: number; }>[] = [
        { accessorKey: 'name', header: 'Name', width: 250, cell: ({ row }) => isAdmin ? <button onClick={() => handleFamilyClick(row.original)} className="btn btn-link p-0 text-start fw-bold text-decoration-none">{row.original.name}</button> : <span className="fw-bold text-dark">{row.original.name}</span> },
        { accessorKey: 'category', header: 'Category', width: 200 },
        { accessorKey: 'total', header: 'Total', width: 100, cell: ({ row }) => <div className="font-monospace text-center">{row.original.total}</div> },
        { accessorKey: 'available', header: 'Available', width: 100, cell: ({ row }) => <div className="font-monospace text-success fw-bold text-center">{row.original.available}</div> },
        { accessorKey: 'actions', header: '', width: 60, cell: ({ row }) => isAdmin && <button onClick={() => handleEditFamily(row.original)} className="btn btn-sm btn-light p-1 text-secondary"><Edit size={16} /></button> },
    ];

    const filteredFamilies = useMemo(() => {
        if (activeView === 'licenses') return familiesWithCounts.filter(f => f.assetType === AssetType.LICENSE);
        if (activeView === 'hardware') return familiesWithCounts.filter(f => f.assetType === AssetType.HARDWARE);
        return [];
    }, [familiesWithCounts, activeView]);

    const addButton = useMemo(() => {
        const configs = {
            licenses: { text: 'Add License Profile', icon: KeyRound },
            hardware: { text: 'Add Hardware Product', icon: Tv },
        };
        if ((activeView !== 'licenses' && activeView !== 'hardware') || !isAdmin) return null;
        const { text, icon: Icon } = (configs as any)[activeView];
        return (<button onClick={() => { setEditingFamily(null); setModalMode('family'); setIsAssetModalOpen(true); }} className="btn btn-primary d-flex align-items-center gap-2 fw-bold shadow-sm"> <Icon size={16} /> {text} </button>);
    }, [activeView, isAdmin]);

    const NavItem = ({ view, label, icon: Icon }: { view: View, label: string, icon: React.ElementType }) => (
        <button
            onClick={() => handleNavigation(view)}
            className={`nav-link d-flex align-items-center gap-2 px-3 py-2 fw-medium ${activeView === view ? 'active border-bottom border-primary border-3' : 'text-secondary'}`}
        >
            <Icon size={18} />
            <span className="d-none d-sm-inline">{label}</span>
        </button>
    );

    const renderContent = () => {
        if (selectedUser) {
            const userAssets = assets.filter(asset =>
                (asset.assignedUser?.id === selectedUser.id) ||
                (asset.assignedUsers?.some(u => u.id === selectedUser.id))
            );
            return (
                <div className="container-xl">
                    <button onClick={handleBackToList} className="btn btn-sm btn-outline-secondary mb-3 d-flex align-items-center gap-1"> <ArrowRight size={14} className="rotate-180" /> Back to List </button>
                    <UserProfile user={selectedUser} userAssets={userAssets} assetFamilies={assetFamilies} onEditProfile={() => setIsProfileModalOpen(true)} onNewRequest={handleNewRequest} onQuickRequest={handleQuickRequest} />
                </div>
            );
        }

        if (selectedFamilyId && isAdmin) {
            const family = assetFamilies.find(f => f.id === selectedFamilyId);
            if (!family) return <div className="alert alert-danger">Family not found</div>;
            return (
                <AssetProfile
                    family={family}
                    allAssets={assets}
                    onBack={handleBackToList}
                    onEditAsset={handleEditAsset}
                    onUserClick={handleUserClick}
                    onAddInstance={handleAddInstance}
                    onEditFamily={handleEditFamily}
                    onBulkCreate={handleBulkCreate}
                />
            );
        }

        switch (activeView) {
            case 'dashboard': return (
                <div className="container-xl py-4">
                    {isAdmin ? (
                        <div className="row g-4">
                            <div className="col-md-6 col-lg-3">
                                <StatCard icon={Users} title="Total Team" value={dashboardStats.totalUsers!} color="#4f46e5" subtext="Active Members" onClick={() => handleNavigation('users')} />
                            </div>
                            <div className="col-md-6 col-lg-3">
                                <StatCard icon={Package} title="Assets Managed" value={dashboardStats.total!} color="#10b981" subtext="Hardware & Licenses" onClick={() => handleNavigation('licenses')} />
                            </div>
                            <div className="col-md-6 col-lg-3">
                                <StatCard icon={ShieldAlert} title="Pending Actions" value={dashboardStats.pendingRequests!} color="#f59e0b" subtext="Requests needing approval" onClick={() => handleNavigation('requests')} />
                            </div>
                            <div className="col-md-6 col-lg-3">
                                <StatCard icon={Clock} title="Attention Needed" value={dashboardStats.expiringSoon!} color="#ef4444" subtext="Expiring in 30 days" onClick={() => handleNavigation('licenses')} />
                            </div>

                            <div className="col-12 d-flex gap-3 overflow-auto pb-2">
                                <button className="btn btn-white border shadow-sm d-flex align-items-center gap-2 text-nowrap" onClick={() => prompt('Feature not implemented')}>
                                    <UserPlus size={16} className="text-primary" /> Add Team Member
                                </button>
                                <button className="btn btn-white border shadow-sm d-flex align-items-center gap-2 text-nowrap" onClick={() => { setEditingFamily(null); setModalMode('family'); setIsAssetModalOpen(true); }}>
                                    <PackageOpen size={16} className="text-success" /> Procure New Asset
                                </button>
                            </div>

                            <div className="col-lg-6">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-header bg-light-subtle d-flex justify-content-between align-items-center py-3">
                                        <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                            <AlertCircle size={18} className="text-warning" /> Action Center
                                        </h6>
                                        <span className="badge text-bg-light border text-secondary">{requests.filter(r => r.status === 'Pending').length} Pending</span>
                                    </div>
                                    <div className="list-group list-group-flush">
                                        {requests.filter(r => r.status === 'Pending').slice(0, 5).map(req => (
                                            <div key={req.id} className="list-group-item d-flex align-items-center justify-content-between py-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <img src={req.requestedBy.avatarUrl} className="rounded-circle border" style={{ width: '40px', height: '40px' }} alt={req.requestedBy.fullName} />
                                                    <div>
                                                        <p className="small fw-bold mb-0 text-dark">{req.requestedBy.fullName}</p>
                                                        <p className="small text-secondary mb-0">Request: <span className="fw-medium text-dark">{req.item}</span></p>
                                                    </div>
                                                </div>
                                                <div className="d-flex gap-2">
                                                    <button onClick={() => handleRequestAction(req.id, RequestStatus.APPROVED)} className="btn btn-sm btn-success-subtle border-success-subtle text-success p-1" title="Approve"><Check size={16} /></button>
                                                    <button onClick={() => handleRequestAction(req.id, RequestStatus.REJECTED)} className="btn btn-sm btn-danger-subtle border-danger-subtle text-danger p-1" title="Reject"><X size={16} /></button>
                                                </div>
                                            </div>
                                        ))}
                                        {requests.filter(r => r.status === 'Pending').length === 0 && (
                                            <div className="py-5 text-center text-secondary small">
                                                <Check size={24} className="d-block mx-auto mb-2 opacity-50" />
                                                All caught up! No pending actions.
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-footer bg-light text-center py-2 border-top-0">
                                        <button onClick={() => handleNavigation('requests')} className="btn btn-link btn-sm text-decoration-none fw-bold text-primary">View All Requests &rarr;</button>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-6">
                                <div className="card border-0 shadow-sm p-4 h-100">
                                    <h6 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2"><TrendingUp size={18} className="text-primary" /> Asset Utilization</h6>
                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between small mb-1">
                                            <span className="text-secondary">Licenses Assigned</span>
                                            <span className="fw-bold text-dark">{Math.round((assets.filter(a => a.assetType === AssetType.LICENSE && a.assignedUsers?.length).length / assets.filter(a => a.assetType === AssetType.LICENSE).length) * 100 || 0)}%</span>
                                        </div>
                                        <div className="progress" style={{ height: '8px' }}>
                                            <div className="progress-bar bg-primary" style={{ width: `${(assets.filter(a => a.assetType === AssetType.LICENSE && a.assignedUsers?.length).length / assets.filter(a => a.assetType === AssetType.LICENSE).length) * 100}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between small mb-1">
                                            <span className="text-secondary">Hardware Assigned</span>
                                            <span className="fw-bold text-dark">{Math.round((assets.filter(a => a.assetType === AssetType.HARDWARE && a.assignedUser).length / assets.filter(a => a.assetType === AssetType.HARDWARE).length) * 100 || 0)}%</span>
                                        </div>
                                        <div className="progress" style={{ height: '8px' }}>
                                            <div className="progress-bar bg-success" style={{ width: `${(assets.filter(a => a.assetType === AssetType.HARDWARE && a.assignedUser).length / assets.filter(a => a.assetType === AssetType.HARDWARE).length) * 100}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="mt-auto row text-center border-top pt-4">
                                        <div className="col-6 border-end">
                                            <p className="h4 fw-bold text-dark mb-0">{assetTypeCounts.licenses}</p>
                                            <p className="text-uppercase text-secondary small fw-bold mb-0" style={{ fontSize: '10px' }}>License Types</p>
                                        </div>
                                        <div className="col-6">
                                            <p className="h4 fw-bold text-dark mb-0">{assetTypeCounts.hardware}</p>
                                            <p className="text-uppercase text-secondary small fw-bold mb-0" style={{ fontSize: '10px' }}>Hardware Types</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Restored Department Distribution Section */}
                            <div className="col-lg-6">
                                <div className="card border-0 shadow-sm p-4 h-100">
                                    <h6 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                                        <Users size={18} className="text-info" /> Department Distribution
                                    </h6>
                                    <div className="d-flex flex-column gap-3">
                                        {departmentStats.map(([dept, count]) => (
                                            <div key={dept}>
                                                <div className="d-flex justify-content-between small mb-1">
                                                    <span className="text-secondary">{dept}</span>
                                                    <span className="fw-bold text-dark">{count} Members</span>
                                                </div>
                                                <div className="progress" style={{ height: '6px' }}>
                                                    <div className="progress-bar bg-info" style={{ width: `${(count / users.length) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Restored New Joiners Section */}
                            <div className="col-lg-6">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-header bg-light-subtle d-flex justify-content-between align-items-center py-3">
                                        <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                            <UserPlus size={18} className="text-primary" /> New Joiners
                                        </h6>
                                    </div>
                                    <div className="list-group list-group-flush">
                                        {users.slice().sort((a, b) => new Date(b.dateOfJoining).getTime() - new Date(a.dateOfJoining).getTime()).slice(0, 5).map(user => (
                                            <div key={user.id} className="list-group-item d-flex align-items-center justify-content-between py-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <img src={user.avatarUrl} className="rounded-circle border" style={{ width: '40px', height: '40px' }} alt={user.fullName} />
                                                    <div>
                                                        <p className="small fw-bold mb-0 text-dark">{user.fullName}</p>
                                                        <p className="small text-secondary mb-0">{user.department}</p>
                                                    </div>
                                                </div>
                                                <span className="small text-secondary">{user.dateOfJoining}</span>
                                            </div>
                                        ))}
                                        {users.length === 0 && (
                                            <div className="py-5 text-center text-secondary small">
                                                No recent joiners found.
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-footer bg-light text-center py-2 border-top-0 mt-auto">
                                        <button onClick={() => handleNavigation('users')} className="btn btn-link btn-sm text-decoration-none fw-bold text-primary">View Full Team Directory &rarr;</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="row g-4">
                            <div className="col-md-6 col-lg-3">
                                <StatCard icon={Package} title="My Total Assets" value={dashboardStats.myAssets!} color="#4f46e5" onClick={() => { handleNavigation('licenses'); setAssetViewMode('items'); }} />
                            </div>
                            <div className="col-md-6 col-lg-3">
                                <StatCard icon={KeyRound} title="My Licenses" value={dashboardStats.myLicenses!} color="#10b981" onClick={() => { handleNavigation('licenses'); setAssetViewMode('items'); }} />
                            </div>
                            <div className="col-md-6 col-lg-3">
                                <StatCard icon={Tv} title="My Hardware" value={dashboardStats.myHardware!} color="#f59e0b" onClick={() => { handleNavigation('hardware'); setAssetViewMode('items'); }} />
                            </div>
                            <div className="col-md-6 col-lg-3">
                                <StatCard icon={ClipboardList} title="My Requests" value={dashboardStats.myRequests!} color="#ef4444" onClick={() => handleNavigation('requests')} />
                            </div>

                            <div className="col-12 mt-4">
                                <div className="card border-0 shadow-sm p-4">
                                    <h5 className="fw-bold text-dark mb-4">My Quick Actions</h5>
                                    <div className="d-flex gap-4">
                                        <button onClick={() => handleNewRequest('Hardware')} className="btn btn-light border p-4 d-flex align-items-center gap-3 rounded-3 text-start transition-all flex-grow-1">
                                            <div className="bg-white p-2 rounded-circle shadow-sm text-primary"><Tv size={24} /></div>
                                            <span className="fw-bold text-secondary">Request Hardware</span>
                                        </button>
                                        <button onClick={() => handleNewRequest('Microsoft')} className="btn btn-light border p-4 d-flex align-items-center gap-3 rounded-3 text-start transition-all flex-grow-1">
                                            <div className="bg-white p-2 rounded-circle shadow-sm text-info"><KeyRound size={24} /></div>
                                            <span className="fw-bold text-secondary">Request License</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
            case 'licenses':
            case 'hardware':
                const isHardware = activeView === 'hardware';
                const currentType = isHardware ? AssetType.HARDWARE : AssetType.LICENSE;
                const familiesData = filteredFamilies;
                const itemsData = visibleAssets.filter(a => a.assetType === currentType);

                return (
                    <div className="container-xl py-4 d-flex flex-column gap-3">
                        <div className="card border-0 shadow-sm p-2 d-flex flex-sm-row justify-content-between align-items-center gap-3">
                            <div className="btn-group bg-light p-1 rounded-2">
                                <button
                                    onClick={() => setAssetViewMode('items')}
                                    className={`btn btn-sm fw-bold px-3 py-1.5 border-0 ${assetViewMode === 'items' ? 'bg-white text-primary shadow-sm' : 'text-secondary'}`}
                                >
                                    <List size={16} className="me-1" /> {isAdmin ? 'Individual Items' : 'My Items'}
                                </button>
                                {isAdmin && (
                                    <button
                                        onClick={() => setAssetViewMode('families')}
                                        className={`btn btn-sm fw-bold px-3 py-1.5 border-0 ${assetViewMode === 'families' ? 'bg-white text-primary shadow-sm' : 'text-secondary'}`}
                                    >
                                        <Layers size={16} className="me-1" /> Asset Families
                                    </button>
                                )}
                            </div>
                            {addButton}
                        </div>

                        {assetViewMode === 'families' && isAdmin ? (
                            <DataTable
                                columns={assetFamilyColumns}
                                data={familiesData}
                            />
                        ) : (
                            <DataTable
                                columns={assetInstanceColumns}
                                data={itemsData}
                            />
                        )}
                    </div>
                );
            case 'users': return isAdmin ? <div className="container-xl py-4"><DataTable columns={userColumns} data={users} /></div> : null;
            case 'requests': return <div className="container-xl py-4"><DataTable columns={requestColumns} data={visibleRequests} /></div>;
            case 'admin': return isAdmin ? <div className="container-xl py-4">
                <AdminDashboard
                    config={config}
                    onUpdateConfig={setConfig}
                    users={users}
                    assets={assets}
                    families={assetFamilies}
                    vendors={vendors}
                    onUpdateVendors={setVendors}
                    onImportData={handleDataImport}
                    onNavigateToFamily={handleFamilyClick}
                    onEditFamily={handleEditFamily}
                    onAddFamily={handleAddFamily}
                />
            </div> : null;
            default: return null;
        }
    };

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <header className="navbar navbar-expand-md navbar-light bg-white border-bottom sticky-top shadow-sm py-0">
                <div className="container-xl h-100">
                    <div className="d-flex align-items-center gap-4 flex-grow-1">
                        <div className="navbar-brand d-flex align-items-center gap-2 cursor-pointer py-0" onClick={() => handleNavigation('dashboard')} style={{ cursor: 'pointer' }}>
                            <LayoutDashboard className="text-primary" size={32} />
                        </div>
                        <nav className="nav nav-underline d-none d-md-flex">
                            <NavItem view="dashboard" label="Dashboard" icon={LayoutDashboard} />
                            <NavItem view="licenses" label="Licenses" icon={FileSpreadsheet} />
                            <NavItem view="hardware" label="Hardware" icon={Monitor} />
                            {isAdmin && <NavItem view="users" label="Users" icon={UserSquare2} />}
                            <NavItem view="requests" label="Requests" icon={ClipboardList} />
                            {isAdmin && <NavItem view="admin" label="Admin" icon={ShieldAlert} />}
                        </nav>
                    </div>
                    <div className="flex-grow-1 px-4 mx-2">
                        <GlobalSearch users={users} assets={assets} families={assetFamilies} onSelect={handleGlobalSearchSelect} />
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <UserSwitcher users={users} currentUser={currentUser} onSwitch={setCurrentUser} />
                    </div>
                </div>
            </header>

            <main className="flex-grow-1 py-4">
                {renderContent()}
            </main>

            {isAssetModalOpen && isAdmin && (
                <AssetFormModal
                    isOpen={isAssetModalOpen}
                    onClose={closeAssetModal}
                    onSaveFamily={handleSaveFamily}
                    onSaveAsset={handleSaveAsset}
                    family={editingFamily}
                    asset={editingAsset}
                    mode={modalMode}
                    assetType={
                        editingFamily ? editingFamily.assetType :
                            editingAsset ? editingAsset.assetType :
                                (activeView === 'hardware' ? AssetType.HARDWARE : AssetType.LICENSE)
                    }
                    allUsers={users}
                    allAssets={assets}
                    config={config}
                    vendors={vendors}
                />
            )}

            {isProfileModalOpen && selectedUser && <EditProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} onSave={handleSaveUser} user={selectedUser} config={config} />}
            {isRequestModalOpen && requestingUser && <RequestAssetModal isOpen={isRequestModalOpen} onClose={closeRequestModal} onSubmit={handleSubmitRequest} user={requestingUser} assetFamilies={assetFamilies} category={requestCategory} />}
            {isTaskModalOpen && requestForTask && <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} request={requestForTask} adminUsers={adminUsers} onCreateTask={handleTaskSubmit} />}
        </div>
    );
};

export default App;
