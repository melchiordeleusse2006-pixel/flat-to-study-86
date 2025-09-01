import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Upload, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function SignupRealtor() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const fullName = `${name} ${surname}`;
    const additionalData = {
      user_type: 'realtor',
      phone,
      company,
      license_number: licenseNumber,
      profile_picture: profilePicture ? profilePicture.name : null
    };

    const { error } = await signUp(email, password, 'realtor', fullName, additionalData);
    
    if (error) {
      if (error.message?.includes('already registered')) {
        setError('An account with this email already exists. Please log in instead.');
      } else {
        setError(error.message || 'Failed to create account');
      }
      setLoading(false);
    } else {
      setSuccess('Account created successfully! Please check your email to verify your account.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/get-started')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Selection
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Realtor Registration</CardTitle>
            <CardDescription>
              Create your professional account to start listing properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-destructive">
                <AlertDescription className="text-destructive">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-green-500">
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Profile Picture */}
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    {profilePicture ? (
                      <img
                        src={URL.createObjectURL(profilePicture)}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                      id="profile-picture"
                    />
                    <Label htmlFor="profile-picture" className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Photo
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="First name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="surname">Surname</Label>
                  <Input
                    id="surname"
                    type="text"
                    placeholder="Last name"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+39 123 456 7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="Real Estate Agency Name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="license">License Number</Label>
                <Input
                  id="license"
                  type="text"
                  placeholder="Professional license number"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Realtor Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/auth" className="text-primary hover:underline">
                  Log in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}