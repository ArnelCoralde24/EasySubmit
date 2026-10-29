import React, { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Camera as CameraIcon, X, Check, FilePlus } from 'lucide-react';

export default function DocumentScannerModal({ isOpen, onClose, onScanComplete }) {
  const [scannedImages, setScannedImages] = useState([]);

  if (!isOpen) return null;

  const handleCaptureImage = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      if (image.webPath) {
        setScannedImages((prev) => [...prev, image.webPath]);
      }
    } catch (err) {
      console.warn('Camera capture cancelled or failed');
    }
  };

  const handleFinalizeScan = async () => {
    if (scannedImages.length === 0) return;
    
    const convertedFiles = await Promise.all(
      scannedImages.map(async (uri, index) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new File([blob], `Scanned_Doc_${index + 1}.jpg`, { type: 'image/jpeg' });
      })
    );

    onScanComplete(convertedFiles);
    setScannedImages([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0b1021] border border-white/10 rounded-3xl p-6 space-y-5">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CameraIcon className="w-5 h-5 text-cyan-400" />
            Document Scanner
          </h3>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-900/60 rounded-2xl border border-white/5">
          {scannedImages.map((img, idx) => (
            <div key={idx} className="relative rounded-xl overflow-hidden border border-cyan-500/30">
              <img src={img} alt="Scanned Page" className="w-full h-20 object-cover" />
            </div>
          ))}
          <button
            type="button"
            onClick={handleCaptureImage}
            className="h-20 border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-xl flex flex-col items-center justify-center text-cyan-400 gap-1 bg-cyan-500/5"
          >
            <FilePlus className="w-5 h-5" />
            <span className="text-[10px] font-bold">Add Page</span>
          </button>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCaptureImage}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2"
          >
            <CameraIcon className="w-4 h-4" />
            Scan Page
          </button>
          <button
            type="button"
            disabled={scannedImages.length === 0}
            onClick={handleFinalizeScan}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Attach ({scannedImages.length})
          </button>
        </div>
      </div>
    </div>
  );
}