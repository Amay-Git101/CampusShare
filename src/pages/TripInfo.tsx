
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plane, Clock, Users, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const TripInfo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    direction: '',
    flightDate: '',
    flightTime: '',
    timeBuffer: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['direction', 'flightDate', 'flightTime', 'timeBuffer'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Simulate trip creation
    toast({
      title: "Trip Created Successfully!",
      description: "Your trip has been created and is now visible to potential matches.",
    });
    
    navigate('/matches');
  };

  const getTimeLabel = () => {
    if (formData.direction === 'to-airport') {
      return 'Flight Take-Off Time';
    } else if (formData.direction === 'from-airport') {
      return 'Flight Landing Time';
    }
    return 'Flight Time';
  };

  const getBufferLabel = () => {
    if (formData.direction === 'to-airport') {
      return 'Preferred Arrival Time at Airport';
    } else if (formData.direction === 'from-airport') {
      return 'Preferred Waiting Time After Landing';
    }
    return 'Time Buffer';
  };

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
            {/* Trip Direction */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Trip Direction *</Label>
              <RadioGroup
                value={formData.direction}
                onValueChange={(value) => setFormData({...formData, direction: value})}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 glass p-4 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                  <RadioGroupItem value="to-airport" id="to-airport" />
                  <Label htmlFor="to-airport" className="cursor-pointer flex-1">
                    <div className="space-y-1">
                      <div className="font-medium">College → Airport</div>
                      <div className="text-sm text-muted-foreground">Going home for vacation</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 glass p-4 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                  <RadioGroupItem value="from-airport" id="from-airport" />
                  <Label htmlFor="from-airport" className="cursor-pointer flex-1">
                    <div className="space-y-1">
                      <div className="font-medium">Airport → College</div>
                      <div className="text-sm text-muted-foreground">Returning to college</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Flight Date */}
            <div className="space-y-2">
              <Label htmlFor="flightDate" className="text-base font-medium">Flight Date *</Label>
              <Input
                id="flightDate"
                type="date"
                value={formData.flightDate}
                onChange={(e) => setFormData({...formData, flightDate: e.target.value})}
                className="glass border-white/20 focus:border-primary"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Flight Time */}
            <div className="space-y-2">
              <Label htmlFor="flightTime" className="text-base font-medium">
                {getTimeLabel()} *
              </Label>
              <Input
                id="flightTime"
                type="time"
                value={formData.flightTime}
                onChange={(e) => setFormData({...formData, flightTime: e.target.value})}
                className="glass border-white/20 focus:border-primary"
              />
            </div>

            {/* Time Buffer */}
            <div className="space-y-2">
              <Label className="text-base font-medium">
                {getBufferLabel()} *
              </Label>
              <Select value={formData.timeBuffer} onValueChange={(value) => setFormData({...formData, timeBuffer: value})}>
                <SelectTrigger className="glass border-white/20 focus:border-primary">
                  <SelectValue placeholder="Select time buffer" />
                </SelectTrigger>
                <SelectContent className="glass border-white/20">
                  <SelectItem value="30min">30 Minutes</SelectItem>
                  <SelectItem value="1hour">1 Hour</SelectItem>
                  <SelectItem value="1.5hour">1 Hour 30 Minutes</SelectItem>
                  <SelectItem value="2hour">2 Hours</SelectItem>
                  <SelectItem value="2.5hour">2 Hours 30 Minutes</SelectItem>
                  <SelectItem value="3hour">3 Hours</SelectItem>
                  <SelectItem value="3hour+">More than 3 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>


            {/* Info Box */}
            <div className="glass p-4 rounded-lg border-l-4 border-primary">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-primary">Important Notes</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• You can only have one active trip at a time</li>
                    <li>• Each trip allows only one match</li>
                    <li>• Trip data will be automatically deleted 24 hours after matching</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-white font-medium py-3 rounded-xl glow-blue transition-all duration-300"
            >
              Create Trip
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TripInfo;
