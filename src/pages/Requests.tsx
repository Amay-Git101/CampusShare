// src/pages/Requests.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Inbox, Check, X, MessageSquare, Clock, MapPin, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useUser } from '../context/UserContext';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// Define the shape of our data after joining tables
interface PopulatedRequest {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  trip_id: string;
  match_id?: string;
  sender_profile: {
    id: string;
    full_name: string;
  } | null;
  host_profile: {
    id: string;
    full_name: string;
  } | null;
  trip: {
    direction: string;
    trip_date: string;
    trip_time: string;
  } | null;
}


const Requests = () => {
  const [sentRequests, setSentRequests] = useState<PopulatedRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<PopulatedRequest[]>([]);
  const { user, loading: userLoading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (userLoading || !user) return;

    const fetchInitialData = async () => {
      // Fetch initial received requests
      const { data: receivedData, error: receivedError } = await supabase
        .from('requests')
        .select(`
          id, status, created_at, trip_id,
          sender_profile:profiles!requests_sender_id_fkey(id, full_name),
          trip:trips!inner(direction, trip_date, trip_time)
        `)
        .eq('host_id', user.id);

      if (receivedError) console.error('Error fetching received requests:', receivedError);
      else setReceivedRequests(receivedData as PopulatedRequest[]);

      // Fetch initial sent requests
      const { data: sentData, error: sentError } = await supabase
        .from('requests')
        .select(`
          id, status, created_at, trip_id, match_id,
          host_profile:profiles!requests_host_id_fkey(id, full_name),
          trip:trips!inner(direction, trip_date, trip_time)
        `)
        .eq('sender_id', user.id);
      
      if (sentError) console.error('Error fetching sent requests:', sentError);
      else setSentRequests(sentData as PopulatedRequest[]);
    };

    fetchInitialData();

    // Set up real-time subscriptions
    const channel = supabase.channel('public:requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' },
        (payload) => {
          console.log('Change received!', payload);
          // Refetch all data on any change for simplicity
          fetchInitialData();
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userLoading]);

  const handleAcceptRequest = async (requestToAccept: PopulatedRequest) => {
    if (!user || !requestToAccept.sender_profile) return;
  
    try {
      // Use an RPC function to handle the transaction securely
      const { data: match, error } = await supabase.rpc('accept_request_and_create_match', {
        request_id_to_accept: requestToAccept.id,
        p_trip_id: requestToAccept.trip_id,
        p_host_id: user.id,
        p_sender_id: requestToAccept.sender_profile.id,
      });
  
      if (error) throw error;
  
      toast({ title: "Match Created!", description: `Your match with ${requestToAccept.sender_profile.full_name} is confirmed.` });
      
      // The RPC function returns the new match's ID
      if (match && match.id) {
        navigate(`/chat/${match.id}`);
      } else {
         // Fallback if the match ID isn't returned for some reason
        const { data: newMatch } = await supabase.from('requests').select('match_id').eq('id', requestToAccept.id).single();
        if(newMatch?.match_id) navigate(`/chat/${newMatch.match_id}`);
      }
    } catch (error: any) {
      console.error("Error accepting request: ", error);
      toast({ title: "Error", description: `Could not accept the request: ${error.message}`, variant: "destructive" });
    }
  };

  const handleRejectRequest = async (requestId: string, senderName: string) => {
    try {
        const { error } = await supabase
          .from('requests')
          .update({ status: 'rejected' })
          .eq('id', requestId);

        if (error) throw error;

        toast({ title: "Request Declined", description: `Request from ${senderName} has been declined.`, variant: "destructive" });
    } catch (error: any) {
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
  
  const formatDate = (timestamp: string | undefined) => {
      if (!timestamp) return '...';
      return new Date(timestamp).toLocaleString();
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
                {receivedRequests.length === 0 ? (
                    <Card className="glass border-0"><CardContent className="p-8 text-center"><Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-medium">No requests received</h3><p className="text-muted-foreground text-sm">When someone requests to join your trip, it will appear here.</p></CardContent></Card>
                ) : (
                    receivedRequests.map((request) => (
                        <Card key={request.id} className="glass border-0">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"><span className="text-white font-semibold">{request.sender_profile?.full_name.split(' ').map(n => n[0]).join('')}</span></div>
                                        <div><p className="font-semibold">{request.sender_profile?.full_name}</p></div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>{getStatusText(request.status)}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {request.trip && (
                                    <div className="space-y-2 text-sm border-t border-white/10 pt-3 mt-3">
                                        <div className="flex items-center space-x-2"><MapPin className="h-4 w-4 text-primary" /><span>{request.trip.direction}</span></div>
                                        <div className="flex items-center space-x-2"><Clock className="h-4 w-4 text-accent" /><span>{new Date(request.trip.trip_date).toLocaleDateString()} at {request.trip.trip_time}</span></div>
                                    </div>
                                )}
                                <div className="text-xs text-muted-foreground">Received: {formatDate(request.created_at)}</div>
                                {request.status === 'pending' && (
                                    <div className="flex space-x-3">
                                        <Button onClick={() => handleAcceptRequest(request)} className="flex-1 bg-green-600 hover:bg-green-700 text-white"><Check className="h-4 w-4 mr-2" />Accept</Button>
                                        <Button onClick={() => handleRejectRequest(request.id, request.sender_profile?.full_name || 'user')} variant="outline" className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"><X className="h-4 w-4 mr-2" />Decline</Button>
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
                                            <Button onClick={() => navigate(`/chat/${request.match_id}`)} size="sm">Go to Chat <ArrowRight className="h-4 w-4 ml-2" /></Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </TabsContent>
            <TabsContent value="sent" className="space-y-4 mt-4">
                {sentRequests.length === 0 ? (
                    <Card className="glass border-0"><CardContent className="p-8 text-center"><Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-medium">No requests sent</h3><p className="text-muted-foreground text-sm">Your sent requests will appear here.</p></CardContent></Card>
                ) : (
                    sentRequests.map((request) => (
                        <Card key={request.id} className="glass border-0">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"><span className="text-white font-semibold">{request.host_profile?.full_name.split(' ').map(n => n[0]).join('')}</span></div>
                                        <div><p className="font-semibold">{request.host_profile?.full_name}</p><p className="text-sm text-muted-foreground">Trip Host</p></div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>{getStatusText(request.status)}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {request.trip && (
                                    <div className="space-y-2 text-sm border-t border-white/10 pt-2 mt-2">
                                        <div className="flex items-center space-x-2"><MapPin className="h-4 w-4 text-primary" /><span>{request.trip.direction}</span></div>
                                        <div className="flex items-center space-x-2"><Clock className="h-4 w-4 text-accent" /><span>{new Date(request.trip.trip_date).toLocaleDateString()} at {request.trip.trip_time}</span></div>
                                    </div>
                                )}
                                <div className="text-xs text-muted-foreground pt-2">Sent: {formatDate(request.created_at)}</div>
                                {request.status === 'accepted' && (
                                    <div className="glass p-4 rounded-lg border-l-4 border-green-500 mt-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <MessageSquare className="h-4 w-4 text-green-400" />
                                                <div className="text-sm">
                                                    <p className="text-green-400 font-medium">Your request was accepted!</p>
                                                    <p className="text-muted-foreground">Start the conversation.</p>
                                                </div>
                                            </div>
                                            <Button onClick={() => navigate(`/chat/${request.match_id}`)} size="sm">Go to Chat <ArrowRight className="h-4 w-4 ml-2" /></Button>
                                        </div>
                                    </div>
                                )}
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