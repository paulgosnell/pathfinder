'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { supabase } from '@/lib/supabase/client';
import type { ChildProfile } from '@/lib/supabase/client';
import AppHeader from '@/components/AppHeader';
import NavigationDrawer from '@/components/NavigationDrawer';
import MobileDeviceMockup from '@/components/MobileDeviceMockup';
import { ContentContainer } from '@/components/layouts/ContentContainer';
import { Card } from '@/components/layouts/Card';
import { Button } from '@/components/layouts/Button';
import { FormField } from '@/components/layouts/FormField';
import { SPACING, BORDER_RADIUS, SHADOWS } from '@/lib/styles/spacing';

interface UserProfile {
  parent_name?: string;
  family_context?: string;
  support_network?: string[];
  parent_photo_url?: string;
}

export default function FamilyPage() {
  const { user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [parentProfile, setParentProfile] = useState<UserProfile | null>(null);
  const [editingChild, setEditingChild] = useState<string | null>(null);
  const [showAddChild, setShowAddChild] = useState(false);

  // Load data on mount
  useEffect(() => {
    if (user) {
      loadFamilyData();
    }
  }, [user]);

  const loadFamilyData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load children
      const { data: childData, error: childError } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false });

      if (!childError && childData) {
        setChildren(childData);
      }

      // Load parent profile
      const { data: parentData, error: parentError } = await supabase
        .from('user_profiles')
        .select('parent_name, family_context, support_network, parent_photo_url')
        .eq('user_id', user.id)
        .single();

      if (!parentError && parentData) {
        setParentProfile(parentData);
      }
    } catch (error) {
      console.error('Error loading family data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunDiscovery = () => {
    window.location.href = '/chat?new=true&sessionType=discovery';
  };

  if (loading) {
    return (
      <MobileDeviceMockup>
        <div className="w-full h-full bg-white flex items-center justify-center">
          <div style={{ color: '#7F8FA6' }}>Loading...</div>
        </div>
      </MobileDeviceMockup>
    );
  }

  return (
    <MobileDeviceMockup>
      <div className="w-full h-full bg-white flex flex-col relative" style={{ overflow: 'hidden' }}>
        <NavigationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

        <AppHeader
          onMenuClick={() => setIsDrawerOpen(true)}
          title="My Family"
          subtitle={children.length === 0 ? "Tell us about your family" : `${children.length} ${children.length === 1 ? 'child' : 'children'}`}
        />

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto" style={{
          backgroundColor: '#F9F7F3',
          marginTop: SPACING.contentTopMargin
        }}>
          <ContentContainer>

            {/* Empty State - No Children Yet */}
            {children.length === 0 && (
              <>
                <Card title="Get Started" padding="large">
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #D7CDEC 0%, #B7D3D8 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 24px',
                      fontSize: '36px'
                    }}>
                      👨‍👩‍👧‍👦
                    </div>

                    <h2 style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#2C3E50',
                      marginBottom: '12px',
                      lineHeight: 1.3
                    }}>
                      Welcome to Pathfinder
                    </h2>

                    <p style={{
                      fontSize: '15px',
                      color: '#586C8E',
                      lineHeight: 1.6,
                      marginBottom: '24px'
                    }}>
                      Let's get to know your family. Run a Discovery session to share details about your children,
                      their challenges, and what you've already tried.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <Button onClick={() => setShowAddChild(true)} variant="primary">
                        + Add Child Manually
                      </Button>

                      <Button onClick={handleRunDiscovery} variant="secondary">
                        Start Discovery Session
                      </Button>
                    </div>

                    <p style={{
                      fontSize: '13px',
                      color: '#7F8FA6',
                      marginTop: '16px',
                      marginBottom: 0,
                      lineHeight: 1.5,
                      textAlign: 'center'
                    }}>
                      Add a child profile manually or run a Discovery session to gather information through conversation.
                    </p>
                  </div>
                </Card>

                {/* Manual Add Child Form (Empty State) */}
                {showAddChild && (
                  <AddEditChildForm
                    userId={user?.id || ''}
                    onSave={() => {
                      setShowAddChild(false);
                      loadFamilyData();
                    }}
                    onCancel={() => setShowAddChild(false)}
                  />
                )}

                <Card title="What We'll Learn" padding="large">
                  <div style={{ padding: '0 8px' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {[
                        { icon: '👶', text: 'Each child\'s age and diagnosis status' },
                        { icon: '⚡', text: 'Main challenges and triggers' },
                        { icon: '🌟', text: 'Strengths, interests, and what motivates them' },
                        { icon: '🏫', text: 'School situation and support services' },
                        { icon: '💊', text: 'Medication and therapy details' },
                        { icon: '📝', text: 'What strategies you\'ve already tried' }
                      ].map((item, idx) => (
                        <li key={idx} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          marginBottom: idx === 5 ? '0' : '16px',
                          gap: '12px'
                        }}>
                          <span style={{ fontSize: '20px', flexShrink: 0 }}>{item.icon}</span>
                          <span style={{
                            fontSize: '14px',
                            color: '#586C8E',
                            lineHeight: 1.6,
                            paddingTop: '2px'
                          }}>
                            {item.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </>
            )}

            {/* Has Children - Show Profiles */}
            {children.length > 0 && (
              <>
                {/* Parent/Family Overview Card */}
                <Card title="Family Overview" padding="large">
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                    {/* Parent Photo */}
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: parentProfile?.parent_photo_url
                        ? `url(${parentProfile.parent_photo_url}) center/cover`
                        : 'linear-gradient(135deg, #D7CDEC 0%, #B7D3D8 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                      flexShrink: 0,
                      boxShadow: SHADOWS.card
                    }}>
                      {!parentProfile?.parent_photo_url && '👤'}
                    </div>

                    {/* Parent Info */}
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#2A3F5A',
                        margin: '0 0 4px 0'
                      }}>
                        {parentProfile?.parent_name || 'Parent'}
                      </h3>
                      <p style={{
                        fontSize: '13px',
                        color: '#7F8FA6',
                        margin: 0,
                        lineHeight: 1.5
                      }}>
                        {parentProfile?.family_context || 'No family context provided yet'}
                      </p>
                    </div>
                  </div>

                  {parentProfile?.support_network && parentProfile.support_network.length > 0 && (
                    <div style={{
                      padding: '12px',
                      background: 'rgba(215, 205, 236, 0.1)',
                      borderRadius: BORDER_RADIUS.medium,
                      border: '1px solid rgba(215, 205, 236, 0.3)'
                    }}>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#7F8FA6',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Support Network
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {parentProfile.support_network.map((support, idx) => (
                          <span key={idx} style={{
                            padding: '4px 10px',
                            background: 'white',
                            borderRadius: BORDER_RADIUS.small,
                            fontSize: '13px',
                            color: '#586C8E',
                            border: '1px solid rgba(215, 205, 236, 0.3)'
                          }}>
                            {support}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                {/* Children Cards */}
                {children.map((child) => (
                  editingChild === child.id ? (
                    <AddEditChildForm
                      key={child.id}
                      child={child}
                      userId={user!.id}
                      onSave={() => {
                        setEditingChild(null);
                        loadFamilyData();
                      }}
                      onCancel={() => setEditingChild(null)}
                    />
                  ) : (
                    <ChildProfileCard
                      key={child.id}
                      child={child}
                      isEditing={false}
                      onEdit={() => setEditingChild(child.id)}
                      onSave={() => {}}
                      onCancel={() => {}}
                    />
                  )
                ))}

                {/* Add Another Child Options */}
                {!showAddChild && (
                  <Card padding="large">
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#2A3F5A',
                      marginTop: 0,
                      marginBottom: '16px'
                    }}>
                      Add Another Child
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <Button onClick={() => setShowAddChild(true)} variant="primary">
                        + Add Child Manually
                      </Button>

                      <Button onClick={handleRunDiscovery} variant="secondary">
                        Run Discovery Session
                      </Button>
                    </div>

                    <p style={{
                      fontSize: '13px',
                      color: '#7F8FA6',
                      marginTop: '12px',
                      marginBottom: 0,
                      lineHeight: 1.5
                    }}>
                      Add a child profile manually or run a Discovery session to gather information through conversation.
                    </p>
                  </Card>
                )}

                {/* Manual Add Child Form */}
                {showAddChild && (
                  <AddEditChildForm
                    onSave={() => {
                      setShowAddChild(false);
                      loadFamilyData();
                    }}
                    onCancel={() => setShowAddChild(false)}
                    userId={user?.id || ''}
                  />
                )}
              </>
            )}

            {/* Privacy Note */}
            <p style={{
              fontSize: '12px',
              color: '#7F8FA6',
              textAlign: 'center',
              margin: 0,
              lineHeight: 1.5,
              padding: '0 20px'
            }}>
              All information is stored securely and used only to provide personalized coaching support.
            </p>

          </ContentContainer>
        </div>
      </div>
    </MobileDeviceMockup>
  );
}

