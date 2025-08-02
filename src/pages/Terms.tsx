
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Shield, AlertTriangle, Clock } from 'lucide-react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gradient-text">Terms of Use & Privacy Policy</h1>
        <p className="text-muted-foreground">
          Please read these terms carefully before using CAB POOL
        </p>
      </div>

      {/* Key Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass border-0 text-center">
          <CardContent className="p-4">
            <FileText className="h-6 w-6 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Accurate Data</h3>
            <p className="text-xs text-muted-foreground mt-1">Real information required</p>
          </CardContent>
        </Card>
        <Card className="glass border-0 text-center">
          <CardContent className="p-4">
            <Shield className="h-6 w-6 text-accent mx-auto mb-2" />
            <h3 className="font-semibold text-sm">User Responsibility</h3>
            <p className="text-xs text-muted-foreground mt-1">You're responsible for interactions</p>
          </CardContent>
        </Card>
        <Card className="glass border-0 text-center">
          <CardContent className="p-4">
            <AlertTriangle className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Platform Liability</h3>
            <p className="text-xs text-muted-foreground mt-1">Not liable for trip experiences</p>
          </CardContent>
        </Card>
        <Card className="glass border-0 text-center">
          <CardContent className="p-4">
            <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Data Deletion</h3>
            <p className="text-xs text-muted-foreground mt-1">Deleted after 24 hours</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-0">
        <CardHeader>
          <CardTitle>Terms of Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <div className="space-y-2">
            <h3 className="font-semibold text-primary">1. Eligibility and Access</h3>
            <p className="text-muted-foreground">
              CAB POOL is exclusively available to students of SRM Institute of Science and Technology (SRMIST) 
              with valid @srmist.edu.in email addresses. By accessing this platform, you confirm that you are 
              a current SRMIST student.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-primary">2. User Responsibilities</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Provide real, accurate, and up-to-date information</li>
              <li>Use the platform solely for legitimate cab-sharing purposes</li>
              <li>Maintain respectful communication with other users</li>
              <li>Be punctual and reliable for confirmed trips</li>
              <li>Report any suspicious or inappropriate behavior</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-primary">3. Platform Limitations</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>One active trip per user at any given time</li>
              <li>Each trip allows only one successful match</li>
              <li>Gender and certain profile fields cannot be changed after initial setup</li>
              <li>Trip data is automatically deleted 24 hours after matching</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-primary">4. Safety and Liability</h3>
            <p className="text-muted-foreground">
              While CAB POOL facilitates connections between SRMIST students, we are not responsible for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>The actual travel experience or any incidents during the trip</li>
              <li>Financial arrangements between users</li>
              <li>Verification of user identity beyond email domain checking</li>
              <li>Disputes between matched users</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-primary">5. Data Privacy</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>We collect minimal data necessary for platform functionality</li>
              <li>Personal information is shared only with matched travel companions</li>
              <li>All trip and match data is permanently deleted 24 hours after successful matching</li>
              <li>We do not sell or share your data with third parties</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-primary">6. Prohibited Activities</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Creating fake profiles or providing false information</li>
              <li>Using the platform for commercial purposes</li>
              <li>Harassment, discrimination, or inappropriate behavior</li>
              <li>Attempting to circumvent platform limitations</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-0">
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <div className="space-y-2">
            <h3 className="font-semibold text-primary">Information We Collect</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Name and email address from Google OAuth</li>
              <li>Registration number (parsed from email)</li>
              <li>Gender and WhatsApp number (provided by you)</li>
              <li>Trip details and preferences</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-primary">How We Use Your Information</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Facilitate trip matching and coordination</li>
              <li>Enable communication between matched users</li>
              <li>Maintain platform security and prevent abuse</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-primary">Data Retention</h3>
            <p className="text-muted-foreground">
              Trip and match data is automatically deleted 24 hours after successful matching. 
              Profile data is retained while your account is active and deleted upon account closure.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-0 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-primary mt-1" />
            <div>
              <h3 className="font-semibold text-primary mb-2">Important Notice</h3>
              <p className="text-sm text-muted-foreground">
                By using CAB POOL, you acknowledge that you have read, understood, and agree to these terms. 
                These terms may be updated periodically, and continued use of the platform constitutes acceptance 
                of any changes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Terms;
