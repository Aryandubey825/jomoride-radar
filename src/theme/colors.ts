export const COLORS = {
  // Backgrounds
  background: '#0B0D13',
  surface: '#151821',
  surfaceLight: '#1E2330',
  surfaceBorder: 'rgba(255, 255, 255, 0.08)',
  surfaceBorderActive: 'rgba(255, 255, 255, 0.22)',

  // Brand / Accents (Apple iOS System Blue & Obsidian)
  primary: '#0A84FF',       // Apple System Blue (Calm, standard iOS tint)
  primaryMuted: 'rgba(10, 132, 255, 0.15)',
  
  premiumGold: '#FFD700',   // Champagne Gold for Premium tier
  premiumGoldMuted: 'rgba(255, 215, 0, 0.15)',
  
  standardSilver: '#A0AEC0', // Sleek silver for Standard tier
  standardSilverMuted: 'rgba(160, 174, 192, 0.15)',

  // Typography
  textPrimary: '#FFFFFF',
  textSecondary: '#8E9BAE',
  textMuted: '#586577',

  // Status
  onlineGreen: '#10B981',
  starYellow: '#FBBF24',
  
  // Sheet
  sheetHandle: '#4A5568',
  sheetBackground: '#13161F',
} as const;
