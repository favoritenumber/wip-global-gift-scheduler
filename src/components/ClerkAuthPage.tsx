import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const ClerkAuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'signin';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md p-6">
        <Tabs value={mode} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="mt-6">
            <SignIn 
              fallbackRedirectUrl="/"
              signUpUrl="/auth?mode=signup"
            />
          </TabsContent>
          
          <TabsContent value="signup" className="mt-6">
            <SignUp 
              fallbackRedirectUrl="/"
              signInUrl="/auth?mode=signin"
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};