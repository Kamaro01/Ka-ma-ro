import React from 'react';
import StockAlertConfigInteractive from './components/StockAlertConfigInteractive';

export const metadata = {
  title: 'Stock Alert Configuration - Ka-ma-ro',
  description:
    'Customize inventory monitoring thresholds and notification preferences for proactive stock management',
};

export default function StockAlertConfiguration() {
  return <StockAlertConfigInteractive />;
}
