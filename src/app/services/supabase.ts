import { Injectable } from '@angular/core'
import {
  AuthChangeEvent,
  AuthSession,
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js'
import { environment } from '../../environments/environment'

export interface Profile {
  id?: string
  username: string
  website: string
  avatar_url: string
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

  get session() {
    this.supabase.auth.getSession().then(({ data }) => {
      this._session = data.session
    })
    return this._session
  }

  profile(user: User) {
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
      .limit(7)
    
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
}