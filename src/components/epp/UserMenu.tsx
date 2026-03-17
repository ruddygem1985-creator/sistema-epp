"use client";

import { useSession, signOut } from "next-auth/react";
import { 
  LogOut, 
  User as UserIcon, 
  ChevronDown, 
  Shield, 
  Settings,
  UserCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserMenu() {
  const { data: session } = useSession();

  if (!session) return null;

  const userInitial = session.user?.name?.[0] || session.user?.email?.[0] || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 flex items-center gap-2 pr-2 border border-transparent hover:bg-slate-100 hover:border-slate-200 transition-all rounded-full">
          <Avatar className="h-8 w-8 border border-emerald-200">
            <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "Usuario"} />
            <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold uppercase">
              {userInitial}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start text-left">
            <span className="text-sm font-semibold text-slate-900 leading-none">
              {session.user?.name || "Usuario"}
            </span>
            <span className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">
              {session.user?.role || "Personal"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session.user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <UserCircle className="mr-2 h-4 w-4 text-slate-500" />
          <span>Mi Perfil</span>
        </DropdownMenuItem>
        {session.user?.role === "admin" && (
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4 text-slate-500" />
            <span>Configuración</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50" 
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
