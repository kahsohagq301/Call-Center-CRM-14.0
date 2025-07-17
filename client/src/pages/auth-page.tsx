import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ForgotPasswordModal } from "@/components/modals/forgot-password-modal";
import { Eye, EyeOff, LogIn, UserPlus, Phone } from "lucide-react";
import backgroundImage from "@assets/Picsart_25-06-24_22-28-16-611_1752740243723.jpg";
import logoImage from "@assets/logo.png_1752740209404.png";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "CC Agent" as "CC Agent" | "CRO Agent",
    officialNumber: "",
  });

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      return;
    }
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 login-bg" />
      
      {/* Company Logo - Top Right */}
      <div className="absolute top-6 right-6 z-10">
        <img src={logoImage} alt="Company Logo" className="h-12 w-auto" />
      </div>
      
      {/* Login Box - Right Side */}
      <div className="relative z-10 flex items-center justify-end min-h-screen pr-8 md:pr-16">
        <Card className="glass-effect bg-white/95 backdrop-blur-sm border-white/20 shadow-2xl animate-fade-in">
          <CardContent className="p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Call Center</h1>
              <p className="text-gray-600">Access Panel</p>
            </div>
            
            <div className="space-y-4">
              <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full btn-gradient hover-lift">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </DialogTrigger>
                <DialogContent className="modal-content">
                  <DialogHeader>
                    <DialogTitle>Login</DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="form-group">
                      <Label htmlFor="email" className="form-label">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        placeholder="Enter your email"
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <Label htmlFor="password" className="form-label">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          placeholder="Enter your password"
                          className="form-input pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <ForgotPasswordModal />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="btn-primary"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full btn-secondary-gradient hover-lift">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Registration
                  </Button>
                </DialogTrigger>
                <DialogContent className="modal-content max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Complete the Information</DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="form-group">
                      <Label htmlFor="name" className="form-label">Enter Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        placeholder="Full Name"
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <Label htmlFor="email" className="form-label">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        placeholder="Enter your email"
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <Label htmlFor="officialNumber" className="form-label">Official Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="officialNumber"
                          type="tel"
                          value={registerData.officialNumber}
                          onChange={(e) => setRegisterData({ ...registerData, officialNumber: e.target.value })}
                          placeholder="Phone Number"
                          className="form-input pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <Label htmlFor="profilePicture" className="form-label">Upload Profile Picture</Label>
                      <Input
                        id="profilePicture"
                        type="file"
                        accept="image/*"
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <Label htmlFor="role" className="form-label">Select Account Type</Label>
                      <Select value={registerData.role} onValueChange={(value: "CC Agent" | "CRO Agent") => setRegisterData({ ...registerData, role: value })}>
                        <SelectTrigger className="form-select">
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CC Agent">CC Agent</SelectItem>
                          <SelectItem value="CRO Agent">CRO Agent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="form-group">
                      <Label htmlFor="registerPassword" className="form-label">Create Password</Label>
                      <div className="relative">
                        <Input
                          id="registerPassword"
                          type={showPassword ? "text" : "password"}
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          placeholder="Create Password"
                          className="form-input pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <Label htmlFor="confirmPassword" className="form-label">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                          placeholder="Confirm Password"
                          className="form-input pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="btn-secondary"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
