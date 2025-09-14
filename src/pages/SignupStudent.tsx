import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, ArrowLeft, Upload, User, Check, ChevronsUpDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { countries, getPriorityCountries, getOtherCountries } from '@/data/countries';

export default function SignupStudent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+39');
  const [countryCodeOpen, setCountryCodeOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('');
  const [proofOfEnrollment, setProofOfEnrollment] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleProofOfEnrollmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofOfEnrollment(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError(t('auth.passwordsNoMatch'));
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      setLoading(false);
      return;
    }

    if (!university) {
      setError(t('signup.student.selectUniversity'));
      setLoading(false);
      return;
    }

    if (!phone.trim()) {
      setError('Phone number is required');
      setLoading(false);
      return;
    }

    const fullName = `${name} ${surname}`;
    const fullPhoneNumber = `${countryCode}${phone}`;
    const additionalData = {
      user_type: 'student',
      phone: fullPhoneNumber,
      university,
      profile_picture: profilePicture ? profilePicture.name : null,
      proof_of_enrollment: proofOfEnrollment ? proofOfEnrollment.name : null
    };

    const { error } = await signUp(email, password, 'student', fullName, additionalData);
    
    if (error) {
      if (error.message?.includes('already registered')) {
        setError(t('auth.accountExists'));
      } else {
        setError(error.message || t('auth.createFailed'));
      }
      setLoading(false);
    } else {
      // Navigate to home page immediately after successful signup
      navigate('/');
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
            {t('signup.student.backToSelection')}
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">{t('signup.student.title')}</CardTitle>
            <CardDescription>
              {t('signup.student.description')}
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
                <Label>{t('signup.student.profilePicture')}</Label>
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
                          {t('signup.student.uploadPhoto')}
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('signup.student.name')}</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t('signup.student.namePlaceholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="surname">{t('signup.student.surname')}</Label>
                  <Input
                    id="surname"
                    type="text"
                    placeholder={t('signup.student.surnamePlaceholder')}
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t('signup.student.phone')} *</Label>
                <div className="flex space-x-2">
                  <Popover open={countryCodeOpen} onOpenChange={setCountryCodeOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={countryCodeOpen}
                        className="w-32 justify-between"
                      >
                        {countryCode || "Select..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0">
                      <Command>
                        <CommandInput placeholder="Search country..." />
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandList>
                          <CommandGroup heading="Priority Countries">
                            {getPriorityCountries().map((country) => (
                              <CommandItem
                                key={country.code}
                                value={`${country.dialCode} ${country.name}`}
                                onSelect={() => {
                                  setCountryCode(country.dialCode);
                                  setCountryCodeOpen(false);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    countryCode === country.dialCode ? "opacity-100" : "opacity-0"
                                  }`}
                                />
                                {country.flag} {country.dialCode} {country.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          <CommandGroup heading="All Countries">
                            {getOtherCountries().map((country) => (
                              <CommandItem
                                key={country.code}
                                value={`${country.dialCode} ${country.name}`}
                                onSelect={() => {
                                  setCountryCode(country.dialCode);
                                  setCountryCodeOpen(false);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    countryCode === country.dialCode ? "opacity-100" : "opacity-0"
                                  }`}
                                />
                                {country.flag} {country.dialCode} {country.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="123 456 7890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('signup.student.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="university">{t('signup.student.university')}</Label>
                <Select value={university} onValueChange={setUniversity} required>
                  <SelectTrigger>
                    <SelectValue placeholder={t('signup.student.universityPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bocconi">{t('university.bocconi')}</SelectItem>
                    <SelectItem value="politecnico">{t('university.politecnico')}</SelectItem>
                    <SelectItem value="cattolica">{t('university.cattolica')}</SelectItem>
                    <SelectItem value="statale">{t('university.statale')}</SelectItem>
                    <SelectItem value="other">{t('university.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Proof of Enrollment */}
              <div className="space-y-2">
                <Label>{t('signup.student.proofOfEnrollment')}</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleProofOfEnrollmentChange}
                      className="hidden"
                      id="proof-of-enrollment"
                    />
                    <Label htmlFor="proof-of-enrollment" className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          {proofOfEnrollment ? proofOfEnrollment.name : t('signup.student.uploadDocument')}
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('signup.student.passwordCreate')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t('signup.student.confirmPassword')}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder={t('signup.student.confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('signup.student.createAccount')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t('signup.student.alreadyHaveAccount')}{' '}
                <Link to="/auth" className="text-primary hover:underline">
                  {t('signup.student.logInHere')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}