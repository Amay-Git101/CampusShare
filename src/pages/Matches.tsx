// src/pages/Matches.tsx

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Clock, User, Send, MapPin, Train } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { db } from '@/lib/supabase';
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { useUser } from '@/context/UserContext';

interface Trip {
  id: string;
  name: string;
  details: string;
  direction: string;
  date: string;
  time: string;
  buffer: string;
  hostUid: string;
}

const Matches = () => {
  const { user: currentUser, loading: userLoading } = useUser();
  const [tripsByDirection, setTripsByDirection] = useState<Record<string, Trip[]>>({});
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState(new Set());

  useEffect(() => {
    if (userLoading || !currentUser) return;

    const fetchAndGroupTrips = async () => {
      try {
        const tripsRef = collection(db, "trips");
        const q = query(tripsRef, where("status", "==", "open"), where("hostUid", "!=", currentUser.uid));
        const querySnapshot = await getDocs(q);
        const tripsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trip));
        
        // Group trips by direction
        const grouped = tripsData.reduce((acc, trip) => {
          const { direction } = trip;
          if (!acc[direction]) {
            acc[direction] = [];
          }
          acc[direction].push(trip);
          return acc;
        }, {} as Record<string, Trip[]>);

        setTripsByDirection(grouped);
      } catch (error) {
        console.error("Error fetching trips: ", error);
        toast({ title: "Error", description: "Could not fetch available trips.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchAndGroupTrips();
  }, [currentUser, userLoading]);

  const handleSendRequest = async (trip: Trip) => {
    if (!currentUser) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    try {
      await addDoc(collection(db, "requests"), { 
        tripId: trip.id, 
        hostUid: trip.hostUid, 
        hostName: trip.name, 
        senderUid: currentUser.uid, 
        senderName: currentUser.fullName, 
        status: "pending", 
        sentAt: serverTimestamp() 
      });
      setSentRequests(prev => new Set(prev).add(trip.id));
      toast({ title: "Request Sent!", description: `Your request has been sent to ${trip.name}.` });
    } catch (error) {
      console.error("Error sending request: ", error);
      toast({ title: "Error", description: "Could not send your request.", variant: "destructive" });
    }
  };

  if (loading || userLoading) {
    return <div className="text-center text-white p-10">Searching for available shares...</div>;
  }
  
  const hasTrips = Object.keys(tripsByDirection).length > 0;

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gradient-text">Available Shares</h1>
        <p className="text-muted-foreground">Browse trips posted by other students</p>
      </div>

      <div className="space-y-8">
        {!hasTrips ? (
          <Card className="glass border-0">
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No shares found</h3>
              <p className="text-muted-foreground">There are currently no open shares. Be the first to create one!</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(tripsByDirection).map(([direction, trips]) => (
            <div key={direction}>
              <h2 className="text-xl font-semibold mb-4 text-left flex items-center">
                {direction.includes('Airport') ? 
                  <MapPin className="h-5 w-5 mr-2 text-primary" /> : 
                  <Train className="h-5 w-5 mr-2 text-primary" />}
                {direction}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trips.map((trip) => (
                  <Card key={trip.id} className="glass glass-hover border-0 transition-all duration-300">
                    <CardHeader><CardTitle className="flex items-center space-x-3"><div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"><User className="h-5 w-5 text-white" /></div><div><p className="font-semibold">{trip.name}</p><p className="text-sm text-muted-foreground">Host</p></div></CardTitle></CardHeader>
                    <CardContent className="space-y-4">
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
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Matches;