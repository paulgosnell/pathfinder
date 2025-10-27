import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { MonthlyProgressContent, StrategyEffectivenessContent, ComprehensiveContent } from '@/lib/reports/generator';

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    borderBottom: '2pt solid #2A3F5A',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2A3F5A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#586C8E',
    marginBottom: 4,
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2A3F5A',
    marginBottom: 10,
    borderBottom: '1pt solid #D7CDEC',
    paddingBottom: 4,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2A3F5A',
    marginTop: 12,
    marginBottom: 6,
  },
  text: {
    fontSize: 11,
    color: '#2A3F5A',
    marginBottom: 6,
  },
  list: {
    marginLeft: 15,
  },
  listItem: {
    fontSize: 11,
    color: '#2A3F5A',
    marginBottom: 4,
  },
  statBox: {
    backgroundColor: '#F9F7F3',
    padding: 10,
    marginBottom: 10,
    borderRadius: 4,
    border: '1pt solid #D7CDEC',
  },
  statLabel: {
    fontSize: 10,
    color: '#586C8E',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2A3F5A',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 9,
    color: '#7F8FA6',
    textAlign: 'center',
    borderTop: '1pt solid #D7CDEC',
    paddingTop: 10,
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #D7CDEC',
    paddingVertical: 6,
  },
  tableHeader: {
    backgroundColor: '#F9F7F3',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    color: '#2A3F5A',
  },
});

// Monthly Progress Report PDF
export function MonthlyProgressPDF({ report, title }: { report: MonthlyProgressContent; title: string }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            {report.date_range.month_label} ({report.date_range.start} to {report.date_range.end})
          </Text>
          <Text style={styles.subtitle}>
            Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </View>

        {/* Check-ins Section */}
        {report.checkins && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Check-ins Summary</Text>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Check-ins</Text>
              <Text style={styles.statValue}>{report.checkins.total_entries}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Average Scores</Text>
              <Text style={styles.text}>
                Sleep: {report.checkins.averages.sleep_quality.toFixed(1)}/10
              </Text>
              <Text style={styles.text}>
                Attention: {report.checkins.averages.attention_focus.toFixed(1)}/10
              </Text>
              <Text style={styles.text}>
                Emotional Regulation: {report.checkins.averages.emotional_regulation.toFixed(1)}/10
              </Text>
              <Text style={styles.text}>
                Behavior: {report.checkins.averages.behavior_quality.toFixed(1)}/10
              </Text>
            </View>
          </View>
        )}

        {/* Sessions Section */}
        {report.sessions && report.sessions.total > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coaching Sessions</Text>
            <Text style={styles.text}>
              Total Sessions: {report.sessions.total}
            </Text>
            {report.sessions.summary && report.sessions.summary.length > 0 && (
              <View>
                <Text style={styles.subsectionTitle}>Recent Topics:</Text>
                {report.sessions.summary.slice(0, 5).map((session, idx) => (
                  <Text key={idx} style={styles.listItem}>
                    • {session.topic}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Strategies Section */}
        {report.strategies && (report.strategies.successful.length > 0 || report.strategies.unsuccessful.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Strategies & Interventions</Text>

            {report.strategies.successful.length > 0 && (
              <View>
                <Text style={styles.subsectionTitle}>Working Well ✓</Text>
                {report.strategies.successful.map((strategy, idx) => (
                  <Text key={idx} style={styles.listItem}>
                    • {strategy}
                  </Text>
                ))}
              </View>
            )}

            {report.strategies.unsuccessful.length > 0 && (
              <View>
                <Text style={styles.subsectionTitle}>Needs Adjustment</Text>
                {report.strategies.unsuccessful.map((strategy, idx) => (
                  <Text key={idx} style={styles.listItem}>
                    • {strategy}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated by Pathfinder ADHD Support Agent</Text>
          <Text>This report is confidential and intended for professional consultation purposes only.</Text>
        </View>
      </Page>
    </Document>
  );
}

// Strategy Effectiveness Report PDF
export function StrategyEffectivenessPDF({ report, title }: { report: StrategyEffectivenessContent; title: string }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            Date Range: {report.date_range.start} to {report.date_range.end}
          </Text>
          <Text style={styles.subtitle}>
            Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </View>

        {/* Strategies Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Strategy Effectiveness Overview</Text>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Strategies Tracked</Text>
            <Text style={styles.statValue}>
              {report.summary.total_strategies_tried}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Success Rate</Text>
            <Text style={styles.statValue}>
              {report.summary.success_rate}
            </Text>
          </View>
        </View>

        {/* Strategies Analyzed */}
        {report.strategies_analyzed && report.strategies_analyzed.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Strategy Analysis</Text>
            {report.strategies_analyzed.map((strategy, idx) => (
              <View key={idx} style={{ marginBottom: 10 }}>
                <Text style={styles.listItem}>
                  • {strategy.strategy_name}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated by Pathfinder ADHD Support Agent</Text>
          <Text>This report is confidential and intended for professional consultation purposes only.</Text>
        </View>
      </Page>
    </Document>
  );
}

// Comprehensive Report PDF
export function ComprehensivePDF({ report, title }: { report: ComprehensiveContent; title: string }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            Date Range: {report.date_range.start} to {report.date_range.end}
          </Text>
          <Text style={styles.subtitle}>
            Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </View>

        {/* Check-ins Section */}
        {report.checkins && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Check-ins Summary</Text>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Check-ins</Text>
              <Text style={styles.statValue}>{report.checkins.total_entries}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Average Scores</Text>
              <Text style={styles.text}>
                Sleep: {report.checkins.averages.sleep_quality.toFixed(1)}/10
              </Text>
              <Text style={styles.text}>
                Attention: {report.checkins.averages.attention_focus.toFixed(1)}/10
              </Text>
              <Text style={styles.text}>
                Emotional Regulation: {report.checkins.averages.emotional_regulation.toFixed(1)}/10
              </Text>
              <Text style={styles.text}>
                Behavior: {report.checkins.averages.behavior_quality.toFixed(1)}/10
              </Text>
            </View>
          </View>
        )}

        {/* Sessions Section */}
        {report.sessions && report.sessions.total > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coaching Sessions</Text>
            <Text style={styles.text}>
              Total Sessions: {report.sessions.total}
            </Text>
            {report.sessions.summary && report.sessions.summary.length > 0 && (
              <View>
                <Text style={styles.subsectionTitle}>Recent Topics:</Text>
                {report.sessions.summary.slice(0, 5).map((session, idx) => (
                  <Text key={idx} style={styles.listItem}>
                    • {session.topic}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Strategies Section */}
        {report.strategies && (report.strategies.successful.length > 0 || report.strategies.unsuccessful.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Strategies & Interventions</Text>

            {report.strategies.successful.length > 0 && (
              <View>
                <Text style={styles.subsectionTitle}>Working Well ✓</Text>
                {report.strategies.successful.map((strategy, idx) => (
                  <Text key={idx} style={styles.listItem}>
                    • {strategy}
                  </Text>
                ))}
              </View>
            )}

            {report.strategies.unsuccessful.length > 0 && (
              <View>
                <Text style={styles.subsectionTitle}>Needs Adjustment</Text>
                {report.strategies.unsuccessful.map((strategy, idx) => (
                  <Text key={idx} style={styles.listItem}>
                    • {strategy}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated by Pathfinder ADHD Support Agent</Text>
          <Text>This report is confidential and intended for professional consultation purposes only.</Text>
        </View>
      </Page>
    </Document>
  );
}
