
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

interface HRProfile {
  uid: string;
  fullName: string;
  email: string;
  age: number;
  profession: string;
  instituteOrOrganization: string;
  photoURL?: string;
}

export default function AllHrsPage() {
  const [hrProfiles, setHrProfiles] = useState<HRProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHRs = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(db, "users"), where("role", "==", "hr"));
        const querySnapshot = await getDocs(q);
        const hrs = querySnapshot.docs.map(doc => doc.data() as HRProfile);
        setHrProfiles(hrs);
      } catch (error) {
        console.error("Error fetching HR profiles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHRs();
  }, []);

  return (
    <div>
      <PageHeader
        title="All HR Professionals"
        description="Browse through the HR professionals registered on the platform."
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {hrProfiles.length > 0 ? (
            hrProfiles.map((hr) => (
              <GradientCard key={hr.uid}>
                <Card className="border-none shadow-none bg-transparent">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="w-16 h-16 text-xl">
                        <AvatarImage src={hr.photoURL} />
                        <AvatarFallback>{hr.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                          <CardTitle className="text-xl font-headline">{hr.fullName}</CardTitle>
                          <CardDescription>{hr.email}</CardDescription>
                      </div>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-3 gap-4 text-sm">
                      <div>
                          <p className="text-muted-foreground">Age</p>
                          <p className="font-medium">{hr.age}</p>
                      </div>
                      <div className="capitalize">
                          <p className="text-muted-foreground">Profession</p>
                          <p className="font-medium">{hr.profession}</p>
                      </div>
                      <div>
                          <p className="text-muted-foreground">Organization</p>
                          <p className="font-medium">{hr.instituteOrOrganization}</p>
                      </div>
                  </CardContent>
                </Card>
              </GradientCard>
            ))
          ) : (
            <GradientCard>
                <div className="col-span-full text-center text-muted-foreground py-16 bg-transparent">
                    <p>No HR professionals found.</p>
                </div>
            </GradientCard>
          )}
        </div>
      )}
    </div>
  );
}
