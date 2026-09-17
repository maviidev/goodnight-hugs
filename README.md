# XC — Avaliação Física e Nutricional

Aplicação web mobile-first para o aluno preencher uma avaliação física e nutricional guiada em 10 etapas.

## Executar localmente

```bash
npm install
npm run dev
```

## Recursos

- 36 perguntas organizadas por etapas configuráveis em `src/questions.ts`
- progresso visual e validação por etapa
- salvamento automático do rascunho no navegador
- upload e pré-visualização de fotos de frente, lado e costas
- layout responsivo alinhado à identidade visual XC
- confirmação de envio e persistência local da submissão

## Persistência

Esta primeira versão funciona sem credenciais externas e mantém rascunhos e submissões no `localStorage`. Para uso em produção com consulta pelo treinador e armazenamento real das imagens, conecte `src/storage.ts` ao banco e ao storage do projeto (por exemplo, Supabase).

## Painel administrativo

O painel privado está disponível em `/admin` e usa a autenticação do Supabase. Configure as variáveis documentadas em `.env.example` e aplique a migration em `supabase/migrations` para liberar leitura somente a usuários com papel `admin`, `trainer` ou `treinador`.

O painel consulta as tabelas existentes `profiles` (com fallback para `clients`), `assessments`, `assessment_answers` e `assessment_photos`. As fotos continuam privadas e são exibidas por URLs assinadas com validade de 15 minutos.
