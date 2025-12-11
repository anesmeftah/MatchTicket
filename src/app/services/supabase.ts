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
      console.log('Fetching user with ID:', userId);
      
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error(' Erreur getUser1:', {
          message: error.message,
          code: error.code,
          details: error.details
        });
        console.warn('Returning fallback user data');
        return {
          id: 1,
          email: 'maindf@gmail.com',
          nom: 'Dupont',
          prenom: 'Jean',
          password: '123456'
        };
      }
      
      if (!data) {
        console.warn(' No user data returned');
        return {
          id: 1,
          email: 'maindf@gmail.com',
          nom: 'Dupont',
          prenom: 'Jean',
          password: '123456'
        };
      }
      
      console.log(' User fetched successfully:', data);
      return data as UserData;
      
    } catch (error) {
      console.error(' Exception in getUser1:', error);
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
      console.log('Updating user:', userData);
      
      const updateData: any = {
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email,
        updated_at: new Date().toISOString()
      };

      if (userData.password && userData.password.trim() !== '') {
        updateData.password = userData.password;
      }

      const { error } = await this.supabase
        .from('users')
        .update(updateData)
        .eq('id', userData.id);

      if (error) {
        console.error('Erreur updateUser1:', error);
        return false;
      }
      
      console.log('User updated successfully in database');
      return true;
    } catch (error) {
      console.error(' Exception in updateUser1:', error);
      return false;
    }
  }
  async getCurrentAuthUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }
  async getConnectedUserId(): Promise<number> {
    try {
      const { data: users, error: queryError } = await this.supabase
        .from('users')
        .select('id')
        .eq('isconnected', 1)
        .maybeSingle(); // Returns null if no match instead of throwing

      if (queryError) {
        console.error('Query error:', queryError);
        return 0;
      }

      if (!users) {
        console.log('No connected user found in users table');
        return 0;
      }

      return users.id;

    } catch (error) {
      console.error('Unexpected error:', error);
      return 0;
    }
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

async getUserIdByEmail(email: string): Promise<number | null> {
  try {
    console.log('🔍 Looking for user with email:', email);
    
    const { data, error } = await this.supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (error) {
      console.error(' User not found:', error);
      return null;
    }
    
    console.log('User found with ID:', data.id);
    return data.id;
  } catch (error) {
    console.error(' Error fetching user ID:', error);
    return null;
  }
}

async getLastUserId(): Promise<number> {
  try {
    console.log('🔍 Getting last user ID from database');
    
    const { data, error } = await this.supabase
      .from('users')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.log(' No users found, starting from ID 1');
      return 1;
    }
    
    console.log(' Last user ID:', data.id);
    return data.id;
  } catch (error) {
    console.error(' Error fetching last user ID:', error);
    return 1;
  }
}

async getAbonnementByUserId(userId: number) {
  try {
    console.log(' Fetching subscriptions for user ID:', userId);
    
    const { data, error } = await this.supabase
      .from('Abonnement')
      .select('*')
      .eq('id_utilisateur', userId)
      .order('id', { ascending: true });

    if (error) {
      console.log('No subscriptions found');
      return [];
    }
    
    console.log(' Subscriptions fetched:', data);
    return data || [];
  } catch (error) {
    console.error(' Error fetching subscriptions:', error);
    return [];
  }
}

async insertAbonnement(abonnement: any) {
  try {
    console.log('Inserting new subscription:', abonnement);
    
    const { data, error } = await this.supabase
      .from('Abonnement')
      .insert(abonnement)
      .select()
      .single();

    if (error) {
      console.error(' Error inserting subscription:', error);
      return null;
    }
    
    console.log('Subscription created:', data);
    return data;
  } catch (error) {
    console.error(' Exception in insertAbonnement:', error);
    return null;
  }
}

async updateAbonnement(abonnement: any) {
  try {
    console.log(' Updating subscription:', abonnement);
    
    const { error } = await this.supabase
      .from('Abonnement')
      .update(abonnement)
      .eq('id', abonnement.id);

    if (error) {
      console.error('Error updating subscription:', error);
      return false;
    }
    
    console.log('Subscription updated');
    return true;
  } catch (error) {
    console.error(' Exception in updateAbonnement:', error);
    return false;
  }
}

