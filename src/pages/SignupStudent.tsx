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
      setSuccess(t('auth.accountCreated'));
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
                            <CommandItem
                              value="+33 France"
                              onSelect={() => {
                                setCountryCode("+33");
                                setCountryCodeOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  countryCode === "+33" ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              🇫🇷 +33 France
                            </CommandItem>
                            <CommandItem
                              value="+39 Italy"
                              onSelect={() => {
                                setCountryCode("+39");
                                setCountryCodeOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  countryCode === "+39" ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              🇮🇹 +39 Italy
                            </CommandItem>
                            <CommandItem
                              value="+40 Romania"
                              onSelect={() => {
                                setCountryCode("+40");
                                setCountryCodeOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  countryCode === "+40" ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              🇷🇴 +40 Romania
                            </CommandItem>
                            <CommandItem
                              value="+90 Turkey"
                              onSelect={() => {
                                setCountryCode("+90");
                                setCountryCodeOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  countryCode === "+90" ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              🇹🇷 +90 Turkey
                            </CommandItem>
                          </CommandGroup>
                          <CommandGroup heading="Other Countries">
                            <CommandItem
                              value="+1 United States"
                              onSelect={() => {
                                setCountryCode("+1");
                                setCountryCodeOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  countryCode === "+1" ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              🇺🇸 +1 United States
                            </CommandItem>
                            <CommandItem
                              value="+44 United Kingdom"
                              onSelect={() => {
                                setCountryCode("+44");
                                setCountryCodeOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  countryCode === "+44" ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              🇬🇧 +44 United Kingdom
                            </CommandItem>
                            <CommandItem
                              value="+49 Germany"
                              onSelect={() => {
                                setCountryCode("+49");
                                setCountryCodeOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  countryCode === "+49" ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              🇩🇪 +49 Germany
                            </CommandItem>
                            <CommandItem
                              value="+34 Spain"
                              onSelect={() => {
                                setCountryCode("+34");
                                setCountryCodeOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  countryCode === "+34" ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              🇪🇸 +34 Spain
                            </CommandItem>
                            <CommandItem
                              value="+31 Netherlands"
                              onSelect={() => {
                                setCountryCode("+31");
                                setCountryCodeOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  countryCode === "+31" ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              🇳🇱 +31 Netherlands
                            </CommandItem>
                            <CommandItem
                              value="+32 Belgium"
                              onSelect={() => {
                                setCountryCode("+32");
                                setCountryCodeOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  countryCode === "+32" ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              🇧🇪 +32 Belgium
                            </CommandItem>
                            <CommandItem
                              value="+41 Switzerland"
                              onSelect={() => {
                                setCountryCode("+41");
                                setCountryCodeOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  countryCode === "+41" ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              🇨🇭 +41 Switzerland
                            </CommandItem>
                            <CommandItem
                              value="+43 Austria"
                              onSelect={() => {
                                setCountryCode("+43");
                                setCountryCodeOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  countryCode === "+43" ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              🇦🇹 +43 Austria
                            </CommandItem>
                            <CommandItem
                              value="+351 Portugal"
                              onSelect={() => {
                                setCountryCode("+351");
                                setCountryCodeOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  countryCode === "+351" ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              🇵🇹 +351 Portugal
                            </CommandItem>
                            <CommandItem
                              value="+30 Greece"
                              onSelect={() => {
                                setCountryCode("+30");
                                setCountryCodeOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  countryCode === "+30" ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              🇬🇷 +30 Greece
                            </CommandItem>
                            <CommandItem
                              value="+7 Russia"
                              onSelect={() => {
                                setCountryCode("+7");
                                setCountryCodeOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  countryCode === "+7" ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              🇷🇺 +7 Russia
                            </CommandItem>
                            <CommandItem
                              value="+91 India"
                              onSelect={() => {
                                setCountryCode("+91");
                                setCountryCodeOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  countryCode === "+91" ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              🇮🇳 +91 India
                            </CommandItem>
                            <CommandItem
                              value="+86 China"
                              onSelect={() => {
                                setCountryCode("+86");
                                setCountryCodeOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  countryCode === "+86" ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              🇨🇳 +86 China
                            </CommandItem>
                            <CommandItem
                              value="+81 Japan"
                              onSelect={() => {
                                setCountryCode("+81");
                                setCountryCodeOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  countryCode === "+81" ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              🇯🇵 +81 Japan
                            </CommandItem>
                            <CommandItem
                              value="+82 South Korea"
                              onSelect={() => {
                                setCountryCode("+82");
                                setCountryCodeOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  countryCode === "+82" ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              🇰🇷 +82 South Korea
                            </CommandItem>
                            <CommandItem
                              value="+55 Brazil"
                              onSelect={() => {
                                setCountryCode("+55");
                                setCountryCodeOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  countryCode === "+55" ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              🇧🇷 +55 Brazil
                            </CommandItem>
                            <CommandItem
                              value="+61 Australia"
                              onSelect={() => {
                                setCountryCode("+61");
                                setCountryCodeOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  countryCode === "+61" ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              🇦🇺 +61 Australia
                            </CommandItem>
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