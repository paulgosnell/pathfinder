/**
 * Profile Completeness Calculation
 *
 * Determines how complete a user's discovery profile is based on:
 * - Parent/family information in user_profiles
 * - Child profiles in child_profiles
 * - Essential fields needed for personalized coaching
 */

import { supabase } from '@/lib/supabase/client';
import type { UserProfile, ChildProfile } from '@/lib/supabase/client';

export interface ProfileCompleteness {
  hasChildren: boolean;          // At least 1 child in child_profiles
  hasParentInfo: boolean;        // parent_name, family_context
  hasChildDetails: boolean;      // Child has age, challenges, strengths
  hasSchoolInfo: boolean;        // Child has school_type, grade_level
  hasTreatmentInfo: boolean;     // Child has medication_status or therapy_status

  completionPercentage: number;  // 0-100
  missingFields: string[];       // Human-readable list
  completedFields: string[];     // What we already have
}

/**
 * Calculate profile completeness for a user
 */
export async function calculateProfileCompleteness(userId: string): Promise<ProfileCompleteness> {
  const result: ProfileCompleteness = {
    hasChildren: false,
    hasParentInfo: false,
    hasChildDetails: false,
    hasSchoolInfo: false,
    hasTreatmentInfo: false,
    completionPercentage: 0,
    missingFields: [],
    completedFields: []
  };

  try {
    // Fetch user profile
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('parent_name, family_context, support_network')
      .eq('user_id', userId)
      .maybeSingle();

    if (userError) {
      console.error('[Profile Completeness] Error fetching user profile:', userError);
    }

    // Fetch child profiles
    const { data: children, error: childError } = await supabase
      .from('child_profiles')
      .select('*')
      .eq('user_id', userId);

    if (childError) {
      console.error('[Profile Completeness] Error fetching children:', childError);
    }

    // Check parent info
    if (userProfile?.parent_name || userProfile?.family_context) {
      result.hasParentInfo = true;
      result.completedFields.push('Parent information');
    } else {
      result.missingFields.push('Parent information');
    }

    // Check if has children
    if (children && children.length > 0) {
      result.hasChildren = true;
      result.completedFields.push('Child profiles');

      // Check child details for primary child (or first child)
      const primaryChild = children.find(c => c.is_primary) || children[0];

      if (primaryChild) {
        // Child basic details (age, challenges, strengths)
        if (
          primaryChild.child_age &&
          primaryChild.main_challenges &&
          primaryChild.main_challenges.length > 0 &&
          primaryChild.strengths &&
          primaryChild.strengths.length > 0
        ) {
          result.hasChildDetails = true;
          result.completedFields.push('Child details');
        } else {
          result.missingFields.push('Child age, challenges, or strengths');
        }

        // School info
        if (primaryChild.school_type || primaryChild.grade_level) {
          result.hasSchoolInfo = true;
          result.completedFields.push('School information');
        } else {
          result.missingFields.push('School information');
        }

        // Treatment info
        if (primaryChild.medication_status || primaryChild.therapy_status) {
          result.hasTreatmentInfo = true;
          result.completedFields.push('Treatment information');
        } else {
          result.missingFields.push('Treatment information');
        }
      }
    } else {
      result.missingFields.push('Child profiles');
    }

    // Calculate completion percentage
    // Weight each category equally (5 total)
    const categories = [
      result.hasParentInfo,
      result.hasChildren,
      result.hasChildDetails,
      result.hasSchoolInfo,
      result.hasTreatmentInfo
    ];

    const completedCount = categories.filter(Boolean).length;
    result.completionPercentage = Math.round((completedCount / categories.length) * 100);

    return result;
  } catch (error) {
    console.error('[Profile Completeness] Unexpected error:', error);
    return result;
  }
}

/**
 * Check if discovery is complete (100%)
 */
export async function isDiscoveryComplete(userId: string): Promise<boolean> {
  const completeness = await calculateProfileCompleteness(userId);
  return completeness.completionPercentage === 100;
}

/**
 * Get human-readable progress message
 */
export function getProgressMessage(completeness: ProfileCompleteness): string {
  if (completeness.completionPercentage === 0) {
    return "Start your discovery session to help me understand you and your child.";
  }

  if (completeness.completionPercentage === 100) {
    return "Discovery complete! I have all the information I need to support you.";
  }

  // Partial completion
  const remaining = completeness.missingFields.slice(0, 2).join(' and ');
  return `Discovery is ${completeness.completionPercentage}% complete. We still need: ${remaining}${completeness.missingFields.length > 2 ? ', and more' : ''}.`;
}
