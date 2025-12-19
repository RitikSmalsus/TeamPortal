
import React, { useState } from 'react';
import { Asset, User, ColumnDef, AssetStatus, AssetFamily, SoftwareProfile, HardwareProduct, AssetType, LicenseVariant } from '../types';
import DataTable from './DataTable';
import { Settings, Edit, ChevronDown, FilePenLine, Plus, Layers, Package, Download } from 'lucide-react';

interface AssetProfileProps {
  family: AssetFamily;
  allAssets: Asset[];
  onBack: () => void;
  onEditAsset: (asset: Asset) => void;
  onEditFamily: (family: AssetFamily) => void;
  onAddInstance: (family: AssetFamily) => void;
  onBulkCreate: (family: AssetFamily, variantName: string, quantity: number, commonData: Partial<Asset>) => void;
  onUserClick: (user: User) => void;
}

const InfoPair: React.FC<{ label: string, value: string | number | undefined }> = ({ label, value }) => (
    <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-sm font-semibold text-slate-800">{value || '-'}</p>
    </div>
);

const VariantCard: React.FC<{ variant: LicenseVariant }> = ({ variant }) => (
    <div className="bg-white rounded-md p-3 border border-slate-200">
        <h4 className="font-semibold text-indigo-700">{variant.name}</h4>
        <div className="mt-2 text-xs text-slate-600 space-y-1">
            <p><span className="font-medium">Type:</span> {variant.licenseType}</p>
            <p><span className="font-medium">Cost:</span> ${variant.cost.toFixed(2)}</p>
        </div>
    </div>
);

const FormRadioGroup: React.FC<{
  label: string;
  name: string;
  value?: string;
  options: { value: string; label: string }[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, name, value, options, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <label key={option.value} className="relative">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={onChange}
            className="sr-only peer"
          />
          <span className="block px-4 py-2 text-sm border rounded-full cursor-pointer peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-600 bg-white border-slate-300 hover:bg-slate-100 transition-colors">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  </div>
);


const BulkCreateModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  family: SoftwareProfile;
  onSubmit: (variantName: string, quantity: number, commonData: Partial<Asset>) => void;
}> = ({ isOpen, onClose, family, onSubmit }) => {
  const [variantName, setVariantName] = useState(family.variants[0]?.name || '');
  const [quantity, setQuantity] = useState(1);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [renewalDate, setRenewalDate] = useState('');
  const [cost, setCost] = useState(family.variants[0]?.cost || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const commonData: Partial<Asset> = { purchaseDate, renewalDate, cost };
    onSubmit(variantName, quantity, commonData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-100 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
            <div className="p-6 border-b bg-white rounded-t-lg">
                <h3 className="text-lg font-bold">Bulk Create Licenses for {family.name}</h3>
            </div>
            <div className="p-6 space-y-4">
                <FormRadioGroup 
                    label="Select Variant"
                    name="variant"
                    value={variantName}
                    onChange={(e) => setVariantName(e.target.value)}
                    options={family.variants.map(v => ({ value: v.name, label: v.name }))}
                />
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                    <input type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value, 10))} min="1" className="w-full p-2 border border-slate-300 rounded" placeholder="Quantity"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Date</label>
                    <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="w-full p-2 border border-slate-300 rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Renewal Date</label>
                    <input type="date" value={renewalDate} onChange={e => setRenewalDate(e.target.value)} className="w-full p-2 border border-slate-300 rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cost per License</label>
                    <input type="number" step="0.01" value={cost} onChange={e => setCost(parseFloat(e.target.value))} className="w-full p-2 border border-slate-300 rounded" placeholder="Cost per license"/>
                </div>
            </div>
            <div className="p-4 bg-white border-t flex justify-end gap-3 rounded-b-lg">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700">Create Licenses</button>
            </div>
        </form>
      </div>
    </div>
  );
};


