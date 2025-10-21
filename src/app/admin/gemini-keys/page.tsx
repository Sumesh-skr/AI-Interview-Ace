
"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, KeyRound, CheckCircle, Circle, Eye, EyeOff } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { updateApiKeyInGenkitConfig } from "@/lib/update-genkit-config";
import { GradientCard } from "@/components/ui/gradient-card";


interface ApiKey {
  id: string;
  name: string;
  key: string;
  isActive: boolean;
}

export default function GeminiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [showNewKeyValue, setShowNewKeyValue] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  const fetchKeys = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const q = query(collection(db, "gemini-keys"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const fetchedKeys = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ApiKey));
      setKeys(fetchedKeys);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      toast({ title: "Error", description: "Could not fetch API keys.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, [user]);

  const handleAddKey = async () => {
    if (!newKeyName || !newKeyValue || !user) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "gemini-keys"), {
        name: newKeyName,
        key: newKeyValue,
        isActive: false,
        userId: user.uid,
      });
      setNewKeyName("");
      setNewKeyValue("");
      setShowNewKeyValue(false);
      toast({ title: "Success", description: "API Key added." });
      await fetchKeys();
    } catch (error) {
      console.error("Error adding key:", error);
      toast({ title: "Error", description: "Could not add API key.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!keyToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, "gemini-keys", keyToDelete));
      toast({ title: "Success", description: "API Key deleted." });
      await fetchKeys();
    } catch (error) {
      console.error("Error deleting key:", error);
      toast({ title: "Error", description: "Could not delete API key.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
      setKeyToDelete(null);
    }
  };
  
  const handleSetActive = async (keyId: string) => {
    if (!user) return;
    const selectedKey = keys.find(k => k.id === keyId);
    if (!selectedKey) return;

    setIsSubmitting(true);
    try {
        // --- Update genkit.ts file ---
        const updateResult = await updateApiKeyInGenkitConfig(selectedKey.key);
        if (!updateResult.success) {
            throw new Error(updateResult.error || "Failed to update config file.");
        }

        // --- Update Firestore database ---
        const batch = writeBatch(db);

        // Set all keys for this user to inactive
        keys.forEach(k => {
            const keyDocRef = doc(db, 'gemini-keys', k.id);
            batch.update(keyDocRef, { isActive: false });
        });

        // Set the selected key to active
        const activeKeyRef = doc(db, "gemini-keys", keyId);
        batch.update(activeKeyRef, { isActive: true });
        
        await batch.commit();

        toast({ title: "Success", description: "Active API key updated and applied." });
        await fetchKeys();

    } catch(e) {
        console.error("Error setting active key:", e);
        const errorMessage = e instanceof Error ? e.message : "Could not set active API key.";
        toast({ title: "Error", description: errorMessage, variant: "destructive"});
    } finally {
        setIsSubmitting(false);
    }
  }

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  return (
    <div>
      <PageHeader title="Gemini API Keys" description="Manage and connect your Gemini API keys." />
      <AlertDialog>
        <div className="grid gap-8">
          <GradientCard>
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader>
                <CardTitle>Add New API Key</CardTitle>
                <CardDescription>Enter a name and the key value to add it to your list.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2 sm:col-span-1">
                    <Label htmlFor="key-name">Key Name</Label>
                    <Input id="key-name" placeholder="e.g., 'Project X Key'" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="key-value">API Key Value</Label>
                    <div className="relative">
                      <Input id="key-value" type={showNewKeyValue ? "text" : "password"} placeholder="Enter your Gemini API key" value={newKeyValue} onChange={(e) => setNewKeyValue(e.target.value)} />
                      <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute inset-y-0 right-0 h-full px-3"
                          onClick={() => setShowNewKeyValue(!showNewKeyValue)}
                      >
                          {showNewKeyValue ? <EyeOff /> : <Eye />}
                          <span className="sr-only">{showNewKeyValue ? "Hide key" : "Show key"}</span>
                      </Button>
                    </div>
                  </div>
                </div>
                <Button onClick={handleAddKey} disabled={isSubmitting}>
                  {isSubmitting && !isLoading ? <Loader2 className="animate-spin" /> : <Plus />}
                  <span className="ml-2">Add Key</span>
                </Button>
              </CardContent>
            </Card>
          </GradientCard>

          <GradientCard>
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader>
                <CardTitle>Connected API Keys</CardTitle>
                <CardDescription>Only one key can be active at a time for the application.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {keys.length > 0 ? (
                      keys.map((apiKey) => (
                        <div key={apiKey.id} className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
                          <div className="flex items-center gap-4">
                              <KeyRound className="w-6 h-6 text-primary" />
                              <div className="flex-1">
                                  <p className="font-semibold">{apiKey.name}</p>
                                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <span>Key:</span>
                                    <span className="font-mono">{visibleKeys[apiKey.id] ? apiKey.key : `••••••••••••${apiKey.key.slice(-4)}`}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleKeyVisibility(apiKey.id)}>
                                          {visibleKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                          <span className="sr-only">{visibleKeys[apiKey.id] ? "Hide key" : "Show key"}</span>
                                      </Button>
                                  </div>
                              </div>
                              {apiKey.isActive && <Badge variant="default">Active</Badge>}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant={apiKey.isActive ? "secondary" : "outline"}
                              size="sm"
                              onClick={() => handleSetActive(apiKey.id)}
                              disabled={apiKey.isActive || isSubmitting}
                            >
                              {apiKey.isActive ? <CheckCircle className="mr-2"/> : <Circle className="mr-2"/>}
                              {apiKey.isActive ? "Connected" : "Connect"}
                            </Button>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => setKeyToDelete(apiKey.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No API keys added yet.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </GradientCard>
        </div>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the API key.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setKeyToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteKey}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
