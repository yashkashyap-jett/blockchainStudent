"use client";

import { useWeb3 } from "@/context/Web3Context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Users, BookOpen, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { account, isTeacher, contract } = useWeb3();
  const [stats, setStats] = useState({ totalClasses: 0, attendancePercent: 0, totalMarks: 0, maxMarks: 0 });

  useEffect(() => {
    const fetchStudentStats = async () => {
      if (!contract || !account || isTeacher) return;
      try {
        const attendance = await contract.getAttendance(account);
        const marksData = await contract.getMarks(account);
        const subjectMarks = marksData[0];
        
        let totalScore = 0;
        subjectMarks.forEach((mark: any) => {
          totalScore += Number(mark.score);
        });
        
        const totalClasses = attendance.length;
        const presentClasses = attendance.filter((a: any) => a.present).length;
        const percent = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;
        
        setStats({
          totalClasses,
          attendancePercent: percent,
          totalMarks: totalScore,
          maxMarks: subjectMarks.length * 100
        });
      } catch (err) {
        console.error("Error fetching stats", err);
      }
    };
    fetchStudentStats();
  }, [contract, account, isTeacher]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Welcome to EduChain. {account ? (isTeacher ? "Manage your students securely." : "View your academic records.") : "Connect your wallet to get started."}
        </p>
      </div>

      {!account && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <AlertCircle className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Wallet Not Connected</h3>
            <p className="text-muted-foreground max-w-sm">
              Please connect your MetaMask wallet using the button in the sidebar to access the dashboard.
            </p>
          </CardContent>
        </Card>
      )}

      {account && isTeacher && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Role</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Teacher</div>
              <p className="text-xs text-muted-foreground">Full access to manage records</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Network</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Localhost</div>
              <p className="text-xs text-muted-foreground">Hardhat Local Network</p>
            </CardContent>
          </Card>
          <Card className="col-span-full lg:col-span-1 border-primary/20 bg-primary/5">
             <CardHeader>
               <CardTitle>Quick Actions</CardTitle>
               <CardDescription>Manage your classroom</CardDescription>
             </CardHeader>
             <CardContent className="space-y-2">
               <div className="flex justify-between items-center p-2 rounded bg-background border">
                 <span className="text-sm font-medium">Mark Attendance</span>
                 <Badge variant="outline">Action</Badge>
               </div>
               <div className="flex justify-between items-center p-2 rounded bg-background border">
                 <span className="text-sm font-medium">Add Student Marks</span>
                 <Badge variant="outline">Action</Badge>
               </div>
             </CardContent>
          </Card>
        </div>
      )}

      {account && !isTeacher && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.attendancePercent.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Out of {stats.totalClasses} total classes</p>
              <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className={cn("h-full", stats.attendancePercent >= 75 ? "bg-green-500" : "bg-red-500")} 
                  style={{ width: `${stats.attendancePercent}%` }} 
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Marks</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMarks} <span className="text-sm font-normal text-muted-foreground">/ {stats.maxMarks}</span></div>
              <p className="text-xs text-muted-foreground">Latest assessment total</p>
              <Badge className="mt-2" variant={stats.maxMarks > 0 && stats.totalMarks >= (stats.maxMarks * 0.4) ? "default" : "destructive"}>
                {stats.maxMarks > 0 ? (stats.totalMarks >= (stats.maxMarks * 0.4) ? "Pass" : "Fail") : "No Marks Yet"}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Quick helper to bypass missing import above
import { CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
