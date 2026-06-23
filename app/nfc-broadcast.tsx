// Route for NFC Broadcast Screen
import { useLocalSearchParams } from 'expo-router';
import NFCBroadcastScreen from '../screens/NFCBroadcastScreen';

export default function NFCBroadcastRoute() {
  const params = useLocalSearchParams();

  // Parse parameters
  const transactionId = params.transactionId as string || 'TXN-' + Date.now();
  const amount = parseFloat(params.amount as string) || 0;
  
  // Parse metadata
  const metadata = params.metadata 
    ? JSON.parse(params.metadata as string)
    : { items: [] };

  // Parse merchant info
  const merchantInfo = params.merchantInfo
    ? JSON.parse(params.merchantInfo as string)
    : {
        businessName: 'Irion Pay',
        address: 'JTBI, JNTUH, Kukatpally, Telangana, India 500085',
        phone: '555-1234',
      };

  return (
    <NFCBroadcastScreen
      transactionId={transactionId}
      amount={amount}
      metadata={metadata}
      merchantInfo={merchantInfo}
    />
  );
}
