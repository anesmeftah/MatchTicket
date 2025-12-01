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
  async getUser(userId: number) {
    const { data, error } = await this.supabase
      .from('user')
          .select('*').eq('id', userId).single();

    if (error) throw error;
    return data;
  }
  async updateUser1(userData: UserData) {
    const { data, error } = await this.supabase
      .from('user')   .update({
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email
      })
      .eq('id', userData.id);

    if (error) throw error;
    return data;
  }
  async getCurrentAuthUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }
}