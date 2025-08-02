import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Clock, User, Send, Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { useUser } from '@/context/UserContext'; // Import useUser hook

interface Trip {
  id: string;
  name: string;
  gender: string;
  direction: string;
  date: string;
  time: string;
  buffer: string;
  hostUid: string;
}

const Matches = () => {
  const { user: currentUser, loading: userLoading } = useUser(); // Get current user from context
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDirection, setFilterDirection] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [sentRequests, setSentRequests] = useState(new Set());

  useEffect(() => {
    if (userLoading) return; // Wait for user data to be available

    const fetchTrips = async () => {
      try {
        if (!currentUser) return;

        const tripsRef = collection(db, "trips");
        const q = query(
          tripsRef, 
          where("status", "==", "open"),
          where("hostUid", "!=", currentUser.uid)
        );

        const querySnapshot = await getDocs(q);
        const tripsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Trip));
        
        setAllTrips(tripsData);
        setFilteredTrips(tripsData);
      } catch (error) {
        console.error("Error fetching trips: ", error);
        toast({ title: "Error", description: "Could not fetch available trips.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [currentUser, userLoading]);

  useEffect(() => {
    let trips = allTrips;
    if (searchTerm) {
      trips = trips.filter(trip => 
        trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.direction.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterDirection !== 'all') {
      trips = trips.filter(trip => trip.direction === filterDirection);
    }
    if (filterGender !== 'all') {
      trips = trips.filter(trip => trip.gender.toLowerCase() === filterGender);
    }
    setFilteredTrips(trips);
  }, [searchTerm, filterDirection, filterGender, allTrips]);

  const handleSendRequest = async (trip: Trip) => {
    if (!currentUser) {
        toast({ title: "Error", description: "You must be logged in to send a request.", variant: "destructive" });
        return;
    }
    
    try {
      // Create a new request document in the 'requests' collection
      await addDoc(collection(db, "requests"), {
        tripId: trip.id,
        direction: trip.direction,
        date: trip.date,
        time: trip.time,
        
        hostUid: trip.hostUid,
        hostName: trip.name,

        senderUid: currentUser.uid,
        senderName: currentUser.fullName,
        senderGender: currentUser.gender,
        
        status: "pending", // pending, accepted, rejected
        sentAt: serverTimestamp(),
      });

      setSentRequests(prev => new Set(prev).add(trip.id));
      toast({
        title: "Request Sent!",
        description: `Your join request has been sent to ${trip.name}.`,
      });

    } catch (error) {
        console.error("Error sending request: ", error);
        toast({ title: "Error", description: "Could not send your request.", variant: "destructive" });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDirection('all');
    setFilterGender('all');
  };

  if (loading || userLoading) {
    return <div className="text-center text-white p-10">Searching for available trips...</div>;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gradient-text">Find Travel Matches</h1>
        <p className="text-muted-foreground">
          Browse available trips and find your perfect travel companion
        </p>
      </div>

      <Card className="glass border-0">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 glass border-white/20 focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Direction</label>
                <Select value={filterDirection} onValueChange={setFilterDirection}>
                  <SelectTrigger className="glass border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/20">
                    <SelectItem value="all">All Directions</SelectItem>
                    <SelectItem value="College → Airport">College → Airport</SelectItem>
                    <SelectItem value="Airport → College">Airport → College</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Gender</label>
                <Select value={filterGender} onValueChange={setFilterGender}>
                  <SelectTrigger className="glass border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/20">
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full glass border-white/20 hover:bg-white/10"
                  onClick={clearFilters}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Available Trips</h2>
          <span className="text-sm text-muted-foreground">
            {filteredTrips.length} trip{filteredTrips.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {filteredTrips.length === 0 ? (
          <Card className="glass border-0">
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No trips found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or create your own trip.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTrips.map((trip) => (
              <Card key={trip.id} className="glass glass-hover border-0 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">{trip.name}</p>
                        <p className="text-sm text-muted-foreground">{trip.gender}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      trip.gender === 'Male' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-pink-500/20 text-pink-400'
                    }`}>
                      {trip.gender}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium">{trip.direction}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-accent" />
                      <span>{new Date(trip.date).toLocaleDateString()} at {trip.time}</span>
                    </div>
                    
                    <div className="text-sm">
                      <span className="text-muted-foreground">Buffer: </span>
                      <span className="font-medium">{trip.buffer}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSendRequest(trip)}
                    disabled={sentRequests.has(trip.id)}
                    className={`w-full font-medium py-2 rounded-lg transition-all duration-300 ${
                      sentRequests.has(trip.id)
                        ? 'bg-green-600/20 text-green-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-white glow-blue'
                    }`}
                  >
                    {sentRequests.has(trip.id) ? (
                      <>✓ Request Sent</>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Join Request
                      </>
                    )}
                  </Button>
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