// src/pages/Auth.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Users, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from "@/lib/firebase";

// Define the props interface
interface AuthProps {
  setAuthenticated: (isAuthenticated: boolean) => void;
}

const Auth: React.FC<AuthProps> = ({ setAuthenticated }) => {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      const email = result.user.email;
      if (!email || !email.endsWith('@srmist.edu.in')) {
        await result.user.delete(); // Important: sign out and delete the user if email is invalid
        toast({
          title: "Invalid Email",
          description: "Please sign in with your official SRM email address (@srmist.edu.in)",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Logged in with Google",
        description: "Welcome! You have signed in successfully."
      });
      localStorage.setItem('cabpool_authenticated', 'true');
      setAuthenticated(true);
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Google Sign-In Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const features = [
    {
      icon: Shield,
      title: "Secure & Verified",
      description: "Only SRM students with verified email addresses"
    },
    {
      icon: Users,
      title: "Find Travel Buddies",
      description: "Connect with fellow students for airport trips"
    },
    {
      icon: Car,
      title: "Save Money",
      description: "Split cab fares and travel affordably"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f2c] via-[#101935] to-[#0f1629] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">

        <div className="space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start space-x-3 group">
              <div className="relative">
                <Car className="h-12 w-12 text-primary group-hover:text-accent transition-colors duration-300" />
                <div className="absolute -inset-2 bg-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h1 className="text-4xl font-bold gradient-text">CAB POOL</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-md mx-auto lg:mx-0">
              Share airport rides with fellow SRM students and save money on your journey
            </p>
          </div>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 glass p-4 rounded-xl">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <Card className="glass border-0">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl gradient-text">
                Welcome to CAB POOL
              </CardTitle>
              <p className="text-muted-foreground">
                Sign in with your SRM Google account to continue
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center space-y-4 pt-4">
                <Button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full bg-white text-black border hover:bg-gray-100 py-6 text-lg font-medium"
                >
                  <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.5 172.6 62.2l-67.6 64.5C335.5 113.5 295.1 98.5 248 98.5c-84.3 0-152.3 68.3-152.3 157.5s68 157.5 152.3 157.5c97.9 0 135-71.2 138.6-106.5H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                  Continue with Google
                </Button>
                <p className="text-xs text-muted-foreground text-center px-4">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;