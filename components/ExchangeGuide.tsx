// components/ExchangeGuide.tsx
'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ExchangeGuideProps {
  onClose: () => void;
}

export default function ExchangeGuide({ onClose }: ExchangeGuideProps) {
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
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--primary)' }}>Exchange Guidelines</h2>
          
          <div className="space-y-8">
            {/* Friendship Books */}
            <div className="feature-border" style={{ borderColor: 'var(--secondary)' }}>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--primary)' }}>Friendship Books (FBs)</h3>
              <ol className="list-decimal list-inside space-y-2 high-contrast-text">
                <li className="ml-4"><span className="font-medium">Write Your Entry:</span> Include your name, interests, and a few fun facts about yourself.</li>
                <li className="ml-4"><span className="font-medium">Decorate Creatively:</span> Use stickers, drawings, or other embellishments to personalize your entry.</li>
                <li className="ml-4"><span className="font-medium">Follow Instructions:</span> If the FB has specific guidelines, make sure to adhere to them.</li>
                <li className="ml-4"><span className="font-medium">Send It Off:</span> Mail the FB to your penpal, along with any instructions for completing their entry.</li>
                <li className="ml-4"><span className="font-medium">Receive and Share:</span> Once you receive it back, read your penpal's entry and keep the FB for future exchanges.</li>
              </ol>
            </div>
            
            {/* Art Journal */}
            <div className="feature-border" style={{ borderColor: 'var(--accent)' }}>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--primary)' }}>Art Journal</h3>
              <ol className="list-decimal list-inside space-y-2 high-contrast-text">
                <li className="ml-4"><span className="font-medium">Start with a Theme:</span> Choose a theme for your entries (e.g., nature, dreams) to guide your creativity.</li>
                <li className="ml-4"><span className="font-medium">Create Your Art:</span> Use a variety of mediums such as drawing, painting, or collage.</li>
                <li className="ml-4"><span className="font-medium">Include Reflections:</span> Write a few sentences about your artwork and what inspired it.</li>
                <li className="ml-4"><span className="font-medium">Mail It:</span> Send your art journal to your penpal and encourage them to add their own creations.</li>
              </ol>
            </div>
            
            {/* Zine */}
            <div className="feature-border" style={{ borderColor: 'var(--success)' }}>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--primary)' }}>Zine</h3>
              <ol className="list-decimal list-inside space-y-2 high-contrast-text">
                <li className="ml-4"><span className="font-medium">Pick a Topic:</span> If you're starting your own zine, choose a theme that interests you (e.g., hobbies, personal stories). If you're contributing to a collaborative zine, follow the predetermined theme established by the group. Some zines may not have a specific theme; feel free to express yourself creatively without constraints.</li>
                <li className="ml-4"><span className="font-medium">Create Content:</span> Write articles, poems, or illustrations that align with your chosen or assigned theme.</li>
                <li className="ml-4"><span className="font-medium">Design Thoughtfully:</span> Arrange your content in a visually appealing way, ensuring good layout and readability.</li>
                <li className="ml-4"><span className="font-medium">Share:</span> Send your zine to your penpal and invite them to contribute to the next edition if it's a collaborative effort.</li>
              </ol>
            </div>
            
            {/* Regular Letters */}
            <div className="feature-border" style={{ borderColor: 'var(--primary)' }}>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--primary)' }}>Regular Letters</h3>
              <ol className="list-decimal list-inside space-y-2 high-contrast-text">
                <li className="ml-4"><span className="font-medium">Start with a Warm Greeting:</span> Address your penpal warmly (e.g., "Dear [Name],").</li>
                <li className="ml-4"><span className="font-medium">Share About Yourself:</span> Talk about your day, interests, or any exciting news.</li>
                <li className="ml-4"><span className="font-medium">Encourage Dialogue:</span> Include questions to prompt your penpal to share their experiences.</li>
                <li className="ml-4"><span className="font-medium">Close Thoughtfully:</span> End with a friendly sign-off and your name.</li>
              </ol>
            </div>
            
            {/* Gift Exchange */}
            <div className="feature-border" style={{ borderColor: 'var(--secondary)' }}>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--primary)' }}>Gift Exchange</h3>
              <ol className="list-decimal list-inside space-y-2 high-contrast-text">
                <li className="ml-4"><span className="font-medium">Set a Budget:</span> Agree on a price range for gifts to ensure fairness.</li>
                <li className="ml-4"><span className="font-medium">Choose Thoughtfully:</span> Select something that reflects your penpal's interests and preferences.</li>
                <li className="ml-4"><span className="font-medium">Include a Personal Note:</span> Write a note explaining why you chose the gift, adding a personal touch.</li>
                <li className="ml-4"><span className="font-medium">Send It:</span> Mail the gift and look forward to receiving one in return!</li>
              </ol>
            </div>
            
            <div className="warning-card">
              <h3 className="text-lg font-bold mb-2">Getting Started Tip</h3>
              <p className="high-contrast-text">If your match provided a Discord username, it's advisable to message them on Discord before sending mail to introduce yourself and coordinate your exchange.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}