async updateUserProfile(userData: UserData) {
  const { data, error } = await this.supabase
    .from('user')
    .update({
      nom: userData.nom,
      prenom: userData.prenom,
      email: userData.email
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
// Ajoutez ces méthodes à la fin de votre classe SupabaseService
// (juste avant le dernier "}")

/**
 * Inscription avec email et mot de passe
 */
async signUpWithPassword(email: string, password: string, nom?: string, prenom?: string) {
  try {
    const fullName = `${nom || ''} ${prenom || ''}`.trim();
    
    console.log('🔍 Inscription avec:', { email, nom, prenom, fullName });
    
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nom: nom,
          prenom: prenom,
          full_name: fullName,
          display_name: fullName
        }
      }
    });

    if (authError) {
      console.error('❌ Erreur auth:', authError.message);
      
      // Check for rate limiting
      if (authError.message.includes('27 seconds')) {
        throw new Error('⏳ Trop de tentatives. Veuillez attendre 27 secondes avant de réessayer.');
      }
      
      throw authError;
    }

    console.log('✅ Utilisateur créé dans Auth:', authData.user?.id);

    if (authData.user) {
      console.log('📝 Tentative insertion dans users table...');
      
      const { data: insertData, error: insertError } = await this.supabase
        .from('users')
        .insert({
          email: email,
          nom: nom || '',
          prenom: prenom || '',
          password: password
        })
        .select();

      if (insertError) {
        console.error('❌ Erreur insertion table users:', insertError);
        return { data: authData, error: insertError };
      }
      
      console.log('✅ Utilisateur inséré dans users table:', insertData);
    }

    return { data: authData, error: null };
  } catch (error: any) {
    console.error('❌ Exception signUpWithPassword:', error);
    return { data: null, error: error };
  }
}
/**
 * Connexion avec email et mot de passe
 */
async signInWithPassword(email: string, password: string) {
  try {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error };
  }
}

/**
 * Vérifier si l'utilisateur est connecté
 */
isLoggedIn(): boolean {
  return this._session !== null;
}

/**
 * Obtenir l'utilisateur actuel
 */
async getCurrentUser() {
  const { data: { user }, error } = await this.supabase.auth.getUser();
  if (error) {
    console.error('Erreur récupération utilisateur:', error);
    return null;
  }
  return user;
}

/**
 * Réinitialisation du mot de passe
 */
