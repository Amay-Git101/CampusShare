// src/pages/Chat.tsx

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, Phone, ArrowLeft, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useUser } from '../context/UserContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, updateDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';

// Interface for a chat message from Firestore
interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: { seconds: number, nanoseconds: number } | null;
}

// Interface for the match document
interface Match {
    id: string;
    users: string[];
    userNames: { [key: string]: string };
    tripId: string;
    hostNumberRevealed: boolean;
    senderNumberRevealed: boolean;
}

type ChatRole = 'sender' | 'receiver';

const Chat = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [match, setMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<{ uid: string, name: string, whatsapp?: string } | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<ChatRole | null>(null);

  // Fetch match details and listen for messages
  useEffect(() => {
    if (!chatId || !user) return;

    const matchRef = doc(db, 'matches', chatId);

    // Fetch initial match data
    getDoc(matchRef).then(docSnap => {
        if (docSnap.exists()) {
            const matchData = { id: docSnap.id, ...docSnap.data() } as Match;
            setMatch(matchData);

            // Determine roles and other user's info
            const otherUserId = matchData.users.find(uid => uid !== user.uid);
            if (otherUserId) {
                setOtherUser({ uid: otherUserId, name: matchData.userNames[otherUserId] });
                // Assuming trip creator is the receiver
                const tripCreatorId = Object.keys(matchData.userNames).find(uid => uid !== otherUserId);
                setCurrentUserRole(user.uid === tripCreatorId ? 'receiver' : 'sender');
            }
        } else {
            toast({ title: "Error", description: "Chat not found.", variant: "destructive" });
            navigate('/requests');
        }
    });

    // Set up real-time listener for messages
    const messagesQuery = query(collection(matchRef, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(messagesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId, user, navigate]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !user || !chatId) return;

    const messagesColRef = collection(db, 'matches', chatId, 'messages');
    await addDoc(messagesColRef, {
      text,
      senderId: user.uid,
      timestamp: serverTimestamp(),
    });

    if (text === newMessage) {
      setNewMessage('');
    }
  };

  const handleRevealNumber = async () => {
    if (!chatId || !currentUserRole) return;
    const matchRef = doc(db, "matches", chatId);
    const fieldToUpdate = currentUserRole === 'receiver' ? { hostNumberRevealed: true } : { senderNumberRevealed: true };
    
    try {
        await updateDoc(matchRef, fieldToUpdate);
        toast({
            title: "Number Revealed!",
            description: `Your WhatsApp number has been shared with ${otherUser?.name}.`,
        });
    } catch (error) {
        toast({ title: "Error", description: "Could not share your number.", variant: "destructive" });
    }
  };
  
  const isNumberRevealed = currentUserRole === 'receiver' ? match?.hostNumberRevealed : match?.senderNumberRevealed;

  const quickReplies = currentUserRole === 'sender' 
    ? ["Hey! Let's split the fare equally. Cool?", "I'll book the cab and share the details here.", "Can we meet near the main gate for pickup?"]
    : ["Sounds good! I'm okay with splitting the fare.", "Thanks! Share the cab details once booked.", "Main gate works for me. See you there!"];

  if (loading || !match) {
      return <div className="text-center text-white p-10">Loading Chat...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-8">
      <Card className="glass border-0 flex flex-col h-[75vh]">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/requests')}><ArrowLeft className="h-5 w-5" /></Button>
            <CardTitle className="text-lg">{otherUser?.name}</CardTitle>
          </div>
          <Button onClick={handleRevealNumber} disabled={isNumberRevealed} size="sm" variant="outline" className="glass hover:bg-white/10">
            <Phone className="h-4 w-4 mr-2" />
            {isNumberRevealed ? "Number Shared" : "Share Number"}
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isMe = msg.senderId === user?.uid;
            return (
              <div key={msg.id} className={cn('flex items-end gap-2', isMe ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-xs md:max-w-md p-3 rounded-2xl', isMe ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted/50 rounded-bl-none')}>
                  <p className="text-sm" style={{ wordBreak: 'break-word' }}>{msg.text}</p>
                  <p className={cn('text-xs mt-1 text-right', isMe ? 'text-blue-200' : 'text-gray-400')}>
                    {msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </CardContent>

        <CardFooter className="p-2 border-t border-white/10 flex flex-col gap-2">
          <div className="flex gap-2 overflow-x-auto p-2 w-full">
            {quickReplies.map((text, i) => (
              <Button key={i} variant="outline" size="sm" className="glass hover:bg-white/10 whitespace-nowrap" onClick={() => handleSendMessage(text)}>{text}</Button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(newMessage); }} className="flex w-full items-center gap-2">
            <Input type="text" placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1 glass border-white/20"/>
            <Button type="submit" size="icon" className="flex-shrink-0"><Send className="h-4 w-4" /></Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Chat;
