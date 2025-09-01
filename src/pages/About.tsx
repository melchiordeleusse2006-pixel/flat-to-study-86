import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function About() {
  return <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back Home
            </Button>
          </Link>
        </div>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">About Us</h1>
          
          <div className="prose prose-lg mx-auto text-center space-y-8">
            <p className="text-lg leading-relaxed text-slate-950">
              Tired of the low quality of real estate services in Milan, we decided to build a platform to make it safer and easier for students who move to University to find a place to live.
            </p>
            
            <p className="text-lg leading-relaxed text-slate-950">
              We carefully select the real estate companies and landowners who share their announcements on this platform based on various criteria–quality-price ratio, responsiveness, comfort–in order to reduce the stress of students as much as possible. We also make sure that only students can make purchases on this platform in order to protect landowners. Enjoy the website and good luck finding your perfect home!
            </p>
            
            <p className="text-lg font-medium">
              Melchior and Teo
            </p>
            
            <div className="bg-card p-8 rounded-lg border mt-12">
              <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  <span className="font-medium">Email:</span> tc4606@nyu.edu
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Email:</span> melchior.deleusse@studbocconi.it
                </p>
              </div>
            </div>
            
            <div className="bg-primary/5 p-8 rounded-lg border border-primary/20 mt-8">
              <h2 className="text-2xl font-semibold mb-4">Want to partner with us?</h2>
              <p className="text-muted-foreground mb-6">
                Write at <span className="font-medium text-foreground">bhousingmilano@gmail.com</span>
              </p>
              
            </div>
          </div>
        </div>
      </main>
    </div>;
}