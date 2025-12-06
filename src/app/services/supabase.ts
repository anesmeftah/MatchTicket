import { Injectable } from '@angular/core'
import {
  AuthChangeEvent,
  AuthSession,
  createClient,
  Session,
  SupabaseClient,
  User as AuthUser,
} from '@supabase/supabase-js'
import { environment } from '../../environments/environment'

export interface Profile {
  id?: string
  username: string
  website: string
  avatar_url: string
}
export interface UserData {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  password?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient
  _session: AuthSession | null = null

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
  }
    getClient() {
    return this.supabase;
  }
  get session() {
    this.supabase.auth.getSession().then(({ data }) => {
      this._session = data.session
    })
    return this._session
  }

  profile(user: AuthUser) {
    return this.supabase
      .from('profiles')
      .select(`username, website, avatar_url`)
      .eq('id', user.id)
      .single()
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }

  signIn(email: string) {
    return this.supabase.auth.signInWithOtp({ email })
  }

  signOut() {
    return this.supabase.auth.signOut()
  }

  updateProfile(profile: Profile) {
    const update = {
      ...profile,
      updated_at: new Date(),
    }

    return this.supabase.from('profiles').upsert(update)
  }

  downLoadImage(path: string) {
    return this.supabase.storage.from('avatars').download(path)
  }

  uploadAvatar(filePath: string, file: File) {
    return this.supabase.storage.from('avatars').upload(filePath, file)
  }

  async getMatches(){
    const { data, error } = await this.supabase
      .from('matches')
      .select(`id , home_team , away_team , date , stadiums(name)`)
      .order('date', { ascending: true })
    
    if (error) {
      console.error('Error fetching matches:', error)
      return []
    }
    
    return data || []
  }

  async getStadiums() {
    const { data, error } = await this.supabase
      .from('stadiums')
      .select('id, name')
    
    if (error) {
      console.error('Error fetching stadiums:', error)
      return []
    }
    return data || []
  }

  async addStadium(name: string) {
    // First try to find existing stadium
    const { data: existing } = await this.supabase
      .from('stadiums')
      .select('id, name')
      .eq('name', name)
      .single()
    
    if (existing) {
      return existing
    }

    const { data, error } = await this.supabase
      .from('stadiums')
      .insert({ 
        name,
        city: 'Unknown',
        country: 'Unknown',
        capacity: 0
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error adding stadium:', error)
      // If insert failed, try one last time to fetch (race condition)
      const { data: retry } = await this.supabase
        .from('stadiums')
        .select('id, name')
        .eq('name', name)
        .single()
      return retry || null
    }
    return data
  }

  async insertMatch(match: any) {
    // Check if match exists to avoid duplicates
    const { data: existing } = await this.supabase
      .from('matches')
      .select('id')
      .eq('home_team', match.home_team)
      .eq('away_team', match.away_team)
      .eq('date', match.date)
      .single()

    if (existing) {
      return existing
    }

    const { data, error } = await this.supabase
      .from('matches')
      .insert(match)
      .select()
      .single()

    if (error) {
      console.error('Error inserting match:', error)
      return null
    }
    return data
  }


  async getSoldTickets(){
    const {data , error} = await this.supabase
      .from('tickets')
      .select(`id , event , date , seat , price , status`)
      .eq('status', 'sold')
      .order('date', { ascending: true })
      .limit(5)

    if (error){
      console.error('Error fetching tickets:', error)
      return []
    }
    return data || []
  }

  async getTicketsSoldPerMatch(){
    const { data, error } = await this.supabase
      .from('tickets')
      .select(`match_id, status, matches(home_team, away_team)`)
      .eq('status', 'sold')
    
    if (error) {
      console.error('Error fetching tickets stats:', error)
      return []
    }

    // Group by match
    const statsMap = new Map<number, { matchName: string, count: number }>()
    
    data?.forEach((ticket: any) => {
      if (ticket.match_id && ticket.matches) {
        const matchName = `${ticket.matches.home_team} vs ${ticket.matches.away_team}`
        if (statsMap.has(ticket.match_id)) {
          statsMap.get(ticket.match_id)!.count++
        } else {
          statsMap.set(ticket.match_id, { matchName, count: 1 })
        }
      }
    })

    return Array.from(statsMap.values())
  }

  async getTotalTicketsSold(): Promise<number> {
    const { count, error } = await this.supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sold')
    
    if (error) {
      console.error('Error fetching total tickets sold:', error)
      return 0
    }
    
    return count || 0
  }

  async getUpcomingMatchesCount(): Promise<number> {
    const today = new Date().toISOString()
    const { count, error } = await this.supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .gte('date', today)
    
    if (error) {
      console.error('Error fetching upcoming matches count:', error)
      return 0
    }
    
    return count || 0
  }

  async getTotalRevenue(): Promise<number> {
    const { data, error } = await this.supabase
      .from('tickets')
      .select('price')
      .eq('status', 'sold')
    
    if (error) {
      console.error('Error fetching total revenue:', error)
      return 0
    }
    
    const total = data?.reduce((sum, ticket) => sum + (ticket.price || 0), 0) || 0
    return total
  }
async getUser1(userId: number): Promise<UserData | null> {
    try {
      console.log('🔍 Fetching user with ID:', userId);
      
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Erreur getUser1:', {
          message: error.message,
          code: error.code,
          details: error.details
        });
        
        // Fallback: retourner des données d'exemple
        console.warn('⚠️ Returning fallback user data');
        return {
          id: 1,
          email: 'maindf@gmail.com',
          nom: 'Dupont',
          prenom: 'Jean',
          password: '123456'
        };
      }
      
      if (!data) {
        console.warn('⚠️ No user data returned');
        return {
          id: 1,
          email: 'maindf@gmail.com',
          nom: 'Dupont',
          prenom: 'Jean',
          password: '123456'
        };
      }
      
      console.log('✅ User fetched successfully:', data);
      return data as UserData;
      
    } catch (error) {
      console.error('❌ Exception in getUser1:', error);
      // Fallback
      return {
        id: 1,
        email: 'maindf@gmail.com',
        nom: 'Dupont',
        prenom: 'Jean',
        password: '123456'
      };
    }
  }
