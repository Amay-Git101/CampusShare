// src/App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import TripInfo from "./pages/TripInfo";
import Matches from "./pages/Matches";
import Requests from "./pages/Requests";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import Chat from "./pages/Chat";
import { useState, useEffect } from "react";
import { UserProvider, useUser } from './context/UserContext';
import { requestNotificationPermission } from '@/lib/firebase-messaging-utils';

const queryClient = new QueryClient();

const isAuthenticated = () => {
  return localStorage.getItem('cabpool_authenticated') === 'true';
};

// A new component to handle the notification logic
const NotificationHandler = () => {
  const { user } = useUser();
  const [permissionRequested, setPermissionRequested] = useState(false);

  useEffect(() => {
    // Check if there's a user and if we haven't already asked for permission this session
    if (user && !permissionRequested) {
      console.log("User found, requesting notification permission...");
      requestNotificationPermission(user.uid);
      setPermissionRequested(true); // Mark as requested to prevent re-prompting
    }
  }, [user, permissionRequested]);

  return null; // This component doesn't render anything
};

const App = () => {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  useEffect(() => {
    const checkAuth = () => setAuthenticated(isAuthenticated());
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <UserProvider>
          <BrowserRouter>
            {!authenticated ? (
              <Routes>
                <Route path="*" element={<Auth setAuthenticated={setAuthenticated} />} />
              </Routes>
            ) : (
              <Layout>
                <NotificationHandler /> {/* Add the handler here */}
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/trip-info" element={<TripInfo />} />
                  <Route path="/matches" element={<Matches />} />
                  <Route path="/requests" element={<Requests />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/chat/:chatId" element={<Chat />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            )}
          </BrowserRouter>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;