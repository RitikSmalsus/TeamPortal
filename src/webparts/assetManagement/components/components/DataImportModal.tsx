
import React, { useState, useEffect } from 'react';
import { X, Upload, ArrowRight, Check, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { AssetType } from '../types';

export type ImportType = 'users' | 'hardware' | 'licenses';

interface DataImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (type: ImportType, data: any[]) => void;
    existingFamilies: { id: string; name: string; type: AssetType }[];
}

interface ImportField {
    key: string;
    label: string;
    required?: boolean;
    type?: string;
}

const IMPORT_SCHEMAS: Record<ImportType, ImportField[]> = {
    users: [
        { key: 'fullName', label: 'Full Name', required: true },
        { key: 'email', label: 'Email', required: true },
        { key: 'jobTitle', label: 'Job Title' },
        { key: 'department', label: 'Department' },
        { key: 'businessPhone', label: 'Phone' },
        { key: 'location', label: 'Location/Site' }
    ],
    hardware: [
        { key: 'title', label: 'Asset Name/Title', required: true },
        { key: 'familyName', label: 'Product/Family Name' },
        { key: 'serialNumber', label: 'Serial Number', required: true },
        { key: 'modelNumber', label: 'Model Number' },
        { key: 'manufacturer', label: 'Manufacturer' },
        { key: 'cost', label: 'Cost', type: 'number' },
        { key: 'purchaseDate', label: 'Purchase Date', type: 'date' },
        { key: 'location', label: 'Location' },
        { key: 'assignedUserEmail', label: 'Assigned User (Email)' }
    ],
    licenses: [
        { key: 'title', label: 'License Title', required: true },
        { key: 'familyName', label: 'Software Name (Profile)' },
        { key: 'licenseKey', label: 'License Key' },
        { key: 'variantType', label: 'Variant/Plan' },
        { key: 'cost', label: 'Cost', type: 'number' },
        { key: 'purchaseDate', label: 'Purchase Date', type: 'date' },
        { key: 'renewalDate', label: 'Renewal Date', type: 'date' },
        { key: 'assignedUserEmail', label: 'Assigned User (Email)' }
    ]
};

