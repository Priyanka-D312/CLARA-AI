import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Brain, CheckCircle2, XCircle } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const QuizGenerator = () => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState("5");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "No topic",
        description: "Please enter a topic for the quiz",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setQuestions([]);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);

    try {
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { topic, difficulty, questionCount: parseInt(questionCount) },
      });

      if (error) throw error;

      setQuestions(data.questions);
      toast({
        title: "Quiz generated!",
        description: `${data.questions.length} questions ready for you.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate quiz",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = () => {
    if (selectedAnswer === null) return;

    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
    setShowResult(true);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuestions([]);
  };

  const isQuizComplete = currentQuestion === questions.length - 1 && showResult;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Quiz Generator</CardTitle>
          <CardDescription>Generate custom quizzes on any topic</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              placeholder="e.g., World War II, Algebra, Cell Biology"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="count">Questions</Label>
              <Select value={questionCount} onValueChange={setQuestionCount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Questions</SelectItem>
                  <SelectItem value="10">10 Questions</SelectItem>
                  <SelectItem value="15">15 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2">
            <Brain className="w-4 h-4" />
            {loading ? "Generating..." : "Generate Quiz"}
          </Button>
        </CardContent>
      </Card>

      {questions.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                Question {currentQuestion + 1} of {questions.length}
              </CardTitle>
              <div className="text-sm font-medium text-primary">
                Score: {score}/{currentQuestion + (showResult ? 1 : 0)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg font-medium">{questions[currentQuestion].question}</p>

            <RadioGroup
              value={selectedAnswer?.toString()}
              onValueChange={(value) => setSelectedAnswer(parseInt(value))}
              disabled={showResult}
            >
              {questions[currentQuestion].options.map((option, idx) => (
                <div
                  key={idx}
                  className={`flex items-center space-x-2 p-4 rounded-lg border ${
                    showResult
                      ? idx === questions[currentQuestion].correctAnswer
                        ? "bg-green-50 border-green-500"
                        : idx === selectedAnswer
                        ? "bg-red-50 border-red-500"
                        : ""
                      : "hover:bg-accent"
                  }`}
                >
                  <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                  <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                  {showResult && idx === questions[currentQuestion].correctAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                  {showResult && idx === selectedAnswer && idx !== questions[currentQuestion].correctAnswer && (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              ))}
            </RadioGroup>

            {showResult && (
              <div className="bg-accent/20 p-4 rounded-lg">
                <p className="font-medium mb-2">Explanation:</p>
                <p className="text-sm">{questions[currentQuestion].explanation}</p>
              </div>
            )}

            {!showResult ? (
              <Button onClick={handleAnswer} disabled={selectedAnswer === null} className="w-full">
                Submit Answer
              </Button>
            ) : isQuizComplete ? (
              <div className="space-y-4">
                <div className="text-center p-6 bg-primary/10 rounded-lg">
                  <p className="text-2xl font-bold text-primary mb-2">Quiz Complete!</p>
                  <p className="text-xl">
                    Your Score: {score}/{questions.length} ({Math.round((score / questions.length) * 100)}%)
                  </p>
                </div>
                <Button onClick={handleRestart} variant="outline" className="w-full">
                  Start New Quiz
                </Button>
              </div>
            ) : (
              <Button onClick={handleNext} className="w-full">
                Next Question
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuizGenerator;
