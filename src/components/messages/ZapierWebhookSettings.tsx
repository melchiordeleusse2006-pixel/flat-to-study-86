import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Zap, Save, TestTube, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ZapierWebhookSettingsProps {
  onWebhookSaved?: (url: string) => void;
}

export function ZapierWebhookSettings({ onWebhookSaved }: ZapierWebhookSettingsProps) {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved webhook URL from localStorage
    const saved = localStorage.getItem('zapier_webhook_url');
    if (saved) {
      setWebhookUrl(saved);
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    try {
      if (webhookUrl.trim()) {
        localStorage.setItem('zapier_webhook_url', webhookUrl.trim());
        onWebhookSaved?.(webhookUrl.trim());
        toast({
          title: "Webhook saved",
          description: "Your Zapier webhook URL has been saved successfully.",
        });
      } else {
        localStorage.removeItem('zapier_webhook_url');
        onWebhookSaved?.('');
        toast({
          title: "Webhook removed",
          description: "Zapier webhook URL has been removed.",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL first",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          message: "This is a test notification from your message system",
          triggered_from: window.location.origin,
        }),
      });

      setTestResult('success');
      toast({
        title: "Test sent",
        description: "Test webhook was sent to Zapier. Check your Zap's history to confirm it was received.",
      });
    } catch (error) {
      console.error("Error testing webhook:", error);
      setTestResult('error');
      toast({
        title: "Test failed",
        description: "Failed to send test webhook. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-500" />
          Zapier Integration
          <Badge variant="secondary">Email Notifications</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="webhook-url">Zapier Webhook URL</Label>
          <Input
            id="webhook-url"
            placeholder="https://hooks.zapier.com/hooks/catch/..."
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Enter your Zapier webhook URL to trigger email notifications when messages are received.
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          
          <Button 
            onClick={handleTest} 
            disabled={isTesting || !webhookUrl.trim()} 
            variant="outline" 
            size="sm"
          >
            <TestTube className="h-4 w-4 mr-2" />
            {isTesting ? 'Testing...' : 'Test'}
          </Button>

          {testResult && (
            <div className="flex items-center gap-1">
              {testResult === 'success' ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
            </div>
          )}
        </div>

        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-sm text-blue-900 mb-2">Setup Instructions:</h4>
          <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
            <li>Go to <a href="https://zapier.com" target="_blank" rel="noopener noreferrer" className="underline">zapier.com</a> and create a new Zap</li>
            <li>Choose "Webhooks by Zapier" as your trigger</li>
            <li>Select "Catch Hook" as the trigger event</li>
            <li>Copy the webhook URL and paste it above</li>
            <li>Set up your action (e.g., "Send Email" via Gmail, Outlook, etc.)</li>
            <li>Test your webhook using the button above</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}