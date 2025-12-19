
import React, { useState, useMemo } from 'react';
import { User, Asset, AccountStatus, Platform, AssetFamily, AssetType } from '../types';
import { 
  CheckCircle, Edit, Phone, Mail, MapPin, Building, 
  User as UserIcon, Linkedin, Twitter, Facebook, Instagram, 
  Plus, Briefcase, Edit2, Globe, Hash, Info, Clock, 
  ShieldCheck, Smartphone, Laptop
} from 'lucide-react';

type RequestCategory = 'Microsoft' | 'External' | 'Hardware';

interface UserProfileProps {
  user: User;
  userAssets: Asset[];
  assetFamilies: AssetFamily[];
  onEditProfile: () => void;
  onNewRequest: (category: RequestCategory) => void;
  onQuickRequest: (assetId: string) => void;
}

const InfoItem: React.FC<{ icon: React.ElementType, label: string, value: string | React.ReactNode, fullWidth?: boolean }> = ({ icon: Icon, label, value, fullWidth = false }) => (
  <div className={`col-12 ${fullWidth ? 'col-md-12' : 'col-md-6 col-lg-4'} p-3`}>
    <div className="d-flex gap-3 align-items-start">
        <div className="bg-light rounded-3 p-2 text-primary shadow-sm" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifySelf: 'center' }}>
          <Icon size={20} />
        </div>
        <div className="text-truncate flex-grow-1">
          <p className="text-uppercase text-secondary small fw-bold mb-1" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>{label}</p>
          <p className="small fw-bold text-dark mb-0 text-truncate" style={{ fontSize: '0.9rem' }}>{value || <span className="text-muted fw-normal fst-italic">Not provided</span>}</p>
        </div>
    </div>
  </div>
);

