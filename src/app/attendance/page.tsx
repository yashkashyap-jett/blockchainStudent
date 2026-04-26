"use client";

import { useState, useEffect } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AttendancePage() {
  const { account, isTeacher, contract } = useWeb3();
  const [studentAddress, setStudentAddress] = useState("");
  const [isPresent, setIsPresent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    if (account && !isTeacher) {
      fetchMyAttendance();
    }
  }, [account, isTeacher, contract]);

  const fetchMyAttendance = async () => {
    if (!contract || !account) return;
    setFetchLoading(true);
    try {
      const records = await contract.getAttendance(account);
      setAttendanceRecords(records);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to fetch attendance records.");
    } finally {
      setFetchLoading(false);
    }
  };

  const markAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !studentAddress) return;

    setLoading(true);
    try {
      const tx = await contract.markAttendance(studentAddress, isPresent);
      toast.info("Transaction submitted, waiting for confirmation...");
      await tx.wait();
      toast.success("Attendance marked successfully!");
      setStudentAddress("");
    } catch (err: any) {
      console.error(err);
      toast.error(err.reason || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  if (!account) {
    return <div className="p-4 text-center text-muted-foreground">Please connect your wallet.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Attendance Management</h2>
        <p className="text-muted-foreground mt-2">
          {isTeacher ? "Mark student attendance for today's class." : "View your attendance history."}
        </p>
      </div>

      {isTeacher ? (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
            <CardDescription>Enter student wallet address to mark their attendance.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={markAttendance} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="studentAddress">Student Address</Label>
                <Input
                  id="studentAddress"
                  placeholder="0x..."
                  value={studentAddress}
                  onChange={(e) => setStudentAddress(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant={isPresent ? "default" : "outline"}
                    className={isPresent ? "bg-green-600 hover:bg-green-700" : ""}
                    onClick={() => setIsPresent(true)}
                  >
                    Present
                  </Button>
                  <Button
                    type="button"
                    variant={!isPresent ? "default" : "outline"}
                    className={!isPresent ? "bg-red-600 hover:bg-red-700" : ""}
                    onClick={() => setIsPresent(false)}
                  >
                    Absent
                  </Button>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Record
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>My Attendance Records</CardTitle>
            <CardDescription>Your complete attendance history recorded on the blockchain.</CardDescription>
          </CardHeader>
          <CardContent>
            {fetchLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : attendanceRecords.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>
                        <Badge variant={record.present ? "default" : "destructive"} className={record.present ? "bg-green-500" : ""}>
                          {record.present ? "Present" : "Absent"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
                No attendance records found.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
