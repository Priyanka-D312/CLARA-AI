import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [recognition, setRecognition] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        await handleVoiceQuery(text);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice recognition error",
          description: "Please try again",
          variant: "destructive",
        });
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      toast({
        title: "Not supported",
        description: "Voice recognition is not supported in this browser",
        variant: "destructive",
      });
    }
  }, []);

  const handleVoiceQuery = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { message: text },
      });

      if (error) throw error;

      setResponse(data.response);
      speak(data.response);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive",
      });
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!recognition) {
      toast({
        title: "Not available",
        description: "Voice recognition is not available",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      setResponse("");
      recognition.start();
      setIsListening(true);
    }
  };

  const repeatResponse = () => {
    if (response) {
      speak(response);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Voice Assistant</CardTitle>
          <CardDescription>
            Click the microphone to ask Clara a question using your voice
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={toggleListening}
              className={`w-32 h-32 rounded-full transition-all ${
                isListening ? "animate-pulse bg-red-500 hover:bg-red-600" : ""
              }`}
            >
              {isListening ? (
                <MicOff className="w-16 h-16" />
              ) : (
                <Mic className="w-16 h-16" />
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {isListening ? "Listening... Speak now!" : "Click the microphone to start"}
            </p>
          </div>

          {transcript && (
            <Card className="bg-accent/20">
              <CardHeader>
                <CardTitle className="text-base">You said:</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{transcript}</p>
              </CardContent>
            </Card>
          )}

          {response && (
            <Card className="bg-primary/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Clara's response:</CardTitle>
                  <Button size="sm" variant="ghost" onClick={repeatResponse}>
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{response}</p>
              </CardContent>
            </Card>
          )}

          <div className="bg-accent/20 p-4 rounded-lg space-y-2 text-sm">
            <p className="font-medium">Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Speak clearly and at a normal pace</li>
              <li>Ask questions like "Explain photosynthesis to me"</li>
              <li>Wait for Clara to finish speaking before asking again</li>
              <li>Click the speaker icon to hear the response again</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceAssistant;
