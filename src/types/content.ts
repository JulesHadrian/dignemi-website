// ==========================================
// 1. ENUMS & SHARED TYPES
// ==========================================

export type ContentStatus = 'draft' | 'review' | 'published' | 'archived';
export type PaywallType = 'free' | 'pro';
export type Difficulty = 'basic' | 'intermediate' | 'advanced';
export type Locale = 'es-LATAM' | 'pt-BR';

// Tipos base para control de auditoría simple
export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// 2. CATÁLOGOS BASE (Topics, Tags)
// ==========================================

export interface Topic extends BaseEntity {
  slug: string; // ej: 'ansiedad', 'estres_laboral'
  display_name: string;
  icon?: string; // URL o nombre de icono
  active: boolean;
}

export interface Tag extends BaseEntity {
  name: string;
  type: 'trabajo' | 'familia' | 'rumiacion' | 'rutina_noche' | 'general';
  active: boolean;
}

// ==========================================
// 3. DISCLAIMERS
// ==========================================

export type DisclaimerScope = 'global' | 'cuestionarios' | 'rutas' | 'ejercicios' | 'ayuda';

export interface Disclaimer extends BaseEntity {
  title: string;
  body: string; // Rich text limitado (HTML string o JSON)
  scope: DisclaimerScope;
  version: number;
  status: ContentStatus;
  effective_date: string; // ISO Date
  required: boolean; // Si true, bloquea uso hasta aceptar
}

// ==========================================
// 4. ACTIVITIES / EXERCISES
// ==========================================

export type ActivityType = 
  | 'breathing_timer' 
  | 'grounding' 
  | 'checklist' 
  | 'reflection' 
  | 'psychoeducation' 
  | 'habit_planner';

export interface ActivityStep {
  order: number;
  text: string;
  audio_url?: string;
}

export interface BreathingConfig {
  inhale: number; // segundos
  hold_in?: number;
  exhale: number;
  hold_out?: number;
  cycles: number;
}

export interface ActivityInstructions {
  intro_text: string;
  bullets?: string[];
  timer_config?: BreathingConfig; // Solo si type === 'breathing_timer'
  reflection_questions?: string[]; // Solo si type === 'reflection'
}

export interface Activity extends BaseEntity {
  slug: string;
  title: string;
  topic_ids: string[]; // Referencia a Topic
  type: ActivityType;
  duration_minutes: number;
  difficulty: Difficulty;
  
  // Contenido
  instructions: ActivityInstructions;
  steps?: ActivityStep[]; // Para grounding o paso a paso
  
  // Seguridad y Legal
  contraindications_soft?: string; // "Si te incomoda..."
  disclaimer_id?: string; // ID opcional, si no usa el global
  
  // Metadata
  assets?: {
    image_url?: string;
    audio_url?: string;
  };
  sources?: Array<{ url: string; citation: string }>;
  paywall: PaywallType;
  status: ContentStatus;
  version: number;
}

// ==========================================
// 5. ROUTES / PROGRAMS (Rutas)
// ==========================================

// Tipo para el listado del catálogo (GET /content/catalog)
export interface RouteListItem {
  id: string;
  title: string;
  description: string | null;
  topic: string;
  version: number;
}

// Tipos para creación de contenido (POST /content)

// === ROUTE ===
export interface RouteDay {
  day: number;
  title: string;
  description: string;
  exerciseId: string;
  estimatedTime: string;
  objectives: string[];
}

export interface RouteBodyContent {
  intro: string;
  duration: string;
  difficulty: 'principiante' | 'intermedio' | 'avanzado';
  estimatedDailyTime: string;
  days: RouteDay[];
  benefits: string[];
  requirements: string[];
}

export interface CreateRoutePayload {
  type: 'route';
  title: string;
  body: RouteBodyContent;
  description?: string;
  topic?: string;
  locale?: 'es-LATAM' | 'pt-BR';
  isPremium?: boolean;
  isPublished?: boolean;
  version?: number;
  disclaimerId?: string;
  sources?: string[];
}

// === EXERCISE ===
export interface ExerciseStep {
  step: number;
  title: string;
  instruction: string;
  duration: string;
  imageUrl?: string;
  hasTimer?: boolean;
  counterType?: 'inhale' | 'hold' | 'exhale';
  repeatCycles?: number;
}

export interface ExerciseBodyContent {
  introduction: string;
  difficulty: 'principiante' | 'intermedio' | 'avanzado';
  duration: string;
  audioUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  steps: ExerciseStep[];
  tips: string[];
  contraindications: string[];
  expectedResults: string;
}

export interface CreateExercisePayload {
  type: 'exercise';
  title: string;
  body: ExerciseBodyContent;
  description?: string;
  topic?: string;
  locale?: 'es-LATAM' | 'pt-BR';
  isPremium?: boolean;
  isPublished?: boolean;
  version?: number;
  sources?: string[];
}

