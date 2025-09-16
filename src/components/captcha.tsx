import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";

interface CaptchaProps {
  onVerify: (isValid: boolean) => void;
  difficulty?: "easy" | "medium" | "hard";
  required?: boolean;
}

interface CaptchaChallenge {
  type: "math" | "text" | "pattern" | "color";
  question: string;
  answer: string;
  options?: string[];
}

export function Captcha({
  onVerify,
  difficulty = "medium",
  required = false,
}: CaptchaProps) {
  const [challenge, setChallenge] = useState<CaptchaChallenge | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate a new challenge
  const generateChallenge = (): CaptchaChallenge => {
    const challengeTypes: CaptchaChallenge["type"][] = [
      "math",
      "text",
      "pattern",
    ];

    if (difficulty === "hard") {
      challengeTypes.push("color");
    }

    const type =
      challengeTypes[Math.floor(Math.random() * challengeTypes.length)];

    switch (type) {
      case "math":
        return generateMathChallenge();
      case "text":
        return generateTextChallenge();
      case "pattern":
        return generatePatternChallenge();
      case "color":
        return generateColorChallenge();
      default:
        return generateMathChallenge();
    }
  };

  const generateMathChallenge = (): CaptchaChallenge => {
    const operations = ["+", "-", "*"];
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let answer: number;
    let question: string;

    switch (operation) {
      case "+":
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case "-":
        answer = Math.max(num1, num2) - Math.min(num1, num2);
        question = `${Math.max(num1, num2)} - ${Math.min(num1, num2)}`;
        break;
      case "*":
        answer = num1 * num2;
        question = `${num1} × ${num2}`;
        break;
      default:
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
    }

    return {
      type: "math",
      question: `Quanto é ${question}?`,
      answer: answer.toString(),
    };
  };

  const generateTextChallenge = (): CaptchaChallenge => {
    const words = [
      "azul",
      "vermelho",
      "verde",
      "amarelo",
      "preto",
      "branco",
      "casa",
      "carro",
      "árvore",
      "rio",
      "montanha",
      "sol",
      "gato",
      "cachorro",
      "pássaro",
      "peixe",
      "flor",
      "livro",
    ];

    const selectedWords = [];
    for (let i = 0; i < 3; i++) {
      const randomWord = words[Math.floor(Math.random() * words.length)];
      if (!selectedWords.includes(randomWord)) {
        selectedWords.push(randomWord);
      }
    }

    const targetWord =
      selectedWords[Math.floor(Math.random() * selectedWords.length)];

    return {
      type: "text",
      question: `Qual palavra está nesta lista: ${selectedWords.join(
        ", "
      )}? Digite "${targetWord}"`,
      answer: targetWord,
    };
  };

  const generatePatternChallenge = (): CaptchaChallenge => {
    const patterns = ["círculos", "quadrados", "triângulos", "estrelas"];
    const colors = ["vermelho", "azul", "verde", "amarelo"];
    const numbers = ["um", "dois", "três", "quatro", "cinco"];

    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const number = numbers[Math.floor(Math.random() * numbers.length)];

    return {
      type: "pattern",
      question: `Quantos ${pattern} ${color}s você vê? (Digite o número)`,
      answer: number,
    };
  };

  const generateColorChallenge = (): CaptchaChallenge => {
    const colors = [
      { name: "vermelho", hex: "#FF0000" },
      { name: "azul", hex: "#0000FF" },
      { name: "verde", hex: "#00FF00" },
      { name: "amarelo", hex: "#FFFF00" },
      { name: "roxo", hex: "#800080" },
      { name: "laranja", hex: "#FFA500" },
    ];

    const targetColor = colors[Math.floor(Math.random() * colors.length)];
    const questionColors = [targetColor];

    // Add 2-3 distractor colors
    const distractors = colors.filter((c) => c.name !== targetColor.name);
    for (let i = 0; i < Math.min(3, distractors.length); i++) {
      questionColors.push(distractors[i]);
    }

    // Shuffle the colors
    for (let i = questionColors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questionColors[i], questionColors[j]] = [
        questionColors[j],
        questionColors[i],
      ];
    }

    return {
      type: "color",
      question: `Qual é a cor ${targetColor.name}? Clique na cor correta.`,
      answer: targetColor.hex,
      options: questionColors.map((c) => c.hex),
    };
  };

  // Initialize challenge
  useEffect(() => {
    if (!required) {
      setIsVerified(true);
      onVerify(true);
      return;
    }

    const newChallenge = generateChallenge();
    setChallenge(newChallenge);
    setIsLoading(false);

    // Draw pattern for pattern challenges
    if (newChallenge.type === "pattern" && canvasRef.current) {
      drawPattern(newChallenge, canvasRef.current);
    }
  }, [required]);

  const drawPattern = (
    challenge: CaptchaChallenge,
    canvas: HTMLCanvasElement
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Parse the challenge to determine what to draw
    const question = challenge.question;
    let shape = "circle";
    let color = "#FF0000";
    let count = 1;

    if (question.includes("círculos")) shape = "circle";
    else if (question.includes("quadrados")) shape = "square";
    else if (question.includes("triângulos")) shape = "triangle";
    else if (question.includes("estrelas")) shape = "star";

    if (question.includes("vermelho")) color = "#FF0000";
    else if (question.includes("azul")) color = "#0000FF";
    else if (question.includes("verde")) color = "#00FF00";
    else if (question.includes("amarelo")) color = "#FFFF00";

    if (question.includes("um")) count = 1;
    else if (question.includes("dois")) count = 2;
    else if (question.includes("três")) count = 3;
    else if (question.includes("quatro")) count = 4;
    else if (question.includes("cinco")) count = 5;

    // Draw shapes
    ctx.fillStyle = color;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 20;

    for (let i = 0; i < count; i++) {
      const x = centerX + (i - (count - 1) / 2) * 60;
      const y = centerY;

      switch (shape) {
        case "circle":
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          ctx.fill();
          break;
        case "square":
          ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
          break;
        case "triangle":
          ctx.beginPath();
          ctx.moveTo(x, y - radius);
          ctx.lineTo(x - radius, y + radius);
          ctx.lineTo(x + radius, y + radius);
          ctx.closePath();
          ctx.fill();
          break;
        case "star":
          drawStar(ctx, x, y, 5, radius, radius * 0.5);
          break;
      }
    }
  };

  const drawStar = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number
  ) => {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }

    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  };

  const handleSubmit = () => {
    if (!challenge) return;

    const isCorrect =
      userAnswer.toLowerCase().trim() === challenge.answer.toLowerCase().trim();
    const newAttempts = attempts + 1;

    setAttempts(newAttempts);

    if (isCorrect) {
      setIsVerified(true);
      onVerify(true);
    } else {
      // Generate new challenge after wrong answer
      if (newAttempts >= 3) {
        // Too many attempts, require harder challenge
        const newChallenge = generateChallenge();
        setChallenge(newChallenge);
        if (newChallenge.type === "pattern" && canvasRef.current) {
          drawPattern(newChallenge, canvasRef.current);
        }
      } else {
        // Just generate new challenge
        const newChallenge = generateChallenge();
        setChallenge(newChallenge);
        if (newChallenge.type === "pattern" && canvasRef.current) {
          drawPattern(newChallenge, canvasRef.current);
        }
      }
      setUserAnswer("");
      onVerify(false);
    }
  };

  const handleColorSelect = (colorHex: string) => {
    if (!challenge || challenge.type !== "color") return;

    const isCorrect = colorHex === challenge.answer;
    setIsVerified(isCorrect);
    onVerify(isCorrect);

    if (!isCorrect) {
      // Generate new challenge
      const newChallenge = generateChallenge();
      setChallenge(newChallenge);
    }
  };

  const handleRefresh = () => {
    const newChallenge = generateChallenge();
    setChallenge(newChallenge);
    setUserAnswer("");
    setAttempts(0);

    if (newChallenge.type === "pattern" && canvasRef.current) {
      drawPattern(newChallenge, canvasRef.current);
    }
  };

  if (!required) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          <span>Carregando captcha...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4 text-orange-600" />
          Verificação de Segurança
          {isVerified && <CheckCircle className="h-4 w-4 text-green-600" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenge && (
          <>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {challenge.question}
            </div>

            {challenge.type === "pattern" && (
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={200}
                  height={100}
                  className="border border-gray-300 rounded"
                />
              </div>
            )}

            {challenge.type === "color" && challenge.options && (
              <div className="flex justify-center gap-2">
                {challenge.options.map((colorHex, index) => (
                  <button
                    key={index}
                    onClick={() => handleColorSelect(colorHex)}
                    className="w-12 h-12 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                    style={{ backgroundColor: colorHex }}
                    title={`Cor ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {challenge.type !== "color" && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="Digite sua resposta"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!userAnswer.trim()}
                  size="sm"
                >
                  Verificar
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Novo desafio
              </Button>

              {attempts > 0 && (
                <Badge variant="outline" className="text-xs">
                  Tentativas: {attempts}
                </Badge>
              )}
            </div>

            {attempts >= 2 && (
              <div className="flex items-center gap-2 text-xs text-orange-600">
                <AlertTriangle className="h-3 w-3" />
                <span>
                  Respostas incorretas detectadas. Complete o desafio para
                  continuar.
                </span>
              </div>
            )}
          </>
        )}

        {isVerified && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Verificação concluída!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
