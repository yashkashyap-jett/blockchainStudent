"use client";

import { useState, useEffect } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, GraduationCap, Plus, Trash2 } from "lucide-react";

export default function MarksPage() {
  const { account, isTeacher, contract } = useWeb3();
  const [studentAddress, setStudentAddress] = useState("");
  const [subjects, setSubjects] = useState([{ name: "", score: "" }]);
  const [loading, setLoading] = useState(false);
  const [myMarks, setMyMarks] = useState<any>(null);
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    if (account && !isTeacher) {
      fetchMyMarks();
    }
  }, [account, isTeacher, contract]);

  const fetchMyMarks = async () => {
    if (!contract || !account) return;
    setFetchLoading(true);
    try {
      const result = await contract.getMarks(account);
      const subjectMarks = result[0];
      const timestamp = result[1];
      
      if (Number(timestamp) > 0) {
        let total = 0;
        subjectMarks.forEach((mark: any) => {
          total += Number(mark.score);
        });
        
        setMyMarks({
          subjects: subjectMarks,
          total: total,
          timestamp: timestamp
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to fetch marks.");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleAddSubject = () => {
    setSubjects([...subjects, { name: "", score: "" }]);
  };

  const handleRemoveSubject = (index: number) => {
    const newSubjects = [...subjects];
    newSubjects.splice(index, 1);
    setSubjects(newSubjects);
  };

  const handleSubjectChange = (index: number, field: "name" | "score", value: string) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  const calculateCurrentTotal = () => {
    return subjects.reduce((sum, sub) => sum + (parseInt(sub.score) || 0), 0);
  };

  const addMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !studentAddress) return;

    // Validate inputs
    const subjectNames = subjects.map(s => s.name.trim());
    const subjectScores = subjects.map(s => parseInt(s.score) || 0);

    if (subjectNames.some(name => name === "")) {
      toast.error("Please provide a name for all subjects.");
      return;
    }

    setLoading(true);
    try {
      const tx = await contract.addMarks(studentAddress, subjectNames, subjectScores);
      toast.info("Transaction submitted, waiting for confirmation...");
      await tx.wait();
      toast.success("Marks added successfully!");
      setStudentAddress("");
      setSubjects([{ name: "", score: "" }]);
    } catch (err: any) {
      console.error(err);
      toast.error(err.reason || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return <div className="p-4 text-center text-muted-foreground">Please connect your wallet.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Academic Marks</h2>
        <p className="text-muted-foreground mt-2">
          {isTeacher ? "Assign custom subjects and enter student marks." : "View your latest assessment results."}
        </p>
      </div>

      {isTeacher ? (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Add Student Marks</CardTitle>
            <CardDescription>Add specific subjects and assign marks for each.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={addMarks} className="space-y-6">
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
              
              <div className="space-y-4">
                <Label>Subjects & Scores (out of 100)</Label>
                {subjects.map((subject, index) => (
                  <div key={index} className="flex items-center space-x-4 animate-in fade-in slide-in-from-left-4">
                    <div className="flex-1 space-y-1">
                      <Input
                        placeholder="Subject Name (e.g. Mathematics)"
                        value={subject.name}
                        onChange={(e) => handleSubjectChange(index, "name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="w-32 space-y-1">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Score"
                        value={subject.score}
                        onChange={(e) => handleSubjectChange(index, "score", e.target.value)}
                        required
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveSubject(index)}
                      disabled={subjects.length === 1}
                      className={subjects.length === 1 ? "opacity-50" : "text-destructive hover:text-destructive"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button type="button" variant="outline" size="sm" onClick={handleAddSubject} className="mt-2">
                  <Plus className="h-4 w-4 mr-2" /> Add Subject
                </Button>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg flex justify-between items-center border mt-6">
                <span className="font-medium">Total Calculated:</span>
                <span className="text-xl font-bold">
                  {calculateCurrentTotal()} / {subjects.length * 100}
                </span>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Marks
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center pb-2">
            <GraduationCap className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle className="text-2xl">Result Card</CardTitle>
            <CardDescription>Officially verified on the blockchain</CardDescription>
          </CardHeader>
          <CardContent>
            {fetchLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : myMarks ? (
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {myMarks.subjects.map((sub: any, idx: number) => (
                    <div key={idx} className="p-4 border rounded-lg bg-card flex flex-col justify-center items-center text-center">
                      <span className="text-sm text-muted-foreground mb-1 break-words w-full">{sub.subjectName}</span>
                      <span className="text-2xl font-semibold">{Number(sub.score)}</span>
                    </div>
                  ))}
                  <div className="p-4 border rounded-lg bg-primary/10 flex flex-col justify-center items-center col-span-2 md:col-span-1">
                    <span className="text-sm font-medium mb-1">Total Marks</span>
                    <span className="text-3xl font-bold text-primary">{myMarks.total}</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-muted/30 rounded-lg border">
                  <div>
                    <p className="text-sm text-muted-foreground">Recorded on</p>
                    <p className="font-medium">{new Date(Number(myMarks.timestamp) * 1000).toLocaleString()}</p>
                  </div>
                  <Badge className="mt-2 sm:mt-0 text-lg py-1 px-4" variant={myMarks.total >= (myMarks.subjects.length * 100 * 0.4) ? "default" : "destructive"}>
                    {myMarks.total >= (myMarks.subjects.length * 100 * 0.4) ? "PASS" : "FAIL"}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20 mt-4">
                No marks have been recorded for your account yet.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
