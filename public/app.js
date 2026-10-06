const appState = {
  language: 'pt',
  selectedCategory: 'ativacoes',
  categoryOrder: ['ativacoes', 'acervo', 'checkout']
};

const translations = {
  pt: {
    title: 'Como você avalia sua experiência?',
    text: 'Escolha seu idioma para responder em poucos segundos.',
    continue: 'Continuar',
    sectionLabel: 'Avaliação',
    labels: {
      ativacoes: 'Ativações do Tour',
      acervo: 'Acervo',
      checkout: 'Checkout / saída'
    },
    questions: {
      ativacoes: 'Como você avalia as ativações do Tour?',
      acervo: 'Como você avalia o acervo?',
      checkout: 'Como você avalia sua experiência no checkout?'
    },
    thanks: 'Sua avaliação foi enviada com sucesso.',
    categories: { ativacoes: 'Ativações do Tour', acervo: 'Acervo', checkout: 'Checkout / saída' }
  },
  en: {
    title: 'How would you rate your experience?',
    text: 'Choose your language and answer in just a few seconds.',
    continue: 'Continue',
    sectionLabel: 'Assessment',
    labels: {
      ativacoes: 'Tour activities',
      acervo: 'Exhibition',
      checkout: 'Checkout experience'
    },
    questions: {
      ativacoes: 'How would you rate the Tour activities?',
      acervo: 'How would you rate the exhibition?',
      checkout: 'How would you rate your checkout experience?'
    },
    thanks: 'Your feedback was submitted successfully.',
    categories: { ativacoes: 'Tour activities', acervo: 'Exhibition', checkout: 'Checkout experience' }
  },
  es: {
    title: '¿Cómo calificarías tu experiencia?',
    text: 'Elige tu idioma y responde en pocos segundos.',
    continue: 'Continuar',
    sectionLabel: 'Evaluación',
    labels: {
      ativacoes: 'Actividades del Tour',
      acervo: 'Exhibición',
      checkout: 'Experiencia de checkout'
    },
    questions: {
      ativacoes: '¿Cómo calificarías las actividades del Tour?',
      acervo: '¿Cómo calificarías la exposición?',
      checkout: '¿Cómo calificarías tu experiencia en el checkout?'
    },
    thanks: 'Tu opinión fue enviada con éxito.',
    categories: { ativacoes: 'Actividades del Tour', acervo: 'Exhibición', checkout: 'Experiencia de checkout' }
  }
};

const faces = {
  pt: [
    { value: 1, emoji: '😠', label: 'Péssimo' },
    { value: 2, emoji: '🙁', label: 'Ruim' },
    { value: 3, emoji: '😐', label: 'Regular' },
    { value: 4, emoji: '🙂', label: 'Bom' },
    { value: 5, emoji: '😄', label: 'Excelente' }
  ],
  en: [
    { value: 1, emoji: '😠', label: 'Very poor' },
    { value: 2, emoji: '🙁', label: 'Poor' },
    { value: 3, emoji: '😐', label: 'Fair' },
    { value: 4, emoji: '🙂', label: 'Good' },
    { value: 5, emoji: '😄', label: 'Excellent' }
  ],
  es: [
    { value: 1, emoji: '😠', label: 'Muy malo' },
    { value: 2, emoji: '🙁', label: 'Malo' },
    { value: 3, emoji: '😐', label: 'Regular' },
    { value: 4, emoji: '🙂', label: 'Bueno' },
    { value: 5, emoji: '😄', label: 'Excelente' }
  ]
};

const languageButtons = [...document.querySelectorAll('.lang-btn')];
const startSurveyBtn = document.getElementById('start-survey');
const welcomeTitle = document.getElementById('welcome-title');
const welcomeText = document.getElementById('welcome-text');
const questionSectionLabel = document.getElementById('question-section-label');
const questionTitle = document.getElementById('question-title');
const facesContainer = document.getElementById('faces');
const screenLanguage = document.getElementById('screen-language');
const screenQuestion = document.getElementById('screen-question');
const screenThanks = document.getElementById('screen-thanks');
const thanksTitle = document.getElementById('thanks-title');
const thanksText = document.getElementById('thanks-text');
const thanksContact = document.getElementById('thanks-contact');

function renderLanguageUI() {
  const locale = translations[appState.language];

  welcomeTitle.textContent = locale.title;
  welcomeText.textContent = locale.text;
  startSurveyBtn.textContent = locale.continue;

  languageButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.lang === appState.language);
  });
}

function renderQuestion() {
  const locale = translations[appState.language];
  const category = appState.selectedCategory;

  questionSectionLabel.textContent = locale.labels[category];
  questionTitle.textContent = locale.questions[category];

  facesContainer.innerHTML = '';

  faces[appState.language].forEach((face) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'face-btn';
    btn.dataset.value = String(face.value);
    btn.innerHTML = `
      <span class="emoji">${face.emoji}</span>
      <span>${face.label}</span>
    `;

    btn.addEventListener('click', async () => {
      document.querySelectorAll('.face-btn').forEach((item) => item.classList.remove('selected'));
      btn.classList.add('selected');

      await submitResponse(Number(face.value));
    });

    facesContainer.appendChild(btn);
  });
}

async function submitResponse(rating) {
  const payload = {
    language: appState.language,
    category: appState.selectedCategory,
    rating
  };

  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!data.ok) {
      console.error(data.error);
      return;
    }

    const locale = translations[appState.language];
    const negative = rating <= 3;

    if (negative) {
      const titles = {
        pt: 'Obrigado por nos avisar',
        en: 'Thank you for letting us know',
        es: 'Gracias por avisarnos'
      };
      const messages = {
        pt: 'Se você quiser formalizar sua insatisfação, entre em contato conosco em contato@maracatour.com.br.',
        en: 'If you would like to formalize your dissatisfaction, please contact us at contato@maracatour.com.br.',
        es: 'Si desea formalizar su insatisfacción, puede contactarnos en contato@maracatour.com.br.'
      };

      thanksTitle.textContent = titles[appState.language];
      thanksText.textContent = messages[appState.language];
      thanksContact.textContent = 'contato@maracatour.com.br';
      thanksContact.classList.remove('hidden');
    } else {
      thanksTitle.textContent = 'Obrigado!';
      thanksText.textContent = locale.thanks;
      thanksContact.textContent = '';
      thanksContact.classList.add('hidden');
    }

    screenQuestion.classList.add('hidden');
    screenThanks.classList.remove('hidden');

    setTimeout(() => {
      const nextCategoryIndex = (appState.categoryOrder.indexOf(appState.selectedCategory) + 1) % appState.categoryOrder.length;
      appState.selectedCategory = appState.categoryOrder[nextCategoryIndex];
      renderQuestion();
      screenThanks.classList.add('hidden');
      screenQuestion.classList.remove('hidden');
    }, 2400);
  } catch (error) {
    console.error('Erro ao enviar resposta:', error);
  }
}

languageButtons.forEach((button) => {
  button.addEventListener('click', () => {
    appState.language = button.dataset.lang;
    renderLanguageUI();
  });
});

startSurveyBtn.addEventListener('click', () => {
  screenLanguage.classList.add('hidden');
  screenQuestion.classList.remove('hidden');
  renderQuestion();
});

renderLanguageUI();
