
import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';

interface ImageUploadTabProps {
  currentAvatar: string | undefined;
  onAvatarChange: (newUrl: string | undefined) => void;
  contactName: string;
}

const logoImages = [
    'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=2069&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1529612453803-b038531649c5?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1611162616805-6a406b2a1a1a?q=80&w=1974&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1548345680-f5475ea5df84?q=80&w=2073&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=1889&auto=format&fit=crop',
];

const coverImages = [
    'https://images.unsplash.com/photo-1549492423-400259a5e5a4?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1473187983305-f61531474237?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506259996624-9f2f5e7b3b9b?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1444044205806-38f376274260?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1533109721025-d1ae7de64092?q=80&w=1887&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1496902526517-c0f2cb8fdb6a?q=80&w=2070&auto=format&fit=crop',
];

const generalImages = [
    'https://images.unsplash.com/photo-1551887373-3c5bd21ffd05?q=80&w=1925&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1502920514358-906c5555a69e?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516048015710-7a3b4c86be43?q=80&w=1887&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509223103693-5e7836798094?q=80&w=2069&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1887&auto=format&fit=crop',
];

const NavButton: React.FC<{ active?: boolean; onClick: () => void; children: React.ReactNode; }> = ({ active, onClick, children }) => (
    <button
        type="button"
        onClick={onClick}
        className={`btn btn-sm w-100 text-start px-3 py-2 mb-1 border-0 rounded-2 ${
            active
                ? 'bg-primary-subtle text-primary fw-bold'
                : 'btn-light text-secondary'
        }`}
    >
        {children}
    </button>
);

const ImageUploadTab: React.FC<ImageUploadTabProps> = ({ currentAvatar, onAvatarChange, contactName }) => {
    const [imageCategory, setImageCategory] = useState('Logos');
    const [imageSourceTab, setImageSourceTab] = useState('existing');

    const activeGallery = useMemo(() => {
        switch (imageCategory) {
            case 'Logos': return logoImages;
            case 'Covers': return coverImages;
            case 'Images': return generalImages;
            default: return [];
        }
    }, [imageCategory]);

    return (
        <div className="row g-4">
            {/* Left Panel */}
            <div className="col-md-3">
                <div className="d-flex flex-column gap-1 mb-4">
                    <NavButton onClick={() => setImageCategory('Logos')} active={imageCategory === 'Logos'}>Logos</NavButton>
                    <NavButton onClick={() => setImageCategory('Covers')} active={imageCategory === 'Covers'}>Covers</NavButton>
                    <NavButton onClick={() => setImageCategory('Images')} active={imageCategory === 'Images'}>Images</NavButton>
                </div>
                {currentAvatar && (
                    <div className="card p-2 border-0 shadow-sm">
                        <img src={currentAvatar} alt="Current selection" className="card-img rounded-3" />
                         <button 
                            type="button" 
                            onClick={() => onAvatarChange(undefined)} 
                            className="btn btn-sm btn-outline-danger w-100 mt-2 d-flex align-items-center justify-content-center gap-2">
                            <X size={14} /> Clear Image
                        </button>
                    </div>
                )}
            </div>

            {/* Right Panel */}
            <div className="col-md-9">
                <div className="row g-3 mb-4">
                     <div className="col-md-6">
                        <label htmlFor="imageUrl" className="form-label small text-secondary fw-bold" style={{ fontSize: '10px' }}>Image URL</label>
                        <input 
                            type="text" 
                            id="imageUrl" 
                            name="imageUrl" 
                            value={currentAvatar || ''} 
                            onChange={(e) => onAvatarChange(e.target.value)}
                            className="form-control form-control-sm" 
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label small text-secondary fw-bold" style={{ fontSize: '10px' }}>Alternate Text</label>
                        <input 
                            type="text" 
                            value={contactName} 
                            readOnly
                            className="form-control form-control-sm bg-light" 
                        />
                    </div>
                </div>

                <div className="btn-group btn-group-sm w-100 bg-light p-1 rounded-3 mb-4">
                     <button type="button" onClick={() => setImageSourceTab('existing')} className={`btn border-0 py-2 rounded-2 ${imageSourceTab === 'existing' ? 'bg-white shadow-sm text-primary fw-bold' : 'text-secondary'}`}>
                        Choose from existing ({activeGallery.length})
                     </button>
                     <button type="button" onClick={() => setImageSourceTab('upload')} className={`btn border-0 py-2 rounded-2 ${imageSourceTab === 'upload' ? 'bg-white shadow-sm text-primary fw-bold' : 'text-secondary'}`}>
                        Upload
                     </button>
                </div>

                {imageSourceTab === 'existing' && (
                    <div className="row g-2">
                        {activeGallery.map((imgSrc, index) => (
                            <div key={index} className="col-4 col-sm-3 col-lg-2">
                                <button
                                    type="button"
                                    onClick={() => onAvatarChange(imgSrc)}
                                    className={`btn p-0 border-3 rounded-3 overflow-hidden w-100 aspect-square ${currentAvatar === imgSrc ? 'border-primary' : 'border-transparent'}`}
                                >
                                    <img src={imgSrc} alt={`Gallery ${index + 1}`} className="w-100 h-100 object-fit-cover" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                 {imageSourceTab === 'upload' && (
                    <div className="d-flex align-items-center justify-content-center border border-2 border-dashed rounded-4" style={{ height: '200px' }}>
                        <p className="text-secondary small fst-italic">Upload functionality is not yet available.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default ImageUploadTab;
