# Supabase Migrations - Clínica de Estética

Este diretório contém o schema de banco de dados e dados iniciais para implantar o backend da Clínica no **Supabase** (PostgreSQL).

## 📁 Estrutura de Arquivos

- `migrations/20260729000000_create_clinic_schema.sql`: Criação das tabelas (`treatments`, `promotions`, `testimonials`, `faqs`, `blog_posts`, `bookings`), triggers de atualização automática (`updated_at`), índices e políticas de segurança RLS (Row Level Security).
- `seed.sql`: Dados iniciais de tratamentos, ofertas promocionais, depoimentos, FAQs e artigos do blog.

---

## 🚀 Como Aplicar no Supabase

### Opção 1: Via Supabase Dashboard (SQL Editor)
1. Acesse o seu projeto em [supabase.com](https://supabase.com).
2. Vá para **SQL Editor** no menu lateral.
3. Clique em **New Query**.
4. Copie o conteúdo de `supabase/migrations/20260729000000_create_clinic_schema.sql` e execute (**Run**).
5. Abra uma nova query, copie o conteúdo de `supabase/seed.sql` e execute (**Run**).

### Opção 2: Via Supabase CLI
Se você utiliza a CLI do Supabase localmente:

```bash
# Inicializar o Supabase (se ainda não o fez)
npx supabase init

# Linkar ao seu projeto remoto
npx supabase link --project-ref <seu-project-ref>

# Aplicar as migrações no banco
npx supabase db push
```

---

## 🔐 Configuração do Cliente Supabase na Aplicação

Para conectar a aplicação ao Supabase via JavaScript/TypeScript SDK:

1. Instale o pacote oficial `@supabase/supabase-js`:
   ```bash
   npm install @supabase/supabase-js
   ```

2. Adicione as variáveis de ambiente em `.env.example`:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
   ```

3. Exemplo de cliente Supabase (`src/lib/supabase.ts`):
   ```typescript
   import { createClient } from '@supabase/supabase-js';

   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

   export const supabase = createClient(supabaseUrl, supabaseAnonKey);
   ```
