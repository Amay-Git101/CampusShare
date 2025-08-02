import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, Phone, User, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '@/lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const Settings = () => {
  const [userInfo, setUserInfo] = useState({
    fullName: '',
    registrationNumber: '',
    email: '',
    whatsappNumber: ''
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

 useEffect(() => {
    // This listener waits for Firebase to be ready
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          // Once we have the user, we fetch their data
          let fullName = currentUser.displayName || '';
          let registrationNumber = '';

          const regNumberMatch = fullName.match(/\(([^)]+)\)/);
          if (regNumberMatch) {
            registrationNumber = regNumberMatch[1];
            fullName = fullName.replace(/\s*\(([^)]+)\)/, '').trim();
          }

          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let whatsapp = '';
          if (userDoc.exists()) {
            whatsapp = userDoc.data().whatsappNumber || '';
          }

          setUserInfo({
            fullName: fullName,
            registrationNumber: registrationNumber.toUpperCase(),
            email: currentUser.email || '',
            whatsappNumber: whatsapp
          });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast({
          title: "Error",
          description: "Could not load your settings.",
          variant: "destructive",
        });
      } finally {
        // This will run after the try/catch is complete
        setLoading(false);
      }
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []); // The empty array ensures this effect runs only once
  
  const handleUpdateWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userDocRef, { whatsappNumber: userInfo.whatsappNumber }, { merge: true });
      toast({
        title: "WhatsApp Updated",
        description: "Your WhatsApp number has been updated successfully.",
      });
    } catch (error) {
      toast({ title: "Error", description: "Could not update WhatsApp number.", variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('cabpool_authenticated');
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
      window.location.href = '/'; 
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "There was an error signing out.",
        variant: "destructive",
      });
    }
  };
  
  const handleWhatsAppChange = (value: string) => {
    let cleanNumber = value.replace(/^\+91-/, '').replace(/[^\d]/g, '');
    if (cleanNumber.length > 10) {
      cleanNumber = cleanNumber.slice(0, 10);
    }
    setUserInfo(prev => ({ ...prev, whatsappNumber: `+91-${cleanNumber}` }));
  };

  if (loading) {
    return <div className="text-center text-white p-10">Loading settings...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gradient-text">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and settings
        </p>
      </div>

      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <span>Account Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
              <Input
                value={userInfo.fullName}
                readOnly
                className="glass border-white/10 bg-white/5 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Registration Number</Label>
              <Input
                value={userInfo.registrationNumber}
                readOnly
                className="glass border-white/10 bg-white/5 cursor-not-allowed"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
            <Input
              value={userInfo.email}
              readOnly
              className="glass border-white/10 bg-white/5 cursor-not-allowed"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="h-5 w-5 text-primary" />
            <span>Contact Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateWhatsApp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-base font-medium">WhatsApp Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="whatsapp"
                  value={userInfo.whatsappNumber}
                  onChange={(e) => handleWhatsAppChange(e.target.value)}
                  placeholder="+91-XXXXXXXXXX"
                  className="pl-9 glass border-white/20 focus:border-primary"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This number will be shared with matched travelers for coordination
              </p>
            </div>
            <Button
              type="submit"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-white font-medium px-6 py-2 rounded-lg glow-blue transition-all duration-300"
            >
              Update WhatsApp
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5 text-primary" />
            <span>App Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Version: </span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div>
              <span className="text-muted-foreground">Last Updated: </span>
              <span className="font-medium">July 2025</span>
            </div>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" className="glass border-white/20 hover:bg-white/10">
              Privacy Policy
            </Button>
            <Button variant="outline" className="glass border-white/20 hover:bg-white/10">
              Terms of Service
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-0 border-red-500/20">
        <CardContent className="p-6">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;