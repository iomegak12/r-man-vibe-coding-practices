import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, RefreshControl, Dimensions } from 'react-native';
import { 
  Card, 
  Text, 
  Avatar, 
  IconButton, 
  useTheme, 
  Surface,
  Divider,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

// Context
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';

const screenWidth = Dimensions.get('window').width;

const getStatusColor = (status) => {
  switch (status) {
    case 'Placed': return '#FF9800';
    case 'Processing': return '#2196F3';
    case 'Shipped': return '#9C27B0';
    case 'Delivered': return '#4CAF50';
    case 'Cancelled': return '#F44336';
    case 'Return Requested': return '#FFC107';
    case 'Returned': return '#795548';
    default: return '#757575';
  }
};

const chartConfig = {
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#FFFFFF',
  color: (opacity = 1) => `rgba(27, 75, 102, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
  propsForLabels: {
    fontSize: 12,
  },
};

// Mock KPI Component
const StatCard = ({ icon, label, value, trend, color }) => {
  const theme = useTheme();
  return (
    <Card style={styles.statCard} mode="elevated">
      <Card.Content style={styles.statContent}>
        <View>
          <Text variant="labelMedium" style={{color: theme.colors.secondary}}>
            {label}
          </Text>
          <Text variant="headlineSmall" style={{fontWeight: 'bold', marginVertical: 4}}>
            {value}
          </Text>
          <Text variant="bodySmall" style={{color: 'green'}}>
            +{trend}% vs last week
          </Text>
        </View>
        <Avatar.Icon size={48} icon={icon} style={{backgroundColor: color}} />
      </Card.Content>
    </Card>
  );
};

const DashboardScreen = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeOrders: 0,
    pendingComplaints: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [chartData, setChartData] = useState({
    ordersByStatus: [],
    complaintsByPriority: [],
    ordersOverTime: { labels: [], data: [] },
  });

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [customersRes, ordersRes, complaintsRes] = await Promise.all([
        apiClient.get('http://192.168.0.4:5002/api/customers'),
        apiClient.get('http://192.168.0.4:5003/api/admin/orders'),
        apiClient.get('http://192.168.0.4:5004/api/complaints'),
      ]);

      let totalCustomers = 0;
      let activeOrders = 0;
      let pendingComplaints = 0;
      const activities = [];

      // Process customers
      if (customersRes.ok) {
        const customersData = await customersRes.json();
        const customers = customersData.data?.customers || customersData.customers || customersData.data || [];
        totalCustomers = customers.length;
        
        // Add recent customer registrations to activity
        customers.slice(0, 2).forEach(customer => {
          activities.push({
            type: 'customer',
            title: 'New Customer',
            subtitle: customer.fullName || customer.name || 'Unknown',
            icon: 'account-plus',
            timestamp: customer.createdAt,
            onPress: () => navigation.navigate('Customers', { 
              screen: 'CustomerDetails', 
              params: { customerId: customer.customerId || customer.id }
            }),
          });
        });
      }

      // Process orders
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const orders = ordersData.items || ordersData.data || [];
        // Count active orders (not Delivered, Cancelled, or Returned)
        activeOrders = orders.filter(o => 
          !['Delivered', 'Cancelled', 'Returned'].includes(o.status)
        ).length;
        
        // Calculate orders by status for pie chart
        const statusCount = {};
        orders.forEach(order => {
          const status = order.status || 'Unknown';
          statusCount[status] = (statusCount[status] || 0) + 1;
        });
        
        const ordersByStatus = Object.entries(statusCount).map(([name, count]) => ({
          name,
          count,
          color: getStatusColor(name),
          legendFontColor: '#7F7F7F',
          legendFontSize: 12,
        }));
        
        // Calculate orders over time (last 7 days)
        const last7Days = [];
        const ordersByDay = {};
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          last7Days.push(dateStr);
          ordersByDay[dateStr] = 0;
        }
        
        orders.forEach(order => {
          const orderDate = (order.orderDate || order.createdAt || '').split('T')[0];
          if (ordersByDay.hasOwnProperty(orderDate)) {
            ordersByDay[orderDate]++;
          }
        });
        
        const ordersOverTime = {
          labels: last7Days.map(d => new Date(d).getDate().toString()),
          data: last7Days.map(d => ordersByDay[d]),
        };
        
        // Add recent orders to activity
        orders.slice(0, 2).forEach(order => {
          activities.push({
            type: 'order',
            title: `Order ${order.orderId || order.id}`,
            subtitle: `${order.customerName} - ${order.status}`,
            icon: 'cart',
            timestamp: order.orderDate || order.createdAt,
            onPress: () => navigation.navigate('Orders', { 
              screen: 'OrderDetails', 
              params: { orderId: order.orderId || order.id }
            }),
          });
        });
        
        setChartData(prev => ({ ...prev, ordersByStatus, ordersOverTime }));
      }

      // Process complaints
      if (complaintsRes.ok) {
        const complaintsData = await complaintsRes.json();
        const complaints = complaintsData.data?.complaints || complaintsData.complaints || complaintsData.data || [];
        // Count pending complaints (Open or In Progress)
        pendingComplaints = complaints.filter(c => 
          ['Open', 'In Progress', 'Reopened'].includes(c.status)
        ).length;
        
        // Calculate complaints by priority for chart
        const priorityCount = { Critical: 0, High: 0, Medium: 0, Low: 0 };
        complaints.forEach(complaint => {
          const priority = complaint.priority || 'Medium';
          if (priorityCount.hasOwnProperty(priority)) {
            priorityCount[priority]++;
          }
        });
        
        const complaintsByPriority = [
          { name: 'Critical', count: priorityCount.Critical, color: '#D32F2F', legendFontColor: '#7F7F7F', legendFontSize: 12 },
          { name: 'High', count: priorityCount.High, color: '#F44336', legendFontColor: '#7F7F7F', legendFontSize: 12 },
          { name: 'Medium', count: priorityCount.Medium, color: '#FF9800', legendFontColor: '#7F7F7F', legendFontSize: 12 },
          { name: 'Low', count: priorityCount.Low, color: '#4CAF50', legendFontColor: '#7F7F7F', legendFontSize: 12 },
        ].filter(item => item.count > 0);
        
        // Add recent complaints to activity
        complaints.slice(0, 2).forEach(complaint => {
          activities.push({
            type: 'complaint',
            title: `Complaint ${complaint.complaintId || complaint.id}`,
            subtitle: `${complaint.subject} - ${complaint.status}`,
            icon: 'alert-circle',
            timestamp: complaint.createdAt,
            onPress: () => navigation.navigate('Complaints', { 
              screen: 'ComplaintDetails', 
              params: { complaintId: complaint.complaintId || complaint.id }
            }),
          });
        });
        
        setChartData(prev => ({ ...prev, complaintsByPriority }));
      }

      setStats({ totalCustomers, activeOrders, pendingComplaints });
      
      // Sort activities by timestamp (most recent first)
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setRecentActivity(activities.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const unsubscribe = navigation.addListener('focus', fetchDashboardData);
    return unsubscribe;
  }, [navigation]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header Greeting */}
      <View style={styles.header}>
        <View>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
            Welcome back, {user?.fullName?.split(' ')[0] || 'Admin'}!
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>
            Overview of business performance
          </Text>
        </View>
        <IconButton icon="bell-outline" mode="contained-tonal" />
      </View>

      {/* KPI Section */}
      <View style={styles.kpiContainer}>
        <StatCard 
          icon="account-multiple" 
          label="Total Customers" 
          value={stats.totalCustomers.toString()} 
          trend="12" 
          color={theme.colors.primaryContainer} 
        />
        <StatCard 
          icon="cart" 
          label="Active Orders" 
          value={stats.activeOrders.toString()} 
          trend="8" 
          color={theme.colors.secondaryContainer} 
        />
        <StatCard 
          icon="alert-circle" 
          label="Pending Complaints" 
          value={stats.pendingComplaints.toString()} 
          trend="-2" 
          color={theme.colors.errorContainer} 
        />
      </View>

      {/* Chart Section - Orders Over Time */}
      {chartData.ordersOverTime.data.length > 0 && (
        <Card style={styles.chartCard}>
          <Card.Title 
            title="Orders Last 7 Days" 
            subtitle="Daily order volume" 
            left={(props) => <Avatar.Icon {...props} icon="chart-line" />} 
          />
          <Card.Content>
            <LineChart
              data={{
                labels: chartData.ordersOverTime.labels,
                datasets: [{ data: chartData.ordersOverTime.data }],
              }}
              width={screenWidth - 64}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </Card.Content>
        </Card>
      )}

      {/* Chart Section - Orders by Status */}
      {chartData.ordersByStatus.length > 0 && (
        <Card style={styles.chartCard}>
          <Card.Title 
            title="Orders by Status" 
            subtitle="Current distribution" 
            left={(props) => <Avatar.Icon {...props} icon="chart-pie" />} 
          />
          <Card.Content>
            <PieChart
              data={chartData.ordersByStatus}
              width={screenWidth - 64}
              height={200}
              chartConfig={chartConfig}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </Card.Content>
        </Card>
      )}

      {/* Chart Section - Complaints by Priority */}
      {chartData.complaintsByPriority.length > 0 && (
        <Card style={styles.chartCard}>
          <Card.Title 
            title="Complaints by Priority" 
            subtitle="Priority distribution" 
            left={(props) => <Avatar.Icon {...props} icon="chart-donut" />} 
          />
          <Card.Content>
            <PieChart
              data={chartData.complaintsByPriority}
              width={screenWidth - 64}
              height={200}
              chartConfig={chartConfig}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </Card.Content>
        </Card>
      )}

      {/* Recent Activity Section */}
      <View style={styles.sectionHeader}>
         <Text variant="titleMedium">Recent Activity</Text>
      </View>
      
      <Card mode="outlined" style={styles.activityCard}>
        {recentActivity.length > 0 ? (
          recentActivity.map((activity, index) => (
            <React.Fragment key={`${activity.type}-${index}`}>
              {index > 0 && <Divider />}
              <Card.Title 
                title={activity.title} 
                subtitle={activity.subtitle}
                left={(props) => <Avatar.Icon {...props} icon={activity.icon} />}
                right={(props) => <IconButton {...props} icon="chevron-right" />}
                onPress={activity.onPress}
              />
            </React.Fragment>
          ))
        ) : (
          <Card.Content>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              No recent activity
            </Text>
          </Card.Content>
        )}
      </Card>

      {/* Quick Actions */}
      <View style={styles.sectionHeader}>
         <Text variant="titleMedium">Quick Actions</Text>
      </View>
      
      <View style={styles.quickActions}>
        <Button 
          mode="outlined" 
          icon="account-plus" 
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Customers', { screen: 'CustomerCreate' })}
        >
          Add Customer
        </Button>
        <Button 
          mode="outlined" 
          icon="alert-circle-outline" 
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Complaints', { screen: 'ComplaintCreate' })}
        >
          New Complaint
        </Button>
      </View>
      
      {/* Bottom spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16 
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  kpiContainer: { 
    gap: 12, 
    marginBottom: 20 
  },
  statCard: { 
    marginBottom: 0 
  },
  statContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  chartCard: { 
    marginBottom: 20 
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartPlaceholder: { 
    height: 180, 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  activityCard: { 
    marginBottom: 20 
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  quickActionButton: {
    flex: 1,
    minWidth: 100,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default DashboardScreen;