// src/pages/CreateTripPage.tsx

import React from 'react';
import CreateTripForm from '../components/CreateTripForm'; // Import the form
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CreateTripPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Share</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateTripForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTripPage;