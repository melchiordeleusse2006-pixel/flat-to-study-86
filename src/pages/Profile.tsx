import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { User, Mail, GraduationCap, ArrowLeft, Edit2, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

export default function Profile() {
  const { user, profile, updateProfile } = useAuth();
  const { t } = useLanguage();
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionValue, setDescriptionValue] = useState(profile?.description || '');
  const [isSaving, setIsSaving] = useState(false);

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

  const handleCancelEdit = () => {
    setDescriptionValue(profile?.description || '');
    setIsEditingDescription(false);
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
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{t('header.profileInfo')}</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
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
                <h3 className="text-sm font-medium text-muted-foreground">About</h3>
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
                  {profile.description || 'No description added yet. Click the edit button to add one.'}
                </p>
              )}
            </div>

            <div className="flex justify-center">
              <Button className="w-full max-w-sm">
                <Mail className="h-4 w-4 mr-2" />
                Contact
              </Button>
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