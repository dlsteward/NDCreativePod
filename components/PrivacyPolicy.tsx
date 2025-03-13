'use client';

import React from 'react';
import { X } from 'lucide-react';

interface PrivacyPolicyProps {
  onClose: () => void;
}

export default function PrivacyPolicy({ onClose }: PrivacyPolicyProps) {
  return (
    <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="modal-content rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-opacity-20 hover:bg-black"
          aria-label="Close"
        >
          <X size={24} style={{ color: 'var(--muted)' }} />
        </button>
        
        <div className="p-6 pb-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--primary)' }}>Privacy Policy</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--primary)' }}>Information We Collect</h3>
              <p className="high-contrast-text">We collect the following information that you voluntarily provide:</p>
              <ul className="list-disc list-inside ml-4 mt-2 high-contrast-text">
                <li>Name</li>
                <li>Mailing address</li>
                <li>Interests</li>
                <li>Discord handle (optional)</li>
                <li>Mail and exchange preferences</li>
              </ul>
            </div>
            
            <div className="section-border">
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--primary)' }}>How We Use Your Information</h3>
              <p className="high-contrast-text">Your information is used solely for the purpose of:</p>
              <ul className="list-disc list-inside ml-4 mt-2 high-contrast-text">
                <li>Facilitating penpal matches based on your preferences</li>
                <li>Enabling other users to contact you for penpal exchanges</li>
                <li>Improving our matching service</li>
              </ul>
            </div>
            
            <div className="section-border">
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--primary)' }}>Information Sharing</h3>
              <p className="high-contrast-text">We share your information only with:</p>
              <ul className="list-disc list-inside ml-4 mt-2 high-contrast-text">
                <li>Other members of the ND Creative Pod Penpals directory who are matched with you</li>
                <li>We do not sell or share your data with third parties</li>
              </ul>
            </div>
            
            <div className="section-border">
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--primary)' }}>Data Protection</h3>
              <p className="high-contrast-text">We take the following measures to protect your data:</p>
              <ul className="list-disc list-inside ml-4 mt-2 high-contrast-text">
                <li>Information is stored securely in our database</li>
                <li>Access to the directory is restricted to members only</li>
                <li>Users can delete their information at any time</li>
              </ul>
            </div>
            
            <div className="section-border">
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--primary)' }}>Your Rights</h3>
              <p className="high-contrast-text">You have the right to:</p>
              <ul className="list-disc list-inside ml-4 mt-2 high-contrast-text">
                <li>Access your personal information</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </div>
            
            <div className="section-border">
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--primary)' }}>Contact</h3>
              <p className="high-contrast-text">If you have questions or concerns about your privacy, please contact the administrator via Discord:</p>
              <p className="info-card inline-block mt-2">
                <span className="font-medium">Discord:</span> chainsawvigilante
              </p>
            </div>
            
            <p className="text-sm mt-4" style={{ color: 'var(--muted)' }}>
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}