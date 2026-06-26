import React, { useState } from 'react';
import { getToken } from '../utils/storage';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Share,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const BASE_URL = 'http://172.20.10.5:3000';

export default function ResultScreen({ route, navigation }) {
  const { inspection } = route.params;
  const [downloading, setDownloading] = useState(false);

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

  const downloadAndSharePDF = async () => {
    setDownloading(true);
    try {
      const token = await getToken();
      const pdfUrl = `${BASE_URL}/api/reports/${inspection.id}/pdf`;
      const fileUri = FileSystem.documentDirectory + `inspection-${inspection.id}.pdf`;

      const downloadResult = await FileSystem.downloadAsync(pdfUrl, fileUri, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (downloadResult.status === 200) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Inspection Report',
        });
      } else {
        Alert.alert('Error', 'Failed to download report');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not generate PDF report');
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const shareViaWhatsApp = async () => {
    const defectList = inspection.defects && inspection.defects.length > 0
      ? inspection.defects.map((d, i) =>
          `${i + 1}. ${d.type} (${Math.round(d.confidence * 100)}% confidence)`
        ).join('\n')
      : 'No defects detected';

    const message = `
*INSPECTION REPORT*
━━━━━━━━━━━━━━━━━━
*Part:* ${inspection.part_name || 'N/A'}
*Date:* ${new Date(inspection.created_at).toLocaleString()}
*Recommendation:* ${getRecommendationText()}
*Severity:* ${(inspection.severity || 'N/A').toUpperCase()}
*Confidence:* ${inspection.confidence_score ? `${Math.round(inspection.confidence_score * 100)}%` : 'N/A'}

*Defects Found:*
${defectList}

*Notes:* ${inspection.notes || 'None'}
*Image:* ${inspection.image_url}
━━━━━━━━━━━━━━━━━━
_AI-Based Automotive Inspection System_
    `.trim();

    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
    const canOpen = await Linking.canOpenURL(whatsappUrl);

    if (canOpen) {
      await Linking.openURL(whatsappUrl);
    } else {
      // Fallback to general share if WhatsApp not installed
      await Share.share({ message });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inspection Result</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Part Image */}
      {inspection.image_url && (
        <Image source={{ uri: inspection.image_url }} style={styles.image} />
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
          value={(inspection.severity || 'Pending AI').toUpperCase()}
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
        {inspection.defects && inspection.defects.length > 0 && (
          <View style={styles.defectList}>
            <Text style={styles.defectTitle}>Detected Defects</Text>
            {inspection.defects.map((defect, index) => (
              <View key={index} style={styles.defectItem}>
                <Text style={styles.defectKey}>{defect.type}</Text>
                <Text style={styles.defectValue}>
                  {Math.round(defect.confidence * 100)}% confidence
                </Text>
              </View>
            ))}
          </View>
        )}
        {(!inspection.defects || inspection.defects.length === 0) && (
          <Text style={styles.pendingText}>
            No defects detected by AI.
          </Text>
        )}
      </View>

      {/* Share Buttons */}
      <View style={styles.shareCard}>
        <Text style={styles.cardTitle}>Share Report</Text>

        <TouchableOpacity
          style={styles.whatsappButton}
          onPress={shareViaWhatsApp}
        >
          <Text style={styles.whatsappText}>📱  Share via WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pdfButton, downloading && styles.buttonDisabled]}
          onPress={downloadAndSharePDF}
          disabled={downloading}
        >
          {downloading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.pdfText}>📄  Download PDF Report</Text>
          )}
        </TouchableOpacity>
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
  shareCard: {
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
  whatsappButton: {
    backgroundColor: '#25D366',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  whatsappText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  pdfButton: {
    backgroundColor: '#E53E3E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  pdfText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  newButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 16,
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