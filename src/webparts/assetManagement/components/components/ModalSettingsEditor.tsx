
import React, { useState, useEffect } from 'react';
import { Config, ModalConfig, ModalLayout, SectionDefinition, TabDefinition } from '../types';
import { Plus, X, ArrowUp, ArrowDown, Trash2, GripVertical, Check, LayoutGrid, Columns } from 'lucide-react';

interface ModalSettingsEditorProps {
    config: Config;
    onUpdateConfig: (newConfig: Config) => void;
}

type ModalContextKey = keyof ModalConfig;

const CONTEXT_OPTIONS: { key: ModalContextKey; label: string }[] = [
    { key: 'licenseFamily', label: 'License Profile (Family)' },
    { key: 'hardwareFamily', label: 'Hardware Product (Family)' },
    { key: 'licenseInstance', label: 'License Asset (Instance)' },
    { key: 'hardwareInstance', label: 'Hardware Asset (Instance)' },
    { key: 'userProfile', label: 'User Profile' },
];

const AVAILABLE_FIELDS: Record<ModalContextKey, string[]> = {
    licenseFamily: ['name', 'productCode', 'vendor', 'category', 'description', 'variants', 'assignmentModel'],
    hardwareFamily: ['name', 'productCode', 'modelNumber', 'manufacturer', 'category', 'description', 'assignmentModel'],
    licenseInstance: ['title', 'assetId', 'status', 'variantType', 'licenseKey', 'email', 'assignedUsers', 'assignedUser', 'activeUsers', 'purchaseDate', 'renewalDate', 'complianceStatus', 'cost', 'currencyTool', 'assignmentHistory'],
    hardwareInstance: ['title', 'assetId', 'status', 'serialNumber', 'macAddress', 'location', 'condition', 'assignedUser', 'assignedUsers', 'activeUsers', 'purchaseDate', 'warrantyExpiryDate', 'cost', 'currencyTool', 'assignmentHistory'],
    userProfile: ['firstName', 'lastName', 'suffix', 'jobTitle', 'department', 'site', 'typeOfContact', 'linkedin', 'twitter', 'facebook', 'instagram', 'businessPhone', 'mobileNo', 'email', 'nonPersonalEmail', 'homePhone', 'skype', 'address', 'city', 'notes', 'avatarUpload']
};

