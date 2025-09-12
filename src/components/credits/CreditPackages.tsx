import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCredits } from "@/hooks/useCredits";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard } from "lucide-react";

const PACKAGES = [
  {
    size: "5",
    credits: 5,
    price: 25,
    pricePerCredit: 5,
    savings: null,
    popular: false
  },
  {
    size: "10", 
    credits: 10,
    price: 45,
    pricePerCredit: 4.5,
    savings: "10%",
    popular: true
  },
  {
    size: "50",
    credits: 50,
    price: 225,
    pricePerCredit: 4.5,
    savings: "10%",
    popular: false
  }
];

export const CreditPackages = () => {
  const { purchaseCredits, loading } = useCredits();
  const { toast } = useToast();

  const handlePurchase = async (packageSize: string) => {
    try {
      await purchaseCredits(packageSize);
      toast({
        title: "Redirecting to payment",
        description: "You'll be redirected to Stripe to complete your purchase.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create payment session. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {PACKAGES.map((pkg) => (
        <Card 
          key={pkg.size} 
          className={`relative ${pkg.popular ? 'border-primary shadow-lg' : ''}`}
        >
          {pkg.popular && (
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
              Most Popular
            </Badge>
          )}
          
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{pkg.credits} Credits</CardTitle>
            <CardDescription>
              €{pkg.pricePerCredit}/credit
              {pkg.savings && (
                <span className="text-green-600 font-medium ml-2">
                  Save {pkg.savings}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <div className="text-3xl font-bold">€{pkg.price}</div>
            
            <div className="text-sm text-muted-foreground">
              Each credit keeps your listing active for 1 day
            </div>
            
            <Button 
              onClick={() => handlePurchase(pkg.size)}
              disabled={loading}
              className="w-full"
              variant={pkg.popular ? "default" : "outline"}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Purchase Credits
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};