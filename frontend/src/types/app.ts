export interface AppConfig {
  name: string;
  description: string;
  appType: string;
  frontendStack: string;
  cssFramework: string;
  colorTheme: string;
  mainFont: string;
  layoutStyle: string;
  enableAuth: boolean;
  enableDatabase: boolean;
  enablePayments: boolean;
  authProvider?: string;
  databaseType?: string;
  paymentProvider?: string;
  platformType: string;
  menuStructure: string;
  adminUsername?: string;
  adminPassword?: string;
  authType: string;
  customLayoutElements: string[];
  // Campos necessários para o GeminiService
  features?: string[];
  integrations?: string[];
}

export interface CompilationState {
  isCompiling: boolean;
  progress: number;
  currentStep: string;
  generatedCode?: string;
  error?: string;
}

export interface CompilationStep {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  error?: string;
}