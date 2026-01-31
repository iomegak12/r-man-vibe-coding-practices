import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Card,
  Text,
  Searchbar,
  FAB,
  useTheme,
  Chip,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
const ComplaintCard = ({ complaint, onPress, theme }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return '#FF9800';
      case 'In Progress': return '#2196F3';
      case 'Resolved': return '#4CAF50';
      case 'Closed': return '#757575';
      case 'Reopened': return '#F44336';
      default: return '#757575';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return '#D32F2F';
      case 'High': return '#F44336';
      case 'Medium': return '#FF9800';
      case 'Low': return '#4CAF50';
      default: return '#757575';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const complaintId = complaint.complaintId || complaint.id;

  return (
    <Card style={styles.complaintCard} mode="elevated" onPress={() => onPress(complaint)}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.complaintHeader}>
          <View style={styles.complaintInfo}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
              {complaintId}
            </Text>
            <Text variant="bodyMedium" numberOfLines={2} style={{ marginTop: 4 }}>
              {complaint.subject}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
              {complaint.customerName || 'Unknown'}
            </Text>
            {complaint.orderId && (
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                Order: {complaint.orderId}
              </Text>
            )}
          </View>
          <View style={styles.statusChips}>
            <Chip
              mode="flat"
              style={{ backgroundColor: getStatusColor(complaint.status), marginBottom: 4 }}
              textStyle={{ color: 'white', fontSize: 12 }}
            >
              {complaint.status}
            </Chip>
            <Chip
              mode="outlined"
              style={{ borderColor: getPriorityColor(complaint.priority) }}
              textStyle={{ color: getPriorityColor(complaint.priority), fontSize: 12 }}
            >
              {complaint.priority}
            </Chip>
          </View>
        </View>

        <Text variant="bodyLarge" style={{ fontWeight: '500', marginVertical: 8 }}>
          {complaint.subject}
        </Text>

        <View style={styles.complaintDetails}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="tag" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
              {complaint.category}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="calendar" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
              {formatDate(complaint.createdAt)}
            </Text>
          </View>
        </View>

        {complaint.assignedToName && (
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="account" size={16} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
              {complaint.assignedToName}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const ComplaintsListScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { orderId } = route.params || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComplaints = React.useCallback(async () => {
    console.log('Fetching complaints...');
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('http://192.168.0.4:5004/api/complaints');
      console.log('Complaints response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Complaints data:', data);
        const items = data.data?.complaints || data.complaints || data.data || data;
        setComplaints(items || []);
      } else {
        const text = await response.text();
        console.error('Failed to load complaints:', response.status, text);
        setError('Failed to load complaints');
      }
    } catch (err) {
      console.error('Network error fetching complaints:', err);
      setError('Network error: ' + err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchComplaints();
    const unsub = navigation.addListener('focus', fetchComplaints);
    return unsub;
  }, [fetchComplaints, navigation]);

  // Filter complaints based on search query and filters
  useEffect(() => {
    let filtered = complaints;

    // Filter by orderId if provided via route params
    if (orderId) {
      filtered = filtered.filter(complaint => complaint.orderId === orderId);
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(complaint => complaint.status === statusFilter);
    }

    if (priorityFilter !== 'All') {
      filtered = filtered.filter(complaint => complaint.priority === priorityFilter);
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(complaint =>
        (complaint.complaintId || complaint.id || '').toLowerCase().includes(query) ||
        (complaint.customerName || '').toLowerCase().includes(query) ||
        (complaint.customerEmail || '').toLowerCase().includes(query) ||
        (complaint.subject || '').toLowerCase().includes(query)
      );
    }

    setFilteredComplaints(filtered);
  }, [searchQuery, complaints, statusFilter, priorityFilter, orderId]);

  const handleComplaintPress = (complaint) => {
    navigation.navigate('ComplaintDetails', { complaintId: complaint.complaintId || complaint.id });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchComplaints();
    setRefreshing(false);
  };

  const statusOptions = ['All', 'Open', 'In Progress', 'Resolved', 'Closed', 'Reopened'];
  const priorityOptions = ['All', 'Critical', 'High', 'Medium', 'Low'];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search complaints..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={statusOptions}
          keyExtractor={(item) => `status-${item}`}
          renderItem={({ item }) => (
            <Chip
              mode={statusFilter === item ? 'flat' : 'outlined'}
              onPress={() => setStatusFilter(item)}
              style={[
                styles.filterChip,
                statusFilter === item && { backgroundColor: theme.colors.primary }
              ]}
              textStyle={statusFilter === item ? { color: 'white' } : {}}
            >
              {item}
            </Chip>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        />
        <FlatList
          horizontal
          data={priorityOptions}
          keyExtractor={(item) => `priority-${item}`}
          renderItem={({ item }) => (
            <Chip
              mode={priorityFilter === item ? 'flat' : 'outlined'}
              onPress={() => setPriorityFilter(item)}
              style={[
                styles.filterChip,
                priorityFilter === item && { backgroundColor: theme.colors.primary }
              ]}
              textStyle={priorityFilter === item ? { color: 'white' } : {}}
            >
              {item}
            </Chip>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Complaints List */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator
            animating={true}
            size="large"
            color={theme.colors.onSurfaceVariant}
          />
          <Text variant="headlineSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>
            Loading complaints...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Text variant="headlineSmall" style={{ color: theme.colors.error }}>{error}</Text>
          <Button mode="contained" onPress={fetchComplaints} style={{ marginTop: 12 }}>Retry</Button>
        </View>
      ) : (
        <FlatList
          data={filteredComplaints}
          keyExtractor={(item) => (item.complaintId || item.id)}
          renderItem={({ item }) => (
            <ComplaintCard
              complaint={item}
              onPress={handleComplaintPress}
              theme={theme}
            />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={64}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="headlineSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>
                No complaints found
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
                Try adjusting your filters
              </Text>
            </View>
          }
        />
      )}
      
      {/* FAB for creating new complaint */}
      <FAB
        icon="plus"
        color="white"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('ComplaintCreate')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchbar: {
    elevation: 2,
  },
  filtersContainer: {
    marginBottom: 8,
    paddingVertical: 4,
  },
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  filterChip: {
    marginRight: 8,
    marginVertical: 4,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  complaintCard: {
    marginBottom: 12,
  },
  cardContent: {
    padding: 16,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  complaintInfo: {
    flex: 1,
  },
  statusChips: {
    alignItems: 'flex-end',
  },
  complaintDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});

export default ComplaintsListScreen;