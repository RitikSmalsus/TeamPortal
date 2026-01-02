
import React, { useState, useEffect } from 'react';
import { X, Globe, User, Mail, Phone, FileText } from 'lucide-react';
import { Vendor } from '../types';

interface VendorFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (vendor: Partial<Vendor>) => void;
    vendor?: Vendor | null;
}

const VendorFormModal: React.FC<VendorFormModalProps> = ({ isOpen, onClose, onSave, vendor }) => {
    const [formData, setFormData] = useState<Partial<Vendor>>({
        name: '',
        website: '',
        contactName: '',
        email: '',
        phone: '',
        notes: ''
    });

    useEffect(() => {
        if (vendor) {
            setFormData(vendor);
        } else {
            setFormData({
                name: '',
                website: '',
                contactName: '',
                email: '',
                phone: '',
                notes: ''
            });
        }
    }, [vendor, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1070 }} onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="modal-content border-0 shadow-lg">
                    <div className="modal-header border-bottom-0 bg-white p-4 pb-0">
                        <h5 className="modal-title fw-bold text-dark">{vendor ? 'Edit Vendor' : 'Add New Vendor'}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-4">
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-secondary text-uppercase">Vendor Name <span className="text-danger">*</span></label>
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-light border-light-subtle font-monospace"><FileText size={14} /></span>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                    placeholder="e.g. Microsoft, Dell"
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label small fw-bold text-secondary text-uppercase">Website URL</label>
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-light border-light-subtle font-monospace"><Globe size={14} /></span>
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="https://example.com"
                                />
                            </div>
                        </div>

                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-secondary text-uppercase">Contact Name</label>
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text bg-light border-light-subtle font-monospace"><User size={14} /></span>
                                    <input
                                        type="text"
                                        name="contactName"
                                        value={formData.contactName}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="Account Manager Name"
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-secondary text-uppercase">Email</label>
                                <div className="input-group input-group-sm">
                                    <span className="input-group-text bg-light border-light-subtle font-monospace"><Mail size={14} /></span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="vendor@example.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label small fw-bold text-secondary text-uppercase">Phone</label>
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-light border-light-subtle font-monospace"><Phone size={14} /></span>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>

                        <div className="mb-0">
                            <label className="form-label small fw-bold text-secondary text-uppercase">Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes || ''}
                                onChange={handleChange}
                                className="form-control form-control-sm"
                                rows={2}
                                placeholder="Additional details..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="modal-footer border-top-0 bg-white p-4 pt-0">
                        <button type="button" onClick={onClose} className="btn btn-light fw-bold px-4">Cancel</button>
                        <button type="submit" className="btn btn-primary fw-bold px-4">
                            {vendor ? 'Update Vendor' : 'Save Vendor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VendorFormModal;
