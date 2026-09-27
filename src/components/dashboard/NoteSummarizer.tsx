import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Save } from "lucide-react";

const NoteSummarizer = () => {
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!notes.trim()) {
      toast({
        title: "No content",
        description: "Please enter some notes to summarize",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("summarize-notes", {
        body: { content: notes },
      });

      if (error) throw error;

      setSummary(data.summary);
      toast({
        title: "Summary generated!",
        description: "Your notes have been summarized successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate summary",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!notes.trim() || !summary.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("notes").insert({
        user_id: user.id,
        title: `Notes - ${new Date().toLocaleDateString()}`,
        content: notes,
        summary: summary,
      });

      if (error) throw error;

      toast({
        title: "Saved!",
        description: "Your notes and summary have been saved.",
      });
      setNotes("");
      setSummary("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save notes",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Your Notes</CardTitle>
          <CardDescription>Paste your study notes here</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste your notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[400px] mb-4"
          />
          <Button onClick={handleSummarize} disabled={loading} className="w-full gap-2">
            <Sparkles className="w-4 h-4" />
            {loading ? "Summarizing..." : "Generate Summary"}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>AI-generated summary of your notes</CardDescription>
        </CardHeader>
        <CardContent>
          {summary ? (
            <div className="space-y-4">
              <div className="bg-accent/20 p-4 rounded-lg min-h-[400px] whitespace-pre-wrap">
                {summary}
              </div>
              <Button onClick={handleSave} variant="secondary" className="w-full gap-2">
                <Save className="w-4 h-4" />
                Save Notes
              </Button>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-24">
              <p>Your summary will appear here</p>
              <p className="text-sm mt-2">Enter your notes and click "Generate Summary"</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NoteSummarizer;
