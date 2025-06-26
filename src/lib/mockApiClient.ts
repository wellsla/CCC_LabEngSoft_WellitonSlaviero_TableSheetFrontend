// This file simulates a backend API for local development and testing.
// It uses mock data and simulates network latency.

import type { RegisterFormValuesForAction } from '@/app/auth/actions';
import type {
  UserProfile,
  ChangePasswordData,
  UpdateProfileData,
} from '@/services/userProfile';

const SIMULATED_LATENCY_MS = 300;

// --- MOCK DATABASE ---

export let mockUsers: UserProfile[] = [
  {
    id: 'user-1',
    name: 'Admin User',
    username: 'admin',
    email: 'admin@tablesheet.com',
    avatar_url: 'https://placehold.co/100x100.png',
    dataAiHint: 'fantasy wizard',
    is_admin: true,
    birth_date: '1980-01-01',
    is_suspended: false,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-2',
    name: 'Jogador Padrão',
    username: 'jogador',
    email: 'jogador@tablesheet.com',
    avatar_url: 'https://placehold.co/100x100.png',
    dataAiHint: 'fantasy rogue',
    is_admin: false,
    birth_date: '1995-05-10',
    is_suspended: false,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockPasswords: Record<string, string> = {
  'admin@tablesheet.com': 'password123',
  'jogador@tablesheet.com': 'password123',
};

let mockGames: Game[] = [
    { id: '1', name: 'GURPS', description: 'Sistema de RPG genérico, adaptável para qualquer cenário.', version: '4ª Edição', is_active: true, dataAiHint: 'fantasy map' },
    { id: '2', name: 'Vampiro: A Máscara', description: 'Jogo de horror pessoal no Mundo das Trevas.', version: '5ª Edição', is_active: true, dataAiHint: 'vampire night' },
    { id: '3', name: 'Dungeons & Dragons', description: 'O maior RPG de fantasia do mundo.', version: '5ª Edição', is_active: true, dataAiHint: 'dungeon dragon' },
    { id: '4', name: 'Pathfinder', description: 'Uma evolução das regras da 3ª edição de D&D.', version: '2ª Edição', is_active: false, dataAiHint: 'fantasy pathfinder' },
];

let mockClasses: GameClass[] = [
    { id: 'c1', game_id: '3', name: 'Guerreiro', description: 'Mestre do combate marcial.' },
    { id: 'c2', game_id: '3', name: 'Mago', description: 'Conjurador de magias arcanas.' },
    { id: 'c3', game_id: '3', name: 'Ladino', description: 'Especialista em furtividade e truques.' },
    { id: 'c4', game_id: '2', name: 'Brujah', description: 'Rebeldes e guerreiros anarquistas.' },
    { id: 'c5', game_id: '2', name: 'Ventrue', description: 'Líderes e nobres da sociedade vampírica.' },
    { id: 'c6', game_id: '1', name: 'Agente Secreto', description: 'Mestre da espionagem e subterfúgio.'},
];

let mockRaces: GameRace[] = [
    { id: 'r1', game_id: '3', name: 'Humano', description: 'Versátil e ambicioso.' },
    { id: 'r2', game_id: '3', name: 'Elfo', description: 'Longevo e gracioso, conectado à magia.' },
    { id: 'r3', game_id: '3', name: 'Anão', description: 'Resistente e habilidoso artesão das montanhas.' },
];

let mockBooks: GameBook[] = [
    { id: 'b1', game_id: '3', name: 'Livro do Jogador', description: 'Regras essenciais para D&D 5e.', document_url: 'https://media.wizards.com/2018/dnd/downloads/DnD_BasicRules_v0.3.pdf', cover_image_url: 'https://placehold.co/300x400.png' },
    { id: 'b2', game_id: '1', name: 'GURPS Módulo Básico', description: 'O livro de regras central para GURPS.', document_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', cover_image_url: 'https://placehold.co/300x400.png' },
];

// Updated Character Sheet structure
let mockCharacters: CharacterSheetFromAPI[] = [
  {
    id: 'char-1',
    user_id: 'user-2', // Jogador Padrão's character
    game_id: '3',
    name: 'Aragorn',
    level: 5,
    race_id: 'r1',
    class_id: 'c1',
    strength: 16,
    dexterity: 14,
    constitution: 15,
    intelligence: 12,
    wisdom: 13,
    charisma: 14,
    current_hit_points: 45,
    max_hit_points: 50,
    armor_class: 18,
    initiative: 2,
    speed: 30,
    description: 'A ranger from the North',
    notes: 'Has a magical sword',
    portrait_url: 'https://placehold.co/400x400.png',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];


// --- UTILITY ---
const simulateRequest = <T>(data: T): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), SIMULATED_LATENCY_MS));
};

