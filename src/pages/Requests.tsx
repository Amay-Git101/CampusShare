
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Inbox, Check, X, MessageSquare, Clock, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Mock data
const mockSentRequests = [
  {
    id: 1,
    recipientName: "Priya Sharma",
    direction: "College → Airport",
    date: "2025-07-15",
    time: "14:30",
    status: "pending", // pending, accepted, rejected
    sentAt: "2025-07-05 10:30"
  },
  {
    id: 2,
    recipientName: "Arjun Patel",
    direction: "Airport → College",
    date: "2025-07-20",
    time: "09:15",
    status: "rejected",
    sentAt: "2025-07-04 16:45"
  }
];

const mockReceivedRequests = [
  {
    id: 1,
    senderName: "Sneha Reddy",
    senderGender: "Female",
    direction: "College → Airport",
    date: "2025-07-18",
    time: "11:00",
    status: "pending",
    receivedAt: "2025-07-05 09:15"
  },
  {
    id: 2,
    senderName: "Rahul Kumar",
    senderGender: "Male",
    direction: "Airport → College",
    date: "2025-07-22",
    time: "16:45",
    status: "pending",
    receivedAt: "2025-07-05 14:20"
  }
];

const Requests = () => {
  const [sentRequests, setSentRequests] = useState(mockSentRequests);
  const [receivedRequests, setReceivedRequests] = useState(mockReceivedRequests);

  const handleAcceptRequest = (requestId: number, senderName: string) => {
    // Accept the selected request and reject all others
    setReceivedRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status: 'accepted' } : { ...req, status: 'rejected' }
      )
    );
    
    // Delete all sent requests when accepting one
    setSentRequests([]);
    
    toast({
      title: "Match Created!",
      description: `✅ Your match with ${senderName} has been created! This trip will auto-expire in 24 hours. All other requests have been automatically declined.`,
      duration: 5000
    });
  };

  const handleRejectRequest = (requestId: number, senderName: string) => {
    setReceivedRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status: 'rejected' } : req
      )
    );
    
    toast({
      title: "Request Declined",
      description: `Request from ${senderName} has been declined.`,
      variant: "destructive"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return '✅ Matched Successfully';
      case 'rejected':
        return '❌ Declined';
      default:
        return '⏳ Pending';
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gradient-text">My Requests</h1>
        <p className="text-muted-foreground">
          Manage your sent and received join requests
        </p>
      </div>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-2 glass border-white/20">
          <TabsTrigger value="received" className="flex items-center space-x-2">
            <Inbox className="h-4 w-4" />
            <span>Received ({receivedRequests.filter(r => r.status === 'pending').length})</span>
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center space-x-2">
            <Send className="h-4 w-4" />
            <span>Sent ({sentRequests.filter(r => r.status === 'pending').length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          <div className="space-y-4">
            {receivedRequests.length === 0 ? (
              <Card className="glass border-0">
                <CardContent className="p-8 text-center">
                  <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No requests received</h3>
                  <p className="text-muted-foreground">
                    When someone wants to join your trip, their requests will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              receivedRequests.map((request) => (
                <Card key={request.id} className="glass border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {request.senderName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{request.senderName}</p>
                          <p className="text-sm text-muted-foreground">{request.senderGender}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{request.direction}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-accent" />
                        <span>{new Date(request.date).toLocaleDateString()} at {request.time}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Received: {new Date(request.receivedAt).toLocaleString()}
                      </div>
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex space-x-3">
                        <Button
                          onClick={() => handleAcceptRequest(request.id, request.senderName)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          onClick={() => handleRejectRequest(request.id, request.senderName)}
                          variant="outline"
                          className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    )}

                    {request.status === 'accepted' && (
                      <div className="glass p-4 rounded-lg border-l-4 border-green-500">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4 text-green-400" />
                            <div className="text-sm">
                              <p className="text-green-400 font-medium">Match created successfully!</p>
                              <p className="text-muted-foreground">You can now contact each other via WhatsApp.</p>
                            </div>
                          </div>
                          <div className="bg-white/5 p-3 rounded-lg">
                            <p className="text-sm font-medium text-primary mb-1">{request.senderName}'s WhatsApp:</p>
                            <p className="text-accent font-mono text-lg">+91-9876543210</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <div className="space-y-4">
            {sentRequests.length === 0 ? (
              <Card className="glass border-0">
                <CardContent className="p-8 text-center">
                  <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No requests sent</h3>
                  <p className="text-muted-foreground">
                    Browse available trips and send join requests to potential travel companions.
                  </p>
                </CardContent>
              </Card>
            ) : (
              sentRequests.map((request) => (
                <Card key={request.id} className="glass border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {request.recipientName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{request.recipientName}</p>
                          <p className="text-sm text-muted-foreground">Trip Host</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{request.direction}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-accent" />
                      <span>{new Date(request.date).toLocaleDateString()} at {request.time}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Sent: {new Date(request.sentAt).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Requests;
