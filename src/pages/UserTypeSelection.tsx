import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Building, Home, GraduationCap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export default function UserTypeSelection() {
  const navigate = useNavigate();
  const { t } = useLanguage();

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
            {t('userType.backToHome')}
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">{t('userType.title')}</h1>
          <p className="text-muted-foreground text-lg">
            {t('userType.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-96 max-w-5xl mx-auto">
          {/* For Apartment Seekers */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 group flex flex-col">
            <Link to="/signup/student" className="flex flex-col h-full">
              <CardHeader className="text-center pb-4 flex-1">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{t('userType.studentTitle')}</CardTitle>
                <CardDescription>
                  {t('userType.studentDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  {t('userType.studentFeatures')}
                </p>
                <Button className="w-full">{t('userType.getStarted')}</Button>
              </CardContent>
            </Link>
          </Card>

          {/* For Private Landlords */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 group flex flex-col">
            <Link to="/signup/private" className="flex flex-col h-full">
              <CardHeader className="text-center pb-4 flex-1">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Home className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{t('userType.privateTitle')}</CardTitle>
                <CardDescription>
                  {t('userType.privateDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  {t('userType.privateFeatures')}
                </p>
                <Button className="w-full">{t('userType.getStarted')}</Button>
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
                <CardTitle className="text-xl">{t('userType.realtorTitle')}</CardTitle>
                <CardDescription>
                  {t('userType.realtorDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  {t('userType.realtorFeatures')}
                </p>
                <Button className="w-full">{t('userType.getStarted')}</Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            {t('userType.alreadyAccount')}{' '}
            <Link to="/auth" className="text-primary hover:underline font-medium">
              {t('userType.logInHere')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}