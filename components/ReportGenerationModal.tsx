'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, CheckSquare, Square } from 'lucide-react';
import { supabase, type ChildProfile } from '@/lib/supabase/client';
import { type ReportType } from '@/lib/database/reports';
import { BORDER_RADIUS, SHADOWS } from '@/lib/styles/spacing';

interface ReportGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: ReportType;
  onSuccess: () => void;
}

export function ReportGenerationModal({ isOpen, onClose, reportType, onSuccess }: ReportGenerationModalProps) {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [includeCheckins, setIncludeCheckins] = useState(true);
  const [includeSessions, setIncludeSessions] = useState(true);
  const [includeStrategies, setIncludeStrategies] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load child profiles on mount
  useEffect(() => {
    async function loadChildren() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false });

      if (data) {
        setChildren(data);
        // Auto-select primary child (or first child)
        if (data.length > 0) {
          setSelectedChildId(data[0].id);
        }
      }
    }

    if (isOpen) {
      loadChildren();
      // Set default date range (last 30 days)
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      setEndDate(end.toISOString().split('T')[0]);
      setStartDate(start.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!selectedChildId || !startDate || !endDate) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_type: reportType,
          child_id: selectedChildId,
          start_date: startDate,
          end_date: endDate,
          title: reportTitle || undefined,
          sections: {
            include_checkins: includeCheckins,
            include_sessions: includeSessions,
            include_strategies: includeStrategies
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate report');
      }

      // Success!
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const reportTypeLabels: Record<ReportType, string> = {
    monthly_progress: 'Monthly Progress Report',
    strategy_effectiveness: 'Strategy Effectiveness Report',
    assessment_history: 'Assessment History Report',
    comprehensive: 'Comprehensive Report'
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(42, 63, 90, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: BORDER_RADIUS.large,
          boxShadow: '0 8px 32px rgba(42, 63, 90, 0.2)',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(215, 205, 236, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{
            fontFamily: 'Quicksand, sans-serif',
            fontSize: '20px',
            fontWeight: 600,
            color: '#2A3F5A',
            margin: 0
          }}>
            {reportTypeLabels[reportType]}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: '#586C8E'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Child Selection */}
          <div>
            <label style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '14px',
              color: '#2A3F5A',
              marginBottom: '8px'
            }}>
              Select Child *
            </label>
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: BORDER_RADIUS.small,
                border: '1px solid rgba(215, 205, 236, 0.4)',
                fontSize: '14px',
                color: '#2A3F5A',
                backgroundColor: 'white'
              }}
            >
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.child_name} {child.is_primary && '(Primary)'}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '14px',
              color: '#2A3F5A',
              marginBottom: '8px'
            }}>
              Date Range *
            </label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: BORDER_RADIUS.small,
                  border: '1px solid rgba(215, 205, 236, 0.4)',
                  fontSize: '14px',
                  color: '#2A3F5A'
                }}
              />
              <span style={{ color: '#586C8E' }}>to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: BORDER_RADIUS.small,
                  border: '1px solid rgba(215, 205, 236, 0.4)',
                  fontSize: '14px',
                  color: '#2A3F5A'
                }}
              />
            </div>
          </div>

          {/* Report Title (Optional) */}
          <div>
            <label style={{
              display: 'block',
              fontWeight: 600,
              fontSize: '14px',
              color: '#2A3F5A',
              marginBottom: '8px'
            }}>
              Custom Title (Optional)
            </label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder="Leave blank for auto-generated title"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: BORDER_RADIUS.small,
                border: '1px solid rgba(215, 205, 236, 0.4)',
                fontSize: '14px',
                color: '#2A3F5A'
              }}
            />
          </div>

          {/* Sections to Include (only for certain report types) */}
          {(reportType === 'monthly_progress' || reportType === 'comprehensive') && (
            <div>
              <label style={{
                display: 'block',
                fontWeight: 600,
                fontSize: '14px',
                color: '#2A3F5A',
                marginBottom: '8px'
              }}>
                Include Sections
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <CheckboxOption
                  checked={includeCheckins}
                  onChange={setIncludeCheckins}
                  label="Daily Check-ins"
                />
                <CheckboxOption
                  checked={includeSessions}
                  onChange={setIncludeSessions}
                  label="Coaching Sessions"
                />
                <CheckboxOption
                  checked={includeStrategies}
                  onChange={setIncludeStrategies}
                  label="Strategies & Interventions"
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '12px',
              borderRadius: BORDER_RADIUS.small,
              backgroundColor: 'rgba(230, 168, 151, 0.1)',
              border: '1px solid rgba(230, 168, 151, 0.3)',
              color: '#E6A897',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px',
          borderTop: '1px solid rgba(215, 205, 236, 0.3)',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '12px 24px',
              borderRadius: BORDER_RADIUS.small,
              border: '1px solid rgba(215, 205, 236, 0.4)',
              backgroundColor: 'white',
              color: '#586C8E',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || !selectedChildId || !startDate || !endDate}
            style={{
              padding: '12px 24px',
              borderRadius: BORDER_RADIUS.small,
              border: 'none',
              backgroundColor: loading || !selectedChildId || !startDate || !endDate
                ? '#B7D3D8'
                : '#2A3F5A',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading || !selectedChildId || !startDate || !endDate
                ? 'not-allowed'
                : 'pointer'
            }}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Checkbox Component
interface CheckboxOptionProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

function CheckboxOption({ checked, onChange, label }: CheckboxOptionProps) {
  return (
    <label style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      userSelect: 'none'
    }}>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          color: checked ? '#2A3F5A' : '#7F8FA6'
        }}
      >
        {checked ? <CheckSquare size={20} /> : <Square size={20} />}
      </button>
      <span style={{
        fontSize: '14px',
        color: '#2A3F5A'
      }}>
        {label}
      </span>
    </label>
  );
}
