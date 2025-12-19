
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
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-50 w-full max-w-5xl h-[80vh] rounded-lg shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-6 bg-white border-b border-slate-200 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <FileSpreadsheet size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Import Data Tool</h2>
                    <p className="text-sm text-slate-500">Copy data from Excel and paste it below</p>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-800"><X size={24}/></button>
        </div>

        {/* Steps Indicator */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-center">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-indigo-600 font-semibold' : 'text-slate-400'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>1</span>
                    Input
                </div>
                <div className={`w-12 h-0.5 mx-2 ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-indigo-600 font-semibold' : 'text-slate-400'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>2</span>
                    Map Columns
                </div>
                <div className={`w-12 h-0.5 mx-2 ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                <div className={`flex items-center gap-2 ${step >= 3 ? 'text-indigo-600 font-semibold' : 'text-slate-400'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>3</span>
                    Preview & Import
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-hidden p-6 flex flex-col">
            
            {/* Step 1: Input */}
            {step === 1 && (
                <div className="h-full flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Import Type</label>
                            <select 
                                value={importType} 
                                onChange={e => setImportType(e.target.value as ImportType)}
                                className="w-full border border-slate-300 rounded-md p-2.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="hardware">Hardware Assets</option>
                                <option value="licenses">Software Licenses</option>
                                <option value="users">Users</option>
                            </select>
                        </div>
                        <div className="flex items-end mb-3">
                             <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={hasHeader} onChange={e => setHasHeader(e.target.checked)} className="rounded text-indigo-600 w-4 h-4" />
                                <span className="text-sm font-medium text-slate-700">First row contains column headers</span>
                            </label>
                        </div>
                    </div>
                    
                    <div className="flex-grow flex flex-col">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Paste Excel Data (Tab-separated)</label>
                        <textarea 
                            value={rawData}
                            onChange={e => setRawData(e.target.value)}
                            placeholder="Paste your data here..."
                            className="flex-grow w-full border border-slate-300 rounded-md p-4 font-mono text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                        />
                    </div>
                </div>
            )}

            {/* Step 2: Mapping */}
            {step === 2 && (
                <div className="h-full overflow-y-auto">
                    <p className="text-sm text-slate-600 mb-4">Match your Excel columns to the system fields. Columns left as "Ignore" will be skipped.</p>
                    <div className="grid grid-cols-1 gap-4">
                        {headers.map((header, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                                <div className="w-1/3">
                                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Source Column</p>
                                    <p className="text-sm font-medium text-slate-800 truncate" title={header}>{header}</p>
                                    <p className="text-xs text-slate-400 mt-1 truncate">Ex: {parsedRows[0]?.[index]}</p>
                                </div>
                                <ArrowRight className="text-slate-400" />
                                <div className="flex-grow">
                                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Map To Field</p>
                                    <select 
                                        value={columnMapping[index] || ''}
                                        onChange={(e) => setColumnMapping(prev => ({ ...prev, [index]: e.target.value }))}
                                        className={`w-full p-2 border rounded-md text-sm ${columnMapping[index] ? 'border-indigo-300 bg-indigo-50 text-indigo-700 font-medium' : 'border-slate-300 text-slate-600'}`}
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
                        ))}
                    </div>
                </div>
            )}

            {/* Step 3: Preview */}
            {step === 3 && (
                <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                         <p className="text-sm text-slate-600">Review the data before importing. You can edit cells directly to fix errors.</p>
                         <div className="flex gap-2 text-sm text-slate-500">
                             <span className="flex items-center gap-1"><AlertCircle size={14} className="text-amber-500"/> Check for missing required fields</span>
                         </div>
                    </div>
                    <div className="flex-grow overflow-auto border border-slate-200 rounded-lg bg-white">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50 sticky top-0">
                                <tr>
                                    {schema.map(field => (
                                        <th key={field.key} className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {previewData.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-slate-50">
                                        {schema.map(field => (
                                            <td key={field.key} className="px-3 py-2 text-sm border-r border-transparent hover:border-slate-200">
                                                <input 
                                                    type="text" 
                                                    value={row[field.key] || ''} 
                                                    onChange={e => handleCellEdit(rowIndex, field.key, e.target.value)}
                                                    className={`w-full bg-transparent focus:outline-none focus:bg-indigo-50 rounded px-1 ${field.required && !row[field.key] ? 'border-b-2 border-red-300 bg-red-50' : ''}`}
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
        <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center rounded-b-lg">
            {step === 1 && (
                <>
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-md">Cancel</button>
                    <button onClick={handleParse} disabled={!rawData} className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        Next: Map Columns <ArrowRight size={16}/>
                    </button>
                </>
            )}
            {step === 2 && (
                <>
                    <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-md">Back</button>
                    <button onClick={handleMapConfirm} className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2">
                        Next: Preview Data <ArrowRight size={16}/>
                    </button>
                </>
            )}
            {step === 3 && (
                <>
                    <button onClick={() => setStep(2)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-md">Back</button>
                    <button onClick={handleFinalImport} className="px-6 py-2 bg-green-600 text-white rounded-md text-sm font-semibold hover:bg-green-700 flex items-center gap-2">
                        <Upload size={16}/> Complete Import ({previewData.length} records)
                    </button>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default DataImportModal;