async resetPassword(email: string) {
  try {
    const { data, error } = await this.supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/reset-password`
      }
    );

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error };
  }
}

async getAvailableTickets() {
  try {
    const { data, error } = await this.supabase
      .from('tickets')
      .select('id, event, date, seat, section, row_number, seat_number, price, status, match_id')
      .eq('status', 'available')
      .order('date', { ascending: true });

    if (error) {
      console.error('❌ Error fetching available tickets:', error);
      return [];
    }

    console.log('✅ Available tickets loaded:', data?.length || 0);
    
    // Ensure price is properly converted to number
    return (data || []).map((ticket: any) => ({
      ...ticket,
      price: typeof ticket.price === 'string' ? parseFloat(ticket.price) : ticket.price
    }));
  } catch (error) {
    console.error('Exception in getAvailableTickets:', error);
    return [];
  }
}

async getUserTickets(userId: number) {
  try {
    const { data, error } = await this.supabase
      .from('ticketUser')
      .select('id, id_user, event, date, seat, section, price')
      .eq('id_user', userId)
      .order('date', { ascending: true });

    if (error) {
      console.error('❌ Error fetching user tickets:', error);
      return [];
    }

    console.log('✅ User tickets loaded:', data?.length || 0);
    
    // Ensure price is properly converted to number
    return (data || []).map((ticket: any) => ({
      ...ticket,
      price: typeof ticket.price === 'string' ? parseFloat(ticket.price) : ticket.price
    }));
  } catch (error) {
    console.error('Exception in getUserTickets:', error);
    return [];
  }
}

async buyTicket(userId: number, ticketId: number) {
  try {
    console.log('🛒 Starting ticket purchase:', { userId, ticketId });

    // Get ticket details
    console.log('📋 Fetching ticket details...');
    const { data: ticket, error: ticketError } = await this.supabase
      .from('tickets')
      .select('id, event, date, seat, section, price, status')
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticket) {
      console.error('❌ Error fetching ticket:', ticketError);
      return { success: false, error: 'Ticket not found: ' + ticketError?.message };
    }

    // Check if ticket is still available
    if (ticket.status !== 'available') {
      console.error('❌ Ticket is no longer available:', ticket.status);
      return { success: false, error: 'Ticket is no longer available' };
    }

    console.log('✅ Ticket found:', ticket);

    // Add to ticketUser table
    console.log('📝 Adding ticket to ticketUser table...');
    const { data: userTicket, error: insertError } = await this.supabase
      .from('ticketUser')
      .insert({
        id_user: userId,
        event: ticket.event,
        date: ticket.date,
        seat: ticket.seat,
        section: ticket.section || null,
        price: typeof ticket.price === 'string' ? parseFloat(ticket.price) : ticket.price
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error adding ticket to user:', insertError);
      return { success: false, error: 'Insert failed: ' + insertError.message };
    }

    console.log('✅ Ticket added to user:', userTicket);

    // Update ticket status to sold
    console.log('🔄 Updating ticket status to sold...');
    const { error: updateError } = await this.supabase
      .from('tickets')
      .update({ status: 'sold', updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    if (updateError) {
      console.error('❌ Error updating ticket status:', updateError);
      // Try to rollback the insert
      console.log('↩️ Rolling back insert...');
      await this.supabase.from('ticketUser').delete().eq('id', userTicket.id);
      return { success: false, error: 'Update failed: ' + updateError.message };
    }

    console.log('✅ Ticket status updated to sold');
    return { success: true, data: userTicket };
  } catch (error) {
    console.error('❌ Exception in buyTicket:', error);
    return { success: false, error: 'Exception: ' + (error as any).message };
  }
}

/**
 * Sign in user with email and password from users table
 * Sets isconnected = 1 for this user and isconnected = 0 for all others
 */
async signInWithUsersTable(email: string, password: string) {
  try {
    console.log('🔐 Attempting sign in with:', email);

    // 1. Verify credentials in users table
    const { data: user, error: userError } = await this.supabase
      .from('users')
      .select('id, email, nom, prenom, password, isadmin')
      .eq('email', email)
      .single();

    if (userError || !user) {
      console.error('❌ User not found:', userError);
      return { success: false, error: 'Your credentials are wrong' };
    }

    // 2. Check password (basic validation)
    if (user.password !== password) {
      console.error('❌ Password mismatch');
      return { success: false, error: 'Your credentials are wrong' };
    }

    console.log('✅ Credentials verified');

    // 3. Set all users to isconnected = 0
    const { error: resetError } = await this.supabase
      .from('users')
      .update({ isconnected: 0 })
      .neq('id', user.id);

    if (resetError) {
      console.error('❌ Error resetting connections:', resetError);
      // Continue anyway as this is not critical
    }

    // 4. Set this user to isconnected = 1
    const { error: updateError } = await this.supabase
      .from('users')
      .update({ isconnected: 1 })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Error setting isconnected:', updateError);
      return { success: false, error: 'Failed to establish connection' };
    }

    console.log('✅ User connected successfully:', user.id);
    return { success: true, data: user };
  } catch (error) {
    console.error('❌ Exception in signInWithUsersTable:', error);
    return { success: false, error: 'An error occurred during sign in' };
  }
}

/**
 * Sign out user - set isconnected = 0
 */
async signOutUser(userId: number) {
  try {
    console.log('🚪 Signing out user:', userId);

    const { error } = await this.supabase
      .from('users')
      .update({ isconnected: 0 })
      .eq('id', userId);

    if (error) {
      console.error('❌ Error signing out:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ User signed out');
    return { success: true };
  } catch (error) {
    console.error('❌ Exception in signOutUser:', error);
    return { success: false, error: 'An error occurred during sign out' };
  }
}
}
