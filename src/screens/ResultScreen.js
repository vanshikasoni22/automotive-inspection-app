import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';

export default function ResultScreen({ route, navigation }) {
  const { inspection } = route.params;

  const isAccepted = inspection.recommendation === 'accept';
  const isRejected = inspection.recommendation === 'reject';

  const getSeverityColor = (severity) => {
    if (severity === 'high') return '#E53E3E';
    if (severity === 'medium') return '#ED8936';
    if (severity === 'low') return '#48BB78';
    return '#718096';
  };

  const getRecommendationColor = () => {
    if (isAccepted) return '#48BB78';
    if (isRejected) return '#E53E3E';
    return '#ED8936';
  };

  const getRecommendationText = () => {
    if (isAccepted) return '✓ ACCEPT';
    if (isRejected) return '✗ REJECT';
    return '⚠ MANUAL REVIEW';
  };

  const handleShare = async () => {
    const defectList = inspection.defects
      ? Object.entries(inspection.defects)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n')
      : 'No defects detected';

    const message = `
INSPECTION REPORT
-----------------
Part: ${inspection.part_name || 'N/A'}
Date: ${new Date(inspection.created_at).toLocaleString()}
Recommendation: ${getRecommendationText()}
Severity: ${inspection.severity || 'N/A'}
Confidence: ${inspection.confidence_score ? `${Math.round(inspection.confidence_score * 100)}%` : 'N/A'}

Defects:
${defectList}

Notes: ${inspection.notes || 'None'}
Image: ${inspection.image_url}
    `.trim();

    await Share.share({ message });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inspection Result</Text>
        <TouchableOpacity onPress={handleShare}>
          <Text style={styles.share}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Part Image */}
      {inspection.image_url && (
        <Image
          source={{ uri: inspection.image_url }}
          style={styles.image}
        />
      )}

      {/* Recommendation Badge */}
      <View style={[styles.badge, { backgroundColor: getRecommendationColor() }]}>
        <Text style={styles.badgeText}>{getRecommendationText()}</Text>
      </View>

      {/* Part Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Part Details</Text>
        <Row label="Part Name" value={inspection.part_name || 'N/A'} />
        <Row
          label="Inspected At"
          value={new Date(inspection.created_at).toLocaleString()}
        />
        <Row label="Notes" value={inspection.notes || 'None'} />
      </View>

      {/* AI Analysis */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>AI Analysis</Text>
        <Row
          label="Severity"
          value={inspection.severity || 'Pending AI'}
          valueColor={getSeverityColor(inspection.severity)}
        />
        <Row
          label="Confidence"
          value={
            inspection.confidence_score
              ? `${Math.round(inspection.confidence_score * 100)}%`
              : 'Pending AI'
          }
        />
        {inspection.defects && (
          <View style={styles.defectList}>
            <Text style={styles.defectTitle}>Detected Defects</Text>
            {Object.entries(inspection.defects).map(([key, value]) => (
              <View key={key} style={styles.defectItem}>
                <Text style={styles.defectKey}>{key}</Text>
                <Text style={styles.defectValue}>{value}</Text>
              </View>
            ))}
          </View>
        )}
        {!inspection.defects && (
          <Text style={styles.pendingText}>
            AI analysis will appear here once the model is connected in Phase 3.
          </Text>
        )}
      </View>

      {/* Actions */}
      <TouchableOpacity
        style={styles.newButton}
        onPress={() => navigation.navigate('Camera')}
      >
        <Text style={styles.newButtonText}>New Inspection</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate('History')}
      >
        <Text style={styles.historyButtonText}>View History</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const Row = ({ label, value, valueColor }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, valueColor && { color: valueColor }]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  back: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  share: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  badge: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  rowLabel: {
    color: '#666',
    fontSize: 13,
    flex: 1,
  },
  rowValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  defectList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingTop: 12,
  },
  defectTitle: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 10,
    fontWeight: '600',
  },
  defectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  defectKey: {
    color: '#666',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  defectValue: {
    color: '#ED8936',
    fontSize: 13,
    fontWeight: '500',
  },
  pendingText: {
    color: '#444',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 8,
  },
  newButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  newButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  historyButton: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  historyButtonText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '600',
  },
});