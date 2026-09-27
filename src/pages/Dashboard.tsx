import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileText, Brain, Mic, LogOut } from "lucide-react";
import claraLogo from "@/assets/clara-logo.png";
import AIChat from "@/components/dashboard/AIChat";
import NoteSummarizer from "@/components/dashboard/NoteSummarizer";
import QuizGenerator from "@/components/dashboard/QuizGenerator";
import VoiceAssistant from "@/components/dashboard/VoiceAssistant";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
    } else {
      setUser(user);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "See you next time!",
    });
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent">
        <div className="animate-pulse text-primary text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      <header className="bg-white/80 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={claraLogo} alt="Clara AI" className="w-12 h-12" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Clara AI</h1>
              <p className="text-sm text-muted-foreground">Your Study Companion</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.email?.split('@')[0]}!
          </h2>
          <p className="text-muted-foreground">
            Choose a tool below to enhance your learning experience
          </p>
        </div>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 h-auto p-2">
            <TabsTrigger value="chat" className="flex flex-col gap-2 py-3">
              <Brain className="w-5 h-5" />
              <span className="text-sm">AI Chat</span>
            </TabsTrigger>
            <TabsTrigger value="summarize" className="flex flex-col gap-2 py-3">
              <FileText className="w-5 h-5" />
              <span className="text-sm">Summarize</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex flex-col gap-2 py-3">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm">Quiz</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex flex-col gap-2 py-3">
              <Mic className="w-5 h-5" />
              <span className="text-sm">Voice</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <AIChat />
          </TabsContent>

          <TabsContent value="summarize">
            <NoteSummarizer />
          </TabsContent>

          <TabsContent value="quiz">
            <QuizGenerator />
          </TabsContent>

          <TabsContent value="voice">
            <VoiceAssistant />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
