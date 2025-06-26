
import axios, { type AxiosInstance } from 'axios';
import { getAuthToken } from '@/lib/tokenManager';

// --- Type Definitions ---
export interface UserProfile {
  id: string;
  username?: string | null;
  name: string;
  email: string;
  avatar_url?: string | null;
  is_admin?: boolean | null;
  birth_date?: string | null;
  is_suspended?: boolean | null;
  status?: 'active' | 'pending' | 'suspended' | string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  dataAiHint?: string;
  email_verified_at?: string | null;
  password?: string;
  password_confirmation?: string;
}

export interface Game {
  id: string;
  name: string;
  description: string;
  version: string;
  cover_image_url?: string | null;
  is_active: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  dataAiHint?: string;
  books?: {
    id: number;
    name: string;
    description?: string;
    document_url: string;
    deleted_at?: string | null;
  }[];
  races?: {
    id: number;
    name: string;
    description?: string;
    deleted_at?: string | null;
  }[];
  classes?: {
    id: number;
    name: string;
    description?: string;
    deleted_at?: string | null;
  }[];
}

export interface Character {
  id: string;
  user_id: string;
  game_id: string;
  name: string;
  race_id: string;
  class_id: string;
  level: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  current_hit_points: number;
  max_hit_points: number;
  armor_class: number;
  initiative: number;
  speed: number;
  description?: string;
  notes?: string;
  portrait_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  game?: { id: number | string; name: string };
  race?: { id: number | string; name: string };
  class?: { id: number | string; name: string };
  user?: { id: number | string; name: string; username: string };
}

export interface GameClass {
  id: string;
  game_id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  game?: { id: number | string; name: string };
}

export interface GameRace {
  id: string;
  game_id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  game?: { id: number | string; name: string };
}

export interface ApiGameBook {
  id: string;
  game_id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  document_url: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  game: { id: number | string; name: string };
}
export type GameBook = ApiGameBook;

export interface RegisterFormValuesForAction {
  name: string;
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  birth_date?: string;
}

export interface UpdateProfileData {
  name?: string;
  username?: string;
  email?: string;
  avatar_url?: string | null;
  birth_date?: string;
}

export interface UpdatePasswordData {
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}

interface UploadResponse {
  message: string;
  data: {
    url: string;
    path: string;
  };
}

class ApiClient {
  private api: AxiosInstance;

