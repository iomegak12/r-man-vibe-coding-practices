import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Card,
  Text,
  Button,
  useTheme,
  Chip,
  Surface,
  RadioButton,
  List,
  Avatar,
  ActivityIndicator,
  TextInput,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import apiClient from '../../services/apiClient';

// Mock data - will be replaced with API calls
const mockComplaintDetails = {
  id: 'CMP-001',
  subject: 'Late Delivery',
  status: 'Open',
  priority: 'High',
  category: 'Shipping',
};

const mockTeamMembers = [
  {
    id: 'user-1',
    name: 'Alice Johnson',
    role: 'Customer Service Lead',
    department: 'Customer Service',
    avatar: null,
    isAvailable: true,
    currentWorkload: 3,
  },
  {
    id: 'user-2',
    name: 'Bob Smith',
    role: 'Support Specialist',
    department: 'Technical Support',
    avatar: null,
    isAvailable: true,
    currentWorkload: 5,
  },
  {
    id: 'user-3',
    name: 'Carol Davis',
    role: 'Shipping Coordinator',
    department: 'Operations',
    avatar: null,
    isAvailable: false,
    currentWorkload: 8,
  },
  {
    id: 'user-4',
    name: 'David Wilson',
    role: 'Quality Assurance',
    department: 'Product',
    avatar: null,
    isAvailable: true,
    currentWorkload: 2,
  },
  {
    id: 'user-5',
    name: 'Emma Brown',
    role: 'Billing Specialist',
    department: 'Finance',
    avatar: null,
    isAvailable: true,
    currentWorkload: 4,
  },
];

