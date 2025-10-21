
"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GradientCard } from "@/components/ui/gradient-card";

interface StudentProfile {
  uid: string;
  fullName: string;
  email: string;
  age: number;
  profession: string;
  instituteOrOrganization: string;
  photoURL?: string;
}

export default function AllStudentsPage() {
  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(db, "users"), where("role", "==", "student"));
        const querySnapshot = await getDocs(q);
        const students = querySnapshot.docs.map(doc => doc.data() as StudentProfile);
        setStudentProfiles(students);
      } catch (error) {
        console.error("Error fetching student profiles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div>
      <PageHeader
        title="All Students"
        description="Browse through the students registered on the platform."
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {studentProfiles.length > 0 ? (
            studentProfiles.map((student) => (
              <GradientCard key={student.uid}>
                <Card className="border-none shadow-none bg-transparent">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="w-16 h-16 text-xl">
                        <AvatarImage src={student.photoURL} />
                        <AvatarFallback>{student.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                          <CardTitle className="text-xl font-headline">{student.fullName}</CardTitle>
                          <CardDescription>{student.email}</CardDescription>
                      </div>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-3 gap-4 text-sm">
                      <div>
                          <p className="text-muted-foreground">Age</p>
                          <p className="font-medium">{student.age}</p>
                      </div>
                      <div className="capitalize">
                          <p className="text-muted-foreground">Profession</p>
                          <p className="font-medium">{student.profession}</p>
                      </div>
                      <div>
                          <p className="text-muted-foreground">Institute</p>
                          <p className="font-medium">{student.instituteOrOrganization}</p>
                      </div>
                  </CardContent>
                </Card>
              </GradientCard>
            ))
          ) : (
             <GradientCard>
                <div className="col-span-full text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg bg-transparent">
                    <p>No students found.</p>
                </div>
            </GradientCard>
          )}
        </div>
      )}
    </div>
  );
}