const DataImportModal: React.FC<DataImportModalProps> = ({ isOpen, onClose, onImport, existingFamilies }) => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [importType, setImportType] = useState<ImportType>('hardware');
    const [rawData, setRawData] = useState('');
    const [hasHeader, setHasHeader] = useState(true);

    const [parsedRows, setParsedRows] = useState<string[][]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [columnMapping, setColumnMapping] = useState<Record<number, string>>({});

    const [previewData, setPreviewData] = useState<any[]>([]);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setRawData('');
            setParsedRows([]);
            setColumnMapping({});
            setPreviewData([]);
        }
    }, [isOpen]);

    const handleParse = () => {
        if (!rawData.trim()) return;

        // Split by new line, then by tab
        const rows = rawData.trim().split('\n').map(row => row.split('\t'));

        if (rows.length === 0) return;

        let detectedHeaders: string[] = [];
        let dataRows = rows;

        if (hasHeader) {
            detectedHeaders = rows[0];
            dataRows = rows.slice(1);
        } else {
            detectedHeaders = rows[0].map((_, i) => `Column ${i + 1}`);
        }

        setHeaders(detectedHeaders);
        setParsedRows(dataRows);

        // Auto-map based on name similarity
        const schema = IMPORT_SCHEMAS[importType];
        const initialMapping: Record<number, string> = {};

        detectedHeaders.forEach((header, index) => {
            const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
            const match = schema.find(field => {
                const normalizedField = field.label.toLowerCase().replace(/[^a-z0-9]/g, '');
                return normalizedHeader.includes(normalizedField) || normalizedField.includes(normalizedHeader);
            });
            if (match) {
                initialMapping[index] = match.key;
            }
        });

        setColumnMapping(initialMapping);
        setStep(2);
    };

    const handleMapConfirm = () => {
        const schema = IMPORT_SCHEMAS[importType];
        const mappedData = parsedRows.map((row, rowIndex) => {
            const obj: any = { _id: rowIndex };
            Object.entries(columnMapping).forEach(([key, fieldKey]) => {
                const colIndex = parseInt(key, 10);
                if (fieldKey && !isNaN(colIndex)) {
                    let value: any = row[colIndex];
                    // Simple type conversion
                    const fieldDef = schema.find(f => f.key === fieldKey);
                    if (fieldDef?.type === 'number') {
                        value = parseFloat(value?.replace(/[^0-9.-]+/g, '')) || 0;
                    }
                    if (fieldDef?.type === 'date') {
                        // Try to parse excel dates or standard dates
                        // Basic check, assume YYYY-MM-DD or simple string
                        value = value?.trim();
                    }
                    obj[fieldKey as string] = value;
                }
            });
            return obj;
        });

        setPreviewData(mappedData);
        setStep(3);
    };

    const handleCellEdit = (rowIndex: number, key: string, value: string) => {
        setPreviewData(prev => prev.map((row: any, i) => i === rowIndex ? { ...row, [key]: value } : row));
    };

    const handleFinalImport = () => {
        // Filter out temporary _id and send to parent
        const cleanData = previewData.map(({ _id, ...rest }) => rest);
        onImport(importType, cleanData);
        onClose();
    };

    if (!isOpen) return null;

    const schema = IMPORT_SCHEMAS[importType];

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1060 }} onClick={onClose}>
            <div className="modal-dialog modal-xl modal-dialog-centered" onClick={e => e.stopPropagation()}>
                <div className="modal-content border-0 shadow-lg" style={{ height: '85vh' }}>

                    {/* Header */}
                    <div className="modal-header border-bottom bg-white p-4">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary-subtle p-2 rounded text-primary">
                                <FileSpreadsheet size={24} />
                            </div>
                            <div>
                                <h5 className="modal-title fw-bold text-dark">Import Data Tool</h5>
                                <p className="text-secondary small mb-0">Copy data from Excel and paste it below</p>
                            </div>
                        </div>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    {/* Steps Indicator */}
                    <div className="bg-light border-bottom px-4 py-3">
                        <div className="d-flex align-items-center justify-content-center">
                            <div className={`d-flex align-items-center gap-2 ${step >= 1 ? 'text-primary fw-bold' : 'text-secondary'}`}>
                                <span className={`badge rounded-circle d-flex align-items-center justify-content-center ${step >= 1 ? 'bg-primary' : 'bg-secondary'}`} style={{ width: '24px', height: '24px' }}>1</span>
                                Input
                            </div>
                            <div className={`mx-3 border-top ${step >= 2 ? 'border-primary' : 'border-secondary'}`} style={{ width: '50px' }}></div>
                            <div className={`d-flex align-items-center gap-2 ${step >= 2 ? 'text-primary fw-bold' : 'text-secondary'}`}>
                                <span className={`badge rounded-circle d-flex align-items-center justify-content-center ${step >= 2 ? 'bg-primary' : 'bg-secondary'}`} style={{ width: '24px', height: '24px' }}>2</span>
                                Map Columns
                            </div>
                            <div className={`mx-3 border-top ${step >= 3 ? 'border-primary' : 'border-secondary'}`} style={{ width: '50px' }}></div>
                            <div className={`d-flex align-items-center gap-2 ${step >= 3 ? 'text-primary fw-bold' : 'text-secondary'}`}>
                                <span className={`badge rounded-circle d-flex align-items-center justify-content-center ${step >= 3 ? 'bg-primary' : 'bg-secondary'}`} style={{ width: '24px', height: '24px' }}>3</span>
                                Preview & Import
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="modal-body p-4 bg-light-subtle overflow-auto">

                        {/* Step 1: Input */}
                        {step === 1 && (
                            <div className="h-100 d-flex flex-column gap-4">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-secondary text-uppercase">Import Type</label>
                                        <select
                                            value={importType}
                                            onChange={e => setImportType(e.target.value as ImportType)}
                                            className="form-select form-select-sm"
                                        >
                                            <option value="hardware">Hardware Assets</option>
                                            <option value="licenses">Software Licenses</option>
                                            <option value="users">Users</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6 d-flex align-items-end pb-1">
                                        <div className="form-check">
                                            <input type="checkbox" className="form-check-input" id="hasHeader" checked={hasHeader} onChange={e => setHasHeader(e.target.checked)} />
                                            <label className="form-check-label small fw-bold text-secondary" htmlFor="hasHeader">First row contains column headers</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-grow-1 d-flex flex-column">
                                    <label className="form-label small fw-bold text-secondary text-uppercase">Paste Excel Data (Tab-separated)</label>
                                    <textarea
                                        value={rawData}
                                        onChange={e => setRawData(e.target.value)}
                                        placeholder="Paste your data here..."
                                        className="form-control form-control-sm flex-grow-1 font-monospace"
                                        style={{ minHeight: '300px' }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Mapping */}
                        {step === 2 && (
                            <div className="h-100">
                                <p className="text-secondary small mb-4">Match your Excel columns to the system fields. Columns left as "Ignore" will be skipped.</p>
                                <div className="d-flex flex-column gap-3">
                                    {headers.map((header, index) => (
                                        <div key={index} className="card border-0 shadow-sm p-3">
                                            <div className="row align-items-center">
                                                <div className="col-md-5">
                                                    <p className="small fw-bold text-uppercase text-secondary mb-1" style={{ fontSize: '10px' }}>Source Column</p>
                                                    <p className="fw-bold text-dark mb-0 text-truncate" title={header}>{header}</p>
                                                    <p className="small text-muted mb-0 text-truncate" style={{ fontSize: '11px' }}>Ex: {parsedRows[0]?.[index]}</p>
                                                </div>
                                                <div className="col-md-1 d-flex justify-content-center text-secondary">
                                                    <ArrowRight size={20} />
                                                </div>
                                                <div className="col-md-6">
                                                    <p className="small fw-bold text-uppercase text-secondary mb-1" style={{ fontSize: '10px' }}>Map To Field</p>
                                                    <select
                                                        value={columnMapping[index] || ''}
                                                        onChange={(e) => setColumnMapping(prev => ({ ...prev, [index]: e.target.value }))}
                                                        className={`form-select form-select-sm ${columnMapping[index] ? 'border-primary bg-primary-subtle text-primary fw-bold' : ''}`}
                                                    >
                                                        <option value="">-- Ignore --</option>
                                                        {schema.map(field => (
                                                            <option key={field.key} value={field.key}>
                                                                {field.label} {field.required ? '*' : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Preview */}
                        {step === 3 && (
                            <div className="h-100 d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <p className="text-secondary small mb-0">Review the data before importing. You can edit cells directly to fix errors.</p>
                                    <span className="badge text-bg-warning d-flex align-items-center gap-1"><AlertCircle size={14} /> Check required fields</span>
                                </div>
                                <div className="flex-grow-1 overflow-auto bg-white border rounded">
                                    <table className="table table-sm table-hover mb-0" style={{ fontSize: '13px' }}>
                                        <thead className="table-light sticky-top">
                                            <tr>
                                                {schema.map(field => (
                                                    <th key={field.key} className="text-uppercase text-secondary fw-bold px-3 py-2" style={{ fontSize: '11px' }}>
                                                        {field.label} {field.required && <span className="text-danger">*</span>}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.map((row, rowIndex) => (
                                                <tr key={rowIndex}>
                                                    {schema.map(field => (
                                                        <td key={field.key} className="p-0">
                                                            <input
                                                                type="text"
                                                                value={row[field.key] || ''}
                                                                onChange={e => handleCellEdit(rowIndex, field.key, e.target.value)}
                                                                className={`form-control form-control-sm border-0 bg-transparent px-3 py-2 ${field.required && !row[field.key] ? 'bg-danger-subtle' : ''}`}
                                                                placeholder="..."
                                                            />
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Footer Actions */}
                    <div className="modal-footer border-top bg-white p-4">
                        {step === 1 && (
                            <>
                                <button type="button" onClick={onClose} className="btn btn-light fw-bold px-4">Cancel</button>
                                <button type="button" onClick={handleParse} disabled={!rawData} className="btn btn-primary fw-bold px-4 d-flex align-items-center gap-2">
                                    Next: Map Columns <ArrowRight size={16} />
                                </button>
                            </>
                        )}
                        {step === 2 && (
                            <>
                                <button type="button" onClick={() => setStep(1)} className="btn btn-light fw-bold px-4">Back</button>
                                <button type="button" onClick={handleMapConfirm} className="btn btn-primary fw-bold px-4 d-flex align-items-center gap-2">
                                    Next: Preview Data <ArrowRight size={16} />
                                </button>
                            </>
                        )}
                        {step === 3 && (
                            <>
                                <button type="button" onClick={() => setStep(2)} className="btn btn-light fw-bold px-4">Back</button>
                                <button type="button" onClick={handleFinalImport} className="btn btn-success fw-bold px-4 d-flex align-items-center gap-2">
                                    <Upload size={16} /> Complete Import ({previewData.length} records)
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataImportModal;
