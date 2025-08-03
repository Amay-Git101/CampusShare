// src/pages/TripInfo.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plane, AlertCircle, HelpCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useUser } from '../context/UserContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const TripInfo = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    direction: '',
    date: '',
    time: '',
    buffer: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to create a trip.", variant: "destructive" });
      return;
    }

    const requiredFields: (keyof typeof formData)[] = ['direction', 'date', 'time', 'buffer'];
    const missingField = requiredFields.find(field => !formData[field]);
    
    if (missingField) {
      toast({
        title: "Missing Information",
        description: `Please fill in all required fields.`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, "trips"), {
        hostUid: user.uid,
        name: user.fullName,
        direction: formData.direction,
        date: formData.date,
        time: formData.time,
        buffer: formData.buffer,
        details: "", // Details field is now empty
        status: "open",
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Trip Created Successfully!",
        description: "Your trip is now visible to other students.",
      });
      
      navigate('/matches');

    } catch (error) {
      console.error("Error creating trip:", error);
      toast({
        title: "Error",
        description: "Could not create your trip. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeLabel = () => {
    if (formData.direction.includes('Airport')) {
      return formData.direction.startsWith('College') ? 'Flight Take-Off Time' : 'Flight Landing Time';
    } else if (formData.direction.includes('Station')) {
       return formData.direction.startsWith('College') ? 'Train Departure Time' : 'Train Arrival Time';
    }
    return 'Time';
  };

  const directionOptions = [
      { value: 'College → Airport', label: 'College → Airport', description: 'Going for a flight'},
      { value: 'Airport → College', label: 'Airport → College', description: 'Returning from a flight'},
      { value: 'College → Railway Station', label: 'College → Railway Station', description: 'Catching a train'},
      { value: 'Railway Station → College', label: 'Railway Station → College', description: 'Arriving by train'},
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gradient-text">Create New Trip</h1>
        <p className="text-muted-foreground">
          Fill in your travel details to find the perfect travel companion
        </p>
      </div>

      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plane className="h-5 w-5 text-primary" />
            <span>Trip Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">Trip Direction *</Label>
              <RadioGroup
                value={formData.direction}
                onValueChange={(value) => setFormData({...formData, direction: value})}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                  {directionOptions.map(opt => (
                     <div key={opt.value} className="flex items-center space-x-2 glass p-4 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                        <RadioGroupItem value={opt.value} id={opt.value} />
                        <Label htmlFor={opt.value} className="cursor-pointer flex-1">
                            <div className="space-y-1">
                            <div className="font-medium">{opt.label}</div>
                            <div className="text-sm text-muted-foreground">{opt.description}</div>
                            </div>
                        </Label>
                    </div>
                  ))}
              </RadioGroup>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="date" className="text-base font-medium">Date *</Label>
                <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="glass border-white/20 focus:border-primary"
                    min={new Date().toISOString().split('T')[0]}
                />
                </div>

                <div className="space-y-2">
                <Label htmlFor="time" className="text-base font-medium">
                    {getTimeLabel()} *
                </Label>
                <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="glass border-white/20 focus:border-primary"
                />
                </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 mb-2">
                <Label className="text-base font-medium">Time Buffer *</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="w-64">
                      <p>
                        This is the time window before your scheduled departure/arrival. For example, if your trip is at 2 PM and you select a 1-hour buffer, you can be matched with people whose trips are between 1 PM and 2 PM.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={formData.buffer} onValueChange={(value) => setFormData({...formData, buffer: value})}>
                <SelectTrigger className="glass border-white/20 focus:border-primary">
                  <SelectValue placeholder="Select your flexible time window" />
                </SelectTrigger>
                <SelectContent className="glass border-white/20">
                  <SelectItem value="30 minutes">30 Minutes</SelectItem>
                  <SelectItem value="60 minutes">1 Hour</SelectItem>
                  <SelectItem value="90 minutes">1 Hour 30 Minutes</SelectItem>
                  <SelectItem value="120 minutes">2 Hours</SelectItem>
                  <SelectItem value="150 minutes">2 Hours 30 Minutes</SelectItem>
                  <SelectItem value="180 minutes">3 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="glass p-4 rounded-lg border-l-4 border-primary">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-primary">Important Notes</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>You can only have one active trip at a time.</li>
                    <li>Each trip allows only one successful match.</li>
                    <li>Trip data will be automatically deleted 24 hours after a match.</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-white font-medium py-3 rounded-xl glow-blue transition-all duration-300"
            >
              {isLoading ? 'Creating Trip...' : 'Create Trip'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TripInfo;
