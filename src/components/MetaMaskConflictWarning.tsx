
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const MetaMaskConflictWarning: React.FC = () => {
  return (
    <Card className="border-yellow-200 bg-yellow-50 mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800 mb-1">
              Multiple Wallet Extensions Detected
            </h3>
            <p className="text-sm text-yellow-700 mb-2">
              Multiple Ethereum wallet extensions are conflicting. This won't affect your voting process.
            </p>
            <div className="text-xs text-yellow-600">
              <strong>To resolve:</strong> Disable all but one wallet extension in your browser settings.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetaMaskConflictWarning;
