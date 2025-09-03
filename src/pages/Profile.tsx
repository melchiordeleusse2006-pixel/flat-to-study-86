import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { User, Mail, GraduationCap, ArrowLeft, Edit2, Save, X, Camera, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function Profile() {
  const { user, profile, updateProfile } = useAuth();
  const { t } = useLanguage();
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState(profile?.description || '');
  const [emailValue, setEmailValue] = useState(profile?.email || '');
  const [phoneValue, setPhoneValue] = useState(profile?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(`avatars/${fileName}`, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('listing-images')
        .getPublicUrl(`avatars/${fileName}`);

      // Update profile with new avatar URL
      const { error: updateError } = await updateProfile({ avatar_url: data.publicUrl });
      
      if (updateError) throw updateError;

      toast.success('Profile photo updated successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveDescription = async () => {
    setIsSaving(true);
    try {
      const { error } = await updateProfile({ description: descriptionValue });
      if (error) {
        toast.error('Failed to update description');
      } else {
        toast.success('Description updated successfully');
        setIsEditingDescription(false);
      }
    } catch (error) {
      toast.error('Failed to update description');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveContact = async () => {
    setIsSaving(true);
    try {
      const { error } = await updateProfile({ 
        email: emailValue, 
        phone: phoneValue 
      });
      if (error) {
        toast.error('Failed to update contact information');
      } else {
        toast.success('Contact information updated successfully');
        setIsEditingContact(false);
      }
    } catch (error) {
      toast.error('Failed to update contact information');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setDescriptionValue(profile?.description || '');
    setIsEditingDescription(false);
  };

  const handleCancelContactEdit = () => {
    setEmailValue(profile?.email || '');
    setPhoneValue(profile?.phone || '');
    setIsEditingContact(false);
  };

  if (!user || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('profile.back')}
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{t('header.profileInfo')}</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile.avatar_url || undefined} alt="Profile photo" />
                  <AvatarFallback className="text-lg">
                    {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                >
                  {isUploadingPhoto ? (
                    <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
                  ) : (
                    <Camera className="h-3 w-3" />
                  )}
                </Button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <CardTitle className="flex items-center space-x-2">
                  <span>{profile.full_name || 'Unnamed User'}</span>
                  <Badge variant={profile.user_type === 'agency' ? 'default' : 'secondary'}>
                    {profile.user_type === 'agency' ? 'Agency' : 'Student'}
                  </Badge>
                </CardTitle>
                {profile.user_type === 'student' && profile.university && (
                  <CardDescription className="flex items-center space-x-1 mt-1">
                    <GraduationCap className="h-3 w-3" />
                    <span>{profile.university}</span>
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Description Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">{t('profile.about')}</h3>
                {!isEditingDescription && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingDescription(true)}
                    className="h-8 px-2"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              {isEditingDescription ? (
                <div className="space-y-3">
                  <Textarea
                    value={descriptionValue}
                    onChange={(e) => setDescriptionValue(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="min-h-[80px] resize-none"
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {descriptionValue.length}/500 characters
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveDescription}
                        disabled={isSaving}
                      >
                        <Save className="h-3 w-3 mr-1" />
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground min-h-[60px] p-3 bg-muted/50 rounded-md">
                  {profile.description || t('profile.noDescription')}
                </p>
              )}
            </div>

            {/* Contact Information Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">{t('profile.contactInformation')}</h3>
                {!isEditingContact && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingContact(true)}
                    className="h-8 px-2"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              {isEditingContact ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Email Address</label>
                    <Input
                      type="email"
                      value={emailValue}
                      onChange={(e) => setEmailValue(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Phone Number</label>
                    <Input
                      type="tel"
                      value={phoneValue}
                      onChange={(e) => setPhoneValue(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelContactEdit}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveContact}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      <Save className="h-3 w-3 mr-1" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {profile.email || 'No email address added'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {profile.phone || 'No phone number added'}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t text-center">
              <p className="text-xs text-muted-foreground">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}