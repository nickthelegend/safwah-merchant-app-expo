// Example usage of QRPaymentScreen
// This file demonstrates how to integrate QRPaymentScreen into your app

import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import {
    MerchantInfo,
    PaymentMetadata,
    TransactionItem,
} from '../services/payment-types';
import QRPaymentScreen from './QRPaymentScreen';

export default function QRPaymentExample() {
  const router = useRouter();

  // Example transaction data
  const amount = 125.50;
  
  const items: TransactionItem[] = [
    {
      id: '1',
      name: 'Coffee',
      quantity: 2,
      unitPrice: 5.00,
      totalPrice: 10.00,
    },
    {
      id: '2',
      name: 'Sandwich',
      quantity: 1,
      unitPrice: 12.50,
      totalPrice: 12.50,
    },
    {
      id: '3',
      name: 'Juice',
      quantity: 3,
      unitPrice: 4.00,
      totalPrice: 12.00,
    },
  ];

  const metadata: PaymentMetadata = {
    orderId: 'ORD-12345',
    customerId: 'CUST-67890',
    description: 'Cafe order',
    items,
  };

  const merchantInfo: MerchantInfo = {
    businessName: 'Irion Pay',
    address: 'JTBI, JNTUH, Kukatpally, Telangana, India 500085',
    phone: '+1 (555) 123-4567',
    taxId: 'TAX-123456789',
  };

  const handleSuccess = (transactionId: string) => {
    console.log('Payment successful:', transactionId);
    // Navigate back or to success screen
    router.back();
  };

  const handleCancel = () => {
    console.log('Payment cancelled');
    // Navigate back to previous screen
    router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <QRPaymentScreen
        amount={amount}
        metadata={metadata}
        merchantInfo={merchantInfo}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </View>
  );
}

// Example: How to navigate to QR Payment from POS Screen
// 
// In your POS screen or payment selection screen:
// 
// import { useRouter } from 'expo-router';
// 
// const router = useRouter();
// 
// const handleQRPayment = () => {
//   router.push({
//     pathname: '/qr-payment',
//     params: {
//       amount: total.toString(),
//       // Pass other data as needed
//     }
//   });
// };
