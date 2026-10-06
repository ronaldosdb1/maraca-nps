# Pesquisa de satisfação — Maraca Tour

Projeto simples para tablets instalados em pontos estratégicos do Tour, com pesquisa rápida de satisfação e painel para acompanhamento.

## Funcionalidades

- Seleção de idioma: Português / English / Español
- 3 blocos de avaliação:
  - Ativações do Tour
  - Acervo
  - Checkout / saída
- Escala de 5 carinhas com resposta em um toque
- Registro em banco local SQLite
- Painel administrativo em `/painel`

## Como rodar

```bash
npm install
npm start
```

A aplicação ficará disponível em:

- http://localhost:8080/
- http://localhost:8080/painel

## Estrutura

- `server.js`: API e servidor Express
- `public/index.html`: tela de pesquisa do tablet
- `public/painel.html`: painel de estatísticas
- `data/pesquisa.db`: banco local SQLite

## Observações

Este é um protótipo pronto para uso em tablets com toques grandes, foco em velocidade e simplicidade.
