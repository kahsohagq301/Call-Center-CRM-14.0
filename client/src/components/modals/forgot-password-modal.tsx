import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function ForgotPasswordModal() {
  const { forgotPasswordMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPasswordMutation.mutate({ code }, {
      onSuccess: () => {
        setIsOpen(false);
        setCode("");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="link" className="text-primary hover:text-primary/80 text-sm font-medium">
          Forgot Password?
        </Button>
      </DialogTrigger>
      <DialogContent className="modal-content">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <Label htmlFor="recoveryCode" className="form-label">Enter Recovery Code</Label>
            <Input
              id="recoveryCode"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code"
              className="form-input"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Hint: sohagq301</p>
          </div>
          
          <Button 
            type="submit" 
            className="btn-primary"
            disabled={forgotPasswordMutation.isPending}
          >
            {forgotPasswordMutation.isPending ? "Verifying..." : "Reset Password"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
