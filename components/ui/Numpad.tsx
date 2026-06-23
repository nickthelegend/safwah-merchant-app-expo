import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../theme';

interface NumpadProps {
  onNumberPress: (number: string) => void;
  onClear: () => void;
  onBackspace: () => void;
}

export const Numpad: React.FC<NumpadProps> = ({
  onNumberPress,
  onClear,
  onBackspace,
}) => {
  const numbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['C', '0', '⌫'],
  ];

  const handlePress = (value: string) => {
    if (value === 'C') {
      onClear();
    } else if (value === '⌫') {
      onBackspace();
    } else {
      onNumberPress(value);
    }
  };

  return (
    <View style={styles.container}>
      {numbers.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((number) => (
            <TouchableOpacity
              key={number}
              style={[
                styles.button,
                (number === 'C' || number === '⌫') && styles.actionButton
              ]}
              onPress={() => handlePress(number)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.buttonText,
                (number === 'C' || number === '⌫') && styles.actionButtonText
              ]}>{number}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  button: {
    width: 75,
    height: 75,
    borderRadius: 16,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    fontSize: 26,
    fontWeight: '600',
    color: theme.colors.text,
  },
  actionButton: {
    backgroundColor: theme.colors.border,
  },
  actionButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 24,
  },
});