  constructor(token?: string) {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
      headers: { Accept: 'application/json' },
      withCredentials: false,
      timeout: 30000,
    });

    this.api.interceptors.request.use((config) => {
      // The token passed to the constructor has priority (for server-side actions)
      let finalToken = token ?? null;

      // If no token is provided in the constructor (client-side), get it from localStorage
      if (!finalToken && typeof window !== 'undefined') {
        finalToken = getAuthToken();
      }

      if (finalToken) {
        config.headers.Authorization = `Bearer ${finalToken}`;
      }
      return config;
    });
  }

  // --- Auth ---
  async register(
    data: RegisterFormValuesForAction
  ): Promise<{ message: string; data: UserProfile }> {
    const response = await this.api.post('/register', data);
    return response.data;
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<{ message: string; data: { user: UserProfile; token: string } }> {
    const response = await this.api.post('/login', data);
    return response.data;
  }

  async requestPasswordReset(email: string): Promise<any> {
    const response = await this.api.post('/forgot-password', { email });
    return response.data;
  }

  async resetPassword(data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<any> {
    const response = await this.api.post('/reset-password', data);
    return response.data;
  }

  async logout(): Promise<any> {
    const response = await this.api.post('/logout');
    return response.data;
  }

  async resendVerificationEmail(): Promise<any> {
    const response = await this.api.post('/email/resend');
    return response.data;
  }

  async verifyEmail(id: string, hash: string): Promise<any> {
    const response = await this.api.get(`/email/verify/${id}/${hash}`);
    return response.data;
  }

  // --- User Profile ---
  async getProfile(): Promise<{ data: UserProfile }> {
    const response = await this.api.get('/profile');
    return response.data;
  }

  async updateProfile(
    data: UpdateProfileData
  ): Promise<{ data: UserProfile; message: string }> {
    const response = await this.api.put('/profile', data);
    return response.data;
  }

  async updatePassword(
    data: UpdatePasswordData
  ): Promise<{ message: string }> {
    const response = await this.api.put('/profile/password', data);
    return response.data;
  }

  // --- Games ---
  async getGameList(): Promise<{ data: Game[]; message: string }> {
    const response = await this.api.get('/games');
    return response.data;
  }

  async getGame(gameId: string): Promise<{ data: Game; message: string }> {
    const response = await this.api.get(`/games/${gameId}`);
    return response.data;
  }

  async createGame(
    gameData: Omit<Game, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ data: Game; message: string }> {
    const response = await this.api.post('/games', gameData);
    return response.data;
  }

  async updateGame(
    gameId: string,
    gameData: Partial<Game>
  ): Promise<{ data: Game; message: string }> {
    const response = await this.api.put(`/games/${gameId}`, gameData);
    return response.data;
  }

  async deleteGame(gameId: string): Promise<{ message: string }> {
    const response = await this.api.delete(`/games/${gameId}`);
    return response.data;
  }

  // --- Character Sheets ---
  async getCharacterList(): Promise<{
    data: Character[];
    message: string;
    meta: any;
  }> {
    const response = await this.api.get('/sheets');
    return response.data;
  }

  async getCharacter(
    characterId: string
  ): Promise<{ data: Character; message: string }> {
    const response = await this.api.get(`/sheets/${characterId}`);
    return response.data;
  }

  async createCharacter(
    characterData: Omit<
      Character,
      | 'id'
      | 'created_at'
      | 'updated_at'
      | 'game'
      | 'race'
      | 'class'
      | 'user'
    >
  ): Promise<{ data: Character; message: string }> {
    const response = await this.api.post('/sheets', characterData);
    return response.data;
  }

  async updateCharacter(
    characterId: string,
    characterData: Partial<Character>
  ): Promise<{ data: Character; message: string }> {
    const response = await this.api.put(`/sheets/${characterId}`, characterData);
    return response.data;
  }

  async deleteCharacter(characterId: string): Promise<{ message: string }> {
    const response = await this.api.delete(`/sheets/${characterId}`);
    return response.data;
  }

  // --- Classes ---
  async getGameClassList(gameId?: string): Promise<{ data: GameClass[] }> {
    const response = await this.api.get('/classes', {
      params: { game_id: gameId },
    });
    return response.data;
  }

  async getGameClass(classId: string): Promise<{ data: GameClass }> {
    const response = await this.api.get(`/classes/${classId}`);
    return response.data;
  }

  async createGameClass(
    classData: Omit<GameClass, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ data: GameClass; message: string }> {
    const response = await this.api.post('/classes', classData);
    return response.data;
  }

  async updateGameClass(
    classId: string,
    classData: Partial<GameClass>
  ): Promise<{ data: GameClass; message: string }> {
    const response = await this.api.put(`/classes/${classId}`, classData);
    return response.data;
  }

  async deleteGameClass(classId: string): Promise<{ message: string }> {
    const response = await this.api.delete(`/classes/${classId}`);
    return response.data;
  }

  // --- Races ---
  async getGameRaceList(gameId?: string): Promise<{ data: GameRace[] }> {
    const response = await this.api.get('/races', {
      params: { game_id: gameId },
    });
    return response.data;
  }

  async getGameRace(raceId: string): Promise<{ data: GameRace }> {
    const response = await this.api.get(`/races/${raceId}`);
    return response.data;
  }

  async createGameRace(
    raceData: Omit<GameRace, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ data: GameRace; message: string }> {
    const response = await this.api.post('/races', raceData);
    return response.data;
  }

  async updateGameRace(
    raceId: string,
    raceData: Partial<GameRace>
  ): Promise<{ data: GameRace; message: string }> {
    const response = await this.api.put(`/races/${raceId}`, raceData);
    return response.data;
  }

  async deleteGameRace(raceId: string): Promise<{ message: string }> {
    const response = await this.api.delete(`/races/${raceId}`);
    return response.data;
  }

  // --- Books ---
  async getBookList(gameId?: string): Promise<{ data: ApiGameBook[] }> {
    const response = await this.api.get('/books', {
      params: { game_id: gameId },
    });
    return response.data;
  }

  async getBook(bookId: string): Promise<{ data: ApiGameBook }> {
    const response = await this.api.get(`/books/${bookId}`);
    return response.data;
  }

  async createBook(
    bookData: Partial<GameBook>
  ): Promise<{ data: ApiGameBook; message: string }> {
    const response = await this.api.post('/books', bookData);
    return response.data;
  }

  async updateBook(
    bookId: string,
    bookData: Partial<GameBook>
  ): Promise<{ data: ApiGameBook; message: string }> {
    const response = await this.api.put(`/books/${bookId}`, bookData);
    return response.data;
  }

  async deleteBook(bookId: string): Promise<{ message: string }> {
    const response = await this.api.delete(`/books/${bookId}`);
    return response.data;
  }

  // --- Admin ---
  async adminGetAllUsers(): Promise<{ data: UserProfile[] }> {
    const response = await this.api.get('/users');
    return response.data;
  }

  async adminGetUser(userId: string): Promise<{ data: UserProfile }> {
    const response = await this.api.get(`/users/${userId}`);
    return response.data;
  }

  async adminUpdateUser(
    userId: string,
    data: Partial<UserProfile>
  ): Promise<{ data: UserProfile; message: string }> {
    const response = await this.api.put(`/users/${userId}`, data);
    return response.data;
  }

  async adminDeleteUser(userId: string): Promise<{ message: string }> {
    const response = await this.api.delete(`/users/${userId}`);
    return response.data;
  }

  async adminSuspendUser(
    userId: string
  ): Promise<{ data: UserProfile; message: string }> {
    const response = await this.api.post(`/users/${userId}/suspend`);
    return response.data;
  }

  // --- Uploads ---
  async uploadAvatar(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async uploadPortrait(
    file: File,
    characterId: string
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('character_sheet_id', characterId);
    const response = await this.api.post('/upload/portrait', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async uploadCoverImage(file: File, gameId: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('game_id', gameId);
    const response = await this.api.post('/upload/cover-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async uploadDocument(file: File, bookId: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('book_id', bookId);
    const response = await this.api.post('/upload/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async deleteFile(path: string): Promise<{ message: string }> {
    const response = await this.api.delete('/upload/file', { data: { path } });
    return response.data;
  }
}

export { ApiClient };
