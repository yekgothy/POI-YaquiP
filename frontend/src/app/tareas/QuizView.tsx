import { useState } from "react";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  image?: string;
}

interface QuizViewProps {
  title: string;
  questions: QuizQuestion[];
  onFinish: (score: number, total: number) => void;
  onBack: () => void;
}

const defaultQuestions: QuizQuestion[] = [
  {
    question: "¿En qué año se celebró el primer Mundial de Fútbol?",
    options: ["1928", "1930", "1934", "1950"],
    correct: 1,
  },
  {
    question: "¿Qué país ha ganado más Copas del Mundo?",
    options: ["Alemania", "Argentina", "Brasil", "Italia"],
    correct: 2,
  },
  {
    question: "¿Quién anotó el 'Gol del Siglo' en México 1986?",
    options: ["Pelé", "Zinedine Zidane", "Diego Maradona", "Johan Cruyff"],
    correct: 2,
  },
  {
    question: "¿Cuántas sedes tendrá el Mundial 2026?",
    options: ["12", "14", "16", "18"],
    correct: 2,
  },
  {
    question: "¿En qué Mundial se utilizó el VAR por primera vez?",
    options: ["Brasil 2014", "Rusia 2018", "Qatar 2022", "Sudáfrica 2010"],
    correct: 1,
  },
];

export default function QuizView({
  title,
  questions = defaultQuestions,
  onFinish,
  onBack,
}: QuizViewProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = questions[current];
  const progress = ((current + (confirmed ? 1 : 0)) / questions.length) * 100;

  const handleSelect = (index: number) => {
    if (confirmed) return;
    setSelected(index);
  };

  const handleConfirm = () => {
    if (selected === null) return;
    setConfirmed(true);
    if (selected === question.correct) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
      onFinish(score + (selected === question.correct ? 0 : 0), questions.length);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setConfirmed(false);
    }
  };

  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 70;
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center max-w-sm animate-[fadeInUp_0.5s_ease-out]">
          <div className="text-6xl mb-4">{passed ? "🏆" : "😢"}</div>
          <h2 className="text-2xl font-extrabold mb-2">
            {passed ? "¡Felicidades!" : "¡Sigue intentando!"}
          </h2>
          <p className="text-base-content/60 mb-6">
            {passed
              ? "Has aprobado el cuestionario con éxito."
              : "No alcanzaste el porcentaje mínimo, pero puedes intentarlo de nuevo."}
          </p>

          {/* Score circle */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                className="text-base-300"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                className={passed ? "text-success" : "text-error"}
                strokeWidth="3"
                strokeDasharray={`${percentage}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div>
                <p className={`text-2xl font-extrabold ${passed ? "text-success" : "text-error"}`}>
                  {score}/{questions.length}
                </p>
                <p className="text-[10px] text-base-content/40">correctas</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onBack} className="btn btn-outline flex-1">
              Volver
            </button>
            {!passed && (
              <button
                onClick={() => {
                  setCurrent(0);
                  setSelected(null);
                  setConfirmed(false);
                  setScore(0);
                  setFinished(false);
                }}
                className="btn btn-primary flex-1"
              >
                Reintentar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-4 pb-3 border-b border-base-300 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onBack} className="btn btn-ghost btn-sm gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            Salir
          </button>
          <span className="text-sm font-bold text-base-content/60">
            {current + 1} / {questions.length}
          </span>
        </div>
        <progress
          className="progress progress-primary w-full h-2"
          value={progress}
          max={100}
        />
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-xl mx-auto w-full">
        <div className="w-full animate-[fadeInUp_0.3s_ease-out]" key={current}>
          <div className="text-center mb-8">
            <span className="text-4xl mb-4 block">🧠</span>
            <h2 className="text-xl font-bold text-base-content leading-relaxed">
              {question.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3 w-full">
            {question.options.map((option, i) => {
              let style = "bg-base-200 hover:bg-base-300 border-transparent";
              if (confirmed) {
                if (i === question.correct) {
                  style = "bg-success/15 border-success text-success";
                } else if (i === selected && i !== question.correct) {
                  style = "bg-error/15 border-error text-error";
                } else {
                  style = "bg-base-200 opacity-50 border-transparent";
                }
              } else if (i === selected) {
                style = "bg-primary/15 border-primary text-primary";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${style}`}
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      confirmed && i === question.correct
                        ? "bg-success text-success-content"
                        : confirmed && i === selected
                        ? "bg-error text-error-content"
                        : i === selected
                        ? "bg-primary text-primary-content"
                        : "bg-base-300 text-base-content/50"
                    }`}
                  >
                    {confirmed && i === question.correct ? "✓" : confirmed && i === selected ? "✗" : String.fromCharCode(65 + i)}
                  </span>
                  <span className="font-medium">{option}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom action */}
      <div className="px-6 pb-6 pt-2 shrink-0">
        {!confirmed ? (
          <button
            onClick={handleConfirm}
            disabled={selected === null}
            className="btn btn-primary w-full font-bold text-base disabled:opacity-30"
          >
            Confirmar respuesta
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="btn btn-primary w-full font-bold text-base"
          >
            {current + 1 >= questions.length ? "Ver resultados" : "Siguiente pregunta →"}
          </button>
        )}
      </div>
    </div>
  );
}
