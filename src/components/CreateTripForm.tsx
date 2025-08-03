// src/components/CreateTripForm.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { db } from '../firebase'; // Corrected import path
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useUser } from '../context/UserContext'; // Corrected import path
import { useNavigate } from 'react-router-dom';

const CreateTripForm = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [direction, setDirection] = useState('College → Airport');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [buffer, setBuffer] = useState('15');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await addDoc(collection(db, "trips"), {
        hostUid: user.uid,
        name: user.fullName,
        direction: direction,
        details: details,
        date: date,
        time: time,
        buffer: `${buffer} minutes`,
        status: "open",
        createdAt: serverTimestamp(),
      });
      toast({ title: "Success!", description: "Your share has been posted." });
      navigate('/matches');
    } catch (error) {
      setIsLoading(false);
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label>Direction</label>
        <Select value={direction} onValueChange={setDirection}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="College → Airport">College → Airport</SelectItem>
            <SelectItem value="Airport → College">Airport → College</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label>Details</label>
        <Textarea placeholder="e.g., 'Leaving from main gate...'" value={details} onChange={(e) => setDetails(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <label>Date & Time</label>
        <div className="flex gap-4">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-2">
        <label>Buffer Time</label>
        <Select value={buffer} onValueChange={setBuffer}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 minutes</SelectItem>
            <SelectItem value="10">10 minutes</SelectItem>
            <SelectItem value="15">15 minutes</SelectItem>
            <SelectItem value="30">30 minutes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Posting..." : "Post Share"}
      </Button>
    </form>
  );
};

export default CreateTripForm;