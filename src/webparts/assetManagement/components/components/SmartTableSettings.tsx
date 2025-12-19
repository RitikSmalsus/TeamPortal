
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[1px]" onClick={onClose}>
      <div className="bg-white w-full max-w-[1000px] shadow-2xl rounded-sm border border-slate-200 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
           <h3 className="text-lg font-semibold text-slate-800">Asset Management - SmartTable Settings</h3>
           <div className="flex items-center gap-4 text-xs text-slate-600">
              <button className="text-indigo-600 hover:underline">Default Settings</button>
              <button className="text-indigo-600 hover:underline">Restore default table</button>
              <InfoIconSmall />
              <button onClick={onClose}><X className="w-5 h-5 text-slate-500 hover:text-slate-700"/></button>
           </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto bg-white flex-1">
            {/* Customized Setting Section */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-800 mb-2">Customized Setting</h4>
                <div className="border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8 pt-2">
                        {/* Table Header Controls */}
                        <div>
                            <div className="font-semibold text-xs text-slate-700 mb-2">Table Header</div>
                            <div className="flex gap-6 mb-2">
                                <label className="flex items-center gap-2 text-xs cursor-pointer select-none text-slate-700">
                                    <input type="checkbox" checked={showHeader} onChange={e => setShowHeader(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500"/> 
                                    Show Header <InfoIconSmall />
                                </label>
                                <label className="flex items-center gap-2 text-xs cursor-pointer select-none text-slate-700">
                                    <input type="checkbox" checked={showColumnFilter} onChange={e => setShowColumnFilter(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500"/> 
                                    Show Column Filter
                                </label>
                            </div>
                            <label className="flex items-center gap-2 text-xs cursor-pointer select-none text-slate-700">
                                <input type="checkbox" checked={showAdvancedSearch} onChange={e => setShowAdvancedSearch(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500"/> 
                                Show Advanced Search
                            </label>
                        </div>

                        {/* Table Height */}
                        <div>
                            <div className="font-semibold text-xs text-slate-700 mb-2">Table Height</div>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 text-xs cursor-pointer select-none text-slate-700">
                                    <input type="radio" checked={tableHeight === 'Flexible'} onChange={() => setTableHeight('Flexible')} name="height" className="text-indigo-600 focus:ring-indigo-500"/> 
                                    Flexible
                                </label>
                                <label className="flex items-center gap-2 text-xs cursor-pointer select-none text-slate-700">
                                    <input type="radio" checked={tableHeight === 'Fixed'} onChange={() => setTableHeight('Fixed')} name="height" className="text-indigo-600 focus:ring-indigo-500"/> 
                                    Fixed
                                </label>
                            </div>
                        </div>

                        {/* Table Header Icons Placeholder */}
                        <div>
                            <div className="font-semibold text-xs text-slate-700 mb-2">Table Header Icons</div>
                            <div className="flex gap-1">
                                <div className="p-1 border border-slate-300 rounded-sm bg-slate-50"><RotateCcw className="w-3 h-3 text-slate-400"/></div>
                                <div className="p-1 border border-slate-300 rounded-sm bg-slate-50"><div className="w-3 h-3 bg-slate-300 rounded-full"></div></div>
                                <div className="p-1 border border-slate-300 rounded-sm bg-slate-50"><div className="w-3 h-3 bg-slate-300"></div></div>
                                <div className="p-1 border border-slate-300 rounded-sm bg-slate-50"><div className="w-3 h-3 bg-slate-300 transform rotate-45"></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Column Settings Section */}
            <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    Column Settings <InfoIconSmall />
                </h4>
                
                <div className="border border-slate-200 rounded-sm overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-2 w-1/2">Columns <InfoIconSmall /></th>
                                <th className="px-4 py-2 w-1/4">Column Width <InfoIconSmall /></th>
                                <th className="px-4 py-2 w-1/4">Column Ordering <InfoIconSmall /></th>
                            </tr>
                        </thead>
                    </table>
                    <div className="max-h-[300px] overflow-y-auto">
                        <table className="w-full text-left text-xs">
                            <tbody className="divide-y divide-slate-100">
                                {localColumns.map((col) => (
                                    <tr key={col.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-2 w-1/2">
                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                <input 
                                                    type="checkbox" 
                                                    checked={col.isVisible} 
                                                    onChange={() => handleToggleColumn(col.id)}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                                />
                                                <span className={col.isVisible ? 'text-slate-800 font-medium' : 'text-slate-400'}>{col.title}</span>
                                                <span className="text-slate-400 cursor-pointer hover:text-indigo-600">✎</span>
                                            </label>
                                        </td>
                                        <td className="px-4 py-2 w-1/4">
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="number" 
                                                    value={col.width} 
                                                    onChange={(e) => handleWidthChange(col.id, parseInt(e.target.value))}
                                                    className="w-16 border border-slate-300 rounded-sm px-1 py-0.5 text-center outline-none focus:border-indigo-500" 
                                                />
                                                <div className="bg-slate-200 px-3 py-0.5 rounded-sm text-slate-600 font-mono text-[10px] min-w-[30px] text-center">{col.width}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 w-1/4">
                                            <div className="flex items-center justify-between pr-4">
                                                <input 
                                                    type="number" 
                                                    value={col.order} 
                                                    onChange={(e) => handleOrderChange(col.id, parseInt(e.target.value))}
                                                    className="w-12 border border-slate-300 rounded-sm px-1 py-0.5 text-center outline-none focus:border-indigo-500" 
                                                />
                                                <span className="font-bold text-slate-800">{col.order}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3">
             <button onClick={handleApply} className="px-4 py-1.5 bg-slate-800 text-white rounded-sm hover:bg-indigo-600 transition-colors text-sm font-medium shadow-sm">Apply</button>
             <button onClick={onClose} className="px-4 py-1.5 border border-slate-300 bg-white text-slate-700 rounded-sm hover:bg-slate-50 transition-colors text-sm font-medium">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default SmartTableSettings;
