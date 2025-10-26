'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Share2, TrendingUp, ClipboardList, Calendar, FileBarChart } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import AppHeader from '@/components/AppHeader';
import NavigationDrawer from '@/components/NavigationDrawer';
import MobileDeviceMockup from '@/components/MobileDeviceMockup';
import { ContentContainer } from '@/components/layouts/ContentContainer';
import { Card } from '@/components/layouts/Card';
import { Button } from '@/components/layouts/Button';
import { getUserReports, type GeneratedReport, type ReportType } from '@/lib/database/reports';
import { SPACING, BORDER_RADIUS, SHADOWS } from '@/lib/styles/spacing';

export default function ReportsPage() {
  const { user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user]);

  const loadReports = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userReports = await getUserReports(user.id);
      setReports(userReports);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = (type: ReportType) => {
    // Show coming soon message
    alert('Report generation coming soon! This feature is currently in development.');
  };

  const getReportIcon = (type: ReportType) => {
    switch (type) {
      case 'monthly_progress':
        return <Calendar size={20} style={{ color: '#586C8E' }} />;
      case 'strategy_effectiveness':
        return <TrendingUp size={20} style={{ color: '#586C8E' }} />;
      case 'assessment_history':
        return <ClipboardList size={20} style={{ color: '#586C8E' }} />;
      case 'comprehensive':
        return <FileBarChart size={20} style={{ color: '#586C8E' }} />;
      default:
        return <FileText size={20} style={{ color: '#586C8E' }} />;
    }
  };

  const formatReportType = (type: ReportType): string => {
    const typeMap: Record<ReportType, string> = {
      monthly_progress: 'Monthly Progress',
      strategy_effectiveness: 'Strategy Report',
      assessment_history: 'Assessment History',
      comprehensive: 'Comprehensive Report',
    };
    return typeMap[type] || type;
  };

  const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };

    return `${start.toLocaleDateString('en-US', formatOptions)} - ${end.toLocaleDateString('en-US', formatOptions)}`;
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
        <NavigationDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />

        <AppHeader
          onMenuClick={() => setIsDrawerOpen(true)}
          title="Reports"
          subtitle="Share progress with professionals"
        />

        <div className="flex-grow overflow-y-auto" style={{ backgroundColor: '#F9F7F3' }}>
          <ContentContainer>

            {/* Generate New Report Card */}
            <Card title="Generate New Report" padding="large">
              <p style={{
                fontSize: '14px',
                color: '#586C8E',
                marginBottom: '20px',
                marginTop: 0,
                lineHeight: 1.6
              }}>
                Create professional reports to share with schools, doctors, and therapists.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <QuickActionButton
                  icon={<Calendar size={20} />}
                  label="Monthly Progress"
                  description="General update on your child's well-being"
                  onClick={() => handleGenerateReport('monthly_progress')}
                />
                <QuickActionButton
                  icon={<TrendingUp size={20} />}
                  label="Strategy Report"
                  description="What's working and what needs adjustment"
                  onClick={() => handleGenerateReport('strategy_effectiveness')}
                />
                <QuickActionButton
                  icon={<ClipboardList size={20} />}
                  label="Assessment History"
                  description="Track formal assessments over time"
                  onClick={() => handleGenerateReport('assessment_history')}
                />
                <QuickActionButton
                  icon={<FileBarChart size={20} />}
                  label="Comprehensive Report"
                  description="Full picture for major meetings (IEP, diagnosis)"
                  onClick={() => handleGenerateReport('comprehensive')}
                />
              </div>
            </Card>

            {/* Recent Reports Card */}
            {reports.length > 0 ? (
              <Card title="Recent Reports" padding="large">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {reports.slice(0, 5).map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      icon={getReportIcon(report.report_type)}
                      onReload={loadReports}
                    />
                  ))}

                  {reports.length > 5 && (
                    <Button
                      variant="secondary"
                      onClick={() => window.location.href = '/reports/all'}
                      style={{ marginTop: '8px' }}
                    >
                      View All Reports ({reports.length})
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              /* Empty State */
              <Card padding="large">
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(215, 205, 236, 0.3), rgba(183, 211, 216, 0.3))'
                    }}
                  >
                    <FileText size={32} style={{ color: '#586C8E' }} />
                  </div>

                  <h3 style={{
                    fontFamily: 'Quicksand, sans-serif',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#2A3F5A',
                    marginBottom: '8px'
                  }}>
                    No Reports Yet
                  </h3>

                  <p style={{
                    fontSize: '14px',
                    color: '#586C8E',
                    marginBottom: 0,
                    lineHeight: 1.6
                  }}>
                    Generate your first report using the quick action buttons above.
                  </p>
                </div>
              </Card>
            )}

            {/* About Reports Info Card */}
            <Card title="About Reports" padding="large">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <InfoItem
                  icon="📄"
                  text="Professional formatting ready for schools and medical professionals"
                />
                <InfoItem
                  icon="📥"
                  text="Download as PDF for easy sharing"
                />
                <InfoItem
                  icon="🔗"
                  text="Create secure sharing links with expiration dates"
                />
                <InfoItem
                  icon="🔒"
                  text="You control what information gets included in each report"
                />
              </div>
            </Card>

          </ContentContainer>
        </div>
      </div>
    </MobileDeviceMockup>
  );
}

