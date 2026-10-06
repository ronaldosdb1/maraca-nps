'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 8080;
const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'pesquisa.db');

fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS respostas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    language TEXT NOT NULL,
    category TEXT NOT NULL,
    rating INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_respostas_categoria
  ON respostas (category, created_at);
`);

app.disable('x-powered-by');
app.use(express.json({ limit: '8kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const FACE_SCALE = {
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

const CATEGORY_LABELS = {
  pt: {
    ativacoes: 'Ativações do Tour',
    acervo: 'Acervo',
    checkout: 'Checkout / saída'
  },
  en: {
    ativacoes: 'Tour activities',
    acervo: 'Exhibition',
    checkout: 'Checkout experience'
  },
  es: {
    ativacoes: 'Actividades del Tour',
    acervo: 'Exhibición',
    checkout: 'Experiencia de checkout'
  }
};

const QUESTION_TEXT = {
  pt: {
    ativacoes: 'Como você avalia as ativações do Tour?',
    acervo: 'Como você avalia o acervo?',
    checkout: 'Como você avalia sua experiência no checkout?'
  },
  en: {
    ativacoes: 'How would you rate the Tour activities?',
    acervo: 'How would you rate the exhibition?',
    checkout: 'How would you rate your checkout experience?'
  },
  es: {
    ativacoes: '¿Cómo calificarías las actividades del Tour?',
    acervo: '¿Cómo calificarías la exposición?',
    checkout: '¿Cómo calificarías tu experiencia en el checkout?'
  }
};

app.get('/health', (req, res) => {
  res.json({ ok: true, database: dbPath });
});

app.get('/api/config', (req, res) => {
  res.json({
    languages: ['pt', 'en', 'es'],
    faces: FACE_SCALE,
    categories: CATEGORY_LABELS,
    questions: QUESTION_TEXT
  });
});

app.get('/api/stats', (req, res) => {
  const totals = db.prepare(`
    SELECT category, rating, COUNT(*) AS total
    FROM respostas
    GROUP BY category, rating
    ORDER BY category, rating
  `).all();

  const byCategory = {};
  const categoryTotals = db.prepare(`
    SELECT category, COUNT(*) AS total
    FROM respostas
    GROUP BY category
    ORDER BY category
  `).all();

  for (const item of categoryTotals) {
    byCategory[item.category] = Number(item.total);
  }

  const result = {};
  for (const category of ['ativacoes', 'acervo', 'checkout']) {
    result[category] = {
      total: Number(byCategory[category] || 0),
      ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  for (const row of totals) {
    if (result[row.category]) {
      result[row.category].ratings[String(row.rating)] = Number(row.total);
    }
  }

  const overall = db.prepare(`SELECT COUNT(*) AS total FROM respostas`).get();

  res.json({
    total: Number(overall.total || 0),
    byCategory: result,
    updatedAt: new Date().toISOString()
  });
});

app.post('/api/submit', (req, res) => {
  try {
    const language = String(req.body.language || 'pt').toLowerCase();
    const category = String(req.body.category || '').trim().toLowerCase();
    const rating = Number(req.body.rating);

    const allowedLanguages = ['pt', 'en', 'es'];
    const allowedCategories = ['ativacoes', 'acervo', 'checkout'];

    if (!allowedLanguages.includes(language)) {
      return res.status(400).json({ ok: false, error: 'Idioma inválido' });
    }

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ ok: false, error: 'Categoria inválida' });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ ok: false, error: 'Avaliação inválida' });
    }

    const stmt = db.prepare(`
      INSERT INTO respostas (language, category, rating) VALUES (?, ?, ?)
    `);
    stmt.run(language, category, rating);

    const contactEmail = 'contato@maracatour.com.br';
    const negative = rating <= 3;

    return res.json({
      ok: true,
      message: 'Resposta registrada com sucesso',
      needs_contact: negative,
      contact_email: contactEmail
    });
  } catch (error) {
    console.error('Erro ao salvar resposta:', error);
    return res.status(500).json({ ok: false, error: 'Erro interno do servidor' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/painel', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'painel.html'));
});

app.listen(PORT, () => {
  console.log(`Pesquisa Maraca rodando na porta ${PORT}`);
});
