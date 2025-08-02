import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Mail, Phone, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    registrationNumber: "",
    gender: "",
    whatsappNumber: "",
    agreedToTerms: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.email) {
        setUser(currentUser);

        let fullName = currentUser.displayName || '';
        let registrationNumber = '';

        const regNumberMatch = fullName.match(/\(([^)]+)\)/);
        if (regNumberMatch) {
          registrationNumber = regNumberMatch[1];
          fullName = fullName.replace(/\s*\(([^)]+)\)/, '').trim();
        } else {
          registrationNumber = currentUser.email.split('@')[0].split('.').pop() || '';
        }
        
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({
            fullName: fullName,
            email: currentUser.email,
            registrationNumber: registrationNumber.toUpperCase(),
            gender: userData.gender || "",
            whatsappNumber: userData.whatsappNumber || "",
            agreedToTerms: true 
          });
          if (userData.gender && userData.whatsappNumber) {
            setIsEditing(false);
          } else {
            setIsEditing(true);
          }
        } else {
          setFormData(prev => ({
            ...prev,
            fullName: fullName,
            email: currentUser.email,
            registrationNumber: registrationNumber.toUpperCase(),
            gender: '',
            whatsappNumber: '',
            agreedToTerms: false
          }));
          setIsEditing(true);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!formData.gender) {
      toast({ title: "Missing Information", description: "Please select your gender.", variant: "destructive" });
      return;
    }
    if (!formData.whatsappNumber || formData.whatsappNumber.replace(/^\+91-/, '').length !== 10) {
      toast({ title: "Invalid Number", description: "WhatsApp number must be 10 digits.", variant: "destructive" });
      return;
    }
    if (!formData.agreedToTerms) {
      toast({ title: "Terms Required", description: "Please accept the Terms of Use and Privacy Policy.", variant: "destructive" });
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        email: user.email,
        fullName: formData.fullName,
        registrationNumber: formData.registrationNumber,
        gender: formData.gender,
        whatsappNumber: formData.whatsappNumber
      }, { merge: true });

      setIsEditing(false);
      toast({
        title: "Profile Updated!",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving profile: ", error);
      toast({ title: "Error", description: "Could not save your profile.", variant: "destructive" });
    }
  };
  
  const handleWhatsAppChange = (value: string) => {
    let cleanNumber = value.replace(/^\+91-/, '').replace(/[^\d]/g, '');
    if (cleanNumber.length > 10) {
      cleanNumber = cleanNumber.slice(0, 10);
    }
    setFormData({...formData, whatsappNumber: `+91-${cleanNumber}`});
  };

  if (loading) {
    return <div className="text-center text-white">Loading profile...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gradient-text">Profile Setup</h1>
        <p className="text-muted-foreground">
          Complete your profile to start using CAB POOL
        </p>
      </div>

      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <span>Personal Information</span>
            {!isEditing && formData.gender && <CheckCircle className="h-5 w-5 text-green-400 ml-auto" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                <Input value={formData.fullName} readOnly className="glass border-white/10 bg-white/5 cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Registration Number</Label>
                <Input value={formData.registrationNumber} readOnly className="glass border-white/10 bg-white/5 cursor-not-allowed" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={formData.email} readOnly className="pl-9 glass border-white/10 bg-white/5 cursor-not-allowed" />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Gender *</Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => setFormData({...formData, gender: value})}
                className="grid grid-cols-2 gap-4"
                disabled={!isEditing}
              >
                <div className={`flex items-center space-x-2 glass p-4 rounded-lg cursor-pointer hover:bg-white/10 transition-colors ${!isEditing ? 'opacity-60' : ''}`}>
                  <RadioGroupItem value="male" id="male" disabled={!isEditing} />
                  <Label htmlFor="male" className="cursor-pointer font-medium">Male</Label>
                </div>
                <div className={`flex items-center space-x-2 glass p-4 rounded-lg cursor-pointer hover:bg-white/10 transition-colors ${!isEditing ? 'opacity-60' : ''}`}>
                  <RadioGroupItem value="female" id="female" disabled={!isEditing} />
                  <Label htmlFor="female" className="cursor-pointer font-medium">Female</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-base font-medium">WhatsApp Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="whatsapp"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleWhatsAppChange(e.target.value)}
                  placeholder="+91-XXXXXXXXXX"
                  className="pl-9 glass border-white/20 focus:border-primary"
                  disabled={!isEditing}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This number will be shared with matched travelers for coordination
              </p>
            </div>
            
            <div className="glass p-4 rounded-lg border-l-4 border-yellow-500">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-yellow-500">Important Notice</p>
                  <p className="text-sm text-muted-foreground">
                    Certain fields cannot be changed later—please verify carefully.
                    Your gender preference will be used for matching and cannot be modified after saving.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 glass p-4 rounded-lg">
              <Checkbox
                id="terms"
                checked={formData.agreedToTerms}
                onCheckedChange={(checked) => setFormData({...formData, agreedToTerms: checked as boolean})}
                className="mt-1"
                disabled={!isEditing}
              />
              <Label htmlFor="terms" className="text-sm cursor-pointer">
                I agree to the{' '}
                <a href="/terms" className="text-primary hover:text-accent underline">
                  Terms of Use and Privacy Policy
                </a>
                .
              </Label>
            </div>

            <div className="flex space-x-4">
              {isEditing ? (
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-white font-medium py-3 rounded-xl glow-blue transition-all duration-300"
                >
                  Save Profile
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="flex-1 glass border-white/20 hover:bg-white/10"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;