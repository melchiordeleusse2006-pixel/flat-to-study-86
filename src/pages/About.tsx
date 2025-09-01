import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export default function About() {
  const { t } = useLanguage();

  return <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('about.backHome')}
            </Button>
          </Link>
        </div>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">{t('about.title')}</h1>
          
          <div className="prose prose-lg mx-auto text-center space-y-8">
            <p className="text-lg leading-relaxed text-foreground">
              {t('about.intro1')}
            </p>
            
            <p className="text-lg leading-relaxed text-foreground">
              {t('about.intro2')}
            </p>
            
            <p className="text-lg font-medium">
              {t('about.founders')}
            </p>
            
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-6">{t('about.contactInfo')}</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  <span className="font-medium">{t('about.email')}</span> tc4606@nyu.edu
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">{t('about.email')}</span> melchior.deleusse@studbocconi.it
                </p>
              </div>
            </div>
            
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-4">{t('about.partnerTitle')}</h2>
              <p className="text-muted-foreground mb-6">
                {t('about.partnerText')} <span className="font-medium text-foreground">bhousingmilano@gmail.com</span>
              </p>
              <p className="text-muted-foreground mb-6">
                {t('about.partnerOr')}
              </p>
              <div className="flex justify-center gap-4">
                <a href="https://calendly.com/tc4606-nyu/30min" target="_blank" rel="noopener noreferrer">
                  <Button>
                    <Calendar className="h-4 w-4 mr-2" />
                    {t('about.scheduleMeeting')}
                  </Button>
                </a>
                <Link to="/">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('about.backHome')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>;
}