// Child Profile Card Component
function ChildProfileCard({
  child,
  isEditing,
  onEdit,
  onSave,
  onCancel
}: {
  child: ChildProfile;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <Card padding="large">
      {/* Header with Photo and Name */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
        {/* Child Photo */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: child.photo_url
            ? `url(${child.photo_url}) center/cover`
            : 'linear-gradient(135deg, #FFE5B4 0%, #FFD700 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          flexShrink: 0,
          boxShadow: SHADOWS.card,
          position: 'relative'
        }}>
          {!child.photo_url && '👦'}
          {child.is_primary && (
            <div style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #D7CDEC 0%, #B7D3D8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              border: '2px solid white',
              boxShadow: SHADOWS.button
            }}>
              ⭐
            </div>
          )}
        </div>

        {/* Child Name and Age */}
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#2A3F5A',
            margin: '0 0 4px 0'
          }}>
            {child.child_name}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '13px', color: '#7F8FA6' }}>
              {child.child_age ? `${child.child_age} years old` : child.child_age_range || 'Age not specified'}
            </span>
            {child.diagnosis_status && (
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: child.diagnosis_status === 'diagnosed' ? '#4A9E5F' : '#7F8FA6',
                textTransform: 'capitalize'
              }}>
                {child.diagnosis_status.replace('-', ' ')}
              </span>
            )}
          </div>
        </div>

        {/* Edit Button */}
        {!isEditing && (
          <button
            onClick={onEdit}
            style={{
              background: 'transparent',
              border: '1px solid rgba(215, 205, 236, 0.3)',
              borderRadius: BORDER_RADIUS.small,
              padding: '8px 12px',
              color: '#7F8FA6',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Edit
          </button>
        )}
      </div>

      {/* Main Challenges */}
      {child.main_challenges && child.main_challenges.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#7F8FA6',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Main Challenges
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {child.main_challenges.map((challenge, idx) => (
              <span key={idx} style={{
                padding: '6px 12px',
                background: 'rgba(255, 200, 200, 0.15)',
                borderRadius: BORDER_RADIUS.small,
                fontSize: '13px',
                color: '#C44569',
                border: '1px solid rgba(196, 69, 105, 0.2)'
              }}>
                {challenge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {child.strengths && child.strengths.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#7F8FA6',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Strengths
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {child.strengths.map((strength, idx) => (
              <span key={idx} style={{
                padding: '6px 12px',
                background: 'rgba(74, 158, 95, 0.15)',
                borderRadius: BORDER_RADIUS.small,
                fontSize: '13px',
                color: '#4A9E5F',
                border: '1px solid rgba(74, 158, 95, 0.2)'
              }}>
                {strength}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* School Info */}
      {(child.school_type || child.grade_level || child.has_iep || child.has_504_plan) && (
        <div style={{
          padding: '12px',
          background: 'rgba(183, 211, 216, 0.1)',
          borderRadius: BORDER_RADIUS.medium,
          border: '1px solid rgba(183, 211, 216, 0.3)',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#7F8FA6', marginBottom: '6px' }}>
            🏫 School
          </div>
          <div style={{ fontSize: '13px', color: '#586C8E', lineHeight: 1.6 }}>
            {child.grade_level && <div>Grade {child.grade_level}</div>}
            {child.school_type && <div style={{ textTransform: 'capitalize' }}>{child.school_type} school</div>}
            {(child.has_iep || child.has_504_plan) && (
              <div style={{ marginTop: '4px', fontWeight: 600, color: '#4A9E5F' }}>
                {child.has_iep && 'Has IEP'}
                {child.has_iep && child.has_504_plan && ' • '}
                {child.has_504_plan && 'Has 504 Plan'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Treatment Info */}
      {(child.medication_status || child.therapy_status) && (
        <div style={{
          padding: '12px',
          background: 'rgba(215, 205, 236, 0.1)',
          borderRadius: BORDER_RADIUS.medium,
          border: '1px solid rgba(215, 205, 236, 0.3)',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#7F8FA6', marginBottom: '6px' }}>
            💊 Treatment
          </div>
          <div style={{ fontSize: '13px', color: '#586C8E', lineHeight: 1.6 }}>
            {child.medication_status && <div>Medication: {child.medication_status}</div>}
            {child.therapy_status && <div>Therapy: {child.therapy_status}</div>}
          </div>
        </div>
      )}

      {/* Strategy Summary */}
      {((child.successful_strategies && child.successful_strategies.length > 0) ||
        (child.failed_strategies && child.failed_strategies.length > 0)) && (
        <div style={{
          padding: '12px',
          background: 'rgba(215, 205, 236, 0.05)',
          borderRadius: BORDER_RADIUS.medium,
          border: '1px solid rgba(215, 205, 236, 0.2)'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#7F8FA6', marginBottom: '8px' }}>
            📝 Strategy History
          </div>
          {child.successful_strategies && child.successful_strategies.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', color: '#4A9E5F', fontWeight: 600, marginBottom: '4px' }}>
                ✓ What Worked ({child.successful_strategies.length})
              </div>
              <div style={{ fontSize: '12px', color: '#586C8E' }}>
                {child.successful_strategies.slice(0, 3).join(' • ')}
                {child.successful_strategies.length > 3 && ` • +${child.successful_strategies.length - 3} more`}
              </div>
            </div>
          )}
          {child.failed_strategies && child.failed_strategies.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', color: '#C44569', fontWeight: 600, marginBottom: '4px' }}>
                ✗ Didn't Work ({child.failed_strategies.length})
              </div>
              <div style={{ fontSize: '12px', color: '#586C8E' }}>
                {child.failed_strategies.slice(0, 3).join(' • ')}
                {child.failed_strategies.length > 3 && ` • +${child.failed_strategies.length - 3} more`}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// Add/Edit Child Form Component
function AddEditChildForm({
  child,
  userId,
  onSave,
  onCancel
}: {
  child?: ChildProfile;
  userId: string;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    child_name: child?.child_name || '',
    child_age: child?.child_age?.toString() || '',
    diagnosis_status: child?.diagnosis_status || 'exploring',
    diagnosis_details: child?.diagnosis_details || '',
    main_challenges: child?.main_challenges?.join(', ') || '',
    strengths: child?.strengths?.join(', ') || '',
    interests: child?.interests?.join(', ') || '',
    school_type: child?.school_type || '',
    grade_level: child?.grade_level || '',
    has_iep: child?.has_iep || false,
    has_504_plan: child?.has_504_plan || false,
    medication_status: child?.medication_status || '',
    therapy_status: child?.therapy_status || '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!formData.child_name.trim()) {
      setError("Child's name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const childData = {
        user_id: userId,
        child_name: formData.child_name.trim(),
        child_age: formData.child_age ? parseInt(formData.child_age) : null,
        diagnosis_status: formData.diagnosis_status,
        diagnosis_details: formData.diagnosis_details.trim() || null,
        main_challenges: formData.main_challenges
          ? formData.main_challenges.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        strengths: formData.strengths
          ? formData.strengths.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        interests: formData.interests
          ? formData.interests.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        school_type: formData.school_type.trim() || null,
        grade_level: formData.grade_level.trim() || null,
        has_iep: formData.has_iep,
        has_504_plan: formData.has_504_plan,
        medication_status: formData.medication_status.trim() || null,
        therapy_status: formData.therapy_status.trim() || null,
        profile_complete: true,
        is_primary: child?.is_primary || false,
      };

      if (child?.id) {
        // Update existing child
        const { error: updateError } = await supabase
          .from('child_profiles')
          .update(childData)
          .eq('id', child.id);

        if (updateError) throw updateError;
      } else {
        // Create new child
        const { error: insertError } = await supabase
          .from('child_profiles')
          .insert(childData);

        if (insertError) throw insertError;
      }

      onSave();
    } catch (err) {
      console.error('Error saving child profile:', err);
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title={child ? `Edit ${child.child_name}` : 'Add Child'} padding="large">
      {error && (
        <div style={{
          padding: '12px',
          background: 'rgba(230, 168, 151, 0.1)',
          border: '1px solid rgba(230, 168, 151, 0.3)',
          borderRadius: BORDER_RADIUS.medium,
          marginBottom: '16px',
          color: '#E6A897',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#7F8FA6',
          marginTop: 0,
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Basic Information
        </h4>

        <FormField
          label="Child's Name"
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
            onChange={(e) => setFormData({ ...formData, diagnosis_status: e.target.value as any })}
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
            <option value="diagnosed">Diagnosed</option>
            <option value="suspected">Suspected</option>
            <option value="exploring">Exploring</option>
            <option value="not-adhd">Not ADHD</option>
          </select>
        </div>

        <FormField
          label="Diagnosis Details (optional)"
          value={formData.diagnosis_details}
          onChange={(e) => setFormData({ ...formData, diagnosis_details: e.target.value })}
          placeholder="When diagnosed, by whom, subtype, comorbidities"
        />
      </div>

      {/* Challenges & Strengths */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#7F8FA6',
          marginTop: 0,
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Challenges & Strengths
        </h4>

        <FormField
          label="Main Challenges (comma-separated)"
          value={formData.main_challenges}
          onChange={(e) => setFormData({ ...formData, main_challenges: e.target.value })}
          placeholder="homework refusal, emotional dysregulation"
        />

        <FormField
          label="Strengths (comma-separated)"
          value={formData.strengths}
          onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
          placeholder="creative, empathetic, loves building"
        />

        <FormField
          label="Interests (comma-separated)"
          value={formData.interests}
          onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
          placeholder="Lego, dinosaurs, drawing"
        />
      </div>

      {/* School */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#7F8FA6',
          marginTop: 0,
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          School
        </h4>

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
            School Type
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
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="charter">Charter</option>
            <option value="homeschool">Homeschool</option>
          </select>
        </div>

        <FormField
          label="Grade Level (optional)"
          value={formData.grade_level}
          onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
          placeholder="2"
        />

        <div style={{ marginBottom: SPACING.formFieldGap }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            color: '#586C8E',
            cursor: 'pointer',
            marginBottom: '8px'
          }}>
            <input
              type="checkbox"
              checked={formData.has_iep}
              onChange={(e) => setFormData({ ...formData, has_iep: e.target.checked })}
              style={{ marginRight: '8px' }}
            />
            Has IEP
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            color: '#586C8E',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={formData.has_504_plan}
              onChange={(e) => setFormData({ ...formData, has_504_plan: e.target.checked })}
              style={{ marginRight: '8px' }}
            />
            Has 504 Plan
          </label>
        </div>
      </div>

      {/* Treatment */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#7F8FA6',
          marginTop: 0,
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Treatment
        </h4>

        <FormField
          label="Medication (optional)"
          value={formData.medication_status}
          onChange={(e) => setFormData({ ...formData, medication_status: e.target.value })}
          placeholder="Concerta 18mg, started 6 months ago"
        />

        <FormField
          label="Therapy (optional)"
          value={formData.therapy_status}
          onChange={(e) => setFormData({ ...formData, therapy_status: e.target.value })}
          placeholder="Weekly behavioral therapy with Dr. Smith"
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <Button onClick={handleSave} disabled={saving} variant="primary">
          {saving ? 'Saving...' : (child ? 'Save Changes' : 'Add Child')}
        </Button>
        <Button onClick={onCancel} disabled={saving} variant="secondary">
          Cancel
        </Button>
      </div>
    </Card>
  );
}