const PlatformAccountsTab: React.FC<{ user: User }> = ({ user }) => {
    const platformAccounts = user.platformAccounts || [];
    const getPlatformIcon = (platform: Platform) => {
        switch(platform) {
            case Platform.SHAREPOINT: return <Briefcase size={18} className="text-primary" />;
            case Platform.GMAIL: return <Mail size={18} className="text-danger" />;
            case Platform.DOGADO: return <Mail size={18} className="text-warning" />;
            default: return <Briefcase size={18} className="text-secondary" />;
        }
    }
    return (
        <div className="card border-0">
             <div className="card-header bg-white d-flex align-items-center justify-content-between py-3 border-0">
                <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <ShieldCheck size={20} className="text-secondary"/> Platform Accounts
                </h6>
                <button className="btn btn-sm btn-primary fw-bold shadow-sm"> <Plus size={14} /> Link Account </button>
            </div>
            <div className="table-responsive rounded border mx-3 mb-3">
                <table className="table table-hover table-sm mb-0 align-middle">
                    <thead className="table-light"><tr className="small text-secondary"><th className="ps-3">Platform</th><th>Email</th><th>Type</th><th>Status</th><th className="text-end pe-3">Actions</th></tr></thead>
                    <tbody>
                        {platformAccounts.map(account => (
                            <tr key={account.id}>
                                <td className="ps-3 py-2"><div className="d-flex align-items-center gap-2">{getPlatformIcon(account.platform)}<span className="small fw-bold">{account.platform}</span></div></td>
                                <td className="small">{account.email}</td>
                                <td className="small">{account.accountType}</td>
                                <td><span className={`badge ${account.status === AccountStatus.ACTIVE ? 'text-bg-success' : 'text-bg-danger'}`}>{account.status}</span></td>
                                <td className="text-end pe-3"><div className="d-flex gap-1 justify-content-end"><button className="btn btn-sm btn-light p-1 text-secondary"><Edit2 size={14} /></button></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {platformAccounts.length === 0 && <div className="text-center py-5 text-secondary small fst-italic">No accounts linked</div>}
            </div>
        </div>
    );
};

const AssignedAssetsTab: React.FC<{ assets: Asset[]; families: AssetFamily[]; onNewRequest: (category: RequestCategory) => void;}> = ({ assets, families, onNewRequest }) => {
    const licenses = useMemo(() => assets.filter(a => a.assetType === AssetType.LICENSE), [assets]);
    const hardware = useMemo(() => assets.filter(a => a.assetType === AssetType.HARDWARE), [assets]);

    return (
        <div className="row g-4">
            <div className="col-12">
                 <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-0">
                        <h6 className="fw-bold mb-0 d-flex align-items-center gap-2"><Laptop size={20} className="text-info"/> Assigned Licenses</h6>
                        <button onClick={() => onNewRequest('External')} className="btn btn-sm btn-info text-white fw-bold"> <Plus size={14} /> Request </button>
                    </div>
                    <div className="table-responsive rounded border mx-3 mb-3">
                        <table className="table table-sm mb-0 align-middle">
                            <thead className="table-light small"><tr><th className="ps-3">Software</th><th>Asset ID</th><th>Email</th><th>Renewal</th></tr></thead>
                            <tbody className="small">
                                {licenses.map(asset => (
                                    <tr key={asset.id}>
                                        <td className="ps-3 fw-bold">{families.find(f => f.id === asset.familyId)?.name || '-'}</td>
                                        <td className="font-monospace text-secondary">{asset.assetId}</td>
                                        <td>{asset.email || '-'}</td>
                                        <td className="text-secondary">{asset.renewalDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {licenses.length === 0 && <div className="text-center py-4 text-secondary small fst-italic">No active licenses</div>}
                    </div>
                </div>
            </div>
            
             <div className="col-12">
                 <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-0">
                        <h6 className="fw-bold mb-0 d-flex align-items-center gap-2"><Smartphone size={20} className="text-warning"/> Assigned Hardware</h6>
                        <button onClick={() => onNewRequest('Hardware')} className="btn btn-sm btn-warning text-white fw-bold"> <Plus size={14} /> Request </button>
                    </div>
                    <div className="table-responsive rounded border mx-3 mb-3">
                        <table className="table table-sm mb-0 align-middle">
                            <thead className="table-light small"><tr><th className="ps-3">Item</th><th>Asset ID</th><th>Serial No</th><th>Warranty</th></tr></thead>
                            <tbody className="small">
                                {hardware.map(asset => (
                                    <tr key={asset.id}>
                                        <td className="ps-3 fw-bold">{families.find(f => f.id === asset.familyId)?.name || '-'}</td>
                                        <td className="font-monospace text-secondary">{asset.assetId}</td>
                                        <td>{asset.serialNumber}</td>
                                        <td className="text-secondary">{asset.warrantyExpiryDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {hardware.length === 0 && <div className="text-center py-4 text-secondary small fst-italic">No hardware assets</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const UserProfile: React.FC<UserProfileProps> = ({ user, userAssets, assetFamilies, onEditProfile, onNewRequest, onQuickRequest }) => {
  const [activeTab, setActiveTab] = useState('general');
  if (!user) return <div className="alert alert-warning text-center m-5">Profile not found.</div>;

  return (
    <div className="card shadow-sm border-0 overflow-hidden">
      {/* Full Restored Profile Header */}
      <div className="card-header bg-white border-0 p-4 pb-0">
        <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-4 mb-4">
            <div className="position-relative">
                 <img 
                   src={user.avatarUrl || 'https://i.pravatar.cc/150'} 
                   alt={user.fullName} 
                   className="rounded-circle border border-4 border-white shadow-sm object-fit-cover" 
                   style={{width: '120px', height: '120px'}}
                 />
                 {user.isVerified && (
                   <div className="position-absolute bottom-0 end-0 bg-primary rounded-circle border border-white p-1 shadow-sm" style={{width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                     <CheckCircle size={18} className="text-white" />
                   </div>
                 )}
            </div>
          
          <div className="flex-grow-1 text-center text-md-start">
            <div className="d-flex flex-column flex-md-row align-items-center gap-2 mb-1">
              <h3 className="fw-bold text-dark mb-0">{user.fullName}{user.suffix ? `, ${user.suffix}` : ''}</h3>
              <span className={`badge rounded-pill ${user.role === 'admin' ? 'bg-primary-subtle text-primary border border-primary-subtle' : 'bg-secondary-subtle text-secondary border border-secondary-subtle'}`}>
                {user.role?.toUpperCase()}
              </span>
            </div>
            <p className="text-primary mb-3 fw-semibold">{user.jobTitle || 'Staff Member'}</p>
            
            <div className="row g-3 justify-content-center justify-content-md-start">
                <div className="col-auto">
                  <div className="d-flex align-items-center gap-1 small">
                    <Building size={14} className="text-secondary" />
                    <span className="text-secondary">Org:</span>
                    <span className="text-dark fw-bold">{user.organization || '-'}</span>
                  </div>
                </div>
                <div className="col-auto">
                  <div className="d-flex align-items-center gap-1 small border-start ps-3">
                    <Briefcase size={14} className="text-secondary" />
                    <span className="text-secondary">Dept:</span>
                    <span className="text-dark fw-bold">{user.department || '-'}</span>
                  </div>
                </div>
                <div className="col-auto">
                  <div className="d-flex align-items-center gap-1 small border-start ps-3">
                    <Clock size={14} className="text-secondary" />
                    <span className="text-secondary">Joined:</span>
                    <span className="text-dark fw-bold">{user.dateOfJoining || '-'}</span>
                  </div>
                </div>
                <div className="col-auto">
                  <div className="d-flex align-items-center gap-1 small border-start ps-3">
                    <Hash size={14} className="text-secondary" />
                    <span className="text-secondary">Staff ID:</span>
                    <span className="text-dark fw-bold">{user.id || '-'}</span>
                  </div>
                </div>
            </div>
          </div>
          
          <div className="ms-md-auto">
            <button onClick={onEditProfile} className="btn btn-primary fw-bold px-4 py-2 d-flex align-items-center gap-2 shadow-sm">
              <Edit size={16} /> Edit Profile
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <ul className="nav nav-underline small fw-bold text-uppercase gap-4 border-top pt-2">
          <li className="nav-item">
            <button 
              onClick={() => setActiveTab('general')} 
              className={`nav-link py-3 px-0 border-3 ${activeTab === 'general' ? 'active' : 'text-secondary'}`}
            >
              General Information
            </button>
          </li>
          <li className="nav-item">
            <button 
              onClick={() => setActiveTab('assets')} 
              className={`nav-link py-3 px-0 border-3 ${activeTab === 'assets' ? 'active' : 'text-secondary'}`}
            >
              Assigned Assets ({userAssets.length})
            </button>
          </li>
          <li className="nav-item">
            <button 
              onClick={() => setActiveTab('accounts')} 
              className={`nav-link py-3 px-0 border-3 ${activeTab === 'accounts' ? 'active' : 'text-secondary'}`}
            >
              Platform Accounts
            </button>
          </li>
          <li className="nav-item">
            <button 
              onClick={() => setActiveTab('history')} 
              className={`nav-link py-3 px-0 border-3 ${activeTab === 'history' ? 'active' : 'text-secondary'}`}
            >
              History
            </button>
          </li>
        </ul>
      </div>

      <div className="card-body p-4 bg-light-subtle">
        {activeTab === 'general' && (
            <div className="d-flex flex-column gap-4">
                {/* Contact Information Section */}
                <div className="card border-0 shadow-sm overflow-hidden">
                    <div className="card-header bg-white border-bottom py-3">
                      <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                        <Phone size={18} className="text-primary" /> Contact Information
                      </h6>
                    </div>
                    <div className="card-body p-2">
                        <div className="row g-0">
                            <InfoItem icon={Briefcase} label="Business Phone" value={user.businessPhone} />
                            <InfoItem icon={Smartphone} label="Mobile No" value={user.mobileNo} />
                            <InfoItem icon={Phone} label="Home Phone" value={user.homePhone} />
                            <InfoItem icon={Mail} label="Official Email" value={user.email} />
                            <InfoItem icon={Mail} label="Non-Personal Email" value={user.nonPersonalEmail} />
                            <InfoItem icon={Globe} label="Skype ID" value={user.skype} />
                        </div>
                    </div>
                </div>

                {/* Address Information Section */}
                <div className="card border-0 shadow-sm overflow-hidden">
                    <div className="card-header bg-white border-bottom py-3">
                      <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                        <MapPin size={18} className="text-primary" /> Address Information
                      </h6>
                    </div>
                    <div className="card-body p-2">
                        <div className="row g-0">
                            <InfoItem icon={MapPin} label="Office Address" value={user.address} fullWidth />
                            <InfoItem icon={Building} label="City" value={user.city} />
                            <InfoItem icon={Globe} label="Zip / Postal Code" value={user.postalCode} />
                            <InfoItem icon={Globe} label="Country" value={user.country || 'Not specified'} />
                        </div>
                    </div>
                </div>

                {/* Social Media Section */}
                <div className="card border-0 shadow-sm overflow-hidden">
                    <div className="card-header bg-white border-bottom py-3">
                      <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                        <Globe size={18} className="text-primary" /> Social Media & Web
                      </h6>
                    </div>
                    <div className="card-body p-2">
                        <div className="row g-0">
                            <InfoItem icon={Linkedin} label="LinkedIn" value={user.linkedin ? <a href={`https://linkedin.com/in/${user.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none">linkedin.com/in/{user.linkedin}</a> : null} />
                            <InfoItem icon={Twitter} label="Twitter / X" value={user.twitter} />
                            <InfoItem icon={Facebook} label="Facebook" value={user.facebook} />
                            <InfoItem icon={Instagram} label="Instagram" value={user.instagram} />
                            <InfoItem icon={Globe} label="Web Page" value={user.webPage} />
                        </div>
                    </div>
                </div>

                {/* Additional Information Section */}
                <div className="card border-0 shadow-sm overflow-hidden">
                    <div className="card-header bg-white border-bottom py-3">
                      <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                        <Info size={18} className="text-primary" /> Additional Information
                      </h6>
                    </div>
                    <div className="card-body p-2">
                        <div className="row g-0">
                            <InfoItem icon={Building} label="Organization" value={user.organization} />
                            <InfoItem icon={UserIcon} label="User Type" value={user.userType} />
                            <InfoItem icon={CheckCircle} label="Account Status" value={user.userStatus} />
                            <InfoItem icon={Hash} label="Extension" value={user.extension} />
                            <InfoItem icon={Globe} label="Professional Notes" value={user.notes} fullWidth />
                        </div>
                    </div>
                </div>
            </div>
        )}
        
        {activeTab === 'assets' && <AssignedAssetsTab assets={userAssets} families={assetFamilies} onNewRequest={onNewRequest} />}
        {activeTab === 'accounts' && <PlatformAccountsTab user={user} />}
        
        {activeTab === 'history' && (
            <div className="card border-0 shadow-sm overflow-hidden">
                <div className="card-header bg-white border-bottom py-3">
                  <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                    <Clock size={18} className="text-primary" /> Activity History
                  </h6>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover table-sm mb-0 align-middle">
                        <thead className="table-light small text-secondary"><tr><th className="ps-3 py-3">Date</th><th>Action Type</th><th>Item Name</th><th>Asset ID</th></tr></thead>
                        <tbody className="small">
                            {user.history?.map(item => (
                                <tr key={item.id}>
                                    <td className="ps-3 py-3 text-secondary">{item.date}</td>
                                    <td><span className={`badge ${item.type === 'Assigned' ? 'text-bg-success' : 'text-bg-danger'}`}>{item.type}</span></td>
                                    <td className="fw-bold">{item.assetName}</td>
                                    <td className="font-monospace text-secondary">{item.assetId}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {(!user.history || user.history.length === 0) && <div className="text-center py-5 text-secondary small fst-italic">No activity recorded</div>}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
