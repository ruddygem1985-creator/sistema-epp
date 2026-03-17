"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Shield, Github, LogIn, Lock, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: true,
        callbackUrl: "/",
      });

      if (result?.error) {
        toast.error("Credenciales incorrectas. Verifique usuario y contraseña.");
      }
    } catch (error) {
      toast.error("Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = () => {
    signIn("github", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/50 backdrop-blur-xl text-slate-100 shadow-2xl relative z-10">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Sistema EPP
          </CardTitle>
          <CardDescription className="text-slate-400">
            Ingresá tu usuario y contraseña (ej. admin)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input 
                  id="username" 
                  type="text"
                  name="username"
                  placeholder="admin" 
                  className="bg-slate-950/50 border-slate-800 pl-10 text-white placeholder:text-slate-600 focus:border-emerald-500 transition-colors"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoCapitalize="none"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input 
                  id="password" 
                  type="password" 
                  className="bg-slate-950/50 border-slate-800 pl-10 text-white placeholder:text-slate-600 focus:border-emerald-500 transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-lg shadow-emerald-600/10"
              disabled={isLoading}
            >
              {isLoading ? "Cargando..." : (
                <>
                  <LogIn className="mr-2 h-4 w-4" /> Iniciar Sesión
                </>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-slate-500">O continuar con</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full border-slate-800 bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white transition-all"
            onClick={handleGithubLogin}
          >
            <Github className="mr-2 h-4 w-4" /> GitHub
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-xs text-slate-500">
          <p>Solo personal autorizado - Departamento de SSO</p>
          <span className="opacity-30">Versión 1.0.3 - Sincronizado: {new Date().toLocaleTimeString()}</span>
        </CardFooter>
      </Card>
    </div>
  );
}
