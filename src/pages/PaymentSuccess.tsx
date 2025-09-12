import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCredits } from "@/hooks/useCredits";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { processPayment, refreshBalance } = useCredits();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);

  const sessionId = searchParams.get("session_id");
  const credits = searchParams.get("credits");

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      if (!sessionId) {
        toast({
          title: "Error",
          description: "Invalid payment session",
          variant: "destructive"
        });
        navigate("/owner-dashboard");
        return;
      }

      try {
        await processPayment(sessionId);
        setSuccess(true);
        toast({
          title: "Payment successful!",
          description: `${credits} credits have been added to your account.`,
        });
      } catch (error) {
        console.error("Payment processing error:", error);
        toast({
          title: "Payment processing error",
          description: "Your payment was successful, but there was an issue adding credits. Please contact support.",
          variant: "destructive"
        });
      } finally {
        setProcessing(false);
      }
    };

    handlePaymentSuccess();
  }, [sessionId, processPayment, toast, navigate, credits]);

  if (processing) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
            <p className="text-muted-foreground">
              Please wait while we confirm your payment and add credits to your account...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Payment Successful!
            </CardTitle>
            <CardDescription>
              Your credit purchase has been completed
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {credits && (
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  +{credits} Credits Added
                </Badge>
              </div>
            )}
            
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Your credits have been successfully added to your account.</p>
              <p>You can now use them to post new listings or extend existing ones.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => navigate("/owner-dashboard")}
                className="flex items-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate("/create-listing")}
              >
                Create New Listing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;