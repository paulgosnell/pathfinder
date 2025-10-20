'use client';

import { Dispatch, SetStateAction } from 'react';
import { FormField } from '@/components/layouts/FormField';
import { SPACING, BORDER_RADIUS } from '@/lib/styles/spacing';

export interface ChildFormData {
  child_name: string;
  child_age: string;
  diagnosis_status: 'diagnosed' | 'suspected' | 'exploring' | 'not-adhd';
  diagnosis_details: string;
  main_challenges: string;
  strengths: string;
  interests: string;
  school_type: string;
  grade_level: string;
  has_iep: boolean;
  has_504_plan: boolean;
  medication_status: string;
  therapy_status: string;
}

interface StepProps {
  formData: ChildFormData;
  setFormData: Dispatch<SetStateAction<ChildFormData>>;
}

// Step 1: Basic Information
export function BasicInfoStep({ formData, setFormData }: StepProps) {
  return (
    <div>
      <div style={{
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFE5B4 0%, #FFD700 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          margin: '0 auto 16px'
        }}>
          👦
        </div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#2A3F5A',
          margin: '0 0 8px 0'
        }}>
          Let's start with the basics
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#7F8FA6',
          lineHeight: 1.5,
          margin: 0
        }}>
          Tell us about your child. Only their name is required.
        </p>
      </div>

      <FormField
        label="Child's Name *"
        value={formData.child_name}
        onChange={(e) => setFormData({ ...formData, child_name: e.target.value })}
        placeholder="Enter name"
      />

      <FormField
        label="Age (years)"
        type="number"
        value={formData.child_age}
        onChange={(e) => setFormData({ ...formData, child_age: e.target.value })}
        placeholder="7"
      />

      <div style={{ marginBottom: SPACING.formFieldGap }}>
        <label style={{
          display: 'block',
          fontSize: '12px',
          fontWeight: 700,
          color: '#586C8E',
          marginBottom: SPACING.labelMargin,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          Diagnosis Status
        </label>
        <select
          value={formData.diagnosis_status}
          onChange={(e) => setFormData({ ...formData, diagnosis_status: e.target.value as ChildFormData['diagnosis_status'] })}
          style={{
            width: '100%',
            padding: '14px 18px',
            fontSize: '16px',
            borderRadius: BORDER_RADIUS.medium,
            border: '2px solid #E3EADD',
            outline: 'none',
            color: '#2A3F5A',
            boxSizing: 'border-box',
            background: 'white'
          }}
        >
          <option value="diagnosed">Diagnosed with ADHD</option>
          <option value="suspected">Suspected ADHD</option>
          <option value="exploring">Exploring/Evaluating</option>
          <option value="not-adhd">Not ADHD</option>
        </select>
      </div>

      <FormField
        label="Diagnosis Details (optional)"
        value={formData.diagnosis_details}
        onChange={(e) => setFormData({ ...formData, diagnosis_details: e.target.value })}
        placeholder="When diagnosed, by whom, subtype, comorbidities"
      />

      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: 'rgba(183, 211, 216, 0.1)',
        borderRadius: BORDER_RADIUS.medium,
        border: '1px solid rgba(183, 211, 216, 0.3)'
      }}>
        <p style={{
          fontSize: '13px',
          color: '#586C8E',
          lineHeight: 1.5,
          margin: 0
        }}>
          💡 This information helps us provide personalized coaching and relevant strategies.
        </p>
      </div>
    </div>
  );
}

// Step 2: Challenges & Strengths
export function ChallengesStrengthsStep({ formData, setFormData }: StepProps) {
  return (
    <div>
      <div style={{
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '40px',
          marginBottom: '12px'
        }}>
          ⚡🌟
        </div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#2A3F5A',
          margin: '0 0 8px 0'
        }}>
          Challenges and Strengths
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#7F8FA6',
          lineHeight: 1.5,
          margin: 0
        }}>
          What are the main struggles? And what makes them shine?
        </p>
      </div>

      <FormField
        label="Main Challenges (optional)"
        value={formData.main_challenges}
        onChange={(e) => setFormData({ ...formData, main_challenges: e.target.value })}
        placeholder="homework refusal, emotional dysregulation"
      />

      <div style={{
        fontSize: '12px',
        color: '#7F8FA6',
        marginBottom: '16px',
        marginTop: '-8px'
      }}>
        Separate multiple items with commas
      </div>

      <FormField
        label="Strengths (optional)"
        value={formData.strengths}
        onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
        placeholder="creative, empathetic, loves building"
      />

      <div style={{
        fontSize: '12px',
        color: '#7F8FA6',
        marginBottom: '16px',
        marginTop: '-8px'
      }}>
        What are they good at? What do others praise them for?
      </div>

      <FormField
        label="Interests (optional)"
        value={formData.interests}
        onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
        placeholder="Lego, dinosaurs, drawing"
      />

      <div style={{
        fontSize: '12px',
        color: '#7F8FA6',
        marginBottom: '16px',
        marginTop: '-8px'
      }}>
        What could they talk about for hours?
      </div>

      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: 'rgba(215, 205, 236, 0.1)',
        borderRadius: BORDER_RADIUS.medium,
        border: '1px solid rgba(215, 205, 236, 0.3)'
      }}>
        <p style={{
          fontSize: '13px',
          color: '#586C8E',
          lineHeight: 1.5,
          margin: 0
        }}>
          💡 Understanding strengths helps us build strategies that leverage what already works.
        </p>
      </div>
    </div>
  );
}