const AssetProfile: React.FC<AssetProfileProps> = ({ family, allAssets, onBack, onEditAsset, onEditFamily, onAddInstance, onBulkCreate, onUserClick }) => {
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const familyAssets = React.useMemo(() => {
    return allAssets.filter(a => a.familyId === family.id);
  }, [allAssets, family]);

  const assignedCount = familyAssets.filter(a => (a.assignedUser || (a.assignedUsers && a.assignedUsers.length > 0))).length;
  const totalAssets = familyAssets.length;
  
  const isSoftware = family.assetType === AssetType.LICENSE;

  const calculatePeriod = (purchase: string | undefined, renewal: string | undefined): string => {
      if (!purchase || !renewal) return '';
      try {
          const start = new Date(purchase);
          const end = new Date(renewal);
          if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';
          
          const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
          
          if (months === 12) return '1 Year';
          if (months === 1) return '1 Month';
          if (months % 12 === 0) return `${months / 12} Years`;
          if (months < 12) return `${months} Months`;
          return `${months} Months`; // Fallback
      } catch {
          return '';
      }
  };

  const columns: ColumnDef<Asset>[] = [
    { accessorKey: 'assetId', header: 'Asset-ID', width: 140 },
    { accessorKey: 'title', header: 'Title', width: 140 },
    ...(isSoftware ? [
        { accessorKey: 'variantType', header: 'Variant', width: 100 },
        { 
          accessorKey: 'assignedUsers', 
          header: 'Assigned User(s)',
          width: 180,
          cell: ({ row }: {row: {original: Asset}}) => {
            const users = row.original.assignedUsers || [];
            if (users.length === 0) return <span className="text-slate-400">-</span>;
            return (
              <div className="flex flex-col">
                {users.map(user => (
                   <button key={user.id} onClick={() => onUserClick(user)} className="text-blue-600 hover:underline truncate text-left">
                     {user.fullName}
                   </button>
                ))}
              </div>
            )
          },
        },
        { accessorKey: 'email', header: 'Email', width: 200 },
        { 
            accessorKey: 'renewalDate', 
            header: 'Renewal', 
            width: 160,
            cell: ({row}) => {
                const period = calculatePeriod(row.original.purchaseDate, row.original.renewalDate);
                const dateStr = row.original.renewalDate;
                return (
                    <div>
                        <div className="text-slate-800">{dateStr}</div>
                        {period && <div className="text-xs text-indigo-600 font-medium bg-indigo-50 inline-block px-1 rounded">{period}</div>}
                    </div>
                )
            }
        },
    ] : [
        { 
          accessorKey: 'assignedUser.fullName', 
          header: 'Assigned User',
          width: 180,
          cell: ({ row }: {row: {original: Asset}}) => row.original.assignedUser ? (
            <button onClick={() => onUserClick(row.original.assignedUser!)} className="font-medium text-blue-600 hover:underline truncate block w-full text-left">
                {row.original.assignedUser.fullName}
            </button>
          ) : <span className="text-slate-400">-</span>,
        },
        { accessorKey: 'serialNumber', header: 'Serial Number', width: 140 },
        { accessorKey: 'location', header: 'Location', width: 150 },
        { accessorKey: 'condition', header: 'Condition', width: 120, cell: ({row}) => <span>{row.original.condition}</span> },
        { accessorKey: 'modelNumber', header: 'Model', width: 120, cell: ({row}) => <span>{row.original.modelNumber || (family as HardwareProduct).modelNumber}</span> },
        { accessorKey: 'os', header: 'OS', width: 140, cell: ({row}) => <span>{row.original.os || '-'}</span> },
        { accessorKey: 'warrantyExpiryDate', header: 'Warranty Ends', width: 120 },
        { accessorKey: 'purchaseDate', header: 'Purchase Date', width: 120 },
        { accessorKey: 'cost', header: 'Cost', width: 100, cell: ({row}) => <span>{row.original.cost ? `$${row.original.cost}` : '-'}</span> },
    ]),
    { accessorKey: 'status', header: 'Status', width: 100, cell: ({row}) => (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full bg-opacity-80
            ${row.original.status === AssetStatus.ACTIVE ? 'bg-green-100 text-green-800' : ''}
            ${row.original.status === AssetStatus.AVAILABLE || row.original.status === AssetStatus.STORAGE ? 'bg-sky-100 text-sky-800' : ''}
            ${row.original.status === AssetStatus.EXPIRED || row.original.status === AssetStatus.RETIRED ? 'bg-red-100 text-red-800' : ''}
            ${row.original.status === AssetStatus.IN_REPAIR || row.original.status === AssetStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : ''}
            ${row.original.status === AssetStatus.INACTIVE ? 'bg-slate-200 text-slate-700' : ''}
        `}>
            {row.original.status}
        </span>
    ) },
    {
      accessorKey: 'actions',
      header: '',
      width: 60,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2 text-slate-500">
          <button onClick={() => onEditAsset(row.original)} className="p-1 hover:text-indigo-600 rounded-full hover:bg-slate-100">
            <FilePenLine size={16} />
          </button>
        </div>
      ),
    }
  ];

  const addButton = (
    <div className="flex items-center gap-2">
      {isSoftware && (
        <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-slate-600 rounded-md shadow-sm hover:bg-slate-700">
            <Layers size={16} /> Bulk Create
        </button>
      )}
      <button 
        onClick={() => onAddInstance(family)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-purple-600 rounded-md shadow-sm hover:bg-purple-700">
        <Plus size={16} /> Add {isSoftware ? 'License' : 'Hardware'}
      </button>
    </div>
  );
  
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
       <div className="max-w-full mx-auto">
            <div className="mb-4 text-sm text-slate-500">
                <button onClick={onBack} className="font-medium text-blue-600 hover:underline">Asset Repository</button>
                <span className="mx-2">/</span>
                <span className="font-medium text-slate-700">{family.name}</span>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Panel */}
                <div className="lg:w-1/3 xl:w-1/4 flex-shrink-0 space-y-6">
                    <div className="bg-white p-5 rounded-lg shadow-sm">
                        <div className="flex justify-between items-start">
                           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                             {isSoftware ? <Settings size={22} className="text-blue-600" /> : <Package size={22} className="text-emerald-600" />}
                             {family.name}
                           </h2>
                           <button onClick={() => onEditFamily(family)} className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full"><Edit size={16} /></button>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <InfoPair label="Category" value={family.category} />
                            <InfoPair label={isSoftware ? "Vendor" : "Manufacturer"} value={(family as any).vendor || (family as any).manufacturer} />
                            <InfoPair label="Total" value={totalAssets} />
                            <InfoPair label="Assigned" value={assignedCount} />
                            <InfoPair label="Available" value={totalAssets - assignedCount} />
                            <InfoPair label="Product Code" value={(family as any).productCode} />
                        </div>
                        {family.description && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <p className="text-xs text-slate-500 font-medium">Description</p>
                                <p className="text-sm text-slate-700">{family.description}</p>
                            </div>
                        )}
                    </div>
                     {isSoftware && (
                        <div className="bg-white p-5 rounded-lg shadow-sm">
                            <h3 className="text-base font-bold text-slate-800 mb-3">License Variants</h3>
                            <div className="space-y-2">
                                {(family as SoftwareProfile).variants.map(v => <VariantCard key={v.id} variant={v} />)}
                            </div>
                        </div>
                     )}
                </div>

                {/* Right Panel */}
                <div className="flex-1">
                    <DataTable 
                      columns={columns} 
                      data={familyAssets}
                      addButton={addButton}
                    />
                </div>
            </div>
       </div>
       {isSoftware && <BulkCreateModal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} family={family as SoftwareProfile} onSubmit={(v, q, c) => onBulkCreate(family, v, q, c)} />}
    </div>
  );
};

export default AssetProfile;