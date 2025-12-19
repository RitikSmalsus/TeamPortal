
import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { User, Config } from '../types';
import ImageUploadTab from './ImageUploadTab';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  user: User | null;
  config: Config;
}

const FormInput: React.FC<{ label: string; name: string; value?: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string }> = ({ label, name, value, onChange, placeholder }) => (
    <div className="mb-3">
        <label htmlFor={name} className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '11px' }}>{label}</label>
        <input 
          type="text" 
          id={name} 
          name={name} 
          value={value || ''} 
          onChange={onChange} 
          placeholder={placeholder}
          className="form-control form-control-sm" />
    </div>
);

const FormSelect: React.FC<{ label: string; name: string; value?: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode }> = ({ label, name, value, onChange, children }) => (
    <div className="mb-3">
        <label htmlFor={name} className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '11px' }}>{label}</label>
        <select 
          id={name} 
          name={name} 
          value={value || ''} 
          onChange={onChange} 
          className="form-select form-select-sm"
        >
            {children}
        </select>
    </div>
);

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, onSave, user, config }) => {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [activeTab, setActiveTab] = useState('');
  
  const layout = config.modalLayouts?.userProfile || { tabs: [] };

  useEffect(() => {
    if (user && isOpen) {
      setFormData(user);
      if (layout.tabs && layout.tabs.length > 0) {
          setActiveTab(layout.tabs[0].id);
      }
    }
  }, [user, isOpen, layout]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSiteChange = (site: string) => {
    const currentSites = formData.site || [];
    const newSites = currentSites.includes(site)
        ? currentSites.filter(s => s !== site)
        : [...currentSites, site];
    setFormData(prev => ({ ...prev, site: newSites }));
  };
  
  const handleAvatarChange = useCallback((newAvatarUrl: string | undefined) => {
    setFormData(prev => ({...prev, avatarUrl: newAvatarUrl}));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const finalData = {
        ...user,
        ...formData,
        fullName: `${formData.firstName || ''} ${formData.lastName || ''}`.trim(),
        modifiedDate: new Date().toLocaleDateString('en-GB'),
        modifiedBy: 'Admin',
    } as User;
    onSave(finalData);
  };

  const renderField = (fieldKey: string) => {
      switch(fieldKey) {
          case 'firstName': return <FormInput label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />;
          case 'lastName': return <FormInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />;
          case 'suffix': return <FormInput label="Suffix" name="suffix" value={formData.suffix} onChange={handleChange} />;
          case 'jobTitle': return <FormInput label="Job Title" name="jobTitle" value={formData.jobTitle} onChange={handleChange} />;
          case 'department': return <FormSelect label="Department" name="department" value={formData.department} onChange={handleChange}><option value="">Select Department</option>{config.departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}</FormSelect>;
          
          case 'site': return (
              <div className="col-12">
                  <label className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '11px' }}>Site</label>
                  <div className="d-flex flex-wrap align-items-center gap-4 mt-1">
                      {config.sites.map(site => (
                          <div key={site} className="form-check">
                              <input type="checkbox" id={`site-${site}`} checked={formData.site?.includes(site)} onChange={() => handleSiteChange(site)} className="form-check-input"/>
                              <label htmlFor={`site-${site}`} className="form-check-label small">{site}</label>
                          </div>
                      ))}
                  </div>
              </div>
          );
          
          case 'typeOfContact': return (
              <div>
                  <label className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '11px' }}>Type Of Contact</label>
                  <div className="d-flex flex-wrap gap-2 mt-1">
                      {formData.typeOfContact?.map(t => (
                          <span key={t} className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">{t}</span>
                      ))}
                  </div>
              </div>
          );

          case 'linkedin': return <FormInput label="LinkedIn" name="linkedin" value={formData.linkedin} onChange={handleChange} />;
          case 'twitter': return <FormInput label="Twitter" name="twitter" value={formData.twitter} onChange={handleChange} />;
          case 'facebook': return <FormInput label="Facebook" name="facebook" value={formData.facebook} onChange={handleChange} />;
          case 'instagram': return <FormInput label="Instagram" name="instagram" value={formData.instagram} onChange={handleChange} />;
          
          case 'businessPhone': return <FormInput label="Business Phone" name="businessPhone" value={formData.businessPhone} onChange={handleChange} />;
          case 'mobileNo': return <FormInput label="Mobile No." name="mobileNo" value={formData.mobileNo} onChange={handleChange} />;
          case 'email': return <FormInput label="Email" name="email" value={formData.email} onChange={handleChange} />;
          case 'nonPersonalEmail': return <FormInput label="Non-Personal Email" name="nonPersonalEmail" value={formData.nonPersonalEmail} onChange={handleChange} />;
          case 'homePhone': return <FormInput label="Home Phone" name="homePhone" value={formData.homePhone} onChange={handleChange} />;
          case 'skype': return <FormInput label="Skype" name="skype" value={formData.skype} onChange={handleChange} />;
          case 'address': return <div className="col-md-8"><FormInput label="Address" name="address" value={formData.address} onChange={handleChange} /></div>;
          case 'city': return <FormInput label="City" name="city" value={formData.city} onChange={handleChange} />;
          
          case 'notes': return <div className="col-12"><label className="form-label small fw-bold text-secondary text-uppercase" style={{ fontSize: '11px' }}>Comments</label><textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} rows={4} className="form-control" /></div>;
          
          case 'avatarUpload': return (
              <ImageUploadTab 
                  currentAvatar={formData.avatarUrl}
                  onAvatarChange={handleAvatarChange}
                  contactName={formData.fullName || ''}
              />
          );

          default: return null;
      }
  }

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="modal-dialog modal-xl modal-dialog-centered" onClick={e => e.stopPropagation()}>
        <div className="modal-content border-0 shadow-lg bg-light">
          {user && (
            <>
              <div className="modal-header border-bottom-0 bg-white p-4">
                <h5 className="modal-title fw-bold text-dark">Edit Contact - {user.fullName}</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
              </div>

              <div className="bg-white border-bottom px-4">
                <ul className="nav nav-tabs border-bottom-0 gap-3">
                  {layout.tabs?.map(tab => (
                    <li key={tab.id} className="nav-item">
                      <button 
                        type="button" 
                        onClick={() => setActiveTab(tab.id)} 
                        className={`nav-link border-0 border-bottom border-3 py-3 px-1 small fw-bold text-uppercase ${activeTab === tab.id ? 'active border-primary' : 'text-secondary'}`}
                      >
                        {tab.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                  {layout.tabs?.map(tab => {
                      if (tab.id !== activeTab) return null;
                      return (
                          <div key={tab.id} className="d-flex flex-column gap-4">
                              {tab.sections?.map(section => (
                                  <Section key={section.id} title={section.title}>
                                      <div className="row g-3">
                                          {section.fields?.map(fieldKey => (
                                              <React.Fragment key={fieldKey}>
                                                  <div className={`col-md-${12 / (section.columns || 1)}`}>
                                                    {renderField(fieldKey)}
                                                  </div>
                                              </React.Fragment>
                                          ))}
                                      </div>
                                  </Section>
                              ))}
                          </div>
                      );
                  })}
                </div>
                
                <div className="modal-footer border-top-0 bg-white p-4 justify-content-between">
                  <div className="small text-secondary" style={{ fontSize: '10px' }}>
                    <p className="mb-0">Created {user.createdDate} By {user.createdBy}</p>
                    <p className="mb-0">Last modified {user.modifiedDate} By {user.modifiedBy}</p>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <button type="button" className="btn btn-link btn-sm text-danger text-decoration-none fw-bold p-0">Delete this item</button>
                    <button type="button" onClick={onClose} className="btn btn-white border px-4 fw-bold">Cancel</button>
                    <button type="submit" className="btn btn-primary px-4 fw-bold shadow-sm">Save</button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="card border-0 shadow-sm p-4 bg-white">
        <h6 className="fw-bold text-dark border-bottom pb-3 mb-4">{title}</h6>
        {children}
    </div>
);

export default EditProfileModal;