// Quick Action Button Component
interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}

function QuickActionButton({ icon, label, description, onClick }: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '16px',
        borderRadius: BORDER_RADIUS.medium,
        border: '2px solid rgba(215, 205, 236, 0.3)',
        backgroundColor: 'white',
        cursor: 'pointer',
        transition: 'all 0.2s',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: SHADOWS.card,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(215, 205, 236, 0.6)';
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(42, 63, 90, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(215, 205, 236, 0.3)';
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = SHADOWS.card;
      }}
    >
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(215, 205, 236, 0.2), rgba(183, 211, 216, 0.2))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: 'Quicksand, sans-serif',
          fontSize: '15px',
          fontWeight: 600,
          color: '#2A3F5A',
          marginBottom: '2px'
        }}>
          {label}
        </div>
        <div style={{
          fontSize: '13px',
          color: '#7F8FA6',
          lineHeight: 1.4
        }}>
          {description}
        </div>
      </div>
    </button>
  );
}

// Report Card Component
interface ReportCardProps {
  report: GeneratedReport;
  icon: React.ReactNode;
  onReload: () => void;
}

function ReportCard({ report, icon, onReload }: ReportCardProps) {
  const [showActions, setShowActions] = useState(false);

  const handleDownload = () => {
    if (report.pdf_url) {
      window.open(report.pdf_url, '_blank');
    } else {
      alert('PDF not yet generated for this report');
    }
  };

  const handleShare = () => {
    alert('Share functionality coming soon');
  };

  const formatReportType = (type: ReportType): string => {
    const typeMap: Record<ReportType, string> = {
      monthly_progress: 'Monthly Progress',
      strategy_effectiveness: 'Strategy Report',
      assessment_history: 'Assessment History',
      comprehensive: 'Comprehensive Report',
    };
    return typeMap[type] || type;
  };

  const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };

    return `${start.toLocaleDateString('en-US', formatOptions)} - ${end.toLocaleDateString('en-US', formatOptions)}`;
  };

  return (
    <div
      style={{
        padding: '16px',
        borderRadius: BORDER_RADIUS.medium,
        border: '1px solid rgba(215, 205, 236, 0.2)',
        backgroundColor: 'rgba(249, 247, 243, 0.5)',
        transition: 'all 0.2s',
      }}
    >
      {/* Report Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(215, 205, 236, 0.3), rgba(183, 211, 216, 0.3))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {icon}
        </div>

        <div style={{ flex: 1 }}>
          <h4 style={{
            fontFamily: 'Quicksand, sans-serif',
            fontSize: '15px',
            fontWeight: 600,
            color: '#2A3F5A',
            margin: '0 0 4px 0'
          }}>
            {report.title}
          </h4>
          <div style={{
            fontSize: '13px',
            color: '#7F8FA6',
            lineHeight: 1.4
          }}>
            {formatReportType(report.report_type)}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#7F8FA6',
            marginTop: '4px'
          }}>
            {formatDateRange(report.start_date, report.end_date)}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleDownload}
          disabled={!report.pdf_url}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: BORDER_RADIUS.small,
            border: '1px solid rgba(215, 205, 236, 0.3)',
            backgroundColor: report.pdf_url ? 'white' : 'rgba(215, 205, 236, 0.2)',
            color: report.pdf_url ? '#586C8E' : '#7F8FA6',
            fontSize: '13px',
            fontWeight: 600,
            cursor: report.pdf_url ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (report.pdf_url) {
              e.currentTarget.style.borderColor = 'rgba(215, 205, 236, 0.5)';
              e.currentTarget.style.backgroundColor = 'rgba(215, 205, 236, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (report.pdf_url) {
              e.currentTarget.style.borderColor = 'rgba(215, 205, 236, 0.3)';
              e.currentTarget.style.backgroundColor = 'white';
            }
          }}
        >
          <Download size={16} />
          PDF
        </button>

        <button
          onClick={handleShare}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: BORDER_RADIUS.small,
            border: '1px solid rgba(215, 205, 236, 0.3)',
            backgroundColor: 'white',
            color: '#586C8E',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(215, 205, 236, 0.5)';
            e.currentTarget.style.backgroundColor = 'rgba(215, 205, 236, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(215, 205, 236, 0.3)';
            e.currentTarget.style.backgroundColor = 'white';
          }}
        >
          <Share2 size={16} />
          Share
        </button>
      </div>
    </div>
  );
}

// Info Item Component
interface InfoItemProps {
  icon: string;
  text: string;
}

function InfoItem({ icon, text }: InfoItemProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px'
    }}>
      <span style={{
        fontSize: '20px',
        flexShrink: 0,
        lineHeight: 1
      }}>
        {icon}
      </span>
      <p style={{
        fontSize: '14px',
        color: '#586C8E',
        margin: 0,
        lineHeight: 1.5,
        paddingTop: '2px'
      }}>
        {text}
      </p>
    </div>
  );
}
