// src/pages/Chat.tsx

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, Phone, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useUser } from '../context/UserContext';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

// Interface for a chat message from Supabase
interface Message {
  id: string;
  text: string;
  sender_id: string;
  created_at: string;
}

// Interface for the match document with joined profiles
interface Match {
    id: string;
    host_id: string;
    sender_id: string;
    host_profile: { full_name: string; whatsapp_number: string } | null;
    sender_profile: { full_name: string; whatsapp_number: string } | null;
}

const Chat = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [match, setMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<{ id: string, name: string, whatsapp: string } | null>(null);

  useEffect(() => {
    if (!chatId || !user) return;

    const fetchMatchAndMessages = async () => {
        setLoading(true);
        // Fetch match details and the profiles of both users in one go
        const { data: matchData, error: matchError } = await supabase
            .from('matches')
            .select(`
                id,
                host_id,
                sender_id,
                host_profile:profiles!matches_host_id_fkey(full_name, whatsapp_number),
                sender_profile:profiles!matches_sender_id_fkey(full_name, whatsapp_number)
            `)
            .eq('id', chatId)
            .single();

        if (matchError || !matchData) {
            toast({ title: "Error", description: "Chat not found.", variant: "destructive" });
            navigate('/requests');
            return;
        }

        setMatch(matchData as Match);

        // Determine who the "other user" is
        const isHost = user.id === matchData.host_id;
        const otherProfile = isHost ? matchData.sender_profile : matchData.host_profile;
        const otherUserId = isHost ? matchData.sender_id : matchData.host_id;
        
        if (otherProfile) {
            setOtherUser({
                id: otherUserId,
                name: otherProfile.full_name,
                whatsapp: otherProfile.whatsapp_number
            });
        }
        
        // Fetch initial messages
        const { data: messagesData, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .eq('match_id', chatId)
            .order('created_at', { ascending: true });

        if (messagesError) {
            console.error("Error fetching messages:", messagesError);
        } else {
            setMessages(messagesData);
        }
        setLoading(false);
    };

    fetchMatchAndMessages();

    // Set up real-time subscription for new messages in this chat
    const messageSubscription = supabase
        .channel(`public:messages:match_id=eq.${chatId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${chatId}` },
            (payload) => {
                setMessages((currentMessages) => [...currentMessages, payload.new as Message]);
            }
        )
        .subscribe();
    
    // Cleanup on unmount
    return () => {
        supabase.removeChannel(messageSubscription);
    };
  }, [chatId, user, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !chatId) return;

    const textToSend = newMessage;
    setNewMessage('');

    await supabase.from('messages').insert({
      text: textToSend,
      sender_id: user.id,
      match_id: chatId,
    });
  };

  if (loading) {
    return <div className="text-center text-white p-10">Loading Chat...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-8">
      <Card className="glass border-0 flex flex-col h-[75vh]">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/requests')}><ArrowLeft className="h-5 w-5" /></Button>
            <CardTitle className="text-lg">{otherUser?.name || "Match"}</CardTitle>
          </div>
          {otherUser?.whatsapp && (
             <Button asChild size="sm" variant="outline" className="glass hover:bg-white/10">
                <a href={`https://wa.me/${otherUser.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact
                </a>
             </Button>
          )}
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={cn('flex items-end gap-2', isMe ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-xs md:max-w-md p-3 rounded-2xl', isMe ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted/50 rounded-bl-none')}>
                  <p className="text-sm" style={{ wordBreak: 'break-word' }}>{msg.text}</p>
                  <p className={cn('text-xs mt-1 text-right', isMe ? 'text-blue-200' : 'text-gray-400')}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </CardContent>

        <CardFooter className="p-2 border-t border-white/10 flex flex-col gap-2">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex w-full items-center gap-2">
            <Input type="text" placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1 glass border-white/20"/>
            <Button type="submit" size="icon" className="flex-shrink-0"><Send className="h-4 w-4" /></Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Chat;