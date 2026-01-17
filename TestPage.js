import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import { PSYCH_TEST_QUESTIONS } from '../data/constants';

export default function TestPage({ answers, setAnswers, submitTest, calculating }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const question = PSYCH_TEST_QUESTIONS[currentQuestion];

    const handleAnswer = (option) => {
      setAnswers({ ...answers, [question.id]: option.trait });
      if (currentQuestion < PSYCH_TEST_QUESTIONS.length - 1) setCurrentQuestion(currentQuestion + 1);
      else submitTest();
    };

    if (calculating) {
      return (
        <div className="min-h-screen bg-indigo-900 flex flex-col items-center justify-center text-white p-6 text-center">
          <Brain className="h-20 w-20 text-indigo-300 animate-pulse mb-6" />
          <h2 className="text-3xl font-bold mb-2">Analyzing Personality...</h2>
          <p className="text-indigo-200">Mapping your traits to the perfect career stream.</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Personality Assessment</h2>
            <div className="text-slate-500 font-mono text-sm">Question {currentQuestion + 1} / {PSYCH_TEST_QUESTIONS.length}</div>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full mb-8">
            <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentQuestion) / PSYCH_TEST_QUESTIONS.length) * 100}%` }}></div>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center mb-8">
             <h3 className="text-2xl font-medium text-slate-900">{question.question}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {question.options.map((opt) => (
              <button key={opt.id} onClick={() => handleAnswer(opt)} className="group relative bg-white p-8 rounded-xl shadow-md border-2 border-transparent hover:border-indigo-600 hover:shadow-xl transition-all duration-200 text-left flex items-center space-x-6">
                <span className="text-6xl group-hover:scale-110 transition-transform duration-200">{opt.icon}</span>
                <div>
                  <p className="text-lg font-semibold text-slate-800">{opt.text}</p>
                  <p className="text-sm text-slate-400 mt-1">Select this option</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
}
