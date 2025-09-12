import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCredits } from "@/hooks/useCredits";
import { Coins, RefreshCw } from "lucide-react";

interface CreditBalanceProps {
  onBuyCredits?: () => void;
}

export const CreditBalance = ({ onBuyCredits }: CreditBalanceProps) => {
  const { creditBalance, loading, refreshBalance } = useCredits();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
        <Coins className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{creditBalance} credits</div>
        <CardDescription className="mt-1">
          Each credit keeps a listing active for 1 day
        </CardDescription>
        
        <div className="flex gap-2 mt-4">
          <Button 
            onClick={onBuyCredits}
            size="sm"
            className="flex-1"
          >
            Buy Credits
          </Button>
          <Button 
            onClick={refreshBalance}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};