// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Mail, Phone, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/context/UserContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, loading: userLoading } = useUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    registration_number: "",
    whatsapp_number: "",
    agreedToTerms: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Pre-fill form with data from UserContext
      setFormData({
        full_name: user.full_name || user.supabaseUser.user_metadata.full_name || '',
        email: user.email || user.supabaseUser.email || '',
        registration_number: user.registration_number || '',
        whatsapp_number: user.whatsapp_number || '',
        agreedToTerms: !!user.whatsapp_number // If whatsapp number exists, they must have agreed
      });

      // If the user's profile is incomplete (e.g., no whatsapp_number), force editing mode.
      if (!user.whatsapp_number) {
        setIsEditing(true);
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.whatsapp_number || formData.whatsapp_number.replace(/^\+91-/, '').length !== 10) {
      toast({ title: "Invalid Number", description: "WhatsApp number must be 10 digits.", variant: "destructive" });
      return;
    }
    if (!formData.agreedToTerms) {
      toast({ title: "Terms Required", description: "Please accept the Terms of Use and Privacy Policy.", variant: "destructive" });
      return;
    }

    setLoading(true);

    // Extract registration number from email if it's not already set
    const registrationNumber = formData.registration_number || user.supabaseUser.email?.split('@')[0].split('.').pop()?.toUpperCase() || '';
    const fullNameFromMetadata = user.supabaseUser.user_metadata.full_name.replace(/\s*\(([^)]+)\)/, '').trim();

    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id, // The user's auth ID is the primary key
        updated_at: new Date().toISOString(),
        full_name: fullNameFromMetadata,
        email: formData.email,
        registration_number: registrationNumber,
        whatsapp_number: formData.whatsapp_number,
      });

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: "Profile Updated!",
        description: "Your profile has been saved successfully.",
      });
      // Optionally, you can trigger a refresh of the user context here if needed,
      // but the onAuthStateChange should handle it on next load.
    } catch (error: any) {
      console.error("Error saving profile: ", error);
      toast({ title: "Error", description: "Could not save your profile. " + error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  
  const handleWhatsAppChange = (value: string) => {
    let cleanNumber = value.replace(/^\+91-/, '').replace(/[^\d]/g, '');
    if (cleanNumber.length > 10) {
      cleanNumber = cleanNumber.slice(0, 10);
    }
    setFormData({...formData, whatsapp_number: `+91-${cleanNumber}`});
  };

  if (userLoading) {
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
            {!isEditing && <CheckCircle className="h-5 w-5 text-green-400 ml-auto" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                <Input value={formData.full_name} readOnly className="glass border-white/10 bg-white/5 cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Registration Number</Label>
                <Input value={formData.registration_number} readOnly className="glass border-white/10 bg-white/5 cursor-not-allowed" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={formData.email} readOnly className="pl-9 glass border-white/10 bg-white/5 cursor-not-allowed" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-base font-medium">WhatsApp Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="whatsapp"
                  value={formData.whatsapp_number}
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
                    Please verify your details carefully before saving.
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
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-white font-medium py-3 rounded-xl glow-blue transition-all duration-300"
                >
                  {loading ? 'Saving...' : 'Save Profile'}
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