import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Building, Home, GraduationCap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function UserTypeSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Get Started with Flat2Study</h1>
          <p className="text-muted-foreground text-lg">
            Choose your profile type to create an account
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-auto md:h-96 max-w-2xl mx-auto">
          {/* For Apartment Seekers */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 group flex flex-col">
            <Link to="/signup/student" className="flex flex-col h-full">
              <CardHeader className="text-center pb-4 flex-1">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">For Apartment Seekers</CardTitle>
                <CardDescription>
                  Students looking for accommodation
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  Search properties, save favorites, request viewings, connect with landlords
                </p>
                <Button className="w-full">Get Started</Button>
              </CardContent>
            </Link>
          </Card>

          {/* For Realtors */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 group flex flex-col">
            <Link to="/signup/realtor" className="flex flex-col h-full">
              <CardHeader className="text-center pb-4 flex-1">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Building className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">For Realtors</CardTitle>
                <CardDescription>
                  Real estate professionals managing multiple properties
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  List and manage properties, connect with potential tenants, track inquiries
                </p>
                <Button className="w-full">Get Started</Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/auth" className="text-primary hover:underline font-medium">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}