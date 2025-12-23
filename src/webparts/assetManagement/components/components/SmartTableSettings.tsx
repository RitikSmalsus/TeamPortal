
import React, { useState, useEffect } from 'react';
import { X, RotateCcw } from 'lucide-react';

export interface SmartTableColumnConfig {
    id: string;
    title: string;
    isVisible: boolean;
    width: number;
    order: number;
}

export interface SmartTableViewSettings {
    showHeader: boolean;
    showColumnFilter: boolean;
    showAdvancedSearch: boolean;
    tableHeight: 'Flexible' | 'Fixed';
}

interface SmartTableSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    columns: SmartTableColumnConfig[];
    viewSettings: SmartTableViewSettings;
    onApply: (columnConfig: SmartTableColumnConfig[], viewSettings: SmartTableViewSettings) => void;
}

const SmartTableSettings: React.FC<SmartTableSettingsProps> = ({
    isOpen,
    onClose,
    columns,
    viewSettings,
    onApply
}) => {
    const [localColumns, setLocalColumns] = useState<SmartTableColumnConfig[]>([]);

    // Settings State
    const [showHeader, setShowHeader] = useState(true);
    const [showColumnFilter, setShowColumnFilter] = useState(false);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(true);
    const [tableHeight, setTableHeight] = useState<'Flexible' | 'Fixed'>('Flexible');

    useEffect(() => {
        if (isOpen) {
            // Initialize with current settings
            setShowHeader(viewSettings.showHeader);
            setShowColumnFilter(viewSettings.showColumnFilter);
            setShowAdvancedSearch(viewSettings.showAdvancedSearch);
            setTableHeight(viewSettings.tableHeight);

            // Initialize columns
            setLocalColumns([...columns].sort((a, b) => a.order - b.order));
        }
    }, [isOpen, columns, viewSettings]);

    if (!isOpen) return null;

    const handleToggleColumn = (id: string) => {
        setLocalColumns(prev => prev.map(c => c.id === id ? { ...c, isVisible: !c.isVisible } : c));
    };

    const handleWidthChange = (id: string, width: number) => {
        setLocalColumns(prev => prev.map(c => c.id === id ? { ...c, width } : c));
    };

    const handleOrderChange = (id: string, order: number) => {
        setLocalColumns(prev => prev.map(c => c.id === id ? { ...c, order } : c));
    };

    const handleApply = () => {
        const newViewSettings: SmartTableViewSettings = {
            showHeader,
            showColumnFilter,
            showAdvancedSearch,
            tableHeight,
        };
        // Ensure order is sequential for safety before applying, though pure sort key usage is fine
        const sortedColumns = [...localColumns].sort((a, b) => a.order - b.order);
        onApply(sortedColumns, newViewSettings);
        onClose();
    };

    const InfoIconSmall = () => (
        <span className="w-3.5 h-3.5 rounded-full border border-slate-400 text-slate-500 flex items-center justify-center text-[8px] font-serif italic inline-block ml-1 cursor-help" title="Info">i</span>
    );

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1060 }} onClick={onClose}>
            <div className="modal-dialog modal-xl modal-dialog-centered" onClick={e => e.stopPropagation()}>
                <div className="modal-content border-0 shadow-lg">

                    {/* Header */}
                    <div className="modal-header border-bottom bg-white p-4">
                        <div>
                            <h5 className="modal-title fw-bold text-dark">SmartTable Settings</h5>
                            <p className="text-secondary small mb-0">Customize your table view and columns</p>
                        </div>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    {/* Content */}
                    <div className="modal-body p-4 bg-light-subtle overflow-auto" style={{ maxHeight: '70vh' }}>
                        {/* Customized Setting Section */}
                        <div className="card border-0 shadow-sm p-4 mb-4">
                            <h6 className="small fw-bold text-secondary text-uppercase mb-3">Customized Setting</h6>
                            <div className="row g-4">
                                {/* Table Header Controls */}
                                <div className="col-md-4">
                                    <p className="small fw-bold text-dark mb-2">Table Header</p>
                                    <div className="d-flex flex-column gap-2">
                                        <div className="form-check form-switch">
                                            <input className="form-check-input" type="checkbox" id="showHeader" checked={showHeader} onChange={e => setShowHeader(e.target.checked)} />
                                            <label className="form-check-label small text-secondary" htmlFor="showHeader">Show Header</label>
                                        </div>
                                        <div className="form-check form-switch">
                                            <input className="form-check-input" type="checkbox" id="showColumnFilter" checked={showColumnFilter} onChange={e => setShowColumnFilter(e.target.checked)} />
                                            <label className="form-check-label small text-secondary" htmlFor="showColumnFilter">Show Column Filter</label>
                                        </div>
                                        <div className="form-check form-switch">
                                            <input className="form-check-input" type="checkbox" id="showAdvancedSearch" checked={showAdvancedSearch} onChange={e => setShowAdvancedSearch(e.target.checked)} />
                                            <label className="form-check-label small text-secondary" htmlFor="showAdvancedSearch">Show Advanced Search</label>
                                        </div>
                                    </div>
                                </div>

                                {/* Table Height */}
                                <div className="col-md-4">
                                    <p className="small fw-bold text-dark mb-2">Table Height</p>
                                    <div className="d-flex flex-column gap-2">
                                        <div className="form-check">
                                            <input className="form-check-input" type="radio" name="tableHeight" id="heightFlexible" checked={tableHeight === 'Flexible'} onChange={() => setTableHeight('Flexible')} />
                                            <label className="form-check-label small text-secondary" htmlFor="heightFlexible">Flexible</label>
                                        </div>
                                        <div className="form-check">
                                            <input className="form-check-input" type="radio" name="tableHeight" id="heightFixed" checked={tableHeight === 'Fixed'} onChange={() => setTableHeight('Fixed')} />
                                            <label className="form-check-label small text-secondary" htmlFor="heightFixed">Fixed (600px)</label>
                                        </div>
                                    </div>
                                </div>

                                {/* Info Tips */}
                                <div className="col-md-4">
                                    <div className="alert alert-info py-2 px-3 small border-0 mb-0">
                                        <p className="fw-bold mb-1">Quick Tip</p>
                                        <p className="mb-0 text-secondary" style={{ fontSize: '11px' }}>Toggle "Fixed" height to enable vertical scrolling for large datasets while keeping the header visible.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Column Settings Section */}
                        <div className="card border-0 shadow-sm p-4">
                            <h6 className="small fw-bold text-secondary text-uppercase mb-3">Column Config</h6>
                            <div className="table-responsive rounded border bg-white">
                                <table className="table table-sm table-hover mb-0 align-middle" style={{ fontSize: '13px' }}>
                                    <thead className="table-light">
                                        <tr>
                                            <th className="px-3 py-2 text-uppercase text-secondary fw-bold" style={{ fontSize: '11px' }}>Column</th>
                                            <th className="px-3 py-2 text-uppercase text-secondary fw-bold text-center" style={{ fontSize: '11px', width: '120px' }}>Width</th>
                                            <th className="px-3 py-2 text-uppercase text-secondary fw-bold text-center" style={{ fontSize: '11px', width: '120px' }}>Order</th>
                                            <th className="px-3 py-2 text-uppercase text-secondary fw-bold text-center" style={{ fontSize: '11px', width: '80px' }}>Show</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {localColumns.map((col) => (
                                            <tr key={col.id}>
                                                <td className="px-3 py-2">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className={col.isVisible ? 'fw-bold text-dark' : 'text-muted'}>{col.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="number"
                                                        value={col.width}
                                                        onChange={(e) => handleWidthChange(col.id, parseInt(e.target.value))}
                                                        className="form-control form-control-sm text-center fw-bold"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="number"
                                                        value={col.order}
                                                        onChange={(e) => handleOrderChange(col.id, parseInt(e.target.value))}
                                                        className="form-control form-control-sm text-center fw-bold"
                                                    />
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={col.isVisible}
                                                        onChange={() => handleToggleColumn(col.id)}
                                                        className="form-check-input"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer border-top bg-white p-4">
                        <button type="button" onClick={onClose} className="btn btn-light fw-bold px-4">Cancel</button>
                        <button type="button" onClick={handleApply} className="btn btn-primary fw-bold px-4">Apply Settings</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartTableSettings;
