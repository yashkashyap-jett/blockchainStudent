"use client";

import { useState } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Search, ShieldCheck, AlertCircle } from "lucide-react";

export default function VerificationPage() {
  const { contract } = useWeb3();
  const [searchAddress, setSearchAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const verifyStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !searchAddress) {
      if (!contract) toast.error("Please connect wallet first to access the network.");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      // Returns (Attendance[] memory, SubjectMark[] memory, uint)
      const data = await contract.verifyStudent(searchAddress);
      const attendance = data[0];
      const subjectMarks = data[1];
      const timestamp = data[2];
      
      const totalClasses = attendance.length;
      const presentClasses = attendance.filter((a: any) => a.present).length;
      const attendancePercent = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;
      
      const hasMarks = Number(timestamp) > 0;
      
      let totalScore = 0;
      let subjectsProcessed: any[] = [];
      if (hasMarks) {
        subjectMarks.forEach((mark: any) => {
          totalScore += Number(mark.score);
          subjectsProcessed.push({ name: mark.subjectName, score: Number(mark.score) });
        });
      }

      setResult({
        address: searchAddress,
        attendance: {
          total: totalClasses,
          present: presentClasses,
          percent: attendancePercent
        },
        marks: hasMarks ? {
          subjects: subjectsProcessed,
          total: totalScore,
          maxTotal: subjectsProcessed.length * 100,
          timestamp: Number(timestamp)
        } : null
      });
      
      toast.success("Record verified successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to verify student. Ensure address is valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <ShieldCheck className="h-16 w-16 mx-auto text-primary mb-4" />
        <h2 className="text-3xl font-bold tracking-tight">Public Verification Portal</h2>
        <p className="text-muted-foreground mt-2">
          Verify the authenticity of any student's academic records directly from the EduChain blockchain.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle>Verify Records</CardTitle>
          <CardDescription>Enter a student's public address to query the smart contract.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={verifyStudent} className="flex space-x-2">
            <Input
              placeholder="0x..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
              {loading ? "" : "Verify"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <div className="max-w-3xl mx-auto grid gap-6 md:grid-cols-2 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-green-500/30 shadow-md">
            <CardHeader className="bg-green-500/5 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Attendance Verification</CardTitle>
                <ShieldCheck className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-muted-foreground">Total Classes</span>
                  <span className="font-semibold">{result.attendance.total}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-muted-foreground">Classes Attended</span>
                  <span className="font-semibold">{result.attendance.present}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-medium text-lg">Overall Attendance</span>
                  <Badge className="text-md" variant={result.attendance.percent >= 75 ? "default" : "destructive"}>
                    {result.attendance.percent.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={result.marks ? "border-blue-500/30 shadow-md" : "border-muted shadow-sm opacity-80"}>
            <CardHeader className={result.marks ? "bg-blue-500/5 pb-4" : "bg-muted/20 pb-4"}>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Academic Marks</CardTitle>
                {result.marks ? <ShieldCheck className="h-5 w-5 text-blue-500" /> : <AlertCircle className="h-5 w-5 text-muted-foreground" />}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {result.marks ? (
                 <div className="flex flex-col space-y-4">
                 {result.marks.subjects.map((sub: any, idx: number) => (
                   <div key={idx} className="flex justify-between items-center border-b pb-2">
                     <span className="text-muted-foreground">{sub.name}</span>
                     <span className="font-semibold">{sub.score} / 100</span>
                   </div>
                 ))}
                 <div className="flex justify-between items-center border-b pb-2 mt-2">
                   <span className="text-muted-foreground">Recorded Date</span>
                   <span className="font-semibold text-sm">{new Date(result.marks.timestamp * 1000).toLocaleDateString()}</span>
                 </div>
                 <div className="flex justify-between items-center pt-2">
                   <span className="font-medium text-lg">Total Score</span>
                   <div className="flex items-center space-x-3">
                     <span className="text-xl font-bold">{result.marks.total} / {result.marks.maxTotal}</span>
                     <Badge variant={result.marks.total >= (result.marks.maxTotal * 0.4) ? "default" : "destructive"}>
                       {result.marks.total >= (result.marks.maxTotal * 0.4) ? "PASS" : "FAIL"}
                     </Badge>
                   </div>
                 </div>
               </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-6">
                  <p>No marks recorded on-chain yet.</p>
                </div>
              )}
            </CardContent>
            {result.marks && (
              <CardFooter className="bg-muted/10 text-xs text-muted-foreground justify-center py-3 border-t">
                Data immutably verified on blockchain block timestamp: {result.marks.timestamp}
              </CardFooter>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
