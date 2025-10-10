import ProtectedRoute from '@/components/ProtectedRoute';
import { ElevenLabsVoiceAssistant } from '@/components/ElevenLabsVoiceAssistant';

export const metadata = {
  title: 'Voice Coaching V2 | ADHD Support',
  description: 'Voice-based ADHD parent coaching powered by ElevenLabs',
};

// Force dynamic rendering since this uses authentication
export const dynamic = 'force-dynamic';

export default function VoiceV2Page() {
  return (
    <ProtectedRoute>
      <ElevenLabsVoiceAssistant />
    </ProtectedRoute>
  );
}
