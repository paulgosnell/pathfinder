import { supabase } from '@/lib/supabase/client';
import { addYears } from 'date-fns';

export class GDPRManager {
  async recordConsent(userId: string, consentData: any) {
    const { error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        consent_given: true,
        consent_timestamp: new Date().toISOString(),
        consent_details: consentData,
        gdpr_delete_at: addYears(new Date(), 2).toISOString() // 2-year retention
      });

    if (error) throw error;
  }

  async scheduleDataDeletion(userId: string, deletionDate?: Date) {
    const deleteAt = deletionDate || addYears(new Date(), 2);
    
    const { error } = await supabase
      .from('users')
      .update({ gdpr_delete_at: deleteAt.toISOString() })
      .eq('id', userId);

    if (error) throw error;
  }

  async executeDataDeletion(userId: string) {
    // Delete in reverse dependency order
    const tables = [
      'agent_conversations',
      'agent_sessions', 
      'strategy_usage',
      'users'
    ];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error(`Failed to delete from ${table}:`, error);
        throw error;
      }
    }
  }

  async processScheduledDeletions() {
    const { data: usersToDelete } = await supabase
      .from('users')
      .select('id')
      .lt('gdpr_delete_at', new Date().toISOString());

    if (usersToDelete) {
      for (const user of usersToDelete) {
        await this.executeDataDeletion(user.id);
      }
    }
  }
}

export const gdprManager = new GDPRManager();