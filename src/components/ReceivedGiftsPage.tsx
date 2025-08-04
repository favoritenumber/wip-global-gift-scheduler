import React from 'react';
import { Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ReceivedGiftsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <Card className="bg-white shadow-xl border border-blue-100">
        <CardContent className="p-8 text-center">
          <div className="p-6 bg-blue-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Gift className="h-10 w-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Received Gifts Feature</h3>
          <p className="text-gray-600 mb-4">
            The received gifts feature is being set up. The database table has been created successfully.
            TypeScript types are being updated automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceivedGiftsPage;