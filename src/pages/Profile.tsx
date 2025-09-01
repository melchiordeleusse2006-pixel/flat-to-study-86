import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, Building, GraduationCap, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Profile() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();

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
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <User className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>{profile.full_name || 'Unnamed User'}</span>
                  <Badge variant={profile.user_type === 'agency' ? 'default' : 'secondary'}>
                    {profile.user_type === 'agency' ? 'Agency' : 'Student'}
                  </Badge>
                </CardTitle>
                <CardDescription>{profile.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
              </div>

              {profile.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{profile.phone}</p>
                  </div>
                </div>
              )}

              {profile.user_type === 'student' && profile.university && (
                <div className="flex items-center space-x-3">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">University</p>
                    <p className="text-sm text-muted-foreground">{profile.university}</p>
                  </div>
                </div>
              )}

              {profile.user_type === 'agency' && profile.agency_name && (
                <div className="flex items-center space-x-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Agency Name</p>
                    <p className="text-sm text-muted-foreground">{profile.agency_name}</p>
                  </div>
                </div>
              )}

              {profile.user_type === 'agency' && profile.company_size && (
                <div className="flex items-center space-x-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Company Size</p>
                    <p className="text-sm text-muted-foreground">{profile.company_size}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
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