const TeamMemberCard = ({ member, selected, onSelect, theme }) => {
  const getWorkloadColor = (workload) => {
    if (workload <= 3) return '#4CAF50';
    if (workload <= 6) return '#FF9800';
    return '#F44336';
  };

  const getWorkloadText = (workload) => {
    if (workload <= 3) return 'Light';
    if (workload <= 6) return 'Moderate';
    return 'Heavy';
  };

  return (
    <Card
      style={[
        styles.memberCard,
        selected && { borderColor: theme.colors.primary, borderWidth: 2 }
      ]}
      mode="elevated"
      onPress={() => onSelect(member)}
    >
      <Card.Content style={styles.memberContent}>
        <View style={styles.memberHeader}>
          <View style={styles.memberInfo}>
            <Avatar.Text
              size={40}
              label={member.name.split(' ').map(n => n[0]).join('')}
              style={{ marginRight: 12 }}
            />
            <View style={styles.memberDetails}>
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                {member.name}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {member.role}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {member.department}
              </Text>
            </View>
          </View>
          <RadioButton
            value={member.id}
            status={selected ? 'checked' : 'unchecked'}
            onPress={() => onSelect(member)}
          />
        </View>

        <View style={styles.memberStats}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name={member.isAvailable ? "check-circle" : "clock-outline"}
              size={16}
              color={member.isAvailable ? '#4CAF50' : '#FF9800'}
            />
            <Text variant="bodySmall" style={{ marginLeft: 4 }}>
              {member.isAvailable ? 'Available' : 'Busy'}
            </Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name="briefcase"
              size={16}
              color={getWorkloadColor(member.currentWorkload)}
            />
            <Text variant="bodySmall" style={{ marginLeft: 4 }}>
              Workload: {getWorkloadText(member.currentWorkload)}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const ComplaintAssignScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { complaintId } = route.params;
  const [complaint, setComplaint] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch complaint details
        const complaintResponse = await apiClient.get(`http://192.168.0.4:5004/api/complaints/${complaintId}`);
        if (complaintResponse.ok) {
          const complaintData = await complaintResponse.json();
          setComplaint(complaintData.data || complaintData);
        } else {
          throw new Error('Failed to load complaint');
        }

        // Fetch team members (admin users)
        const usersResponse = await apiClient.get('http://192.168.0.4:5001/api/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          const users = usersData.data?.users || usersData.users || usersData.data || usersData || [];
          // Filter for admin/support users if needed
          setTeamMembers(users.map(user => ({
            id: user.userId || user.id,
            name: user.fullName || user.name || 'Unknown',
            role: user.role || 'Staff',
            department: user.department || 'Support',
            email: user.email,
            isAvailable: true,
            currentWorkload: 0,
          })));
        } else {
          console.warn('Failed to load users, using empty list');
          setTeamMembers([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to load assignment data: ' + error.message);
      }
      setLoading(false);
    };

    fetchData();
  }, [complaintId]);

  const handleAssign = async () => {
    if (!selectedMember) {
      Alert.alert('Selection Required', 'Please select a team member to assign this complaint to.');
      return;
    }

    setAssigning(true);
    try {
      const assignmentData = {
        assignTo: selectedMember.id,
        notes: notes.trim() || 'Assigned via mobile app',
      };

      const response = await apiClient.patch(
        `http://192.168.0.4:5004/api/complaints/${complaintId}/assign`,
        assignmentData
      );

      if (response.ok) {
        Alert.alert(
          'Success',
          `Complaint ${complaint.complaintId || complaint.id} has been assigned to ${selectedMember.name}`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        const error = await response.json().catch(() => ({}));
        Alert.alert('Error', error.message || 'Failed to assign complaint');
      }
    } catch (error) {
      console.error('Error assigning complaint:', error);
      Alert.alert('Error', 'Network error: ' + error.message);
    } finally {
      setAssigning(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading assignment data...</Text>
      </View>
    );
  }

  if (!complaint) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text>Complaint not found</Text>
        <Button onPress={() => navigation.goBack()}>Go Back</Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Complaint Info */}
      <Card style={styles.complaintCard} mode="elevated">
        <Card.Content>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginBottom: 8 }}>
            Assign Complaint {complaint.complaintId || complaint.id}
          </Text>
          <Text variant="titleMedium" style={{ marginBottom: 4 }}>
            {complaint.subject}
          </Text>
          <View style={styles.complaintMeta}>
            <Chip mode="flat" style={{ backgroundColor: '#FF9800', marginRight: 8 }}>
              {complaint.status}
            </Chip>
            <Chip mode="outlined" style={{ borderColor: '#F44336' }}>
              {complaint.priority}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Notes Input */}
      <Card style={styles.notesCard} mode="elevated">
        <Card.Content>
          <TextInput
            label="Assignment Notes"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            multiline
            numberOfLines={4}
            placeholder="Add notes for the assigned team member..."
            left={<TextInput.Icon icon="note-text" />}
          />
        </Card.Content>
      </Card>

      {/* Team Members List */}
      <ScrollView style={styles.membersList}>
        <Text variant="titleLarge" style={{ fontWeight: 'bold', margin: 16, marginBottom: 8 }}>
          Select Team Member
        </Text>

        {teamMembers.map((member) => (
          <TeamMemberCard
            key={member.id}
            member={member}
            selected={selectedMember?.id === member.id}
            onSelect={setSelectedMember}
            theme={theme}
          />
        ))}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Action Buttons */}
      <Surface style={styles.actionBar} elevation={4}>
        <Button
          mode="outlined"
          onPress={handleCancel}
          style={styles.cancelButton}
          disabled={assigning}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleAssign}
          style={styles.assignButton}
          loading={assigning}
          disabled={assigning || !selectedMember}
        >
          Assign Complaint
        </Button>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  complaintCard: {
    margin: 16,
    marginBottom: 8,
  },
  notesCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  complaintMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  membersList: {
    flex: 1,
  },
  memberCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  memberContent: {
    padding: 16,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberDetails: {
    flex: 1,
  },
  memberStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomPadding: {
    height: 100,
  },
  actionBar: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  assignButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default ComplaintAssignScreen;