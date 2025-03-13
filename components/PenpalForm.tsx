'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Lock, CheckCircle2, RefreshCw, BookOpen, HelpCircle, Shield } from 'lucide-react';
import { PenpalFormData, MatchedPenpal, CreatePenpalResponse, FindMatchResponse, DeletePenpalResponse } from '@/types';
import { createPenpal, findPenpalMatch, deletePenpal } from '@/app/actions';
import ExchangeGuide from './ExchangeGuide';
import FAQ from './FAQ';
import PrivacyPolicy from './PrivacyPolicy';

export default function PenpalForm() {
  // App states
  const [currentView, setCurrentView] = useState<'form' | 'confirmation' | 'match' | 'manage'>('form');
  const [formData, setFormData] = useState<PenpalFormData>({
    name: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '', // Added field
    country: '', // Added field
    interests: '',
    discordHandle: '',
    mailPreference: 'letters',
    mailLocation: 'domestic',
    exchangeTypes: {
      friendBooks: false,
      artJournal: false,
      zine: false,
      letters: false,
      giftExchange: false
    },
    acceptTerms: false
  });
  
  // Matching system state
  const [matchedPenpal, setMatchedPenpal] = useState<MatchedPenpal | null>(null);
  const [matchesRemaining, setMatchesRemaining] = useState(3);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  // New state for modal visibility
  const [showGuide, setShowGuide] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Country options list for dropdown
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'IE', name: 'Ireland' },
    { code: 'FR', name: 'France' },
    { code: 'DE', name: 'Germany' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'PT', name: 'Portugal' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'BE', name: 'Belgium' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'AT', name: 'Austria' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' },
    { code: 'DK', name: 'Denmark' },
    { code: 'FI', name: 'Finland' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
    { code: 'SG', name: 'Singapore' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CL', name: 'Chile' },
    { code: 'IN', name: 'India' },
  ].sort((a, b) => a.name.localeCompare(b.name));
  
  // Clear timeout when component unmounts
  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, []);

  // Anti-copy protection for match view
  useEffect(() => {
    if (currentView === 'match') {
      const preventCopy = (e: Event) => {
        e.preventDefault();
        showAlert('Copying is disabled for privacy reasons');
      };
      
      const preventSave = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p')) {
          e.preventDefault();
          showAlert('Saving is disabled for privacy reasons');
        }
      };
      
      document.addEventListener('copy', preventCopy);
      document.addEventListener('contextmenu', preventCopy);
      document.addEventListener('keydown', preventSave);
      
      return () => {
        document.removeEventListener('copy', preventCopy);
        document.removeEventListener('contextmenu', preventCopy);
        document.removeEventListener('keydown', preventSave);
      };
    }
  }, [currentView]);

  // Show alert message
  const showAlert = (message: string) => {
    setAlertMessage(message);
    
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }
    
    alertTimeoutRef.current = setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.acceptTerms) {
      showAlert('Please accept the terms to continue');
      return;
    }
    
    if (formData.interests.length < 50) {
      showAlert('Please write at least 50 characters for interests');
      return;
    }
    
    if (Object.values(formData.exchangeTypes).every(v => !v)) {
      showAlert('Please select at least one exchange type');
      return;
    }
    
    if (!formData.country) {
      showAlert('Please select your country');
      return;
    }
    
    if (!formData.zipCode) {
      showAlert('Please enter your postal/zip code');
      return;
    }
    
    try {
      console.log('Submitting form data:', formData);
      // Call the server action to create the penpal
      const result = await createPenpal(formData);
      console.log('Form submission result:', result);
      
      if (result.success) {
        // Store the penpal ID for later use in matching
        sessionStorage.setItem('penpalId', result.penpalId || '');
        console.log('Stored penpal ID in session storage:', result.penpalId);
        setCurrentView('confirmation');
      } else {
        showAlert(result.error || 'Failed to join directory');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showAlert('An unexpected error occurred. Please try again.');
    }
  };

  // Get a match
  const getMatch = async () => {
    setIsLoadingMatch(true);
    
    try {
      // Get the user's penpal ID from session storage
      const penpalId = sessionStorage.getItem('penpalId');
      console.log('Using penpal ID for matching:', penpalId);
      
      if (!penpalId) {
        showAlert('Your session has expired. Please rejoin the directory.');
        setCurrentView('form');
        return;
      }
      
      // Call the server action to find a match
      const result = await findPenpalMatch(penpalId);
      console.log('Match result:', result);
      
      if (result.success && result.match) {
        setMatchedPenpal(result.match);
      } else {
        showAlert(result.error || 'No matches found');
      }
    } catch (error) {
      console.error('Error finding match:', error);
      showAlert('Failed to find a penpal match');
    } finally {
      setIsLoadingMatch(false);
      setCurrentView('match');
    }
  };

  // Regenerate a new match
  const regenerateMatch = async () => {
    if (matchesRemaining > 0) {
      setMatchesRemaining(prev => prev - 1);
      getMatch();
    }
  };

  // Handle deleting an entry
  const handleDeleteEntry = async () => {
    const penpalId = sessionStorage.getItem('penpalId');
    
    if (!penpalId) {
      showAlert('Unable to find your entry information');
      setShowDeleteConfirm(false);
      return;
    }
    
    setDeleteStatus('loading');
    
    try {
      const result = await deletePenpal(penpalId);
      
      if (result.success) {
        setDeleteStatus('success');
        // Clear the session data
        sessionStorage.removeItem('penpalId');
      } else {
        setDeleteStatus('error');
        showAlert(result.error || 'Failed to delete your entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      setDeleteStatus('error');
      showAlert('An unexpected error occurred');
    }
  };

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle radio button changes
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    if (name === 'acceptTerms') {
      setFormData(prev => ({
        ...prev,
        acceptTerms: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        exchangeTypes: {
          ...prev.exchangeTypes,
          [name]: checked
        }
      }));
    }
  };

  // Form View
  if (currentView === 'form') {
    return (
      <div className="min-h-screen p-6 relative" style={{ background: 'var(--background)' }}>
        {/* Show modals when activated */}
        {showGuide && <ExchangeGuide onClose={() => setShowGuide(false)} />}
        {showFAQ && <FAQ onClose={() => setShowFAQ(false)} />}
        {showPrivacyPolicy && <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />}
        
        {alertMessage && (
          <div className="fixed top-5 left-1/2 transform -translate-x-1/2 p-3 error-card shadow-lg z-50 max-w-[90%] text-center">
            {alertMessage}
          </div>
        )}
        
        <div className="max-w-2xl mx-auto">
          <div className="form-container">
            {/* Header Image with Gradient Overlay */}
            <div className="form-header">
              <img 
                src="https://raw.githubusercontent.com/dlsteward/NDCreativePod/32cb1bbf1aca3a814c28355741666e8c6a4861ec/IMG_5660.png"
                alt="Creative Pod Penpals"
                className="w-full h-auto object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h1 className="text-5xl fredoka-font title-outline-light text-center" style={{ color: 'var(--primary)' }}>
                  ND Creative Pod Penpals
                </h1>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Lock style={{ color: 'var(--primary)' }} size={20} />
                <p className="high-contrast-text">Private penpal directory and matching system.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name field */}
                <div>
                  <label htmlFor="name" className="block label-text mb-2">
                    Name <span style={{ color: 'var(--secondary)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 themed-border bg-transparent"
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Street Address field */}
                <div>
                  <label htmlFor="streetAddress" className="block label-text mb-2">
                    Street Address <span style={{ color: 'var(--secondary)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="streetAddress"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleInputChange}
                    className="w-full p-3 themed-border bg-transparent"
                    required
                  />
                </div>

                {/* City and State fields in one row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block label-text mb-2">
                      City <span style={{ color: 'var(--secondary)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full p-3 themed-border bg-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block label-text mb-2">
                      State/Province <span style={{ color: 'var(--secondary)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full p-3 themed-border bg-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Postal Code and Country fields in one row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="zipCode" className="block label-text mb-2">
                      Postal/ZIP Code <span style={{ color: 'var(--secondary)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full p-3 themed-border bg-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="country" className="block label-text mb-2">
                      Country <span style={{ color: 'var(--secondary)' }}>*</span>
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full p-3 themed-border bg-transparent"
                      required
                    >
                      <option value="">Select Country</option>
                      {countries.map(country => (
                        <option key={country.code} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Interests field */}
                <div>
                  <label htmlFor="interests" className="block label-text mb-2">
                    Interests <span style={{ color: 'var(--secondary)' }}>*</span>
                  </label>
                  <textarea
                    id="interests"
                    name="interests"
                    value={formData.interests}
                    onChange={handleInputChange}
                    className="w-full p-3 themed-border bg-transparent"
                    rows={3}
                    required
                    minLength={50}
                    placeholder="Share your interests (minimum 50 characters)"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      Please write at least 50 characters
                    </p>
                    <div className="flex items-center gap-1">
                      <span 
                        className="text-sm"
                        style={{ color: formData.interests.length >= 50 ? 'var(--success)' : 'var(--muted)' }}
                      >
                        {formData.interests.length}/50
                      </span>
                      {formData.interests.length >= 50 && (
                        <CheckCircle2 
                          className="w-4 h-4" 
                          style={{ color: 'var(--success)' }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Discord Handle field */}
                <div>
                  <label htmlFor="discordHandle" className="block label-text mb-2">
                    Discord Handle <span className="text-sm" style={{ color: 'var(--muted)' }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="discordHandle"
                    name="discordHandle"
                    value={formData.discordHandle}
                    onChange={handleInputChange}
                    className="w-full p-3 themed-border bg-transparent"
                    placeholder="username#0000"
                  />
                </div>

                {/* Mail Preferences field */}
                <div>
                  <label className="block label-text mb-2">
                    Mail Preferences <span style={{ color: 'var(--secondary)' }}>*</span>
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="mailPreference"
                        value="letters"
                        checked={formData.mailPreference === 'letters'}
                        onChange={handleRadioChange}
                        className="mr-2"
                      />
                      <span className="high-contrast-text">Letters and postcards only</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="mailPreference"
                        value="packages"
                        checked={formData.mailPreference === 'packages'}
                        onChange={handleRadioChange}
                        className="mr-2"
                      />
                      <span className="high-contrast-text">Open to small packages and gift exchanges</span>
                    </label>
                  </div>
                </div>

                {/* Exchange Types field */}
                <div>
                  <label className="block label-text mb-2">
                    Exchange Types <span style={{ color: 'var(--secondary)' }}>*</span>
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="friendBooks"
                        checked={formData.exchangeTypes.friendBooks}
                        onChange={handleCheckboxChange}
                        className="mr-2"
                      />
                      <span className="high-contrast-text">Friend Books (FBs)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="artJournal"
                        checked={formData.exchangeTypes.artJournal}
                        onChange={handleCheckboxChange}
                        className="mr-2"
                      />
                      <span className="high-contrast-text">Art Journal</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="zine"
                        checked={formData.exchangeTypes.zine}
                        onChange={handleCheckboxChange}
                        className="mr-2"
                      />
                      <span className="high-contrast-text">Zine</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="letters"
                        checked={formData.exchangeTypes.letters}
                        onChange={handleCheckboxChange}
                        className="mr-2"
                      />
                      <span className="high-contrast-text">Regular Letters</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="giftExchange"
                        checked={formData.exchangeTypes.giftExchange}
                        onChange={handleCheckboxChange}
                        className="mr-2"
                      />
                      <span className="high-contrast-text">Gift Exchange</span>
                    </label>
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                    Please select at least one exchange type
                  </p>
                </div>

                {/* Mailing Location field */}
                <div>
                  <label className="block label-text mb-2">
                    Mailing Location <span style={{ color: 'var(--secondary)' }}>*</span>
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="mailLocation"
                        value="domestic"
                        checked={formData.mailLocation === 'domestic'}
                        onChange={handleRadioChange}
                        className="mr-2"
                      />
                      <span className="high-contrast-text">Domestic mail only (within my country)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="mailLocation"
                        value="international"
                        checked={formData.mailLocation === 'international'}
                        onChange={handleRadioChange}
                        className="mr-2"
                      />
                      <span className="high-contrast-text">Open to international mail</span>
                    </label>
                  </div>
                </div>

                {/* Terms Acceptance */}
                <div className="info-card">
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleCheckboxChange}
                      className="mt-1"
                    />
                    <span className="high-contrast-text">
                      I agree to add my information to the private penpal directory. I understand my information may appear as a potential match when other members use the matching feature.
                    </span>
                  </label>
                </div>

                {/* Join Directory Button */}
                <div className="mt-6">
                  <button 
                    type="submit"
                    className="w-full p-4 rounded-xl font-medium btn-primary"
                  >
                    Join Directory
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* Privacy Policy and FAQ links */}
        <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-6 text-sm">
          <button 
            onClick={() => setShowFAQ(true)}
            className="footer-link flex items-center gap-1"
          >
            <HelpCircle size={16} />
            FAQ
          </button>
          <button 
            onClick={() => setShowPrivacyPolicy(true)}
            className="footer-link flex items-center gap-1"
          >
            <Shield size={16} />
            Privacy Policy
          </button>
        </div>
      </div>
    );
  }

  // Confirmation View
  if (currentView === 'confirmation') {
    return (
      <div className="min-h-screen p-6 relative" style={{ background: 'var(--background)' }}>
        {/* Show modals when activated */}
        {showGuide && <ExchangeGuide onClose={() => setShowGuide(false)} />}
        {showFAQ && <FAQ onClose={() => setShowFAQ(false)} />}
        {showPrivacyPolicy && <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />}
        
        <div className="max-w-2xl mx-auto">
          <div className="form-container p-8 text-center relative">
            {/* Close button in upper right */}
            <button 
              onClick={() => setCurrentView('form')} 
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-opacity-10 hover:bg-black"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted)' }}>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="mb-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: 'rgba(77, 198, 181, 0.2)' }}>
                <CheckCircle2 size={40} style={{ color: 'var(--success)' }} />
              </div>
              <h2 className="text-2xl font-bold mt-4" style={{ color: 'var(--primary)' }}>Successfully Added!</h2>
              <p className="high-contrast-text mt-2">
                Your information has been securely added to the private ND Creative Pod Penpals directory.
              </p>
            </div>

            <div className="info-card mb-6">
              <h3 className="text-xl font-medium mb-3" style={{ color: 'var(--primary)' }}>Ready to Start Exchanging?</h3>
              <p className="high-contrast-text mb-6">
                Find a penpal who matches your interests and preferences.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={getMatch}
                  className="px-6 py-3 rounded-xl font-medium btn-secondary flex items-center justify-center gap-2 text-white"
                >
                  <Lock size={18} />
                  Get Matched with a Penpal Now!
                </button>
                <button
                  onClick={() => setShowGuide(true)}
                  className="px-6 py-3 rounded-xl font-medium btn-outline flex items-center justify-center gap-2"
                >
                  <BookOpen size={18} />
                  Exchange Guidelines
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>
                You can manage your information or find a match later by bookmarking this page.
              </p>
              
              <div className="flex gap-3 justify-center">
                {/* Close button */}
                <button 
                  onClick={() => setCurrentView('form')}
                  className="px-6 py-3 rounded-xl font-medium btn-gray"
                >
                  Close
                </button>
                
                {/* Manage My Data button */}
                <button 
                  onClick={() => setCurrentView('manage')}
                  className="px-6 py-3 rounded-xl font-medium btn-outline"
                >
                  Manage My Data
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Privacy Policy and FAQ links */}
        <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-6 text-sm">
          <button 
            onClick={() => setShowFAQ(true)}
            className="footer-link flex items-center gap-1"
          >
            <HelpCircle size={16} />
            FAQ
          </button>
          <button 
            onClick={() => setShowPrivacyPolicy(true)}
            className="footer-link flex items-center gap-1"
          >
            <Shield size={16} />
            Privacy Policy
          </button>
        </div>
      </div>
    );
  }

  // Match View
  if (currentView === 'match') {
    return (
      <div className="min-h-screen p-6 relative" style={{ background: 'var(--background)' }}>
        {/* Show modals when activated */}
        {showGuide && <ExchangeGuide onClose={() => setShowGuide(false)} />}
        {showFAQ && <FAQ onClose={() => setShowFAQ(false)} />}
        {showPrivacyPolicy && <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />}
        
        {alertMessage && (
          <div className="fixed top-5 left-1/2 transform -translate-x-1/2 p-3 error-card shadow-lg z-50 max-w-[90%] text-center">
            {alertMessage}
          </div>
        )}
        
        <div className="max-w-2xl mx-auto">
          <div className="form-container">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>Your Penpal Match</h2>
                {/* Private info badge */}
                <div className="badge">
                  <Lock size={14} />
                  <span className="text-xs font-medium">Private Information</span>
                </div>
              </div>

              {isLoadingMatch ? (
                <div className="py-20 text-center">
                  <div className="animate-spin w-12 h-12 border-4 border-t-transparent rounded-full mx-auto mb-4" 
                       style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}></div>
                  <p className="high-contrast-text">Finding your perfect penpal match...</p>
                </div>
              ) : matchedPenpal ? (
                <div className="space-y-6 relative">
                  {/* Watermark for screenshot prevention */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 rotate-45 text-6xl font-bold" style={{ color: 'var(--secondary)' }}>
                    PRIVATE INFO
                  </div>

                  {/* Animated success indicator */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 animate-[fadeInDown_0.5s_ease_forwards]">
                    <div className="success-card px-4 py-2 rounded-full font-medium flex items-center gap-2">
                      <CheckCircle2 size={18} />
                      Match Found!
                    </div>
                  </div>

                  <div className="info-card">
                    <h3 className="text-xl font-medium mb-2" style={{ color: 'var(--primary)' }}>{matchedPenpal.name}</h3>
                    <p className="high-contrast-text mb-2">{matchedPenpal.city}, {matchedPenpal.state}, {matchedPenpal.country}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {matchedPenpal.exchangeTypes.map((type, index) => (
                        <span key={index} className="tag">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2" style={{ color: 'var(--primary)' }}>Mailing Address</h4>
                    <div className="p-4 themed-border high-contrast-text">
                      <p>{matchedPenpal.name}</p>
                      <p>{matchedPenpal.streetAddress}</p>
                      <p>{matchedPenpal.city}, {matchedPenpal.state} {matchedPenpal.zipCode}</p>
                      <p>{matchedPenpal.country}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2" style={{ color: 'var(--primary)' }}>Interests</h4>
                    <p className="p-4 themed-border high-contrast-text">
                      {matchedPenpal.interests}
                    </p>
                  </div>

                  {matchedPenpal.discordHandle && (
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--primary)' }}>Discord</h4>
                      <p className="p-4 themed-border high-contrast-text">
                        {matchedPenpal.discordHandle}
                      </p>
                    </div>
                  )}

                  <div className="warning-card">
                    <h4 className="font-medium mb-1">Next Steps</h4>
                    <p className="high-contrast-text text-sm">
                      {matchedPenpal.discordHandle 
                        ? `Start by reaching out to ${matchedPenpal.name} on Discord to introduce yourself and discuss your preferred exchange type.` 
                        : `Prepare a letter or your chosen exchange format to send to ${matchedPenpal.name} to start your penpal journey.`}
                    </p>
                    <button
                      onClick={() => setShowGuide(true)}
                      className="mt-3 text-sm font-medium hover:underline flex items-center gap-1"
                      style={{ color: 'var(--warning-foreground)' }}
                    >
                      <BookOpen size={14} />
                      View Exchange Guidelines
                    </button>
                  </div>

                  <div className="error-card">
                    <p className="text-sm">
                      <strong>Privacy Notice:</strong> This information is for your personal use only. 
                      Please respect your penpal's privacy and do not share their contact details with others.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    <button 
                      onClick={() => setCurrentView('confirmation')}
                      className="flex-1 p-4 rounded-xl font-medium btn-outline"
                    >
                      Go Back
                    </button>
                    <button 
                      onClick={regenerateMatch}
                      disabled={matchesRemaining === 0}
                      className={`flex-1 p-4 rounded-xl font-medium flex items-center justify-center gap-2 ${
                        matchesRemaining > 0 
                          ? "btn-secondary text-white" 
                          : "opacity-50"
                      }`}
                    >
                      <RefreshCw size={18} />
                      Find New Match 
                      <span className="text-sm">({matchesRemaining} left)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center space-y-6">
                  <div className="warning-card inline-block mx-auto">
                    <p className="text-lg font-medium">No match found</p>
                    <p className="text-sm mt-1">We couldn't find a suitable penpal match at this time.</p>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={getMatch}
                      className="px-6 py-3 rounded-xl font-medium hover:bg-opacity-90 mx-auto flex items-center gap-2 btn-secondary text-white"
                    >
                      <RefreshCw size={18} />
                      Try Finding a Match Again
                    </button>
                    
                    <button 
                      onClick={() => setCurrentView('confirmation')}
                      className="px-6 py-3 rounded-xl font-medium mx-auto btn-outline"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Privacy Policy and FAQ links */}
        <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-6 text-sm">
          <button 
            onClick={() => setShowFAQ(true)}
            className="footer-link flex items-center gap-1"
          >
            <HelpCircle size={16} />
            FAQ
          </button>
          <button 
            onClick={() => setShowPrivacyPolicy(true)}
            className="footer-link flex items-center gap-1"
          >
            <Shield size={16} />
            Privacy Policy
          </button>
        </div>
      </div>
    );
  }

  // Manage Data View
  if (currentView === 'manage') {
    return (
      <div className="min-h-screen p-6 relative" style={{ background: 'var(--background)' }}>
        {/* Show modals when activated */}
        {showGuide && <ExchangeGuide onClose={() => setShowGuide(false)} />}
        {showFAQ && <FAQ onClose={() => setShowFAQ(false)} />}
        {showPrivacyPolicy && <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />}
        
        {alertMessage && (
          <div className="fixed top-5 left-1/2 transform -translate-x-1/2 p-3 error-card shadow-lg z-50 max-w-[90%] text-center">
            {alertMessage}
          </div>
        )}
        
        <div className="max-w-2xl mx-auto">
          <div className="form-container">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>Manage Your Directory Entry</h2>
                <button 
                  onClick={() => setCurrentView('confirmation')} 
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-opacity-10 hover:bg-black"
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted)' }}>
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Review your information section */}
                <div>
                  <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--primary)' }}>Your Information</h3>
                  <div className="space-y-4 themed-border p-4">
                    <div>
                      <h4 className="font-medium high-contrast-text">Name</h4>
                      <p className="high-contrast-text">{formData.name}</p>
                    </div>
                    <div>
                      <h4 className="font-medium high-contrast-text">Address</h4>
                      <p className="high-contrast-text">{formData.streetAddress}</p>
                      <p className="high-contrast-text">{formData.city}, {formData.state} {formData.zipCode}</p>
                      <p className="high-contrast-text">{formData.country}</p>
                    </div>
                    <div>
                      <h4 className="font-medium high-contrast-text">Interests</h4>
                      <p className="high-contrast-text">{formData.interests}</p>
                    </div>
                    {formData.discordHandle && (
                      <div>
                        <h4 className="font-medium high-contrast-text">Discord</h4>
                        <p className="high-contrast-text">{formData.discordHandle}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium high-contrast-text">Mail Preferences</h4>
                      <p className="high-contrast-text">
                        {formData.mailPreference === 'letters' 
                          ? 'Letters and postcards only' 
                          : 'Open to small packages and gift exchanges'}
                      </p>
                      <p className="high-contrast-text">
                        {formData.mailLocation === 'domestic' 
                          ? 'Domestic mail only' 
                          : 'Open to international mail'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium high-contrast-text">Exchange Types</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {formData.exchangeTypes.friendBooks && (
                          <span className="tag">
                            Friend Books
                          </span>
                        )}
                        {formData.exchangeTypes.artJournal && (
                          <span className="tag">
                            Art Journal
                          </span>
                        )}
                        {formData.exchangeTypes.zine && (
                          <span className="tag">
                            Zine
                          </span>
                        )}
                        {formData.exchangeTypes.letters && (
                          <span className="tag">
                            Letters
                          </span>
                        )}
                        {formData.exchangeTypes.giftExchange && (
                          <span className="tag">
                            Gift Exchange
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delete your entry section */}
                <div className="section-border">
                  <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--error-foreground)' }}>Remove Your Information</h3>
                  <p className="high-contrast-text mb-4">
                    If you'd like to be removed from the penpal directory, you can delete your entry below.
                    This action cannot be undone.
                  </p>
                  
                  {!showDeleteConfirm ? (
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-6 py-3 rounded-xl font-medium transition-colors btn-danger text-white"
                    >
                      Delete My Entry
                    </button>
                  ) : deleteStatus === 'loading' ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin w-5 h-5 border-2 border-t-transparent rounded-full mr-2"
                           style={{ borderColor: 'var(--error-foreground)', borderTopColor: 'transparent' }}></div>
                      <span style={{ color: 'var(--error-foreground)' }}>Deleting...</span>
                    </div>
                  ) : deleteStatus === 'success' ? (
                    <div className="success-card">
                      Your information has been successfully removed from the directory.
                      <button 
                        onClick={() => setCurrentView('form')}
                        className="mt-4 px-6 py-2 text-white rounded-xl font-medium transition-colors"
                        style={{ backgroundColor: 'var(--success-foreground)' }}
                      >
                        Return to Home
                      </button>
                    </div>
                  ) : deleteStatus === 'error' ? (
                    <div className="error-card">
                      There was an error deleting your entry. Please try again or contact support.
                      <div className="flex gap-3 mt-4">
                        <button 
                          onClick={() => {
                            setDeleteStatus('idle');
                            setShowDeleteConfirm(false);
                          }}
                          className="px-4 py-2 rounded-xl btn-danger"
                          style={{ backgroundColor: 'transparent' }}
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleDeleteEntry}
                          className="px-4 py-2 rounded-xl btn-danger text-white"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="error-card">
                      <p className="font-medium mb-2">
                        Are you sure you want to delete your entry?
                      </p>
                      <p className="mb-4 text-sm">
                        This will permanently remove your information from the penpal directory.
                      </p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-4 py-2 rounded-xl btn-danger"
                          style={{ backgroundColor: 'transparent' }}
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleDeleteEntry}
                          className="px-4 py-2 rounded-xl btn-danger text-white"
                        >
                          Yes, Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Support section */}
                <div className="section-border">
                  <h3 className="text-lg font-medium mb-3" style={{ color: 'var(--primary)' }}>Need Help?</h3>
                  <p className="high-contrast-text mb-2">
                    If you need assistance managing your information, you can contact the administrator directly:
                  </p>
                  <p className="info-card inline-block">
                    <span className="font-medium">Discord:</span> 
                    <span className="font-medium">chainsawvigilante</span>
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex justify-center gap-4 mt-6">
                  <button 
                    onClick={() => setCurrentView('confirmation')}
                    className="px-6 py-3 rounded-xl font-medium btn-outline"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Privacy Policy and FAQ links */}
        <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-6 text-sm">
          <button 
            onClick={() => setShowFAQ(true)}
            className="footer-link flex items-center gap-1"
          >
            <HelpCircle size={16} />
            FAQ
          </button>
          <button 
            onClick={() => setShowPrivacyPolicy(true)}
            className="footer-link flex items-center gap-1"
          >
            <Shield size={16} />
            Privacy Policy
          </button>
        </div>
      </div>
    );
  }

  return null;
}