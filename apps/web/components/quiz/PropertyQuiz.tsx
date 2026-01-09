'use client';

import { useState } from 'react';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface QuizStep {
  question: string;
  options: { label: string; value: string }[];
}

interface QuizResult {
  title: string;
  description: string;
  recommendations: string[];
}

const QUIZ_STEPS: QuizStep[] = [
  {
    question: 'Bütçeniz nedir?',
    options: [
      { label: '500K - 1M TL', value: 'low' },
      { label: '1M - 2M TL', value: 'medium' },
      { label: '2M - 5M TL', value: 'high' },
      { label: '5M+ TL', value: 'premium' },
    ],
  },
  {
    question: 'Bu evi ne için kullanacaksınız?',
    options: [
      { label: 'Yazlık', value: 'summer' },
      { label: 'Yatırım', value: 'investment' },
      { label: 'Oturum', value: 'residence' },
      { label: 'Kira geliri', value: 'rental' },
    ],
  },
  {
    question: 'Yatırım zaman ufkunuz nedir?',
    options: [
      { label: '1 yıl içinde', value: 'short' },
      { label: '1-3 yıl', value: 'medium' },
      { label: '3-5 yıl', value: 'long' },
      { label: '5+ yıl', value: 'very-long' },
    ],
  },
  {
    question: 'Önceliğiniz nedir?',
    options: [
      { label: 'Denize yakınlık', value: 'sea' },
      { label: 'Merkeze yakınlık', value: 'center' },
      { label: 'Yatırım getirisi', value: 'return' },
      { label: 'Yaşam kalitesi', value: 'quality' },
    ],
  },
];

const QUIZ_RESULTS: { [key: string]: QuizResult } = {
  'low-summer-short-sea': {
    title: 'Yazlık Ev Arayanlar İçin',
    description: 'Bütçenize uygun yazlık ev seçenekleri için Karasu\'nun denize yakın mahallelerini inceleyebilirsiniz.',
    recommendations: [
      'Karasu Sahil Mahallesi\'nde yazlık ev seçeneklerini inceleyin',
      'Kiralık yazlık seçeneklerini değerlendirin',
      'Denize yakın konumları tercih edin',
    ],
  },
  'medium-investment-medium-return': {
    title: 'Yatırım Odaklı Arayanlar İçin',
    description: 'Orta vadeli yatırım için Karasu\'da değer kazanma potansiyeli yüksek bölgeleri inceleyebilirsiniz.',
    recommendations: [
      'Gelişmekte olan mahallelerde yatırım fırsatlarını değerlendirin',
      'Kiralama potansiyeli yüksek bölgeleri tercih edin',
      'Uzun vadeli değer artışı için merkeze yakın konumları inceleyin',
    ],
  },
  'high-residence-long-quality': {
    title: 'Kalıcı Yaşam İçin',
    description: 'Yaşam kalitesi yüksek, kalıcı oturum için ideal bölgeleri inceleyebilirsiniz.',
    recommendations: [
      'Merkeze yakın, sosyal tesisleri gelişmiş mahalleleri tercih edin',
      'Ulaşım kolaylığı olan bölgeleri değerlendirin',
      'Okul, sağlık gibi temel hizmetlere yakın konumları inceleyin',
    ],
  },
};

export default function PropertyQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentStep < QUIZ_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate result
      const resultKey = newAnswers.join('-');
      const quizResult = QUIZ_RESULTS[resultKey] || {
        title: 'Genel Öneriler',
        description: 'İhtiyaçlarınıza uygun emlak seçenekleri için profesyonel danışmanlık almanızı öneririz.',
        recommendations: [
          'Satılık ve kiralık ilanlarımızı inceleyin',
          'Bizimle iletişime geçerek detaylı bilgi alın',
          'Bütçenize ve ihtiyaçlarınıza uygun seçenekleri değerlendirin',
        ],
      };
      setResult(quizResult);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers([]);
    setResult(null);
  };

  if (result) {
    return (
      <div className="bg-card rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">{result.title}</h2>
          <p className="text-muted-foreground mb-6">{result.description}</p>
        </div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">Öneriler:</h3>
          <ul className="space-y-2">
            {result.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex gap-4">
          <Button onClick={resetQuiz} variant="outline">
            Tekrar Başla
          </Button>
          <Link href="/iletisim">
            <Button>
              İletişime Geçin
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = QUIZ_STEPS[currentStep];
  const progress = ((currentStep + 1) / QUIZ_STEPS.length) * 100;

  return (
    <div className="bg-card rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-muted-foreground">
            Soru {currentStep + 1} / {QUIZ_STEPS.length}
          </span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">{currentQuestion.question}</h2>

      <div className="space-y-3">
        {currentQuestion.options.map((option, index) => (
          <Button
            key={index}
            onClick={() => handleAnswer(option.value)}
            variant="outline"
            className="w-full text-left justify-start h-auto py-4 px-6 hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

