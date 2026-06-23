import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image } from 'react-native';
import { theme } from '../theme';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  stock?: number;
}

const mockProducts: Product[] = [
  { id: '1', name: 'Coffee', price: 4.50, category: 'Beverages', stock: 50 },
  { id: '2', name: 'Sandwich', price: 8.99, category: 'Food', stock: 25 },
  { id: '3', name: 'Pastry', price: 3.25, category: 'Food', stock: 15 },
];

export default function ProductsScreen() {
  const [products] = useState(mockProducts);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={viewMode === 'grid' ? styles.gridItem : styles.listItem}>
      <Card style={styles.productCard}>
        <View style={styles.productImage}>
          <Text style={styles.productImagePlaceholder}>📦</Text>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          {item.stock !== undefined && (
            <Text style={styles.productStock}>Stock: {item.stock}</Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
        <Button
          title="Add Product"
          onPress={() => {}}
          size="small"
        />
      </View>

      <View style={styles.controls}>
        <View style={styles.viewToggle}>
          <Button
            title="Grid"
            onPress={() => setViewMode('grid')}
            variant={viewMode === 'grid' ? 'primary' : 'secondary'}
            size="small"
          />
          <Button
            title="List"
            onPress={() => setViewMode('list')}
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            size="small"
            style={styles.toggleButton}
          />
        </View>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  title: {
    ...theme.typography.h1,
  },
  controls: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  viewToggle: {
    flexDirection: 'row',
  },
  toggleButton: {
    marginLeft: theme.spacing.sm,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
  },
  gridItem: {
    flex: 1,
    margin: theme.spacing.xs,
  },
  listItem: {
    marginBottom: theme.spacing.sm,
  },
  productCard: {
    padding: theme.spacing.sm,
  },
  productImage: {
    height: 80,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  productImagePlaceholder: {
    fontSize: 32,
  },
  productInfo: {
    alignItems: 'flex-start',
  },
  productName: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.xs,
  },
  productPrice: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  productCategory: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.xs,
  },
  productStock: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});