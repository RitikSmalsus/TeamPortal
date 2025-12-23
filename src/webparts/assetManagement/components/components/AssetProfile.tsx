
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
  <div className="mb-3">
    <p className="small fw-bold text-secondary text-uppercase mb-1" style={{ fontSize: '10px' }}>{label}</p>
    <p className="fw-semibold text-dark mb-0">{value || '-'}</p>
  </div>
);

const VariantCard: React.FC<{ variant: LicenseVariant }> = ({ variant }) => (
  <div className="card bg-light-subtle p-3 mb-2 border-light-subtle">
    <h6 className="fw-bold text-primary mb-1">{variant.name}</h6>
    <div className="d-flex justify-content-between small text-secondary">
      <span>{variant.licenseType}</span>
      <span className="fw-bold text-dark">${variant.cost.toFixed(2)}</span>
    </div>
  </div>
);

const FormRadioGroupBootstrap: React.FC<{
  label: string;
  name: string;
  value?: string;
  options: { value: string; label: string }[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, name, value, options, onChange }) => (
  <div className="mb-3">
    <label className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '11px' }}>{label}</label>
    <div className="d-flex flex-wrap gap-2">
      {options.map((option) => (
        <div key={option.value}>
          <input
            type="radio"
            className="btn-check"
            name={name}
            id={`${name}-${option.value}`}
            value={option.value}
            checked={value === option.value}
            onChange={onChange}
            autoComplete="off"
          />
          <label className="btn btn-sm btn-outline-primary rounded-pill px-3" htmlFor={`${name}-${option.value}`}>
            {option.label}
          </label>
        </div>
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
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1060 }} onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="modal-content border-0 shadow-lg">
          <div className="modal-header border-bottom bg-white p-4">
            <h5 className="modal-title fw-bold text-dark">Bulk Create Licenses</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4 bg-light-subtle">
            <div className="card border-0 shadow-sm p-4 mb-4">
              <FormRadioGroupBootstrap
                label="Select Variant"
                name="variant"
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
                options={family.variants.map(v => ({ value: v.name, label: v.name }))}
              />
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '11px' }}>Quantity</label>
                  <input type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value, 10))} min="1" className="form-control form-control-sm" placeholder="Quantity" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '11px' }}>Cost per License</label>
                  <input type="number" step="0.01" value={cost} onChange={e => setCost(parseFloat(e.target.value))} className="form-control form-control-sm" placeholder="Cost per license" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '11px' }}>Purchase Date</label>
                  <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="form-control form-control-sm" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '11px' }}>Renewal Date</label>
                  <input type="date" value={renewalDate} onChange={e => setRenewalDate(e.target.value)} className="form-control form-control-sm" />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer border-top bg-white p-4">
            <button type="button" onClick={onClose} className="btn btn-light fw-bold px-4">Cancel</button>
            <button type="submit" className="btn btn-primary fw-bold px-4">Create Licenses</button>
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
        cell: ({ row }: { row: { original: Asset } }) => {
          const users = row.original.assignedUsers || [];
          if (users.length === 0) return <span className="text-muted">-</span>;
          return (
            <div className="d-flex flex-column">
              {users.map(user => (
                <button key={user.id} onClick={() => onUserClick(user)} className="btn btn-link btn-sm p-0 m-0 text-primary text-decoration-none text-start small">
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
        cell: ({ row }) => {
          const period = calculatePeriod(row.original.purchaseDate, row.original.renewalDate);
          const dateStr = row.original.renewalDate;
          return (
            <div>
              <div className="text-dark">{dateStr}</div>
              {period && <span className="badge bg-primary-subtle text-primary border border-primary-subtle mt-1" style={{ fontSize: '10px' }}>{period}</span>}
            </div>
          )
        }
      },
    ] : [
      {
        accessorKey: 'assignedUser.fullName',
        header: 'Assigned User',
        width: 180,
        cell: ({ row }: { row: { original: Asset } }) => row.original.assignedUser ? (
          <button onClick={() => onUserClick(row.original.assignedUser!)} className="btn btn-link btn-sm p-0 m-0 text-primary text-decoration-none text-start fw-bold">
            {row.original.assignedUser.fullName}
          </button>
        ) : <span className="text-muted">-</span>,
      },
      { accessorKey: 'serialNumber', header: 'Serial Number', width: 140 },
      { accessorKey: 'location', header: 'Location', width: 150 },
      { accessorKey: 'condition', header: 'Condition', width: 120, cell: ({ row }) => <span>{row.original.condition}</span> },
      { accessorKey: 'modelNumber', header: 'Model', width: 120, cell: ({ row }) => <span>{row.original.modelNumber || (family as HardwareProduct).modelNumber}</span> },
      { accessorKey: 'os', header: 'OS', width: 140, cell: ({ row }) => <span>{row.original.os || '-'}</span> },
      { accessorKey: 'warrantyExpiryDate', header: 'Warranty Ends', width: 120 },
      { accessorKey: 'purchaseDate', header: 'Purchase Date', width: 120 },
      { accessorKey: 'cost', header: 'Cost', width: 100, cell: ({ row }) => <span>{row.original.cost ? `$${row.original.cost}` : '-'}</span> },
    ]),
    {
      accessorKey: 'status', header: 'Status', width: 100, cell: ({ row }) => (
        <span className={`badge rounded-pill
            ${row.original.status === AssetStatus.ACTIVE ? 'text-bg-success' : ''}
            ${row.original.status === AssetStatus.AVAILABLE || row.original.status === AssetStatus.STORAGE ? 'text-bg-info' : ''}
            ${row.original.status === AssetStatus.EXPIRED || row.original.status === AssetStatus.RETIRED ? 'text-bg-danger' : ''}
            ${row.original.status === AssetStatus.IN_REPAIR || row.original.status === AssetStatus.PENDING ? 'text-bg-warning text-white' : ''}
            ${row.original.status === AssetStatus.INACTIVE ? 'bg-secondary' : ''}
        `} style={{ fontSize: '11px' }}>
          {row.original.status}
        </span>
      )
    },
    {
      accessorKey: 'actions',
      header: '',
      width: 60,
      cell: ({ row }) => (
        <div className="d-flex align-items-center justify-content-end gap-2 text-secondary">
          <button onClick={() => onEditAsset(row.original)} className="btn btn-sm btn-light border p-1 rounded-circle">
            <FilePenLine size={16} />
          </button>
        </div>
      ),
    }
  ];

  const addButton = (
    <div className="d-flex align-items-center gap-2">
      {isSoftware && (
        <button
          onClick={() => setIsBulkModalOpen(true)}
          className="btn btn-sm btn-outline-primary fw-bold d-flex align-items-center gap-2 px-3">
          <Layers size={16} /> Bulk Create
        </button>
      )}
      <button
        onClick={() => onAddInstance(family)}
        className="btn btn-sm btn-primary fw-bold d-flex align-items-center gap-2 px-3 shadow-sm">
        <Plus size={16} /> Add {isSoftware ? 'License' : 'Hardware'}
      </button>
    </div>
  );

  return (
    <div className="bg-light min-h-screen py-4">
      <div className="container-fluid">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item"><button onClick={onBack} className="btn btn-link btn-sm p-0 text-decoration-none">Asset Repository</button></li>
            <li className="breadcrumb-item active" aria-current="page">{family.name}</li>
          </ol>
        </nav>

        <div className="row g-4">
          {/* Left Panel */}
          <div className="col-lg-4 col-xl-3">
            <div className="card border-0 shadow-sm p-4 mb-4">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <h4 className="fw-bold text-dark d-flex align-items-center gap-2 mb-0">
                  {isSoftware ? <Settings size={22} className="text-primary" /> : <Package size={22} className="text-success" />}
                  {family.name}
                </h4>
                <button onClick={() => onEditFamily(family)} className="btn btn-sm btn-light border rounded-circle p-1"><Edit size={16} /></button>
              </div>
              <div className="row row-cols-2 g-2">
                <div className="col"><InfoPair label="Category" value={family.category} /></div>
                <div className="col"><InfoPair label={isSoftware ? "Vendor" : "Manufacturer"} value={(family as any).vendor || (family as any).manufacturer} /></div>
                <div className="col"><InfoPair label="Total" value={totalAssets} /></div>
                <div className="col"><InfoPair label="Assigned" value={assignedCount} /></div>
                <div className="col"><InfoPair label="Available" value={totalAssets - assignedCount} /></div>
                <div className="col"><InfoPair label="Product Code" value={(family as any).productCode} /></div>
              </div>
              {family.description && (
                <div className="mt-3 pt-3 border-top">
                  <p className="small fw-bold text-secondary text-uppercase mb-1" style={{ fontSize: '10px' }}>Description</p>
                  <p className="small text-dark mb-0">{family.description}</p>
                </div>
              )}
            </div>
            {isSoftware && (
              <div className="card border-0 shadow-sm p-4">
                <h6 className="fw-bold text-dark mb-3">License Variants</h6>
                {(family as SoftwareProfile).variants.map(v => <VariantCard key={v.id} variant={v} />)}
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="col-lg-8 col-xl-9">
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