const ModalSettingsEditor: React.FC<ModalSettingsEditorProps> = ({ config, onUpdateConfig }) => {
    const [selectedContext, setSelectedContext] = useState<ModalContextKey>('licenseFamily');
    const [currentLayout, setCurrentLayout] = useState<ModalLayout>(config.modalLayouts?.[selectedContext] || { tabs: [] });
    const [activeTabId, setActiveTabId] = useState<string | null>(null);

    // Sync state when config/context changes
    useEffect(() => {
        if (config.modalLayouts && config.modalLayouts[selectedContext]) {
            setCurrentLayout(JSON.parse(JSON.stringify(config.modalLayouts[selectedContext])));
            // Set first tab as active if none active
            if (!activeTabId && config.modalLayouts[selectedContext].tabs.length > 0) {
                setActiveTabId(config.modalLayouts[selectedContext].tabs[0].id);
            } else if (activeTabId && !config.modalLayouts[selectedContext].tabs.find(t => t.id === activeTabId)) {
                // If active tab no longer exists
                setActiveTabId(config.modalLayouts[selectedContext].tabs[0]?.id || null);
            }
        }
    }, [selectedContext, config.modalLayouts]);

    const handleSave = () => {
        const newModalLayouts = { ...config.modalLayouts, [selectedContext]: currentLayout };
        onUpdateConfig({ ...config, modalLayouts: newModalLayouts });
        alert('Modal layout saved successfully!');
    };

    // --- Tab Actions ---
    const addTab = () => {
        const newTabId = `tab-${Date.now()}`;
        const newTab: TabDefinition = { id: newTabId, label: 'New Tab', sections: [] };
        setCurrentLayout(prev => ({ ...prev, tabs: [...prev.tabs, newTab] }));
        setActiveTabId(newTabId);
    };

    const removeTab = (tabId: string) => {
        if (confirm('Delete this tab?')) {
            setCurrentLayout(prev => ({ ...prev, tabs: prev.tabs.filter(t => t.id !== tabId) }));
            if (activeTabId === tabId) setActiveTabId(null);
        }
    };

    const updateTabLabel = (tabId: string, newLabel: string) => {
        setCurrentLayout(prev => ({ ...prev, tabs: prev.tabs.map(t => t.id === tabId ? { ...t, label: newLabel } : t) }));
    };

    // --- Section Actions ---
    const addSection = (tabId: string) => {
        const newSection: SectionDefinition = {
            id: `sec-${Date.now()}`,
            title: 'New Section',
            columns: 1,
            fields: []
        };
        setCurrentLayout(prev => ({
            ...prev,
            tabs: prev.tabs.map(t => t.id === tabId ? { ...t, sections: [...t.sections, newSection] } : t)
        }));
    };

    const removeSection = (tabId: string, sectionId: string) => {
        setCurrentLayout(prev => ({
            ...prev,
            tabs: prev.tabs.map(t => t.id === tabId ? { ...t, sections: t.sections.filter(s => s.id !== sectionId) } : t)
        }));
    };

    const updateSection = (tabId: string, sectionId: string, updates: Partial<SectionDefinition>) => {
        setCurrentLayout(prev => ({
            ...prev,
            tabs: prev.tabs.map(t => t.id === tabId ? {
                ...t,
                sections: t.sections.map(s => s.id === sectionId ? { ...s, ...updates } : s)
            } : t)
        }));
    };

    const moveSection = (tabId: string, sectionIndex: number, direction: 'up' | 'down') => {
        setCurrentLayout(prev => ({
            ...prev,
            tabs: prev.tabs.map(t => {
                if (t.id === tabId) {
                    const sections = [...t.sections];
                    const targetIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
                    if (targetIndex >= 0 && targetIndex < sections.length) {
                        [sections[sectionIndex], sections[targetIndex]] = [sections[targetIndex], sections[sectionIndex]];
                    }
                    return { ...t, sections };
                }
                return t;
            })
        }));
    };

    // --- Field Actions & Drag Drop ---
    const [draggedField, setDraggedField] = useState<string | null>(null);
    const [dragSourceSection, setDragSourceSection] = useState<string | null>(null); // null means 'available' list

    const handleDragStart = (e: React.DragEvent, field: string, sourceSectionId: string | null) => {
        setDraggedField(field);
        setDragSourceSection(sourceSectionId);
        e.dataTransfer.effectAllowed = 'move';
        // Hack to allow drag image to appear
        const el = e.target as HTMLElement;
        el.style.opacity = '0.5';
    };

    const handleDragEnd = (e: React.DragEvent) => {
        const el = e.target as HTMLElement;
        el.style.opacity = '1';
        setDraggedField(null);
        setDragSourceSection(null);
    };

    const handleDrop = (e: React.DragEvent, targetSectionId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggedField || !activeTabId) return;

        // Remove from source if it was in a section
        let newLayout = { ...currentLayout };
        
        if (dragSourceSection) {
            newLayout.tabs = newLayout.tabs.map(t => ({
                ...t,
                sections: t.sections.map(s => s.id === dragSourceSection ? { ...s, fields: s.fields.filter(f => f !== draggedField) } : s)
            }));
        } else {
            // It was from available fields, ensure it's not anywhere else (shouldn't be, but safe check)
             newLayout.tabs = newLayout.tabs.map(t => ({
                ...t,
                sections: t.sections.map(s => ({ ...s, fields: s.fields.filter(f => f !== draggedField) }))
            }));
        }

        // Add to target section
        newLayout.tabs = newLayout.tabs.map(t => {
            if (t.id === activeTabId) {
                return {
                    ...t,
                    sections: t.sections.map(s => {
                        if (s.id === targetSectionId) {
                            // Don't add duplicate if somehow logic failed
                            if (!s.fields.includes(draggedField)) {
                                return { ...s, fields: [...s.fields, draggedField] };
                            }
                        }
                        return s;
                    })
                };
            }
            return t;
        });

        setCurrentLayout(newLayout);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const removeField = (tabId: string, sectionId: string, field: string) => {
        setCurrentLayout(prev => ({
            ...prev,
            tabs: prev.tabs.map(t => t.id === tabId ? {
                ...t,
                sections: t.sections.map(s => s.id === sectionId ? { ...s, fields: s.fields.filter(f => f !== field) } : s)
            } : t)
        }));
    };

    // Derived State
    const currentTab = currentLayout.tabs.find(t => t.id === activeTabId);
    const assignedFields = new Set(currentLayout.tabs.flatMap(t => t.sections.flatMap(s => s.fields)));
    const availableFields = AVAILABLE_FIELDS[selectedContext].filter(f => !assignedFields.has(f));

    return (
        <div className="h-full flex flex-col bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <label className="text-sm font-bold text-slate-700">Select Modal Context:</label>
                    <select 
                        value={selectedContext} 
                        onChange={(e) => setSelectedContext(e.target.value as ModalContextKey)}
                        className="text-sm border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        {CONTEXT_OPTIONS.map(opt => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
                    </select>
                </div>
                <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700 shadow-sm">
                    <Check size={16} /> Save Layout
                </button>
            </div>

            <div className="flex-grow flex overflow-hidden">
                {/* Available Fields Sidebar */}
                <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Available Fields</h4>
                    </div>
                    <div className="overflow-y-auto p-2 space-y-2 flex-grow">
                        {availableFields.map(field => (
                            <div 
                                key={field} 
                                draggable
                                onDragStart={(e) => handleDragStart(e, field, null)}
                                onDragEnd={handleDragEnd}
                                className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded shadow-sm cursor-grab hover:border-indigo-400 active:cursor-grabbing"
                            >
                                <GripVertical size={14} className="text-slate-400"/>
                                <span className="text-sm text-slate-700 font-mono truncate">{field}</span>
                            </div>
                        ))}
                        {availableFields.length === 0 && <p className="text-center text-xs text-slate-400 mt-4">All fields assigned</p>}
                    </div>
                </div>

                {/* Main Preview / Editor Area */}
                <div className="flex-grow flex flex-col bg-slate-100 overflow-hidden">
                    {/* Tabs Navigation */}
                    <div className="p-4 border-b border-slate-200 bg-white flex gap-2 items-center overflow-x-auto">
                        {currentLayout.tabs.map(tab => (
                            <div key={tab.id} className={`flex items-center group px-3 py-2 rounded-t-md border-b-2 transition-colors cursor-pointer ${activeTabId === tab.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-transparent hover:bg-slate-50'}`} onClick={() => setActiveTabId(tab.id)}>
                                <input 
                                    value={tab.label}
                                    onChange={(e) => updateTabLabel(tab.id, e.target.value)}
                                    className="bg-transparent border-none p-0 text-sm font-medium focus:ring-0 w-24 cursor-pointer"
                                />
                                <button onClick={(e) => { e.stopPropagation(); removeTab(tab.id); }} className="ml-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><X size={12}/></button>
                            </div>
                        ))}
                        <button onClick={addTab} className="p-1 rounded-full hover:bg-slate-200 text-slate-500"><Plus size={16}/></button>
                    </div>

                    {/* Active Tab Content (Sections) */}
                    <div className="flex-grow overflow-y-auto p-8">
                        {currentTab ? (
                            <div className="space-y-6 max-w-4xl mx-auto">
                                {currentTab.sections.map((section, index) => (
                                    <div 
                                        key={section.id} 
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, section.id)}
                                        className={`bg-white rounded-lg border-2 ${draggedField ? 'border-dashed border-indigo-300' : 'border-slate-200'} p-4 transition-colors`}
                                    >
                                        {/* Section Header */}
                                        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                                            <div className="flex items-center gap-2">
                                                <LayoutGrid size={16} className="text-indigo-600"/>
                                                <input 
                                                    value={section.title}
                                                    onChange={(e) => updateSection(currentTab.id, section.id, { title: e.target.value })}
                                                    className="text-sm font-semibold text-slate-800 border-none focus:ring-0 p-0 placeholder:text-slate-400"
                                                    placeholder="Section Title"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center bg-slate-100 rounded p-1">
                                                    <Columns size={14} className="text-slate-500 mr-1"/>
                                                    <select 
                                                        value={section.columns} 
                                                        onChange={(e) => updateSection(currentTab.id, section.id, { columns: parseInt(e.target.value) })}
                                                        className="text-xs bg-transparent border-none p-0 pr-4 focus:ring-0 text-slate-700 cursor-pointer"
                                                    >
                                                        <option value={1}>1 Col</option>
                                                        <option value={2}>2 Cols</option>
                                                        <option value={3}>3 Cols</option>
                                                        <option value={4}>4 Cols</option>
                                                    </select>
                                                </div>
                                                <div className="flex items-center">
                                                    <button onClick={() => moveSection(currentTab.id, index, 'up')} disabled={index === 0} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"><ArrowUp size={14}/></button>
                                                    <button onClick={() => moveSection(currentTab.id, index, 'down')} disabled={index === currentTab.sections.length - 1} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30"><ArrowDown size={14}/></button>
                                                </div>
                                                <button onClick={() => removeSection(currentTab.id, section.id)} className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                                            </div>
                                        </div>

                                        {/* Grid Content */}
                                        <div className={`grid gap-4 min-h-[50px] ${section.fields.length === 0 ? 'bg-slate-50 rounded border-2 border-dashed border-slate-200 flex items-center justify-center' : ''}`} style={{ gridTemplateColumns: `repeat(${section.columns}, minmax(0, 1fr))` }}>
                                            {section.fields.map(field => (
                                                <div 
                                                    key={field} 
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, field, section.id)}
                                                    onDragEnd={handleDragEnd}
                                                    className="flex justify-between items-center p-2 bg-slate-50 border border-slate-200 rounded group cursor-grab active:cursor-grabbing hover:border-indigo-300"
                                                >
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <GripVertical size={14} className="text-slate-400 flex-shrink-0"/>
                                                        <span className="text-xs font-medium text-slate-700 font-mono truncate">{field}</span>
                                                    </div>
                                                    <button onClick={() => removeField(currentTab.id, section.id, field)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><X size={12}/></button>
                                                </div>
                                            ))}
                                            {section.fields.length === 0 && <span className="text-xs text-slate-400">Drop fields here</span>}
                                        </div>
                                    </div>
                                ))}
                                
                                <button onClick={() => addSection(currentTab.id)} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                                    <Plus size={16}/> Add Section
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">Select or add a tab to edit layout</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalSettingsEditor;
