// app/actions.ts
'use server';

import { connectDB } from '@/lib/mongodb';
import PenpalModel from '@/models/Penpal';
import { revalidatePath } from 'next/cache';
import { PenpalFormData, MatchedPenpal, CreatePenpalResponse, FindMatchResponse } from '@/types';
import mongoose from 'mongoose';

/**
 * Creates a new penpal in the directory
 */
export async function createPenpal(formData: PenpalFormData): Promise<CreatePenpalResponse> {
  try {
    await connectDB();
    
    // Create a new penpal entry (excluding acceptTerms which is just for form validation)
    const { acceptTerms, ...penpalData } = formData;
    const newPenpal = new PenpalModel(penpalData);
    await newPenpal.save();
    
    // Revalidate the directory path to update any cached data
    revalidatePath('/');
    
    return { 
      success: true,
      penpalId: newPenpal._id.toString()
    };
  } catch (error) {
    console.error('Error creating penpal:', error);
    return { 
      success: false, 
      error: 'Failed to save your information. Please try again.' 
    };
  }
}

/**
 * Finds potential penpal matches based on user preferences
 */
export async function findPenpalMatch(userId: string): Promise<FindMatchResponse> {
  try {
    console.log(`Starting match search for user ID: ${userId}`);
    await connectDB();
    
    // Verify the user ID exists first
    const userPenpal = await PenpalModel.findById(userId);
    if (!userPenpal) {
      console.log(`User with ID ${userId} not found in database`);
      return { success: false, error: 'User not found' };
    }
    
    console.log(`Found user: ${userPenpal.name}`);
    
    // Get previous matches to exclude them
    const previousMatches = await getPreviousMatches(userId);
    console.log(`Found ${previousMatches.length} previous matches to exclude`);
    
    // Start with a query that excludes the current user and previous matches
    let matchQuery: any = {
      _id: { 
        $ne: userId,
        $nin: previousMatches 
      }
    };
    
    // Apply mail location filter
    // If user wants domestic only, find others in the same country
    if (userPenpal.mailLocation === 'domestic') {
      matchQuery.country = userPenpal.country;
    }
    
    // Find potential matches that have at least one matching exchange type
    const userExchangeTypes = Object.entries(userPenpal.exchangeTypes)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);
    
    if (userExchangeTypes.length > 0) {
      // Create a query that checks if at least one exchange type matches
      const exchangeTypeQueries = userExchangeTypes.map(type => {
        return { [`exchangeTypes.${type}`]: true };
      });
      
      matchQuery.$or = exchangeTypeQueries;
    }
    
    console.log('Match query:', JSON.stringify(matchQuery, null, 2));
    
    // Log how many potential matches exist with our filters
    const potentialMatchCount = await PenpalModel.countDocuments(matchQuery);
    console.log(`Found ${potentialMatchCount} potential matches with filtering`);
    
    if (potentialMatchCount === 0) {
      return { success: false, error: 'No available matches found. Try again later or broaden your exchange preferences.' };
    }
    
    // Find potential matches with our filters
    let potentialMatches = await PenpalModel.find(matchQuery).limit(10);
    
    if (potentialMatches.length === 0) {
      return { success: false, error: 'No matches found. Try again later.' };
    }
    
    console.log(`Found ${potentialMatches.length} potential matches`);
    
    // Score each match based on shared interests and exchange types
    const scoredMatches = potentialMatches.map(match => {
      let score = 0;
      
      // Score based on shared exchange types
      userExchangeTypes.forEach(type => {
        if (match.exchangeTypes[type]) {
          score += 10; // +10 points for each shared exchange type
        }
      });
      
      // Simple interest matching (could be improved with NLP/keyword matching)
      const userInterests = userPenpal.interests.toLowerCase();
      const matchInterests = match.interests.toLowerCase();
      const interestKeywords = userInterests.split(/\s+/);
      
      interestKeywords.forEach(keyword => {
        if (keyword.length > 4 && matchInterests.includes(keyword)) {
          score += 5; // +5 points for each shared interest keyword
        }
      });
      
      return {
        match,
        score
      };
    });
    
    // Sort by score (highest first)
    scoredMatches.sort((a, b) => b.score - a.score);
    console.log(`Top match score: ${scoredMatches[0]?.score || 'No matches'}`);
    
    // Choose a random match from top 3 results to introduce variety
    const topMatches = scoredMatches.slice(0, Math.min(3, scoredMatches.length));
    const randomIndex = Math.floor(Math.random() * topMatches.length);
    const bestMatch = topMatches[randomIndex].match;
    
    // Record this match in the user's match history
    await recordMatch(userId, bestMatch._id.toString());
    
    // Format the exchange types for display
    const exchangeTypes = Object.entries(bestMatch.exchangeTypes)
      .filter(([, value]) => value)
      .map(([key]) => {
        // Convert camelCase to display format
        switch(key) {
          case 'friendBooks': return 'Friend Books';
          case 'artJournal': return 'Art Journal';
          case 'zine': return 'Zine';
          case 'letters': return 'Letters';
          case 'giftExchange': return 'Gift Exchange';
          default: return key;
        }
      });
    
    console.log(`Returning match with ${exchangeTypes.length} exchange types`);
    
    return {
      success: true,
      match: {
        id: bestMatch._id.toString(),
        name: bestMatch.name,
        streetAddress: bestMatch.streetAddress,
        city: bestMatch.city,
        state: bestMatch.state,
        zipCode: bestMatch.zipCode,
        country: bestMatch.country,
        interests: bestMatch.interests,
        discordHandle: bestMatch.discordHandle || '',
        exchangeTypes
      }
    };
  } catch (error) {
    console.error('Error finding penpal match:', error);
    return { 
      success: false, 
      error: 'An error occurred while finding a match.' 
    };
  }
}

/**
 * Deletes a penpal from the directory
 */
export async function deletePenpal(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();
    
    // Find and delete the penpal entry
    const result = await PenpalModel.findByIdAndDelete(userId);
    
    if (!result) {
      return { success: false, error: 'Entry not found' };
    }
    
    // Revalidate the directory path to update any cached data
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting penpal:', error);
    return { 
      success: false, 
      error: 'Failed to delete your information. Please try again.' 
    };
  }
}

/**
 * Gets list of previously matched user IDs
 */
async function getPreviousMatches(userId: string): Promise<string[]> {
  // Create match history collection if it doesn't exist
  if (!mongoose.models.MatchHistory) {
    mongoose.model('MatchHistory', new mongoose.Schema({
      userId: { type: String, required: true },
      matchedWith: { type: String, required: true },
      matchedAt: { type: Date, default: Date.now }
    }));
  }
  
  const MatchHistory = mongoose.models.MatchHistory;
  const matches = await MatchHistory.find({ userId });
  return matches.map(match => match.matchedWith);
}

/**
 * Records a match in the user's history
 */
async function recordMatch(userId: string, matchedWith: string): Promise<void> {
  // Create match history collection if it doesn't exist
  if (!mongoose.models.MatchHistory) {
    mongoose.model('MatchHistory', new mongoose.Schema({
      userId: { type: String, required: true },
      matchedWith: { type: String, required: true },
      matchedAt: { type: Date, default: Date.now }
    }));
  }
  
  const MatchHistory = mongoose.models.MatchHistory;
  await MatchHistory.create({
    userId,
    matchedWith,
    matchedAt: new Date()
  });
}