const simulateError = (message: string, status: number) => {
    return new Promise((_, reject) => {
        setTimeout(() => {
            const error = new Error(message) as any;
            error.response = { status, data: { message, message_en: message, errors: {} } };
            error.isAxiosError = true;
            reject(error);
        }, SIMULATED_LATENCY_MS);
    });
};

// --- API INTERFACE ---

// Auth
export async function loginApi(data: { email: string; password: string; }): Promise<{ user: UserProfile; token: string; }> {
    const user = mockUsers.find(u => u.email === data.email);
    if (!user || mockPasswords[data.email] !== data.password) {
        return simulateError('Credenciais inválidas.', 401) as any;
    }
    if (user.is_suspended) {
        return simulateError('Esta conta está suspensa.', 403) as any;
    }
    // The "token" is just the user type for the mock setup
    const token = user.is_admin ? 'mock-admin-token' : 'mock-player-token';
    return simulateRequest({ user, token });
}

export async function registerApi(data: RegisterFormValuesForAction): Promise<any> {
    if (mockUsers.some(u => u.email === data.email)) {
      return simulateError('O e-mail já está em uso.', 422);
    }
    if (mockUsers.some(u => u.username === data.username)) {
      return simulateError('O nome de usuário já está em uso.', 422);
    }
    const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: data.name,
        username: data.username,
        email: data.email,
        is_admin: false,
        is_suspended: false,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    mockPasswords[data.email] = data.password;
    return simulateRequest({ success: true, message: 'Usuário registrado com sucesso.' });
}

export async function logoutApi(): Promise<{ success: boolean; message: string }> {
    return simulateRequest({ success: true, message: 'Logout bem-sucedido.' });
}

export async function requestPasswordResetApi(email: string): Promise<any> {
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
        // Silently succeed as per best practice to not reveal if an email is registered
        console.log(`[Mock API] Password reset requested for non-existent user: ${email}. Responding with success.`);
    } else {
        console.log(`[Mock API] Password reset requested for: ${email}`);
    }
    return simulateRequest({ success: true, message: 'Se um usuário com este e-mail existir, um link de redefinição foi enviado.' });
}


// User Profile
export async function getMeApi(token: string): Promise<UserProfile> {
    const userType = token.includes('admin') ? 'admin' : 'player';
    const user = mockUsers.find(u => (userType === 'admin' ? u.is_admin : !u.is_admin));
    if (!user) return simulateError('Usuário não encontrado.', 404) as any;
    return simulateRequest(user);
}

export async function updateUserProfileApi(data: UpdateProfileData): Promise<UserProfile> {
    // In mock setup, we assume we know the user from context (handled in userProfile service)
    // This function will be called with the current user's ID by the service layer
    // For now, let's just find the first non-admin user to update for simplicity in this mock file.
    const userIndex = mockUsers.findIndex(u => !u.is_admin);
    if (userIndex === -1) return simulateError('Usuário não encontrado.', 404) as any;

    mockUsers[userIndex] = { ...mockUsers[userIndex], ...data, updated_at: new Date().toISOString() };
    return simulateRequest(mockUsers[userIndex]);
}

export async function changePasswordApi(data: ChangePasswordData, userEmail: string): Promise<any> {
    if (mockPasswords[userEmail] !== data.currentPassword) {
        return simulateError('A senha atual está incorreta.', 422);
    }
    mockPasswords[userEmail] = data.newPassword;
    return simulateRequest({ success: true, message: 'Senha alterada com sucesso.' });
}


// Admin: Users
export async function adminGetAllUsersApi(): Promise<UserProfile[]> {
    return simulateRequest(mockUsers);
}

export async function adminGetUserDetailsByIdApi(userId: string): Promise<UserProfile> {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return simulateError('Usuário não encontrado.', 404) as any;
    return simulateRequest(user);
}

export async function adminUpdateUserByIdApi(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) return simulateError('Usuário não encontrado.', 404) as any;
    
    const originalUser = mockUsers[userIndex];

    // Handle email change logic
    if (data.email && data.email !== originalUser.email) {
        // Check for uniqueness
        if (mockUsers.some(u => u.email === data.email && u.id !== userId)) {
            return simulateError('Este endereço de e-mail já está em uso por outra conta.', 422) as any;
        }
        // Update password key
        const password = mockPasswords[originalUser.email];
        if (password) {
            delete mockPasswords[originalUser.email];
            mockPasswords[data.email] = password;
        }
    }

    mockUsers[userIndex] = { ...originalUser, ...data, updated_at: new Date().toISOString() };
    return simulateRequest(mockUsers[userIndex]);
}

