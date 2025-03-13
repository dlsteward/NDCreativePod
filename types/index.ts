// types/index.ts
export interface PenpalFormData {
    name: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string; // Added field
    country: string; // Added field
    interests: string;
    discordHandle: string;
    mailPreference: 'letters' | 'packages';
    mailLocation: 'domestic' | 'international';
    exchangeTypes: {
      friendBooks: boolean;
      artJournal: boolean;
      zine: boolean;
      letters: boolean;
      giftExchange: boolean;
    };
    acceptTerms: boolean;
  }
  
  export interface MatchedPenpal {
    id: string;
    name: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string; // Added field
    country: string; // Added field
    interests: string;
    discordHandle: string;
    exchangeTypes: string[];
  }
  
  export interface CreatePenpalResponse {
    success: boolean;
    penpalId?: string;
    error?: string;
  }
  
  export interface FindMatchResponse {
    success: boolean;
    match?: MatchedPenpal;
    error?: string;
  }
  
  export interface DeletePenpalResponse {
    success: boolean;
    error?: string;
  }