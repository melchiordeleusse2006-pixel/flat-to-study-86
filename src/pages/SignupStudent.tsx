import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, Upload, User } from 'lucide-react';
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
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+1">🇺🇸 +1</SelectItem>
                      <SelectItem value="+44">🇬🇧 +44</SelectItem>
                      <SelectItem value="+33">🇫🇷 +33</SelectItem>
                      <SelectItem value="+49">🇩🇪 +49</SelectItem>
                      <SelectItem value="+34">🇪🇸 +34</SelectItem>
                      <SelectItem value="+39">🇮🇹 +39</SelectItem>
                      <SelectItem value="+31">🇳🇱 +31</SelectItem>
                      <SelectItem value="+32">🇧🇪 +32</SelectItem>
                      <SelectItem value="+41">🇨🇭 +41</SelectItem>
                      <SelectItem value="+43">🇦🇹 +43</SelectItem>
                      <SelectItem value="+351">🇵🇹 +351</SelectItem>
                      <SelectItem value="+45">🇩🇰 +45</SelectItem>
                      <SelectItem value="+46">🇸🇪 +46</SelectItem>
                      <SelectItem value="+47">🇳🇴 +47</SelectItem>
                      <SelectItem value="+358">🇫🇮 +358</SelectItem>
                      <SelectItem value="+48">🇵🇱 +48</SelectItem>
                      <SelectItem value="+420">🇨🇿 +420</SelectItem>
                      <SelectItem value="+36">🇭🇺 +36</SelectItem>
                      <SelectItem value="+386">🇸🇮 +386</SelectItem>
                      <SelectItem value="+385">🇭🇷 +385</SelectItem>
                      <SelectItem value="+30">🇬🇷 +30</SelectItem>
                      <SelectItem value="+90">🇹🇷 +90</SelectItem>
                      <SelectItem value="+7">🇷🇺 +7</SelectItem>
                      <SelectItem value="+380">🇺🇦 +380</SelectItem>
                      <SelectItem value="+91">🇮🇳 +91</SelectItem>
                      <SelectItem value="+86">🇨🇳 +86</SelectItem>
                      <SelectItem value="+81">🇯🇵 +81</SelectItem>
                      <SelectItem value="+82">🇰🇷 +82</SelectItem>
                      <SelectItem value="+55">🇧🇷 +55</SelectItem>
                      <SelectItem value="+52">🇲🇽 +52</SelectItem>
                      <SelectItem value="+54">🇦🇷 +54</SelectItem>
                      <SelectItem value="+56">🇨🇱 +56</SelectItem>
                      <SelectItem value="+57">🇨🇴 +57</SelectItem>
                      <SelectItem value="+58">🇻🇪 +58</SelectItem>
                      <SelectItem value="+51">🇵🇪 +51</SelectItem>
                      <SelectItem value="+593">🇪🇨 +593</SelectItem>
                      <SelectItem value="+598">🇺🇾 +598</SelectItem>
                      <SelectItem value="+595">🇵🇾 +595</SelectItem>
                      <SelectItem value="+591">🇧🇴 +591</SelectItem>
                      <SelectItem value="+61">🇦🇺 +61</SelectItem>
                      <SelectItem value="+64">🇳🇿 +64</SelectItem>
                      <SelectItem value="+27">🇿🇦 +27</SelectItem>
                      <SelectItem value="+20">🇪🇬 +20</SelectItem>
                      <SelectItem value="+234">🇳🇬 +234</SelectItem>
                      <SelectItem value="+254">🇰🇪 +254</SelectItem>
                      <SelectItem value="+212">🇲🇦 +212</SelectItem>
                      <SelectItem value="+216">🇹🇳 +216</SelectItem>
                      <SelectItem value="+213">🇩🇿 +213</SelectItem>
                      <SelectItem value="+218">🇱🇾 +218</SelectItem>
                      <SelectItem value="+966">🇸🇦 +966</SelectItem>
                      <SelectItem value="+971">🇦🇪 +971</SelectItem>
                      <SelectItem value="+974">🇶🇦 +974</SelectItem>
                      <SelectItem value="+965">🇰🇼 +965</SelectItem>
                      <SelectItem value="+968">🇴🇲 +968</SelectItem>
                      <SelectItem value="+973">🇧🇭 +973</SelectItem>
                      <SelectItem value="+962">🇯🇴 +962</SelectItem>
                      <SelectItem value="+961">🇱🇧 +961</SelectItem>
                      <SelectItem value="+963">🇸🇾 +963</SelectItem>
                      <SelectItem value="+964">🇮🇶 +964</SelectItem>
                      <SelectItem value="+98">🇮🇷 +98</SelectItem>
                      <SelectItem value="+92">🇵🇰 +92</SelectItem>
                      <SelectItem value="+880">🇧🇩 +880</SelectItem>
                      <SelectItem value="+94">🇱🇰 +94</SelectItem>
                      <SelectItem value="+977">🇳🇵 +977</SelectItem>
                      <SelectItem value="+60">🇲🇾 +60</SelectItem>
                      <SelectItem value="+65">🇸🇬 +65</SelectItem>
                      <SelectItem value="+66">🇹🇭 +66</SelectItem>
                      <SelectItem value="+84">🇻🇳 +84</SelectItem>
                      <SelectItem value="+62">🇮🇩 +62</SelectItem>
                      <SelectItem value="+63">🇵🇭 +63</SelectItem>
                    </SelectContent>
                  </Select>
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