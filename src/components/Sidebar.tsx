"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, GraduationCap, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWeb3 } from "@/context/Web3Context";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Attendance", href: "/attendance", icon: CheckSquare },
  { name: "Marks", href: "/marks", icon: GraduationCap },
  { name: "Verification", href: "/verification", icon: FileCheck },
];

export function Sidebar() {
  const pathname = usePathname();
  const { account, isTeacher, connectWallet, loading } = useWeb3();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card px-4 py-6 text-card-foreground">
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold tracking-tight text-primary">EduChain</h1>
        <p className="text-sm text-muted-foreground mt-1">Student Management</p>
      </div>

      <div className="mb-6 px-2">
        {account ? (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Connected Wallet</div>
            <div className="rounded-md bg-secondary px-3 py-2 text-sm font-medium truncate" title={account}>
              {account.substring(0, 6)}...{account.substring(account.length - 4)}
            </div>
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
              {isTeacher ? "Teacher" : "Student"}
            </div>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
          >
            {loading ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
