// src/pages/Requests.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Inbox, Check, X, MessageSquare, Clock, MapPin, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useUser } from '../context/UserContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, writeBatch, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';

// Interfaces for our data structures
interface Request {
  id: string;
  hostName: string;
  hostUid: string;
  senderName: string;
  senderUid: string;
  status: 'pending' | 'accepted' | 'rejected';
  tripId: string;
  tripDetails?: TripDetails; 
  sentAt: { seconds: number, nanoseconds: number };
  matchId?: string;
}

interface TripDetails {
    direction: string;
    date: string;
    time: string;
}

const Requests = () => {
  const [sentRequests, setSentRequests] = useState<Request[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<Request[]>([]);
  const { user, loading: userLoading } = useUser(); // Use loading state from context
  const navigate = useNavigate();

  useEffect(() => {
    // **THE FIX:** Wait until the user object is fully loaded before setting up listeners.
    if (userLoading || !user) {
      return; 
    }

    // This function fetches the associated trip details for each request
    const fetchTripDetails = async (requests: Request[]): Promise<Request[]> => {
        return Promise.all(requests.map(async (req) => {
            if (!req.tripId) return req;
            const tripRef = doc(db, "trips", req.tripId);
            const tripSnap = await getDoc(tripRef);
            return tripSnap.exists() ? { ...req, tripDetails: tripSnap.data() as TripDetails } : req;
        }));
    };

    // --- Set up REAL-TIME listeners ---

    // Listener for requests RECEIVED by the current user
    const receivedQuery = query(collection(db, "requests"), where("hostUid", "==", user.uid));
    const unsubscribeReceived = onSnapshot(receivedQuery, async (snapshot) => {
      const requestsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Request));
      const withDetails = await fetchTripDetails(requestsData);
      setReceivedRequests(withDetails);
    }, (error) => {
        console.error("Error fetching received requests:", error);
    });

    // Listener for requests SENT by the current user
    const sentQuery = query(collection(db, "requests"), where("senderUid", "==", user.uid));
    const unsubscribeSent = onSnapshot(sentQuery, async (snapshot) => {
      const requestsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Request));
      const withDetails = await fetchTripDetails(requestsData);
      setSentRequests(withDetails);
    }, (error) => {
        console.error("Error fetching sent requests:", error);
    });

    // Cleanup listeners when the component unmounts
    return () => {
      unsubscribeReceived();
      unsubscribeSent();
    };
  }, [user, userLoading]); // Re-run this effect when the user or loading state changes

  const handleAcceptRequest = async (requestToAccept: Request) => {
    if (!user) return;
    const batch = writeBatch(db);
    const matchRef = doc(collection(db, "matches"));
    
    batch.set(matchRef, {
        tripId: requestToAccept.tripId,
        users: [requestToAccept.hostUid, requestToAccept.senderUid],
        userNames: { [requestToAccept.hostUid]: requestToAccept.hostName, [requestToAccept.senderUid]: requestToAccept.senderName },
        createdAt: serverTimestamp(),
    });
    
    const acceptedReqRef = doc(db, "requests", requestToAccept.id);
    batch.update(acceptedReqRef, { status: "accepted", matchId: matchRef.id });

    const tripRef = doc(db, "trips", requestToAccept.tripId);
    batch.update(tripRef, { status: "matched" });
    
    receivedRequests
        .filter(req => req.tripId === requestToAccept.tripId && req.id !== requestToAccept.id && req.status === 'pending')
        .forEach(req => {
            const reqRef = doc(db, "requests", req.id);
            batch.update(reqRef, { status: "rejected" });
        });

    try {
        await batch.commit();
        toast({ title: "Match Created!", description: `Your match with ${requestToAccept.senderName} is confirmed.` });
        navigate(`/chat/${matchRef.id}`, { state: { otherUserName: requestToAccept.senderName } });
    } catch (error) {
        console.error("Error accepting request: ", error);
        toast({ title: "Error", description: "Could not accept the request.", variant: "destructive" });
    }
  };

  const handleRejectRequest = async (requestId: string, senderName: string) => {
    const reqRef = doc(db, "requests", requestId);
    try {
        await updateDoc(reqRef, { status: 'rejected' });
        toast({ title: "Request Declined", description: `Request from ${senderName} has been declined.`, variant: "destructive" });
    } catch (error) {
        console.error("Error rejecting request: ", error);
        toast({ title: "Error", description: "Could not decline the request.", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return '✅ Matched';
      case 'rejected': return '❌ Declined';
      default: return '⏳ Pending';
    }
  };
  
  const formatDate = (timestamp: { seconds: number } | undefined) => {
      if (!timestamp) return '...';
      return new Date(timestamp.seconds * 1000).toLocaleString();
  }

  if (userLoading) {
    return <div className="text-center text-white p-10">Loading your requests...</div>;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gradient-text">My Requests</h1>
        <p className="text-muted-foreground">Manage your sent and received trip requests</p>
      </div>
      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-2 glass border-white/20">
          <TabsTrigger value="received">
            <Inbox className="h-4 w-4 mr-2" />
            <span>Received ({receivedRequests.filter(r => r.status === 'pending').length})</span>
          </TabsTrigger>
          <TabsTrigger value="sent">
            <Send className="h-4 w-4 mr-2" />
            <span>Sent ({sentRequests.filter(r => r.status === 'pending').length})</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="received" className="space-y-4 mt-4">
          {!userLoading && receivedRequests.length === 0 ? (
            <Card className="glass border-0"><CardContent className="p-8 text-center"><Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-medium">No requests received</h3><p className="text-muted-foreground text-sm">When someone requests to join your trip, it will appear here.</p></CardContent></Card>
          ) : (
            receivedRequests.map((request) => (
              <Card key={request.id} className="glass border-0">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"><span className="text-white font-semibold">{request.senderName.split(' ').map(n=>n[0]).join('')}</span></div>
                      <div><p className="font-semibold">{request.senderName}</p></div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>{getStatusText(request.status)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {request.tripDetails && (
                    <div className="space-y-2 text-sm border-t border-white/10 pt-3 mt-3">
                        <div className="flex items-center space-x-2"><MapPin className="h-4 w-4 text-primary" /><span>{request.tripDetails.direction}</span></div>
                        <div className="flex items-center space-x-2"><Clock className="h-4 w-4 text-accent" /><span>{new Date(request.tripDetails.date).toLocaleDateString()} at {request.tripDetails.time}</span></div>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">Received: {formatDate(request.sentAt)}</div>
                  {request.status === 'pending' && (
                    <div className="flex space-x-3">
                      <Button onClick={() => handleAcceptRequest(request)} className="flex-1 bg-green-600 hover:bg-green-700 text-white"><Check className="h-4 w-4 mr-2" />Accept</Button>
                      <Button onClick={() => handleRejectRequest(request.id, request.senderName)} variant="outline" className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"><X className="h-4 w-4 mr-2" />Decline</Button>
                    </div>
                  )}
                  {request.status === 'accepted' && (
                    <div className="glass p-4 rounded-lg border-l-4 border-green-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4 text-green-400" />
                          <div className="text-sm">
                            <p className="text-green-400 font-medium">Match successful!</p>
                            <p className="text-muted-foreground">Start the conversation.</p>
                          </div>
                        </div>
                        <Button onClick={() => navigate(`/chat/${request.matchId}`, { state: { otherUserName: request.senderName } })} size="sm">Go to Chat <ArrowRight className="h-4 w-4 ml-2" /></Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="sent" className="space-y-4 mt-4">
            {!userLoading && sentRequests.length === 0 ? (
                 <Card className="glass border-0"><CardContent className="p-8 text-center"><Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-medium">No requests sent</h3><p className="text-muted-foreground text-sm">Your sent requests will appear here.</p></CardContent></Card>
            ): (
                sentRequests.map((request) => (
                    <Card key={request.id} className="glass border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"><span className="text-white font-semibold">{request.hostName.split(' ').map(n=>n[0]).join('')}</span></div>
                                    <div><p className="font-semibold">{request.hostName}</p><p className="text-sm text-muted-foreground">Trip Host</p></div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>{getStatusText(request.status)}</span>
                            </CardTitle>
                        </CardHeader>
                         <CardContent className="space-y-2">
                            {request.tripDetails && (
                                <div className="space-y-2 text-sm border-t border-white/10 pt-2 mt-2">
                                    <div className="flex items-center space-x-2"><MapPin className="h-4 w-4 text-primary" /><span>{request.tripDetails.direction}</span></div>
                                    <div className="flex items-center space-x-2"><Clock className="h-4 w-4 text-accent" /><span>{new Date(request.tripDetails.date).toLocaleDateString()} at {request.tripDetails.time}</span></div>
                                </div>
                            )}
                             <div className="text-xs text-muted-foreground pt-2">Sent: {formatDate(request.sentAt)}</div>
                        </CardContent>
                    </Card>
                ))
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Requests;
