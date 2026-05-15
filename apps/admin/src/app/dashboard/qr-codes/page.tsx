"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { Button } from '@repo/ui';
import { QrCode, Download, Share2, ShieldCheck, AlertCircle, Printer, Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function QrCodesPage() {
  const { user } = useAuthStore();
  const [kycStatus, setKycStatus] = useState<string>('NOT_SUBMITTED');
  const [loading, setLoading] = useState(true);
  const qrRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await api.get('/kyc/status');
      setKycStatus(response.data?.kycStatus || 'NOT_SUBMITTED');
    } catch (err) {
      console.error('Error fetching KYC status', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const svg = qrRef.current;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `HireMe-QR-${user?.name || 'User'}.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const shareLink = () => {
    const url = `${window.location.origin}/p/${user?.id}`;
    navigator.clipboard.writeText(url);
    alert('Profile link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isVerified = kycStatus === 'APPROVED';
  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${user?.id}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Digital ID & QR Code</h1>
        <p className="text-gray-400">Your unique QR code for identity verification and bookings.</p>
      </div>

      {!isVerified ? (
        <div className="p-8 bg-white/5 border border-white/10 rounded-2xl text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
            <AlertCircle size={40} className="text-amber-400" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white mb-2">Verification Required</h3>
            <p className="text-gray-400 mb-6">You need to complete your KYC verification before a professional QR code can be generated for your profile.</p>
            <Button 
              onClick={() => window.location.href = '/dashboard/kyc'}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              Complete KYC Now
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* QR Display */}
          <div className="p-8 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center justify-center space-y-6 bg-gradient-to-b from-white/5 to-transparent">
            <div className="p-6 bg-white rounded-3xl shadow-2xl shadow-blue-500/20">
              <QRCodeSVG 
                ref={qrRef}
                value={profileUrl} 
                size={220}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/logo-black.png", // Placeholder or app icon
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>
            <div className="text-center">
              <h4 className="text-white font-bold text-lg">{user?.name}</h4>
              <p className="text-blue-400 text-sm font-medium flex items-center justify-center gap-1">
                <ShieldCheck size={14} /> Verified {user?.role}
              </p>
            </div>
          </div>

          {/* Actions & Info */}
          <div className="space-y-6">
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <QrCode size={18} className="text-blue-400" /> Your QR Card
              </h4>
              <p className="text-gray-400 text-sm">
                Customers can scan this code to view your verified profile, skills, and ratings instantly.
              </p>
              
              <div className="grid grid-cols-1 gap-3 pt-2">
                <Button onClick={downloadQR} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center gap-2">
                  <Download size={18} /> Download Image (PNG)
                </Button>
                <Button onClick={shareLink} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center gap-2">
                  <Copy size={18} /> Copy Profile Link
                </Button>
                <Button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center gap-2">
                  <Printer size={18} /> Print ID Card
                </Button>
              </div>
            </div>

            <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
              <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                <Share2 size={18} /> How to use?
              </h4>
              <ul className="text-sm text-gray-400 space-y-2 list-disc pl-4">
                <li>Show this code to customers at the job location.</li>
                <li>Print it on your visiting cards or flyers.</li>
                <li>Share your link on WhatsApp or social media.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