// Step 3: School
export function SchoolStep({ formData, setFormData }: StepProps) {
  return (
    <div>
      <div style={{
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '40px',
          marginBottom: '12px'
        }}>
          🏫
        </div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#2A3F5A',
          margin: '0 0 8px 0'
        }}>
          School Information
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#7F8FA6',
          lineHeight: 1.5,
          margin: 0
        }}>
          Tell us about their school setup and support.
        </p>
      </div>

      <div style={{ marginBottom: SPACING.formFieldGap }}>
        <label style={{
          display: 'block',
          fontSize: '12px',
          fontWeight: 700,
          color: '#586C8E',
          marginBottom: SPACING.labelMargin,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          School Type (optional)
        </label>
        <select
          value={formData.school_type}
          onChange={(e) => setFormData({ ...formData, school_type: e.target.value })}
          style={{
            width: '100%',
            padding: '14px 18px',
            fontSize: '16px',
            borderRadius: BORDER_RADIUS.medium,
            border: '2px solid #E3EADD',
            outline: 'none',
            color: '#2A3F5A',
            boxSizing: 'border-box',
            background: 'white'
          }}
        >
          <option value="">Select...</option>
          <option value="public">Public School</option>
          <option value="private">Private School</option>
          <option value="charter">Charter School</option>
          <option value="homeschool">Homeschool</option>
        </select>
      </div>

      <FormField
        label="Grade Level (optional)"
        value={formData.grade_level}
        onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
        placeholder="2"
      />

      <div style={{
        marginTop: '20px',
        marginBottom: '20px',
        padding: '16px',
        background: 'rgba(183, 211, 216, 0.1)',
        borderRadius: BORDER_RADIUS.medium,
        border: '1px solid rgba(183, 211, 216, 0.3)'
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: 600,
          color: '#586C8E',
          marginBottom: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          School Support Plans
        </div>

        <label style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '14px',
          color: '#586C8E',
          cursor: 'pointer',
          marginBottom: '12px',
          padding: '8px 0'
        }}>
          <input
            type="checkbox"
            checked={formData.has_iep}
            onChange={(e) => setFormData({ ...formData, has_iep: e.target.checked })}
            style={{
              marginRight: '12px',
              width: '20px',
              height: '20px',
              cursor: 'pointer'
            }}
          />
          <span style={{ fontWeight: 500 }}>Has IEP (Individualized Education Program)</span>
        </label>

        <label style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '14px',
          color: '#586C8E',
          cursor: 'pointer',
          padding: '8px 0'
        }}>
          <input
            type="checkbox"
            checked={formData.has_504_plan}
            onChange={(e) => setFormData({ ...formData, has_504_plan: e.target.checked })}
            style={{
              marginRight: '12px',
              width: '20px',
              height: '20px',
              cursor: 'pointer'
            }}
          />
          <span style={{ fontWeight: 500 }}>Has 504 Plan</span>
        </label>
      </div>

      <div style={{
        padding: '12px',
        background: 'rgba(215, 205, 236, 0.1)',
        borderRadius: BORDER_RADIUS.medium,
        border: '1px solid rgba(215, 205, 236, 0.3)'
      }}>
        <p style={{
          fontSize: '13px',
          color: '#586C8E',
          lineHeight: 1.5,
          margin: 0
        }}>
          💡 School accommodations help us understand what's already in place and what additional strategies might help.
        </p>
      </div>
    </div>
  );
}

// Step 4: Treatment
export function TreatmentStep({ formData, setFormData }: StepProps) {
  return (
    <div>
      <div style={{
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '40px',
          marginBottom: '12px'
        }}>
          💊
        </div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#2A3F5A',
          margin: '0 0 8px 0'
        }}>
          Treatment Information
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#7F8FA6',
          lineHeight: 1.5,
          margin: 0
        }}>
          Are they currently receiving any treatment? This is completely optional.
        </p>
      </div>

      <FormField
        label="Medication (optional)"
        value={formData.medication_status}
        onChange={(e) => setFormData({ ...formData, medication_status: e.target.value })}
        placeholder="Concerta 18mg, started 6 months ago"
      />

      <div style={{
        fontSize: '12px',
        color: '#7F8FA6',
        marginBottom: '16px',
        marginTop: '-8px'
      }}>
        Include medication name, dosage, and when they started
      </div>

      <FormField
        label="Therapy (optional)"
        value={formData.therapy_status}
        onChange={(e) => setFormData({ ...formData, therapy_status: e.target.value })}
        placeholder="Weekly behavioral therapy with Dr. Smith"
      />

      <div style={{
        fontSize: '12px',
        color: '#7F8FA6',
        marginBottom: '16px',
        marginTop: '-8px'
      }}>
        Type of therapy, frequency, provider name
      </div>

      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: 'rgba(183, 211, 216, 0.1)',
        borderRadius: BORDER_RADIUS.medium,
        border: '1px solid rgba(183, 211, 216, 0.3)'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#2A3F5A',
          marginBottom: '8px'
        }}>
          Almost done!
        </div>
        <p style={{
          fontSize: '13px',
          color: '#586C8E',
          lineHeight: 1.6,
          margin: 0
        }}>
          This information helps us provide comprehensive support that complements any treatments they're receiving.
          Click "Save" to add this profile.
        </p>
      </div>

      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(215, 205, 236, 0.1)',
        borderRadius: BORDER_RADIUS.medium,
        border: '1px solid rgba(215, 205, 236, 0.3)'
      }}>
        <p style={{
          fontSize: '12px',
          color: '#7F8FA6',
          lineHeight: 1.5,
          margin: 0,
          textAlign: 'center'
        }}>
          🔒 All information is stored securely and only used to provide personalized coaching support.
        </p>
      </div>
    </div>
  );
}
