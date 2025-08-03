// src/pages/Matches.tsx (Updated)

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Clock, User, Send, Filter, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { useUser } from '@/context/UserContext';

// 1. Re-added 'direction' to the Trip interface
interface Trip {
  id: string;
  name: string;
  details: string;
  direction: string; // <-- This is back
  date: string;
  time: string;
  buffer: string;
  hostUid: string;
}

const Matches = () => {
  const { user: currentUser, loading: userLoading } = useUser();
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 2. State for direction filter, with a required default value
  const [filterDirection, setFilterDirection] = useState('College → Airport');
  const [sentRequests, setSentRequests] = useState(new Set());

  useEffect(() => {
    // This effect fetches all 'open' trips
    if (userLoading || !currentUser) return;
    const fetchTrips = async () => {
      try {
        const tripsRef = collection(db, "trips");
        const q = query(tripsRef, where("status", "==", "open"), where("hostUid", "!=", currentUser.uid));
        const querySnapshot = await getDocs(q);
        const tripsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trip));
        setAllTrips(tripsData);
      } catch (error) {
        console.error("Error fetching trips: ", error);
        toast({ title: "Error", description: "Could not fetch available trips.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [currentUser, userLoading]);

  // 3. This effect now ONLY filters by direction
  useEffect(() => {
    const trips = allTrips.filter(trip => trip.direction === filterDirection);
    setFilteredTrips(trips);
  }, [filterDirection, allTrips]);

  const handleSendRequest = async (trip: Trip) => {
    // This function remains the same
    if (!currentUser) {
        toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
        return;
    }
    try {
      await addDoc(collection(db, "requests"), { tripId: trip.id, hostUid: trip.hostUid, hostName: trip.name, senderUid: currentUser.uid, senderName: currentUser.fullName, status: "pending", sentAt: serverTimestamp() });
      setSentRequests(prev => new Set(prev).add(trip.id));
      toast({ title: "Request Sent!", description: `Your request has been sent to ${trip.name}.` });
    } catch (error) {
        console.error("Error sending request: ", error);
        toast({ title: "Error", description: "Could not send your request.", variant: "destructive" });
    }
  };

  const clearFilters = () => {
    // Reset to the default direction
    setFilterDirection('College → Airport');
  };

  if (loading || userLoading) {
    return <div className="text-center text-white p-10">Searching for available shares...</div>;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gradient-text">Find a Share</h1>
        <p className="text-muted-foreground">Select a direction to find available shares</p>
      </div>

      {/* 4. Updated filter card */}
      <Card className="glass border-0">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Direction</label>
              <Select value={filterDirection} onValueChange={setFilterDirection}>
                <SelectTrigger className="glass border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass border-white/20">
                  {/* "All Directions" option is removed */}
                  <SelectItem value="College → Airport">College → Airport</SelectItem>
                  <SelectItem value="Airport → College">Airport → College</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full glass border-white/20 hover:bg-white/10" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredTrips.length === 0 ? (
          <Card className="glass border-0"><CardContent className="p-8 text-center"><Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-medium mb-2">No shares found</h3><p className="text-muted-foreground">There are no open shares for this direction.</p></CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTrips.map((trip) => (
              <Card key={trip.id} className="glass glass-hover border-0 transition-all duration-300">
                <CardHeader><CardTitle className="flex items-center space-x-3"><div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"><User className="h-5 w-5 text-white" /></div><div><p className="font-semibold">{trip.name}</p><p className="text-sm text-muted-foreground">Host</p></div></CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {/* 5. Added direction back to the card display */}
                  <div className="flex items-center space-x-2 text-sm font-medium">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{trip.direction}</span>
                  </div>
                  <p className="text-sm border-t border-white/10 pt-3">{trip.details}</p>
                  <div className="space-y-2 border-t border-white/10 pt-3">
                    <div className="flex items-center space-x-2 text-sm"><Clock className="h-4 w-4 text-accent" /><span>{new Date(trip.date).toLocaleDateString()} at {trip.time}</span></div>
                    <div className="text-sm"><span className="text-muted-foreground">Buffer: </span><span className="font-medium">{trip.buffer}</span></div>
                  </div>
                  <Button onClick={() => handleSendRequest(trip)} disabled={sentRequests.has(trip.id)} className={`w-full font-medium py-2 rounded-lg transition-all duration-300 ${sentRequests.has(trip.id) ? 'bg-green-600/20 text-green-400 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-white glow-blue'}`}>{sentRequests.has(trip.id) ? '✓ Request Sent' : <><Send className="h-4 w-4 mr-2" />Send Request</>}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;