// Shared types between frontend and backend

export interface Project {
  id: string;
  name: string;
  type: string;
  frontend_stack: string;
  css_framework: string;
  color_theme: string;
  font_family: string;
  layout_style: string;
  auth_enabled: boolean;
  admin_user?: string;
  admin_password?: string;
  output_path?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectHistory {
  id: string;
  project_id: string;
  action: string;
  config_snapshot?: string;
  created_at: string;
}

export interface Settings {
  key: string;
  value: string;
  updated_at: string;
}

export interface CreateProjectRequest {
  name: string;
  type: string;
  frontend_stack: string;
  css_framework: string;
  color_theme: string;
  font_family: string;
  layout_style: string;
  auth_enabled: boolean;
  admin_user?: string;
  admin_password?: string;
}

export interface CompileRequest {
  project_id: string;
  config: CreateProjectRequest;
}

export interface CompileResponse {
  success: boolean;
  output_path?: string;
  logs: string[];
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ProjectsResponse {
  projects: Project[];
  total: number;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState {
  isValid: boolean;
  errors: ValidationError[];
}

// App configuration options
export const APP_TYPES = [
  'landing',
  'blog',
  'ecommerce',
  'portfolio',
  'dashboard',
  'saas'
] as const;

export const FRONTEND_STACKS = [
  'react',
  'vue',
  'vanilla'
] as const;

export const CSS_FRAMEWORKS = [
  'tailwind',
  'bootstrap',
  'bulma',
  'custom'
] as const;

export const COLOR_THEMES = [
  'modern',
  'classic',
  'dark',
  'colorful',
  'minimal'
] as const;

export const FONT_FAMILIES = [
  'inter',
  'roboto',
  'poppins',
  'montserrat',
  'open-sans'
] as const;

export const LAYOUT_STYLES = [
  'modern',
  'classic',
  'minimal',
  'creative'
] as const;

export type AppType = typeof APP_TYPES[number];
export type FrontendStack = typeof FRONTEND_STACKS[number];
export type CssFramework = typeof CSS_FRAMEWORKS[number];
export type ColorTheme = typeof COLOR_THEMES[number];
export type FontFamily = typeof FONT_FAMILIES[number];
export type LayoutStyle = typeof LAYOUT_STYLES[number];