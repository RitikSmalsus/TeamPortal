
import React, { useState, useEffect, useMemo } from 'react';
import { Asset, User, ColumnDef, AssetType, AssetStatus, Request, RequestStatus, AssetFamily, SoftwareProfile, Config, Task, TaskStatus, Vendor, AssignmentHistory, LicenseType, UserRole, HardwareCondition } from './types';
// import { getMockAssets, getMockUsers, getMockRequests, getMockAssetFamilies, getMockVendors } from './services/mockData';
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
import { Web } from 'sp-pnp-js';
import { get } from '@microsoft/sp-lodash-subset';

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
                            { id: 'sec-hw-ident', title: 'Identity', columns: 2, fields: ['name', 'productCode', 'modelNumber', 'manufacturer', 'assignmentModel', 'totalCount'] },
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

    const getDate = (date: any) => {
        if (!date) return null;
        try {
            const d = new Date(date);
            return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
        } catch {
            return null;
        }
    };

    //API calls to get data from backend
    const getMockAssetFamilies = async () => {
        const res = new Web("https://smalsusinfolabs.sharepoint.com/sites/HHHHQA/AI");
        try {
            const data = await res.lists.getByTitle("AssetRepository").items.select("ID", "Title", "Topic", "AssetType", "Prefix", "VendorName/Title", "StartDate", "EndDate", "TotalCount", "Variants", "Category", "AssignmentModel", "Description", "ProductCode", "configuration", "cost").expand("VendorName").get();
            console.log(data)
            const formattedData: AssetFamily[] = data.map((item: any) => {
                const isHardware = item.AssetType === 'Hardware';
                const base = {
                    id: `repo-${item.ID || item.Id}`,
                    name: item.Title, // UI expects 'name'
                    assetType: item.AssetType === 'Hardware' ? AssetType.HARDWARE : AssetType.LICENSE,
                    productCode: item.ProductCode || item.Prefix,
                    description: item.Description || item.Topic || '',
                    category: item.Category || (isHardware ? 'Hardware' : 'External'),
                    assignmentModel: item.AssignmentModel || (isHardware ? 'Single' : 'Multiple'),
                    createdDate: item.Created || item.StartDate || new Date().toISOString(),
                    lastModifiedDate: item.Modified || item.EndDate || new Date().toISOString(),
                    totalCount: item.TotalCount || 0,
                    cost: item.cost || 0,
                };

                if (isHardware) {
                    return {
                        ...base,
                        assetType: AssetType.HARDWARE,
                        manufacturer: item.VendorName?.Title || 'Generic',
                    } as any; // Cast as HardwareProduct
                } else {
                    let variants = [{ id: `var-${item.ID}`, name: 'Standard', licenseType: LicenseType.SUBSCRIPTION, cost: 0 }];
                    if (item.Variants) {
                        try {
                            variants = JSON.parse(item.Variants);
                        } catch (e) {
                            console.error("Error parsing variants for", item.Title, e);
                        }
                    }
                    return {
                        ...base,
                        assetType: AssetType.LICENSE,
                        vendor: item.VendorName?.Title || 'Unknown',
                        variants: variants
                    } as any; // Cast as SoftwareProfile
                }
            });
            return formattedData;
        } catch (error) {
            console.log("Error fetching asset families:", error);
            return [];
        }
    }

    const getMockUsers = async () => {
        const res = new Web("https://smalsusinfolabs.sharepoint.com/sites/HHHHQA/AI");
        try {
            const data = await res.lists.getByTitle("Contacts").items.getAll();

            // Fetch attachments for all users in parallel
            const usersWithAttachments = await Promise.all(
                data.map(async (apiUser: any) => {
                    let avatarUrl = `https://i.pravatar.cc/150?u=${apiUser.GUID || apiUser.ID}`;

                    try {
                        // Fetch attachments for this user
                        const attachments = await res.lists.getByTitle("Contacts")
                            .items.getById(apiUser.ID)
                            .attachmentFiles.get();

                        // Find profile picture attachment
                        const profilePic = attachments.find((att: any) =>
                            att.FileName.startsWith('profile_') ||
                            att.FileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                        );

                        if (profilePic) {
                            // Use SharePoint site URL + ServerRelativeUrl
                            avatarUrl = `https://smalsusinfolabs.sharepoint.com${profilePic.ServerRelativeUrl}`;
                        }
                    } catch (attachmentError) {
                        console.warn(`Could not fetch attachments for user ${apiUser.ID}:`, attachmentError);
                        // Continue with default avatar
                    }

                    return {
                        id: apiUser.ID,
                        fullName: apiUser.FullName || apiUser.Title,
                        suffix: apiUser.Suffix,
                        firstName: apiUser.FirstName || (apiUser.FullName || apiUser.Title)?.split(' ')[0] || '',
                        lastName: (apiUser.FullName || apiUser.Title)?.split(' ').slice(1).join(' ') || '',
                        email: apiUser.Email,
                        avatarUrl,
                        role: (apiUser.Role?.toLowerCase() || 'user') as UserRole,
                        isVerified: apiUser.isVerified ?? false,
                        jobTitle: apiUser.JobTitle || 'Employee',
                        department: apiUser.Department || 'General',
                        organization: apiUser.Company || 'Smalsus Infolabs Pvt Ltd',
                        dateOfJoining: (apiUser.Date_x0020_Of_x0020_Joining ? getDate(apiUser.Date_x0020_Of_x0020_Joining) : null) || new Date().toISOString().split('T')[0],
                        dateOfExit: apiUser.DateOfExit ? getDate(apiUser.DateOfExit) : null,
                        businessPhone: apiUser.WorkPhone || '',
                        mobileNo: apiUser.CellPhone || '',
                        address: apiUser.WorkAddress || '',
                        city: apiUser.WorkCity || '',
                        postalCode: apiUser.WorkZip || '',
                        userType:
                            apiUser.User_x0020_Type === 'Internal'
                                ? 'Internal User'
                                : 'External User',
                        extension: '',
                        permissionGroups: [],
                        principalName: apiUser.Email,
                        userStatus: 'Active',
                        userTypeDetail: 'Member',
                        createdDate: apiUser.Created || new Date().toISOString(),
                        modifiedDate: apiUser.Modified || new Date().toISOString(),
                        createdBy: apiUser.Author || 'Admin',
                        modifiedBy: apiUser.Editor || 'Admin',
                        site: apiUser.Site || ['SMALSUS'],
                        typeOfContact: ['Employee'],
                        platformAccounts: [],
                        history: (() => {
                            // Parse userHistory from SharePoint (stored as JSON string)
                            try {
                                if (apiUser.userHistory) {
                                    const historyData = typeof apiUser.userHistory === 'string'
                                        ? JSON.parse(apiUser.userHistory)
                                        : apiUser.userHistory;
                                    return Array.isArray(historyData) ? historyData : [];
                                }
                            } catch (error) {
                                console.warn(`Failed to parse userHistory for user ${apiUser.ID}:`, error);
                            }
                            return [];
                        })(),
                        linkedin: apiUser.LinkedIn?.Url || '',
                        twitter: apiUser.Twitter?.Url || '',
                        notes: apiUser.Comments || apiUser.Notes || '',
                        gender: apiUser.Gender || ''
                    };
                })
            );
            return usersWithAttachments;
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    const getMockAssets = async (allUsers: User[] = []): Promise<Asset[]> => {
        const web = new Web("https://smalsusinfolabs.sharepoint.com/sites/HHHHQA/AI");

        try {
            const items = await web.lists
                .getByTitle("AssetManagementSystem")
                .items.select(
                    "Id",
                    "Title",
                    "AssetId",
                    "Email",
                    "licenseKey",
                    "Status",
                    "AssetType",
                    "LicenseType",
                    "purchaseDate",
                    "expiryDate",
                    "Cost",
                    "serialNumber",
                    "modelNumber",
                    "Created",
                    "Modified",
                    "assetRepo/Id",
                    "assetRepo/Title",
                    "assetRepo/cost",
                    "assignToUserId",
                    "assignToUser/Id",
                    "maintenanceHistory"
                )
                .expand("assetRepo", "assignToUser")
                .getAll();
            return items.map((item: any): Asset => {
                /* ---------- Asset Type ---------- */
                const assetType =
                    item.AssetType === "Hardware"
                        ? AssetType.HARDWARE
                        : AssetType.LICENSE;

                /* ---------- Assigned Users (Multi-select lookup) ---------- */
                let assignedUser: User | null = null;
                let assignedUsers: User[] = [];

                // assignToUser is a multi-select lookup field, so it returns an array
                const assignToUserData = item.assignToUser;
                const lookupUsers = allUsers.length > 0 ? allUsers : users;

                if (assignToUserData) {
                    // Handle both array (multi-select) and single object (in case of single selection)
                    const userArray = Array.isArray(assignToUserData) ? assignToUserData : [assignToUserData];

                    assignedUsers = userArray.map((spUser: any) => {
                        // Try to find the user in our users list first
                        const found = lookupUsers.find(
                            u => u.id.toString() === spUser.Id.toString()
                        );

                        return found ?? {
                            id: spUser.Id,
                            fullName: spUser.Title || "",
                            firstName: spUser.Title?.split(" ")[0] || "",
                            lastName: spUser.Title?.split(" ").slice(1).join(" ") || "",
                            email: spUser.Email || "",
                            avatarUrl: `https://i.pravatar.cc/150?u=${spUser.Id}`,
                            role: "user",
                            isVerified: false,
                            jobTitle: "",
                            department: "",
                            organization: "",
                            dateOfJoining: "",
                            dateOfExit: null,
                            businessPhone: "",
                            mobileNo: "",
                            address: "",
                            city: "",
                            postalCode: "",
                            userType: "External",
                            extension: "",
                            permissionGroups: [],
                            principalName: spUser.Email || "",
                            userStatus: "Active",
                            userTypeDetail: "",
                            createdDate: item.Created,
                            modifiedDate: item.Modified,
                            createdBy: "System",
                            modifiedBy: "System",
                            site: [],
                            typeOfContact: [],
                            platformAccounts: [],
                            linkedin: "",
                            twitter: ""
                        } as User;
                    });

                    // For hardware (single assignment model), use the first user as assignedUser
                    if (assetType === AssetType.HARDWARE && assignedUsers.length > 0) {
                        assignedUser = assignedUsers[0];
                    }
                }

                /* ---------- Final Asset ---------- */
                const spId = item.Id || item.ID;
                return {
                    id: spId,
                    assetId: item.AssetId || spId,

                    familyId: item.assetRepo?.Id ? `repo-${item.assetRepo.Id}` : undefined,
                    title: item.Title,

                    status: item.Status || AssetStatus.AVAILABLE,
                    assetType,
                    variantType: (() => {
                        const variant = item.LicenseType || "";
                        if (item.AssetId) {
                            console.log(`Asset ${item.AssetId}: LicenseType from SharePoint = "${item.LicenseType}", variantType = "${variant}"`);
                        }
                        return variant;
                    })(),

                    purchaseDate: getDate(item.purchaseDate) || "",
                    renewalDate: getDate(item.expiryDate) || "",
                    warrantyExpiryDate: getDate(item.expiryDate) || "",

                    cost: item.Cost || item.cost || item.assetRepo?.cost || 0,
                    serialNumber: item.serialNumber,
                    modelNumber: item.modelNumber,

                    assignedUser,
                    assignedUsers,
                    activeUsers: assignedUsers,
                    // For email, use item.Email first, then assignedUser (hardware), then first assignedUser (licenses)
                    email: item.Email || assignedUser?.email || (assignedUsers.length > 0 ? assignedUsers[0].email : undefined),
                    licenseKey: item.licenseKey,

                    location: "Office",
                    condition: HardwareCondition.GOOD,
                    assignmentHistory: (() => {
                        // Parse maintenanceHistory from SharePoint (stored as JSON string)
                        let parsedHistory: AssignmentHistory[] = [];

                        // Helper function to decode HTML entities
                        const decodeHtmlEntities = (text: string): string => {
                            const textarea = document.createElement('textarea');
                            textarea.innerHTML = text;
                            return textarea.value;
                        };

                        try {
                            // Try both lowercase and uppercase field names (SharePoint can be case-sensitive)
                            const historyField = item.maintenanceHistory || item.MaintenanceHistory;

                            if (historyField) {
                                let jsonString = historyField;

                                // If it's a string, decode HTML entities first
                                if (typeof historyField === 'string') {
                                    jsonString = decodeHtmlEntities(historyField);
                                }

                                // Parse the JSON
                                const historyData = typeof jsonString === 'string'
                                    ? JSON.parse(jsonString)
                                    : jsonString;

                                console.log(`Asset ${spId} - Parsed historyData:`, historyData); // Debug log
                                console.log(`Asset ${spId} - Is array:`, Array.isArray(historyData)); // Debug log

                                // Ensure it's an array
                                if (Array.isArray(historyData)) {
                                    parsedHistory = historyData.map((entry: any, index: number) => ({
                                        id: entry.id || `hist-${spId}-${index}`,
                                        assetName: entry.assetName || item.Title,
                                        assetId: String(entry.assetId || item.AssetId || spId), // Ensure assetId is a string
                                        date: entry.date || new Date().toISOString().split('T')[0],
                                        type: entry.type || 'Maintenance',
                                        notes: entry.notes || '',
                                        assignedTo: entry.assignedTo,
                                        assignedFrom: entry.assignedFrom
                                    }));
                                } else {
                                    console.warn(`⚠️ Asset ${spId} - historyData is not an array:`, historyData);
                                }
                            } else {
                                console.log(`ℹ️ Asset ${spId} - No maintenanceHistory field found`);
                            }
                        } catch (error) {
                            console.error(`❌ Asset ${spId} - Failed to parse maintenanceHistory:`, error);
                            console.error(`Raw data that failed:`, item.maintenanceHistory || item.MaintenanceHistory);
                            // Continue with empty history array on parse error
                        }

                        return parsedHistory;
                    })(),

                    created: item.Created,
                    modified: item.Modified,
                    createdBy: "Admin",
                    modifiedBy: "Admin"
                } as Asset;
            });
        } catch (error) {
            console.error("Error fetching assets:", error);
            return [];
        }
    };

    const getMockRequests = async (allUsers: User[] = []) => {
        const res = new Web("https://smalsusinfolabs.sharepoint.com/sites/HHHHQA/AI");
        try {
            const data = await res.lists.getByTitle("Request").items.select(
                "Id",
                "Title",
                "RequestType",
                "Status",
                "Comment",
                "RequestDate",
                "AssetId",
                "AssetFamily/Id",
                "AssetFamily/Title",
                "RequestedBy/Id",
                "RequestedBy/FullName",
                "RequestedBy/Email",
            )
                .expand(
                    "AssetFamily",
                    "RequestedBy"
                )
                .top(5000)
                .get();
            const formateData: Request[] = data.map((apiItem: any) => {

                // Robust user lookup
                let requester: User | null = null;
                const lookupUsers = allUsers.length > 0 ? allUsers : users;

                if (apiItem.RequestedBy) {
                    requester = lookupUsers.find(u =>
                        String(u.id) === String(apiItem.RequestedBy.Id) ||
                        (apiItem.RequestedBy.Email && u.email?.toLowerCase() === apiItem.RequestedBy.Email.toLowerCase())
                    ) || null;
                }

                // Fallback user if not found or expansion missing
                const safeRequester = requester || {
                    id: apiItem.RequestedBy?.Id || apiItem.RequestedById || `u-${apiItem.Id}`,
                    fullName: apiItem.RequestedBy?.FullName || apiItem.RequestedBy?.Title || "Unknown",
                    email: apiItem.RequestedBy?.Email || "",
                    avatarUrl: `https://i.pravatar.cc/150?u=${apiItem.RequestedBy?.Id || apiItem.Id}`,
                    role: "user",
                } as User;

                return {
                    id: String(apiItem.Id),
                    type: apiItem.RequestType,
                    item: apiItem.Title,
                    familyId: apiItem.AssetFamily?.Id ? `repo-${apiItem.AssetFamily.Id}` : undefined,
                    assetId: apiItem.AssetId,
                    requestedBy: safeRequester,
                    status: (apiItem.Status as RequestStatus) || RequestStatus.PENDING,
                    requestDate: apiItem.RequestDate
                        ? apiItem.RequestDate.split("T")[0]
                        : new Date().toISOString().split("T")[0],
                    notes: apiItem.Comment
                        ? apiItem.Comment.replace(/<[^>]*>/g, "").trim()
                        : "",
                };
            });
            return formateData;
        } catch (error) {
            console.log("Error fetching requests:", error);
            return [];
        }
    }

    const getMockVendors = async () => {
        const res = new Web("https://smalsusinfolabs.sharepoint.com/sites/HHHHQA/AI");
        try {
            const data = await res.lists.getByTitle("Vendors").items.getAll();
            const formateData: Vendor[] = data.map((apiVendor: any) => ({
                id: `v-${apiVendor.ID}`,
                name: apiVendor.Title,
                website: apiVendor.Website?.Url || apiVendor.Description || apiVendor.Url || '',
                contactName: apiVendor.ContactName || '',
                email: apiVendor.Email || ''
            }));
            return formateData;
        } catch (error) {
            console.log("Error fetching vendors:", error);
            return [];
        }
    }

    useEffect(() => {
        const loadData = async () => {
            const usersData = await getMockUsers();
            setUsers(usersData);

            // Set current user if matches
            // const current = usersData.find(u => u.email.toLowerCase() === "abhishek.tiwari@hochhuth-consulting.de"); // Example hardcoded check, ideally get current context
            if (usersData.length > 0) setCurrentUser(usersData[0]);

            const familiesData = await getMockAssetFamilies();
            setAssetFamilies(familiesData);

            const vendorData = await getMockVendors();
            setVendors(vendorData);

            // Assets and Requests depend on Families/Users for mapping
            const assetsData = await getMockAssets(usersData);
            setAssets(assetsData);
            // DEBUGING

            console.log('=== ASSET DEBUG ===');
            console.log('Total assets:', assetsData.length);
            console.log('Licenses with assignedUsers:', assetsData.filter(a => a.assetType === 'License' && a.assignedUsers && a.assignedUsers.length > 0).length);
            console.log('Hardware with assignedUser:', assetsData.filter(a => a.assetType === 'Hardware' && a.assignedUser).length);
            console.log('Sample asset:', assetsData[0]);

            const requestsData = await getMockRequests(usersData);
            setRequests(requestsData);
        };

        loadData();
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

    const handleSaveFamily = async (family: AssetFamily) => {
        const res = new Web("https://smalsusinfolabs.sharepoint.com/sites/HHHHQA/AI");
        const isHardware = family.assetType === AssetType.HARDWARE;
        const spData: any = {
            Title: family.name,
            AssetType: isHardware ? 'Hardware' : 'Software',
            Category: family.category,
            Description: family.description,
            AssignmentModel: family.assignmentModel,
            VendorNameId: undefined, // Handle Lookup later if needed, but Title is usually sync'd
            ProductCode: family.productCode || family.name.substring(0, 4).toUpperCase(),
            TotalCount: family.totalCount,
        };

        if (!isHardware) {
            const software = family as SoftwareProfile;
            spData.Variants = JSON.stringify(software.variants || []);
        }

        try {
            if (editingFamily) {
                const numericId = Number(family.id.replace('repo-', '').replace('fam-', ''));
                if (!isNaN(numericId)) {
                    await res.lists.getByTitle("AssetRepository").items.getById(numericId).update(spData);
                    setAssetFamilies(assetFamilies.map(f => f.id === family.id ? { ...family, lastModifiedDate: new Date().toISOString() } : f));
                }
            } else {
                const result = await res.lists.getByTitle("AssetRepository").items.add(spData);
                const newFamily = {
                    ...family,
                    id: `repo-${result.data.Id}`,
                    productCode: spData.ProductCode,
                    createdDate: new Date().toISOString(),
                    lastModifiedDate: new Date().toISOString()
                };
                setAssetFamilies([...assetFamilies, newFamily as AssetFamily]);
            }
            console.log("Asset Family saved to SharePoint successfully.");
        } catch (error) {
            console.error("Error saving Asset Family to SharePoint:", error);
            alert("Failed to save to SharePoint. Check console for details.");
        }
        closeAssetModal();
    };

    const handleBulkCreate = async (family: AssetFamily, variantName: string, quantity: number, commonData: Partial<Asset>) => {
        const res = new Web("https://smalsusinfolabs.sharepoint.com/sites/HHHHQA/AI");
        const newAssets: Asset[] = [];
        const familyPrefix = family.assetType === AssetType.LICENSE ? 'SOFT' : 'HARD';
        const productCode = (family as any).productCode || 'GEN';
        const familyInstances = assets.filter(a => a.familyId === family.id);
        const repoId = Number(family.id.replace('repo-', '').replace('fam-', ''));
        let sequenceStart = familyInstances.length + 1;

        try {
            const batch = res.createBatch();
            const addedItems: any[] = [];

            for (let i = 0; i < quantity; i++) {
                const sequenceNumber = String(sequenceStart + i).padStart(4, '0');
                const assetId = `${familyPrefix}-${productCode}-${sequenceNumber}`;
                const spData: any = {
                    Title: `${family.name} ${sequenceStart + i}`,
                    AssetId: assetId,
                    Status: AssetStatus.AVAILABLE,
                    AssetType: family.assetType === AssetType.HARDWARE ? 'Hardware' : 'Software',
                    LicenseType: variantName,
                    purchaseDate: new Date().toISOString().split('T')[0],
                    Cost: 0,
                    assetRepoId: repoId,
                    ...commonData, // Override with any common data provided
                };

                // Add to batch
                res.lists.getByTitle("AssetManagementSystem").items.inBatch(batch).add(spData).then(r => {
                    addedItems.push({ spId: r.data.Id, assetId });
                });
            }

            await batch.execute();

            // Map back to local state
            const localAssets: Asset[] = addedItems.map(item => ({
                id: String(item.spId),
                assetId: item.assetId,
                familyId: family.id,
                title: `${family.name} ${item.assetId.split('-').pop()}`,
                status: AssetStatus.AVAILABLE,
                assetType: family.assetType,
                variantType: variantName,
                purchaseDate: new Date().toISOString().split('T')[0],
                cost: 0,
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                createdBy: 'Admin (Bulk)',
                modifiedBy: 'Admin (Bulk)',
            } as Asset));

            setAssets(prev => [...prev, ...localAssets]);
            console.log(`Successfully bulk created ${quantity} assets in SharePoint.`);
        } catch (error) {
            console.error("Error bulk creating assets in SharePoint:", error);
            alert("Bulk creation failed. Check console for details.");
        }
    };

    const handleSaveAsset = async (asset: Asset) => {
        // Validation: Check Total Count Limit
        const family = assetFamilies.find(f => f.id === asset.familyId);
        if (family && (family.totalCount || 0) > 0) {
            const familyAssets = assets.filter(a => a.familyId === family.id && a.id !== asset.id);
            const currentAssignedCount = familyAssets.reduce((sum, a) => {
                if (a.assetType === AssetType.HARDWARE) return sum + (a.assignedUser ? 1 : 0);
                return sum + (a.assignedUsers ? a.assignedUsers.length : 0);
            }, 0);

            const newAssignmentsCount = asset.assetType === AssetType.HARDWARE
                ? (asset.assignedUser ? 1 : 0)
                : (asset.assignedUsers ? asset.assignedUsers.length : 0);

            if (currentAssignedCount + newAssignmentsCount > (family.totalCount || 0)) {
                alert("First create the Asset then Assign");
                return;
            }
        }

        const res = new Web("https://smalsusinfolabs.sharepoint.com/sites/HHHHQA/AI");
        let finalAsset = { ...asset };
        const today = new Date().toISOString().split('T')[0];
        let newHistoryEntries: AssignmentHistory[] = [];

        const repoId = family ? Number(family.id.replace('repo-', '').replace('fam-', '')) : null;

        // Prepare SP Data
        const spData: any = {
            Title: asset.title,
            AssetId: asset.assetId,
            Status: asset.status,
            AssetType: asset.assetType === AssetType.HARDWARE ? 'Hardware' : 'Software',
            LicenseType: asset.variantType,
            purchaseDate: asset.purchaseDate,
            expiryDate: asset.renewalDate || asset.warrantyExpiryDate,
            Cost: asset.cost,
            serialNumber: asset.serialNumber,
            modelNumber: asset.modelNumber,
            assetRepoId: repoId,
            licenseKey: asset.licenseKey,
            Email: asset.email,
        };

        // Handle User Assignment
        const assignedUserIds = asset.assetType === AssetType.HARDWARE
            ? (asset.assignedUser ? [Number(asset.assignedUser.id)] : [])
            : (asset.assignedUsers ? asset.assignedUsers.map(u => Number(u.id)) : []);

        spData.assignToUserId = { results: assignedUserIds };

        try {
            if (editingAsset) {
                const numericId = Number(asset.id);
                if (isNaN(numericId)) throw new Error("Invalid Asset ID for SharePoint update");

                // History Tracking
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
                            assignedTo: newUser?.fullName || 'Inventory',
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

                if (newHistoryEntries.length > 0) {
                    finalAsset.assignmentHistory = [...(finalAsset.assignmentHistory || []), ...newHistoryEntries];
                }

                // Encode history for SP
                spData.maintenanceHistory = JSON.stringify(finalAsset.assignmentHistory || []);

                await res.lists.getByTitle("AssetManagementSystem").items.getById(numericId).update(spData);
                finalAsset = { ...finalAsset, modified: new Date().toISOString(), modifiedBy: 'Admin' };
                setAssets(assets.map(a => a.id === asset.id ? finalAsset : a));
            } else {
                // Formatting for new asset ID if not provided
                if (!asset.assetId) {
                    const familyPrefix = family?.assetType === AssetType.LICENSE ? 'SOFT' : 'HARD';
                    const productCode = (family as any)?.productCode || 'GEN';
                    const sequenceNumber = String(assets.filter(a => a.familyId === asset.familyId).length + 1).padStart(4, '0');
                    spData.AssetId = `${familyPrefix}-${productCode}-${sequenceNumber}`;
                }

                // Initial History
                if (asset.assignedUser || (asset.assignedUsers && asset.assignedUsers.length > 0)) {
                    newHistoryEntries.push({
                        id: `hist-${Date.now()}`,
                        assetId: spData.AssetId,
                        assetName: spData.Title,
                        date: today,
                        type: 'Assigned',
                        assignedTo: asset.assignedUser?.fullName || 'Multiple Users',
                        notes: 'Initial Assignment'
                    });
                }
                spData.maintenanceHistory = JSON.stringify(newHistoryEntries);

                const result = await res.lists.getByTitle("AssetManagementSystem").items.add(spData);
                const newAsset = {
                    ...asset,
                    id: String(result.data.Id),
                    assetId: spData.AssetId,
                    assignmentHistory: newHistoryEntries,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    createdBy: 'Admin',
                    modifiedBy: 'Admin'
                };
                setAssets([...assets, newAsset]);
            }
            console.log("Asset instance saved to SharePoint successfully.");
        } catch (error) {
            console.error("Error saving Asset instance to SharePoint:", error);
            alert("Failed to save to SharePoint. Check console for details.");
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

    const handleSaveUser = async (user: User) => {
        // Optimistic Update: Update local state immediately
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

        // Persist to SharePoint
        try {
            const res = new Web("https://smalsusinfolabs.sharepoint.com/sites/HHHHQA/AI");
            await res.lists.getByTitle("Contacts").items.getById(Number(user.id)).update({
                JobTitle: user.jobTitle,
                Department: user.department,
                WorkPhone: user.businessPhone,
                CellPhone: user.mobileNo,
                WorkAddress: user.address,
                WorkCity: user.city,
                WorkZip: user.postalCode,
                WorkCountry: user.country,
                Company: user.organization,
                FirstName: user.firstName,
                Title: user.lastName,
                FullName: user.fullName,
                Role: user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'User',
                User_x0020_Type: user.userType,
                Date_x0020_Of_x0020_Joining: user.dateOfJoining,
                Email: user.email,
                WebPage: user.webPage ? { Description: user.webPage, Url: user.webPage } : null,
                LinkedIn: user.linkedin ? { Description: user.linkedin, Url: user.linkedin } : null,
                Twitter: user.twitter ? { Description: user.twitter, Url: user.twitter } : null
            });
            console.log("User profile saved to SharePoint successfully.");
        } catch (error) {
            console.error("Error saving user profile to SharePoint:", error);
            alert("Changes were saved locally but failed to sync to SharePoint. Check console for details.");
        }
    };

    const handleSubmitRequest = async (familyId: string, notes: string) => {
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

        // Persist to SharePoint
        try {
            const res = new Web("https://smalsusinfolabs.sharepoint.com/sites/HHHHQA/AI");
            const familyIdNumeric = Number(family.id.replace('repo-', '').replace('fam-', ''));
            const result = await res.lists.getByTitle("Request").items.add({
                Title: family.name,
                RequestType: family.assetType === AssetType.HARDWARE ? 'Hardware' : 'Software',
                AssetFamilyId: familyIdNumeric || null,
                Status: 'Pending',
                Comment: notes,
                RequestDate: new Date().toISOString(),
                RequestedById: Number(user.id)
            });
            console.log("Request saved to SharePoint successfully.");

            // Update local ID with the one returned from SharePoint
            const actualId = result.data.Id.toString();
            setRequests(prev => prev.map(r => r.id === newRequest.id ? { ...r, id: actualId } : r));
        } catch (error) {
            console.error("Error saving request to SharePoint:", error);
            alert("Request was saved locally but failed to sync to SharePoint. Check console for details.");
        }
    };

    const handleNewRequest = (category: RequestCategory, requestedFor?: User) => {
        setRequestingUser(requestedFor || currentUser);
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


    const handleRequestAction = async (requestId: string, newStatus: RequestStatus) => {
        if (newStatus === RequestStatus.APPROVED) {
            const req = requests.find(r => r.id === requestId);
            if (req) {
                handleCreateTask(req);
            }
        } else {
            // rejection case
            setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
            try {
                const res = new Web("https://smalsusinfolabs.sharepoint.com/sites/HHHHQA/AI");
                const numericId = Number(requestId.replace('req-', ''));
                if (!isNaN(numericId)) {
                    await res.lists.getByTitle("Request").items.getById(numericId).update({
                        Status: 'Rejected'
                    });
                    console.log("Request rejection persisted to SharePoint.");
                }
            } catch (error) {
                console.error("Error persisting request rejection:", error);
            }
        }
    };

    const handleTaskSubmit = async (newTask: Task) => {
        setTasks(prev => [newTask, ...prev]);

        // Find the request and the user
        const request = requests.find(r => r.id === newTask.requestId);
        if (!request) {
            console.error("Request not found for task:", newTask.requestId);
            setIsTaskModalOpen(false);
            setRequestForTask(null);
            return;
        }

        const requester = request.requestedBy;
        const familyId = String(request.familyId);

        // Find an available asset of this family (strict string comparison)
        const availableAsset = assets.find(a => String(a.familyId) === familyId && a.status === AssetStatus.AVAILABLE);
        let updatedAssetId: string | undefined = undefined;

        if (!availableAsset) {
            alert("No available assets found for this product. Please add more inventory before fulfilling this request.");
            setIsTaskModalOpen(false);
            setRequestForTask(null);
            return;
        }

        updatedAssetId = availableAsset.assetId;

        if (availableAsset) {
            updatedAssetId = availableAsset.assetId;
            // Update Asset locally
            const updatedAsset: Asset = {
                ...availableAsset,
                status: AssetStatus.ACTIVE,
                modified: new Date().toISOString(),
                modifiedBy: 'System (Automatic Assignment)'
            };

            if (updatedAsset.assetType === AssetType.HARDWARE) {
                updatedAsset.assignedUser = requester;
                updatedAsset.assignedUsers = [requester];
            } else {
                updatedAsset.assignedUsers = [...(updatedAsset.assignedUsers || []), requester];
                if (!updatedAsset.assignedUser) updatedAsset.assignedUser = requester;
            }

            // Validation: Check Total Count Limit
            const family = assetFamilies.find(f => f.id === updatedAsset.familyId);
            if (family && (family.totalCount || 0) > 0) {
                const familyAssets = assets.filter(a => a.familyId === family.id && a.id !== updatedAsset.id);
                const currentAssignedCount = familyAssets.reduce((sum, a) => {
                    if (a.assetType === AssetType.HARDWARE) return sum + (a.assignedUser ? 1 : 0);
                    return sum + (a.assignedUsers ? a.assignedUsers.length : 0);
                }, 0);

                const newAssignmentsCount = updatedAsset.assetType === AssetType.HARDWARE
                    ? (updatedAsset.assignedUser ? 1 : 0)
                    : (updatedAsset.assignedUsers ? updatedAsset.assignedUsers.length : 0);

                if (currentAssignedCount + newAssignmentsCount > (family.totalCount || 0)) {
                    alert("First create the Asset then Assign");
                    // Revert changes/Cancel
                    setIsTaskModalOpen(false);
                    setRequestForTask(null);
                    return;
                }
            }

            updatedAsset.email = requester.email;

            // Add assignment history
            const historyEntry: AssignmentHistory = {
                id: `hist-${Date.now()}`,
                assetId: updatedAsset.assetId,
                assetName: updatedAsset.title,
                date: new Date().toISOString().split('T')[0],
                type: 'Assigned',
                assignedTo: requester.fullName,
                notes: `Automatically assigned via fulfilled request ${request.id}`
            };
            updatedAsset.assignmentHistory = [...(updatedAsset.assignmentHistory || []), historyEntry];

            // Update assets state
            setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));

            // Persist Asset Update to SharePoint
            const assetNumericId = Number(availableAsset.id);
            if (!isNaN(assetNumericId)) {
                try {
                    const res = new Web("https://smalsusinfolabs.sharepoint.com/sites/HHHHQA/AI");

                    const requesterId = Number(requester.id);
                    const spAssetData: any = {
                        Status: 'Active',
                        Email: requester.email,
                        maintenanceHistory: JSON.stringify(updatedAsset.assignmentHistory || [])
                    };

                    if (availableAsset.assetType === AssetType.LICENSE) {
                        const existingIds = (availableAsset.assignedUsers || []).map(u => Number(u.id));
                        const newIds = Array.from(new Set([...existingIds, requesterId]));
                        spAssetData.assignToUserId = { results: newIds };
                    } else {
                        spAssetData.assignToUserId = { results: [requesterId] };
                    }

                    await res.lists.getByTitle("AssetManagementSystem").items.getById(assetNumericId).update(spAssetData);
                    console.log("Asset assignment persisted to SharePoint.");
                } catch (error) {
                    console.error("Error persisting asset assignment:", error);
                }
            }
        }

        // Update request state locally and persist to SP
        setRequests(prev => prev.map(r => r.id === request.id ? {
            ...r,
            status: RequestStatus.FULFILLED,
            linkedTaskId: newTask.id,
            assetId: updatedAssetId || r.assetId
        } : r));

        try {
            const res = new Web("https://smalsusinfolabs.sharepoint.com/sites/HHHHQA/AI");
            const requestNumericId = Number(request.id.replace('req-', ''));
            if (!isNaN(requestNumericId)) {
                await res.lists.getByTitle("Request").items.getById(requestNumericId).update({
                    Status: 'Fulfilled',
                    AssetId: updatedAssetId
                });
                console.log("Request fulfillment persisted to SharePoint.");
            }
        } catch (error) {
            console.error("Error persisting request fulfillment:", error);
        }

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
        { accessorKey: 'role', header: 'Role', width: 100, cell: ({ row }) => <span className={`badge ${row.original.role === 'admin' ? 'text-bg-primary' : 'bg-light text-dark border'}`}>{row.original.role}</span> },
        { accessorKey: 'jobTitle', header: 'Job Title', width: 200 },
        { accessorKey: 'department', header: 'Department', width: 200 },
        {
            accessorKey: 'assets', header: 'Assigned', width: 100, cell: ({ row }) => {
                const count = assets.filter(a => a.assignedUser?.id === row.original.id || a.assignedUsers?.some(u => u.id === row.original.id)).length;
                return <span className="badge rounded-pill bg-info text-dark">{count}</span>
            }
        },
        { accessorKey: 'view', header: '', width: 100, cell: ({ row }) => (<button onClick={() => handleUserClick(row.original)} className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 border-0"> View <ArrowRight size={14} /> </button>) }
    ];

    const requestColumns: ColumnDef<Request>[] = [
        { accessorKey: 'item', header: 'Item', width: 250, cell: ({ row }) => (<div> <p className="fw-medium text-dark mb-0">{row.original.item}</p> <p className="small text-secondary mb-0">{row.original.type}</p> </div>) },
        {
            accessorKey: 'familyId',
            header: 'Asset Family',
            width: 180,
            cell: ({ row }) => {
                const fam = assetFamilies.find(f => f.id === row.original.familyId);
                return <span className="small text-secondary">{fam?.name || '-'}</span>
            }
        },
        { accessorKey: 'assetId', header: 'Assigned ID', width: 140, cell: ({ row }) => <span className="font-monospace small text-primary">{row.original.assetId || '-'}</span> },
        { accessorKey: 'requestedBy.fullName', header: 'Requested By', width: 180, cell: ({ row }) => (<button disabled={!isAdmin} onClick={() => handleUserClick(row.original.requestedBy)} className={`btn btn-link p-0 text-decoration-none d-flex align-items-center gap-2 text-start ${!isAdmin ? 'disabled text-dark' : 'text-primary'}`}> <img src={row.original.requestedBy.avatarUrl} alt={row.original.requestedBy.fullName} className="rounded-circle" style={{ width: '24px', height: '24px' }} /> <span className="small fw-medium text-truncate">{row.original.requestedBy.fullName}</span> </button>) },
        { accessorKey: 'requestDate', header: 'Date', width: 120 },
        { accessorKey: 'notes', header: 'Notes', width: 250, cell: ({ row }) => <span className="small text-secondary text-truncate d-inline-block" style={{ maxWidth: '200px' }} title={row.original.notes}>{row.original.notes || '-'}</span> },
        {
            accessorKey: 'status', header: 'Status', width: 150, cell: ({ row }) => {
                const status = row.original.status;
                const colorClasses = {
                    [RequestStatus.PENDING]: 'bg-warning-subtle text-warning border border-warning-subtle',
                    [RequestStatus.APPROVED]: 'bg-success-subtle text-success border border-success-subtle',
                    [RequestStatus.REJECTED]: 'bg-danger-subtle text-danger border border-danger-subtle',
                    [RequestStatus.FULFILLED]: 'bg-info-subtle text-info border border-info-subtle',
                    [RequestStatus.IN_PROGRESS]: 'bg-primary-subtle text-primary border border-primary-subtle'
                };
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
        { accessorKey: 'actions', header: '', width: 100, cell: ({ row }) => (isAdmin && row.original.status === RequestStatus.PENDING) ? (<div className="d-flex gap-2"> <button onClick={() => handleRequestAction(row.original.id, RequestStatus.APPROVED)} className="btn btn-sm btn-success p-1" title="Approve"><Check size={16} /></button> <button onClick={() => handleRequestAction(row.original.id, RequestStatus.REJECTED)} className="btn btn-sm btn-danger p-1" title="Reject"><X size={16} /></button> </div>) : null, },
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
                let bgClass = 'bg-light text-secondary border';
                if (row.original.status === AssetStatus.ACTIVE) bgClass = 'bg-success-subtle text-success border border-success-subtle';
                if (row.original.status === AssetStatus.AVAILABLE) bgClass = 'bg-info-subtle text-info border border-info-subtle';
                if (row.original.status === AssetStatus.EXPIRED || row.original.status === AssetStatus.RETIRED) bgClass = 'bg-danger-subtle text-danger border border-danger-subtle';
                if (row.original.status === AssetStatus.IN_REPAIR || row.original.status === AssetStatus.PENDING) bgClass = 'bg-warning-subtle text-warning border border-warning-subtle';
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
            const total = family.totalCount || instances.length;
            const assigned = instances.reduce((sum, a) => {
                if (a.assetType === AssetType.LICENSE) {
                    return sum + (a.assignedUsers?.length || 0);
                } else {
                    return sum + (a.assignedUser ? 1 : 0);
                }
            }, 0);
            return { ...family, total, assigned, available: Math.max(0, total - assigned) };
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
                (asset.assignedUser?.id && String(asset.assignedUser.id) === String(selectedUser.id)) ||
                (asset.assignedUsers?.some(u => String(u.id) === String(selectedUser.id)))
            );
            return (
                <div className="container-xl">
                    <button onClick={handleBackToList} className="btn btn-sm btn-outline-secondary mb-3 d-flex align-items-center gap-1"> <ArrowRight size={14} className="rotate-180" /> Back to List </button>
                    <UserProfile
                        user={selectedUser}
                        userAssets={userAssets}
                        assetFamilies={assetFamilies}
                        onEditProfile={() => setIsProfileModalOpen(true)}
                        onNewRequest={(cat) => handleNewRequest(cat, selectedUser || undefined)}
                        onQuickRequest={handleQuickRequest}
                    />
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
                                        <span className="border text-secondary">{requests.filter(r => r.status === 'Pending').length} Pending</span>
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
                                            <span className="fw-bold text-dark">{Math.round((assets.filter(a => a.assetType === AssetType.LICENSE && a.assignedUsers && a.assignedUsers.length > 0).length / assets.filter(a => a.assetType === AssetType.LICENSE).length) * 100 || 0)}%</span>
                                        </div>
                                        <div className="progress" style={{ height: '8px' }}>
                                            <div className="progress-bar bg-primary" style={{ width: `${((assets.filter(a => a.assetType === AssetType.LICENSE && a.assignedUsers && a.assignedUsers.length > 0).length / assets.filter(a => a.assetType === AssetType.LICENSE).length) * 100 || 0)}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between small mb-1">
                                            <span className="text-secondary">Hardware Assigned</span>
                                            <span className="fw-bold text-dark">{Math.round((assets.filter(a => a.assetType === AssetType.HARDWARE && a.assignedUser).length / assets.filter(a => a.assetType === AssetType.HARDWARE).length) * 100 || 0)}%</span>
                                        </div>
                                        <div className="progress" style={{ height: '8px' }}>
                                            <div className="progress-bar bg-success" style={{ width: `${((assets.filter(a => a.assetType === AssetType.HARDWARE && a.assignedUser).length / assets.filter(a => a.assetType === AssetType.HARDWARE).length) * 100 || 0)}%` }}></div>
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
                        <nav className="nav nav-underline d-none d-md-flex gap-2">
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
