import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { theme } from '../../theme';

interface QuickActionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color?: string;
  onPress: () => void;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon,
  label,
  color = theme.colors.primary,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.wrapper}>
      <Card variant="elevated" style={styles.card}>
        <View style={styles.iconWrapper}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: { width: '47%', marginHorizontal: '1.5%', marginBottom: theme.spacing.md },
  card: { padding: theme.spacing.lg, alignItems: 'center' },
  iconWrapper: { width: 56, height: 56, borderRadius: 16, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.sm },
  label: { ...theme.typography.body, fontWeight: '500', textAlign: 'center' },
});
