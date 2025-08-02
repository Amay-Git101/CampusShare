import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Mail, Settings, MapPin, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// ... imports
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Home = () => {
  const [user, setUser] = useState({
    name: "Loading...",
    regNo: "Loading...",
    initials: "",
    hasActiveTrip: false,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.displayName) {
        let fullName = currentUser.displayName;
        let registrationNumber = '';

        const regNumberMatch = fullName.match(/\(([^)]+)\)/);
        if (regNumberMatch) {
          registrationNumber = regNumberMatch[1];
          fullName = fullName.replace(/\s*\(([^)]+)\)/, '').trim();
        }

        setUser({
          name: fullName,
          regNo: registrationNumber,
          initials: fullName.split(' ').map(n => n[0]).join(''),
          hasActiveTrip: false,
        });
      } else {
        // Handle case where there is no user
        setUser({ name: "Guest", regNo: "", initials: "G", hasActiveTrip: false });
      }
    });

    return () => unsubscribe();
  }, []);

  // ... rest of the component
  // ... (rest of the component is the same)

  const quickActions = [
    {
      title: "Create New Trip",
      description: "Plan your airport journey",
      icon: Plus,
      link: "/trip-info",
      color: "from-blue-500 to-blue-600",
      glow: "glow-blue"
    },
    {
      title: "Find Matches",
      description: "Browse available trips",
      icon: Search,
      link: "/matches",
      color: "from-cyan-500 to-cyan-600",
      glow: "glow-cyan"
    },
    {
      title: "My Requests",
      description: "Manage sent/received requests",
      icon: Mail,
      link: "/requests",
      color: "from-purple-500 to-purple-600",
      glow: "glow-purple"
    },
    {
      title: "Settings",
      description: "Update your preferences",
      icon: Settings,
      link: "/settings",
      color: "from-emerald-500 to-emerald-600",
      glow: "glow-emerald"
    }
  ];

  const stats = [
    { label: "Active Trips", value: "247", icon: MapPin },
    { label: "Successful Matches", value: "1,234", icon: Users },
    { label: "Avg. Wait Time", value: "12 min", icon: Clock }
  ];

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-bold gradient-text animate-float">
            Welcome to CAB POOL
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Share airport rides with fellow SRM students and save money on your journey
          </p>
        </div>
        
        <div className="glass p-6 rounded-2xl max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-lg font-bold text-white">
                {user.initials}
              </span>
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.regNo}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="glass glass-hover border-0">
            <CardContent className="p-6 text-center">
              <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {user.hasActiveTrip ? (
        <Card className="glass border-0 animate-pulse-glow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span>Your Active Trip</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No active trip details available</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass glass-hover border-0">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No Active Trip</h3>
                <p className="text-muted-foreground mb-4">
                  Ready to share a ride? Create your first trip and find travel companions.
                </p>
                <Button asChild className="bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-white font-medium px-8 py-3 rounded-xl transition-all duration-300 glow-blue">
                  <Link to="/trip-info">Create New Trip</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center gradient-text">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link} className="block group">
              <Card className="glass glass-hover border-0 h-full transition-transform duration-300 group-hover:scale-105">
                <CardContent className="p-6 text-center space-y-4">
                  <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mx-auto group-hover:${action.glow} transition-all duration-300`}>
                    <action.icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;