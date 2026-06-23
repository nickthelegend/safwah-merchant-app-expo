import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { theme } from '../../theme';

interface RevenueCardProps {
  amount: string;
  cryptoBreakdown: string;
  percentageChange: string;
  transactionCount: number;
}

export const RevenueCard: React.FC<RevenueCardProps> = ({
  amount,
  cryptoBreakdown,
  percentageChange,
  transactionCount,
}) => {
  const isPositive = percentageChange.startsWith('+');

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <Ionicons name="trending-up" size={20} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>Today's Revenue</Text>
      </View>
      <Text style={styles.amount}>{amount}</Text>
      <Text style={styles.crypto}>{cryptoBreakdown}</Text>
      <View style={styles.divider} />
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <View style={styles.statIconWrapper}>
            <Ionicons 
              name={isPositive ? "arrow-up" : "arrow-down"} 
              size={16} 
              color={isPositive ? theme.colors.success : theme.colors.error} 
            />
          </View>
          <View>
            <Text style={styles.statValue}>{percentageChange}</Text>
            <Text style={styles.statLabel}>vs yesterday</Text>
          </View>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={styles.statIconWrapper}>
            <Ionicons name="receipt-outline" size={16} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={styles.statValue}>{transactionCount}</Text>
            <Text style={styles.statLabel}>transactions</Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: theme.spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md },
  iconWrapper: { width: 32, height: 32, borderRadius: 8, backgroundColor: `${theme.colors.primary}20`, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.sm },
  title: { ...theme.typography.h3, flex: 1 },
  amount: { fontSize: 36, fontWeight: '700', color: theme.colors.text, marginBottom: theme.spacing.xs },
  crypto: { ...theme.typography.bodySmall, color: theme.colors.textSecondary, marginBottom: theme.spacing.md },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: theme.spacing.md },
  stats: { flexDirection: 'row', justifyContent: 'space-around' },
  statDivider: { width: 1, backgroundColor: theme.colors.border, marginHorizontal: theme.spacing.md },
  statItem: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
  statIconWrapper: { width: 28, height: 28, borderRadius: 6, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.sm },
  statValue: { ...theme.typography.body, fontWeight: '600', color: theme.colors.text },
  statLabel: { ...theme.typography.caption, color: theme.colors.textSecondary },
});