async updateUser1(userData: UserData): Promise<boolean> {
    try {
      console.log('📝 Updating user:', userData);
      
      const updateData: any = {
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email,
        updated_at: new Date().toISOString()
      };

      // Ajouter le mot de passe seulement s'il est fourni
      if (userData.password && userData.password.trim() !== '') {
        updateData.password = userData.password;
      }

      const { error } = await this.supabase
        .from('users')
        .update(updateData)
        .eq('id', userData.id);

      if (error) {
        console.error('❌ Erreur updateUser1:', error);
        return false;
      }
      
      console.log('✅ User updated successfully in database');
      return true;
    } catch (error) {
      console.error('❌ Exception in updateUser1:', error);
      return false;
    }
  }
  async getCurrentAuthUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  async addTickets(tickets: any[]) {
    const { data, error } = await this.supabase
      .from('tickets')
      .insert(tickets)
      .select()
    
    if (error) {
      console.error('Error adding tickets:', error)
      throw error
    }
    
    return data
  }
// Pour mahdi (insertion abonnement - Get abonnement )
    async insertAbonnement(match: any) {
    // Check if match exists to avoid duplicates
    const { data: existing } = await this.supabase
      .from('matches')
      .select('id')
      .eq('home_team', match.home_team)
      .eq('away_team', match.away_team)
      .eq('date', match.date)
      .single()

    if (existing) {
      return existing
    }

    const { data, error } = await this.supabase
      .from('Abonnement')
      .insert(match)
      .select()
      .single()

    if (error) {
      console.error('Error inserting match:', error)
      return null
    }
    return data
  }

async getUserByEmail(email: string): Promise<UserData | null> {
  const { data, error } = await this.supabase
    .from('user')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Erreur récupération utilisateur:', error);
    return null;
  }
  return data;
}

async updateUserProfile(userData: UserData) {
  // Mise à jour sans le mot de passe (à gérer séparément)
  const { data, error } = await this.supabase
    .from('user')
    .update({
      nom: userData.nom,
      prenom: userData.prenom,
      email: userData.email
      // Ne pas mettre à jour le mot de passe ici
    })
    .eq('id', userData.id)
    .select()
    .single();

  if (error) {
    console.error('Erreur mise à jour utilisateur:', error);
    throw error;
  }
  return data;
}

async updatePassword(userId: number, newPassword: string) {
  // Si tu veux mettre à jour le mot de passe séparément
  const { data, error } = await this.supabase
    .from('user')
    .update({ password: newPassword })
    .eq('id', userId);

  if (error) {
    console.error('Erreur mise à jour mot de passe:', error);
    throw error;
  }
  return data;
}

}
