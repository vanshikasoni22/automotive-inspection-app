import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { getInspections } from '../services/api';

export default function HistoryScreen({ navigation }) {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    try {
      const response = await getInspections();
      setInspections(response.data.inspections);
    } catch (err) {
      console.error('Failed to fetch inspections:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchInspections();
  };

  const getRecommendationStyle = (recommendation) => {
    if (recommendation === 'accept') return styles.accept;
    if (recommendation === 'reject') return styles.reject;
    return styles.review;
  };

  const getRecommendationLabel = (recommendation) => {
    if (recommendation === 'accept') return '✓ Accept';
    if (recommendation === 'reject') return '✗ Reject';
    return '⚠ Review';
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Result', { inspection: item })}
    >
      <View style={styles.cardLeft}>
        <Text style={styles.partName}>{item.part_name || 'Unnamed Part'}</Text>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        {item.notes ? (
          <Text style={styles.notes} numberOfLines={1}>
            {item.notes}
          </Text>
        ) : null}
      </View>
      <View style={styles.cardRight}>
        <View style={[styles.badge, getRecommendationStyle(item.recommendation)]}>
          <Text style={styles.badgeText}>
            {getRecommendationLabel(item.recommendation)}
          </Text>
        </View>
        {item.severity && (
          <Text style={styles.severity}>{item.severity} severity</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyText}>No inspections yet</Text>
      <Text style={styles.emptySubtext}>
        Start by capturing a part image
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('Camera')}
      >
        <Text style={styles.emptyButtonText}>New Inspection</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inspection History</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Camera')}>
          <Text style={styles.newText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{inspections.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: '#48BB78' }]}>
            {inspections.filter(i => i.recommendation === 'accept').length}
          </Text>
          <Text style={styles.statLabel}>Accepted</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: '#E53E3E' }]}>
            {inspections.filter(i => i.recommendation === 'reject').length}
          </Text>
          <Text style={styles.statLabel}>Rejected</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { color: '#ED8936' }]}>
            {inspections.filter(i => i.recommendation === 'manual_review').length}
          </Text>
          <Text style={styles.statLabel}>Review</Text>
        </View>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator color="#2563EB" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={inspections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2563EB"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
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
  newText: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '600',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#111',
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#222',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: '#555',
    fontSize: 11,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
    marginRight: 12,
  },
  partName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    color: '#555',
    fontSize: 12,
    marginBottom: 4,
  },
  notes: {
    color: '#444',
    fontSize: 12,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
  },
  accept: {
    backgroundColor: 'rgba(72,187,120,0.15)',
    borderWidth: 1,
    borderColor: '#48BB78',
  },
  reject: {
    backgroundColor: 'rgba(229,62,62,0.15)',
    borderWidth: 1,
    borderColor: '#E53E3E',
  },
  review: {
    backgroundColor: 'rgba(237,137,54,0.15)',
    borderWidth: 1,
    borderColor: '#ED8936',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  severity: {
    color: '#555',
    fontSize: 11,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#555',
    fontSize: 14,
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});