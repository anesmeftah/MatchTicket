# 🔧 Configuration Supabase - Table Users

## Problème: Chargement des données bloqué

Si le profil reste sur "Chargement des données...", c'est que la table `users` n'existe pas ou n'est pas accessible.

## Solution - Créer la table dans Supabase

### Étape 1: Aller sur le Dashboard Supabase

1. Allez à: https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans **SQL Editor** (barre latérale gauche)

### Étape 2: Exécuter le SQL

Copiez-collez ce code SQL et cliquez sur **RUN**:

```sql
-- Créer la table users
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Créer un index sur l'email
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Insérer un utilisateur de test
INSERT INTO public.users (id, email, nom, prenom, password) 
VALUES (1, 'maindf@gmail.com', 'Dupont', 'Jean', '123456')
ON CONFLICT (id) DO NOTHING;
```

### Étape 3: Vérifier les politiques RLS (Row Level Security)

Si vous avez activé RLS sur la table `users`, vous devez ajouter une politique:

```sql
-- Permettre l'accès en lecture à tous
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.users
FOR SELECT USING (true);

CREATE POLICY "Allow public update" ON public.users
FOR UPDATE USING (true);
```

### Étape 4: Rafraîchir l'application

Une fois la table créée, retournez à l'application et appuyez sur **F5** pour rafraîchir.

## Debugging

Ouvrez la console du navigateur (F12) et cherchez:
- ✅ `✅ User fetched successfully` - Les données sont chargées
- ❌ Erreur Supabase - La table n'existe pas ou RLS bloque l'accès
- ⚠️ `Returning fallback user data` - Utilisation des données de secours

## Données par défaut (Fallback)

Si la table n'existe pas, l'app montre ces données de test:
- Nom: Dupont
- Prénom: Jean
- Email: maindf@gmail.com

