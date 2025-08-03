// src/pages/Home.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Mail, Settings, MapPin, Users, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';

const Home = () => {
  const [currentUser, setCurrentUser] = useState({
    name: "Loading...",
    regNo: "Loading...",
    initials: "",
  });
  const [stats, setStats] = useState({
    activeTrips: "0",
    successfulMatches: "0",
    avgBufferTime: "0 min",
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUserAuth) => {
      if (currentUserAuth && currentUserAuth.displayName) {
        let fullName = currentUserAuth.displayName;
        let registrationNumber = '';

        const regNumberMatch = fullName.match(/\(([^)]+)\)/);
        if (regNumberMatch) {
          registrationNumber = regNumberMatch[1];
          fullName = fullName.replace(/\s*\(([^)]+)\)/, '').trim();
        }

        setCurrentUser({
          name: fullName,
          regNo: registrationNumber,
          initials: fullName.split(' ').map(n => n[0]).join(''),
        });
      } else {
        setCurrentUser({ name: "Guest", regNo: "", initials: "G" });
      }
    });

    const fetchStats = async () => {
      try {
        const tripsQuery = query(collection(db, "trips"));
        const matchesQuery = query(collection(db, "requests"), where("status", "==", "accepted"));
        
        const [tripsSnapshot, matchesSnapshot] = await Promise.all([
          getDocs(tripsQuery),
          getDocs(matchesQuery)
        ]);
        
        // Calculate average buffer time
        let totalBuffer = 0;
        let tripsWithBuffer = 0;
        tripsSnapshot.forEach(doc => {
          const trip = doc.data();
          if (trip.buffer && typeof trip.buffer === 'string') {
            const bufferMinutes = parseInt(trip.buffer, 10);
            if (!isNaN(bufferMinutes)) {
              totalBuffer += bufferMinutes;
              tripsWithBuffer++;
            }
          }
        });
        const avgBuffer = tripsWithBuffer > 0 ? Math.round(totalBuffer / tripsWithBuffer) : 0;

        setStats({
          activeTrips: tripsSnapshot.size.toLocaleString(),
          successfulMatches: matchesSnapshot.size.toLocaleString(),
          avgBufferTime: `${avgBuffer} min`
        });

      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };
    
    fetchStats();
    return () => unsubscribe();
  }, []);

  const quickActions = [
    {
      title: "Find Matches",
      description: "Browse available trips",
      icon: Search,
      link: "/matches",
    },
    {
      title: "My Requests",
      description: "Manage your requests",
      icon: Mail,
      link: "/requests",
    },
    {
      title: "My Profile",
      description: "View your user profile",
      icon: User,
      link: "/profile",
    },
    {
      title: "Settings",
      description: "Update your preferences",
      icon: Settings,
      link: "/settings",
    }
  ];

  const statCards = [
    { label: "Active Trips", value: loadingStats ? "..." : stats.activeTrips, icon: MapPin },
    { label: "Successful Matches", value: loadingStats ? "..." : stats.successfulMatches, icon: Users },
    { label: "Avg. Buffer Time", value: loadingStats ? "..." : stats.avgBufferTime, icon: Clock },
  ];

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-bold gradient-text animate-float">
            Welcome to CAB POOL
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Share airport rides with fellow SRM students and save money
          </p>
        </div>
        
        <div className="glass p-6 rounded-2xl max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-lg font-bold text-white">
                {currentUser.initials}
              </span>
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">{currentUser.name}</p>
              <p className="text-sm text-muted-foreground">{currentUser.regNo}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="glass glass-hover border-0">
            <CardContent className="p-6 text-center">
              <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass glass-hover border-0">
        <CardContent className="p-8 text-center">
          <Link to="/trip-info" className="block group">
            <div className="space-y-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">Create New Trip</h3>
                  <p className="text-muted-foreground mb-4">
                    Ready to share a ride? Create your first trip and find travel companions.
                  </p>
                </div>
            </div>
          </Link>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center gradient-text">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link} className="block group">
              <Card className="glass glass-hover border-0 h-full transition-transform duration-300 group-hover:scale-105">
                <CardContent className="p-6 text-center space-y-4">
                  <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto group-hover:glow-blue transition-all duration-300`}>
                    <action.icon className="h-8 w-8 text-primary" />
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