// === ARTICLE ===
export interface ArticleSection {
  heading: string;
  content?: string;
  type: 'text' | 'list';
  imageUrl?: string;
  items?: string[];
}

export interface ArticleBodyContent {
  coverImage: string;
  author: string;
  readingTime: string;
  publishDate: string;
  sections: ArticleSection[];
  relatedExercises: string[];
  tags: string[];
}

export interface CreateArticlePayload {
  type: 'article';
  title: string;
  body: ArticleBodyContent;
  description?: string;
  topic?: string;
  locale?: 'es-LATAM' | 'pt-BR';
  isPremium?: boolean;
  isPublished?: boolean;
  version?: number;
  disclaimerId?: string;
  sources?: string[];
}

// Union type para todos los payloads
export type CreateContentPayload = CreateRoutePayload | CreateExercisePayload | CreateArticlePayload;

// Tipo para actualización de contenido (PATCH /content/{id})
// Todos los campos son opcionales - solo envía los que quieres modificar
export interface UpdateContentPayload {
  title?: string;
  description?: string;
  topic?: string;
  locale?: 'es-LATAM' | 'pt-BR';
  isPremium?: boolean;
  isPublished?: boolean;
  version?: number;
  disclaimerId?: string;
  body?: Partial<RouteBodyContent> | Partial<ExerciseBodyContent> | Partial<ArticleBodyContent>;
  sources?: string[];
}

// Tipo para la respuesta de GET /content/{id}
export interface ContentDetail {
  id: string;
  type: 'route' | 'exercise' | 'article';
  title: string;
  description?: string;
  topic?: string;
  locale?: 'es-LATAM' | 'pt-BR';
  isPremium?: boolean;
  isPublished?: boolean;
  version?: number;
  disclaimerId?: string;
  body: RouteBodyContent | ExerciseBodyContent | ArticleBodyContent;
  sources?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type BlockType = 'lesson_block' | 'activity_block' | 'reflection_block' | 'quick_tip_block' | 'checklist_block';

export interface RouteBlock {
  id: string; // ID interno del bloque
  type: BlockType;
  title: string;
  body?: string; // Texto para lecciones
  estimated_minutes: number;
  
  // Relaciones
  activity_ref_id?: string; // Solo si type == 'activity_block'
  disclaimer_id?: string; // Opcional, hereda de ruta
}

export interface RouteDay {
  day_number: number;
  title: string; // "Día 1: Señales tempranas"
  learning_objective: string;
  blocks: RouteBlock[];
}

export interface Route extends BaseEntity {
  slug: string;
  title: string;
  topic_id: string; // Principal
  summary: string;
  goal: string; // Objetivo no clínico
  
  // Configuración
  duration_days: 7 | 14 | 21; // Restricción común
  estimated_daily_minutes: number;
  level: Difficulty;
  
  // Media & Legal
  cover_image?: string;
  disclaimer_id?: string;
  paywall: PaywallType;
  status: ContentStatus;
  version: number;
  
  // Extra
  prerequisites?: string[];
  safety_notes?: string; // Texto visible siempre
  
  // Contenido anidado (Días)
  days?: RouteDay[]; 
}

// ==========================================
// 6. LIBRARY CONTENT
// ==========================================

export type LibraryContentType = 'article' | 'guide' | 'checklist' | 'faq';

export interface LibraryItem extends BaseEntity {
  slug: string;
  title: string;
  topic_ids: string[];
  reading_time_minutes: number;
  content_type: LibraryContentType;
  
  body: string; // Rich Text
  sources: Array<{ url: string; citation: string }>; // Obligatorio si es psicoeducación
  
  disclaimer_id?: string;
  paywall: PaywallType;
  status: ContentStatus;
  version: number;
  
  seo_meta?: {
    description?: string;
    keywords?: string[];
  };
}

// ==========================================
// 7. HELP NOW RESOURCES
// ==========================================

export interface EmergencyNumber {
  label: string; // "Policía", "Ambulancia"
  number: string;
}

export interface OfficialLine {
  name: string;
  phone: string;
  hours: string; // Texto libre: "24/7" o "L-V 9-5"
  website?: string;
  notes?: string;
}

export interface HelpResource extends BaseEntity {
  country_code: string; // ISO: 'MX', 'CO', 'AR'
  locale: Locale;
  
  emergency_numbers: EmergencyNumber[];
  official_lines: OfficialLine[];
  
  copy_header: string; // Microcopy título
  copy_body: string;   // Microcopy descripción
  
  last_verified_at: string; // Fecha ISO
  status: ContentStatus;
  version: number;
}