export async function adminDeleteUserByIdApi(userId: string): Promise<any> {
    const initialLength = mockUsers.length;
    mockUsers = mockUsers.filter(u => u.id !== userId);
    if (mockUsers.length === initialLength) {
        return simulateError('Usuário não encontrado.', 404) as any;
    }
    return simulateRequest({ success: true, message: 'Usuário excluído.' });
}


// Games
export interface Game { id: string; name: string; description: string; version: string; cover_image_url?: string; is_active: boolean; created_by?: string; created_at?: string; updated_at?: string; dataAiHint?: string; }
export async function getGameListApi(): Promise<Game[]> { return simulateRequest(mockGames); }
export async function getGameDetailsApi(gameId: string): Promise<Game> {
    const game = mockGames.find(g => g.id === gameId);
    if (!game) return simulateError('Jogo não encontrado.', 404) as any;
    return simulateRequest(game);
}
export async function createGameApi(gameData: Omit<Game, 'id' | 'created_at' | 'updated_at'>): Promise<Game> {
    const newGame: Game = { ...gameData, id: `game-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    mockGames.push(newGame);
    return simulateRequest(newGame);
}
export async function updateGameApi(gameId: string, gameData: Partial<Game>): Promise<Game> {
    const gameIndex = mockGames.findIndex(g => g.id === gameId);
    if (gameIndex === -1) return simulateError('Jogo não encontrado.', 404) as any;
    mockGames[gameIndex] = { ...mockGames[gameIndex], ...gameData, updated_at: new Date().toISOString() };
    return simulateRequest(mockGames[gameIndex]);
}
export async function deleteGameApi(gameId: string): Promise<any> {
    mockGames = mockGames.filter(g => g.id !== gameId);
    return simulateRequest({ success: true, message: 'Jogo excluído.' });
}


// Characters
// Updated to match the new simplified structure
export interface CharacterSheetFromAPI { 
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
}
export async function getCharacterListApi(userId: string): Promise<CharacterSheetFromAPI[]> {
    const userChars = mockCharacters.filter(c => c.user_id === userId);
    return simulateRequest(userChars);
}
export async function getCharacterDetailsApi(characterId: string): Promise<CharacterSheetFromAPI> {
    const character = mockCharacters.find(c => c.id === characterId);
    if (!character) return simulateError('Personagem não encontrado.', 404) as any;
    return simulateRequest(character);
}
export async function createCharacterApi(characterData: Omit<CharacterSheetFromAPI, 'id' | 'created_at' | 'updated_at'>): Promise<CharacterSheetFromAPI> {
    const newChar: CharacterSheetFromAPI = { ...characterData, id: `char-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    mockCharacters.push(newChar);
    return simulateRequest(newChar);
}
export async function updateCharacterApi(characterId: string, characterData: Partial<CharacterSheetFromAPI>): Promise<CharacterSheetFromAPI> {
    const charIndex = mockCharacters.findIndex(c => c.id === characterId);
    if (charIndex === -1) return simulateError('Personagem não encontrado.', 404) as any;
    mockCharacters[charIndex] = { ...mockCharacters[charIndex], ...characterData, updated_at: new Date().toISOString() };
    return simulateRequest(mockCharacters[charIndex]);
}
export async function deleteCharacterApi(characterId: string): Promise<any> {
    mockCharacters = mockCharacters.filter(c => c.id !== characterId);
    return simulateRequest({ success: true, message: 'Personagem excluído.' });
}


// Classes
export interface GameClass { id: string; game_id: string; name: string; description?: string; created_at?: string; updated_at?: string; }
export async function getGameClassListApi(gameId?: string): Promise<GameClass[]> {
    const classes = gameId ? mockClasses.filter(c => c.game_id === gameId) : mockClasses;
    return simulateRequest(classes);
}
export async function getGameClassDetailsApi(classId: string): Promise<GameClass> {
    const gameClass = mockClasses.find(c => c.id === classId);
    if (!gameClass) return simulateError('Classe não encontrada.', 404) as any;
    return simulateRequest(gameClass);
}
export async function createGameClassApi(classData: Omit<GameClass, 'id' | 'created_at' | 'updated_at'>): Promise<GameClass> {
    const newClass: GameClass = { ...classData, id: `c-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    mockClasses.push(newClass);
    return simulateRequest(newClass);
}
export async function updateGameClassApi(classId: string, classData: Partial<GameClass>): Promise<GameClass> {
    const classIndex = mockClasses.findIndex(c => c.id === classId);
    if (classIndex === -1) return simulateError('Classe não encontrada.', 404) as any;
    mockClasses[classIndex] = { ...mockClasses[classIndex], ...classData, updated_at: new Date().toISOString() };
    return simulateRequest(mockClasses[classIndex]);
}
export async function deleteGameClassApi(classId: string): Promise<any> {
    mockClasses = mockClasses.filter(c => c.id !== classId);
    return simulateRequest({ success: true, message: 'Classe excluída.' });
}


// Races
export interface GameRace { id: string; game_id: string; name: string; description?: string; created_at?: string; updated_at?: string; }
export async function getGameRaceListApi(gameId?: string): Promise<GameRace[]> {
    const races = gameId ? mockRaces.filter(r => r.game_id === gameId) : mockRaces;
    return simulateRequest(races);
}
export async function getGameRaceDetailsApi(raceId: string): Promise<GameRace> {
    const gameRace = mockRaces.find(r => r.id === raceId);
    if (!gameRace) return simulateError('Raça não encontrada.', 404) as any;
    return simulateRequest(gameRace);
}
export async function createGameRaceApi(raceData: Omit<GameRace, 'id' | 'created_at' | 'updated_at'>): Promise<GameRace> {
    const newRace: GameRace = { ...raceData, id: `r-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    mockRaces.push(newRace);
    return simulateRequest(newRace);
}
export async function updateGameRaceApi(raceId: string, raceData: Partial<GameRace>): Promise<GameRace> {
    const raceIndex = mockRaces.findIndex(r => r.id === raceId);
    if (raceIndex === -1) return simulateError('Raça não encontrada.', 404) as any;
    mockRaces[raceIndex] = { ...mockRaces[raceIndex], ...raceData, updated_at: new Date().toISOString() };
    return simulateRequest(mockRaces[raceIndex]);
}
export async function deleteGameRaceApi(raceId: string): Promise<any> {
    mockRaces = mockRaces.filter(r => r.id !== raceId);
    return simulateRequest({ success: true, message: 'Raça excluída.' });
}


// Books
export interface GameBook { id: string; game_id: string; name: string; description?: string; cover_image_url?: string; document_url: string; created_by?: string; created_at?: string; updated_at?: string; }
export async function getBookListApi(gameId?: string): Promise<GameBook[]> {
    const books = gameId ? mockBooks.filter(b => b.game_id === gameId) : mockBooks;
    return simulateRequest(books);
}
export async function getBookDetailsApi(bookId: string): Promise<GameBook> {
    const gameBook = mockBooks.find(b => b.id === bookId);
    if (!gameBook) return simulateError('Livro não encontrado.', 404) as any;
    return simulateRequest(gameBook);
}
export async function createBookApi(bookData: Omit<GameBook, 'id' | 'created_at' | 'updated_at' | 'created_by'>): Promise<GameBook> {
    const newBook: GameBook = { ...bookData, id: `b-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    mockBooks.push(newBook);
    return simulateRequest(newBook);
}
export async function updateBookApi(bookId: string, bookData: Partial<GameBook>): Promise<GameBook> {
    const bookIndex = mockBooks.findIndex(b => b.id === bookId);
    if (bookIndex === -1) return simulateError('Livro não encontrado.', 404) as any;
    mockBooks[bookIndex] = { ...mockBooks[bookIndex], ...bookData, updated_at: new Date().toISOString() };
    return simulateRequest(mockBooks[bookIndex]);
}
export async function deleteBookApi(bookId: string): Promise<any> {
    mockBooks = mockBooks.filter(b => b.id !== bookId);
    return simulateRequest({ success: true, message: 'Livro excluído.' });
}

// Error Handling (Simplified for Mock)
export interface ProcessedError {
  success: false;
  messageKey: string;
  rawMessage?: string;
  errors?: Record<string, string[]>;
}

export function handleAxiosError(error: unknown): ProcessedError {
    const err = error as any;
    console.error("[Mock Handle Error]", err);
    return {
        success: false,
        messageKey: 'general.unexpectedError',
        rawMessage: err.response?.data?.message || err.message || 'Ocorreu um erro inesperado no mock.',
        errors: err.response?.data?.errors,
    };
}
