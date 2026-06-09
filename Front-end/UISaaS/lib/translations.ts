/**
 * ClarkPlayer i18n translation dictionary.
 *
 * Add new languages by extending the `Translations` record.
 * Every key should exist in ALL languages — if a translation is
 * missing the English fallback is used.
 */

export type LanguageCode = keyof typeof translations

export interface TranslationMap {
  // ── Settings tab labels ──
  settings: string
  appearance: string
  language: string
  libraryFiles: string
  playback: string
  about: string

  // ── Appearance ──
  theme: string
  dark: string
  light: string
  midnight: string
  accentColor: string
  fontSize: string
  small: string
  default: string
  large: string
  boldMode: string
  boldModeDesc: string

  // ── Language / Region ──
  dateTimeFormat: string
  dateFormat: string
  timeFormat: string
  translationContributors: string
  translationThanks: string
  languageLabel: string

  // ── Library / Files ──
  folderScanning: string
  scanNow: string
  hiddenFiles: string
  showHiddenFiles: string
  hiddenFilesDesc: string
  supportedFormats: string
  unsupportedFormat: string
  letUsKnow: string
  storageUsage: string

  // ── Playback / Equalizer ──
  equalizer: string
  preset: string
  playbackOptions: string
  crossfade: string
  crossfadeDesc: string
  gapless: string
  gaplessDesc: string
  normalization: string
  normalizationDesc: string
  sleepTimer: string
  off: string
  min: string
  hour: string
  endOfTrack: string
  cancelTimer: string

  // ── About ──
  version: string
  whatsNew: string
  privacyPolicy: string
  termsOfService: string
  ossLicenses: string
  madeWith: string

  // ── Navigation (sidebar) ──
  browseGenres: string
  yourPlaylists: string
  newPlaylist: string
  sort: string
  tracks: string
  updated: string
  noTracksInQueue: string
  browseTracks: string
  nowPlaying: string
  queue: string
  createPlaylist: string
  publicLabel: string
  privateLabel: string
  nameLabel: string
  descriptionOptional: string
  descriptionPlaceholder: string
  loginAccount: string
  signOut: string
  signIn: string
  home: string
  allTracks: string
  library: string
  playlists: string
  artists: string
  genres: string
  search: string
  settingsNav: string

  // ── AppShell / player bar ARIA ──
  mainNavigation: string
  openSidebar: string
  closeSidebar: string
  closePanel: string
  hidePlayer: string
  showPlayer: string
  toggleFavorite: string
  toggleShuffle: string
  previousTrack: string
  nextTrack: string
  playBtn: string
  pauseBtn: string
  toggleRepeat: string
  volumeLabel: string
  lyricsBtn: string
  sleepBtn: string
  openNowPlayingPanel: string
  closeNowPlayingPanel: string
  closeNavigation: string

  // ── Home / NowPlayingContent ──
  welcomeToClarkPlayer: string
  fortressOfSound: string
  recentlyPlayed: string

  // ── All Tracks (audios) ──
  titleColumn: string
  albumColumn: string
  durationColumn: string
  formatColumn: string
  selectAction: string
  songsLabel: string
  addToPlaylist: string
  deleteAction: string
  cancelAction: string
  dateAdded: string
  artistColumn: string
  sortAction: string
  selectedLabel: string
  trackIndex: string

  // ── Library ──
  totalTracks: string
  favorites: string
  totalDuration: string
  libraryOverview: string
  libraryOverviewBrowse: string
  libraryOverviewOr: string

  // ── Playlists list ──
  sortLabel: string
  sortAZ: string
  sortRecentlyUpdated: string
  sortMostPlayed: string
  sortDateCreated: string

  // ── Playlist detail ──
  playAction: string
  shuffleAction: string
  shareAction: string
  exportJSON: string
  exportM3U8: string
  collaborativeLabel: string
  addTracks: string
  searchInPlaylist: string
  moreOptions: string

  // ── Artists list ──
  albumSingular: string
  albumPlural: string

  // ── Artist detail ──
  verifiedArtist: string
  followAction: string
  topTracks: string
  discography: string
  filterAll: string
  filterAlbums: string
  filterEPs: string
  filterSingles: string
  similarArtists: string
  showFullLyrics: string
  aboutLabel: string
  keyLabel: string
  valenceLabel: string
  acousticnessLabel: string
  instrumentalnessLabel: string
  livenessLabel: string
  speechinessLabel: string

  // ── Genres ──
  browseByGenre: string

  // ── Search ──
  searchPlaceholder: string
  tracksTab: string
  artistsTab: string
  playlistsTab: string
  startTyping: string
  noTracksFound: string
  noArtistsFound: string
  noPlaylistsFound: string
  searchAcrossWeb: string
  searchAcrossWebDesc: string
  searchGlobalPlaceholder: string
  searchingLabel: string
  searchErrorLabel: string
  popularityLabel: string
  playcountLabel: string
  bpmLabel: string
  energyLabel: string
  danceabilityLabel: string
  previewLabel: string
  noPreviewLabel: string
  lyricsLabel: string
  similarTracksLabel: string
  audioFeaturesLabel: string

  // ── Account ──
  myAccount: string
  profileInformation: string
  displayName: string
  emailLabel: string
  bioLabel: string
  saveChanges: string
  linkedAccounts: string
  connectedLabel: string
  disconnectAction: string
  dangerZone: string
  dangerZoneDesc: string
  deleteAccount: string
  deleteConfirmTitle: string
  deleteConfirmDesc: string
  typeDeleteConfirm: string
  deleting: string
  free: string
  googleAccountLinked: string
  editPhoto: string

  // ── Auth / Login ──
  welcomeBack: string
  signInToContinue: string
  continueWithGoogle: string
  orDivider: string
  passwordLabel: string
  forgotPassword: string
  signingIn: string
  lockedLabel: string
  noAccount: string
  signUp: string
  accountCreatedBanner: string
  accountLocked: string
  tooManyAttempts: string
  attemptsRemaining: string
  wrongCredentials: string
  accessDeniedGoogle: string
  authFailedGoogle: string
  authFailed: string
  closeLoginPage: string

  // ── Register ──
  createYourAccount: string
  joinClarkPlayer: string
  fullName: string
  confirmPassword: string
  agreeTerms: string
  createAccount: string
  creatingAccount: string
  alreadyHaveAccount: string
  weak: string
  fair: string
  strong: string
  accountCreated: string
  redirectingSignIn: string

  // ── Forgot Password ──
  forgotPasswordTitle: string
  forgotPasswordDesc: string
  checkInbox: string
  resetLinkSent: string
  clickLinkToReset: string
  backToLogin: string
  sendResetLink: string
  sending: string

  // ── Reset Password ──
  resetPassword: string
  newPassword: string
  resetPasswordBtn: string
  passwordResetComplete: string
  passwordUpdated: string
  invalidResetLink: string
  invalidResetLinkDesc: string
  enterNewPassword: string
  goToSignIn: string

  // ── Verify Email ──
  verifying: string
  emailVerified: string
  verificationFailed: string
  verificationTokenMissing: string
  emailVerifiedMessage: string
  verificationFailedMessage: string

  // ── Google Callback ──
  signingInGoogle: string

  // ── CreatePlaylistModal ──
  dropImageUpload: string
  pngJpgLimit: string
  playlistNamePlaceholder: string
  playlistCoverPreview: string
  togglePrivacy: string

  // ── TrackRow ──
  addToFavorites: string
  unfavorite: string
  selectTrack: string
  currentlyPlaying: string
}

const translations = {
  'en-US': {
    // ── Settings tab labels ──
    settings: 'Settings',
    appearance: 'Appearance',
    language: 'Language',
    libraryFiles: 'Library & Files',
    playback: 'Playback',
    about: 'About',
    // ── Appearance ──
    theme: 'Theme',
    dark: 'Dark',
    light: 'Light',
    midnight: 'Midnight',
    accentColor: 'Accent Color',
    fontSize: 'Font Size',
    small: 'Small',
    default: 'Default',
    large: 'Large',
    boldMode: 'Bold Mode',
    boldModeDesc: 'Enable bold text across the entire interface.',
    // ── Language / Region ──
    dateTimeFormat: 'Date & Time Format',
    dateFormat: 'Date format',
    timeFormat: 'Time format',
    translationContributors: 'Translation Contributors',
    translationThanks: 'Thanks to our community translators: Maria S., João P., Yuki T., Ahmed K., and others.',
    languageLabel: 'Language',
    // ── Library / Files ──
    folderScanning: 'Folder Scanning',
    scanNow: 'Scan all folders now',
    hiddenFiles: 'Hidden Files',
    showHiddenFiles: 'Show hidden files',
    hiddenFilesDesc: 'Hidden files typically start with a dot (e.g. .DS_Store). Enable only if needed.',
    supportedFormats: 'Supported Formats',
    unsupportedFormat: 'Unsupported format?',
    letUsKnow: 'Let us know',
    storageUsage: 'Storage Usage',
    // ── Playback / Equalizer ──
    equalizer: 'Equalizer',
    preset: 'Preset',
    playbackOptions: 'Playback Options',
    crossfade: 'Crossfade',
    crossfadeDesc: 'Smooth transition between tracks',
    gapless: 'Gapless playback',
    gaplessDesc: 'No silence between consecutive tracks',
    normalization: 'Normalization',
    normalizationDesc: 'Adjust volume to a consistent level',
    sleepTimer: 'Sleep Timer',
    off: 'Off',
    min: 'min',
    hour: 'hour',
    endOfTrack: 'End of track',
    cancelTimer: 'Cancel timer',
    // ── About ──
    version: 'Version',
    whatsNew: "What's New",
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    ossLicenses: 'Open Source Licenses',
    madeWith: 'Made with ♥ by the ClarkPlayer team',
    // ── Navigation ──
    browseGenres: 'Browse by Genre',
    yourPlaylists: 'Your Playlists',
    newPlaylist: 'New Playlist',
    sort: 'Sort',
    tracks: 'tracks',
    updated: 'Updated',
    noTracksInQueue: 'No tracks in queue',
    browseTracks: 'Browse tracks to start listening',
    nowPlaying: 'Now Playing',
    queue: 'Queue',
    createPlaylist: 'Create Playlist',
    publicLabel: 'Public',
    privateLabel: 'Private',
    nameLabel: 'Name',
    descriptionOptional: 'Description (optional)',
    descriptionPlaceholder: "What's this playlist about?",
    loginAccount: 'Login Account',
    signOut: 'Sign out',
    signIn: 'Sign in',
    home: 'Home',
    allTracks: 'All Tracks',
    library: 'Library',
    playlists: 'Playlists',
    artists: 'Artists',
    genres: 'Genres',
    search: 'Search',
    settingsNav: 'Settings',
    // ── AppShell / player bar ──
    mainNavigation: 'Main navigation',
    openSidebar: 'Open sidebar',
    closeSidebar: 'Close sidebar',
    closePanel: 'Close panel',
    hidePlayer: 'Hide player',
    showPlayer: 'Show player',
    toggleFavorite: 'Toggle favorite',
    toggleShuffle: 'Toggle shuffle',
    previousTrack: 'Previous track',
    nextTrack: 'Next track',
    playBtn: 'Play',
    pauseBtn: 'Pause',
    toggleRepeat: 'Toggle repeat',
    volumeLabel: 'Volume',
    lyricsBtn: 'Lyrics',
    sleepBtn: 'Sleep',
    openNowPlayingPanel: 'Open now playing panel',
    closeNowPlayingPanel: 'Close now playing panel',
    closeNavigation: 'Close navigation',
    // ── Home / NowPlayingContent ──
    welcomeToClarkPlayer: 'Welcome to ClarkPlayer',
    fortressOfSound: 'Your Fortress of Sound is ready. Browse your library, create playlists, and let the music fly.',
    recentlyPlayed: 'Recently Played',
    // ── All Tracks ──
    titleColumn: 'Title',
    albumColumn: 'Album',
    durationColumn: 'Duration',
    formatColumn: 'Format',
    selectAction: 'Select',
    songsLabel: 'songs',
    addToPlaylist: 'Add to playlist',
    deleteAction: 'Delete',
    cancelAction: 'Cancel',
    dateAdded: 'Date Added',
    artistColumn: 'Artist',
    sortAction: 'Sort',
    selectedLabel: 'selected',
    trackIndex: '#',
    // ── Library ──
    totalTracks: 'Total tracks',
    favorites: 'Favorites',
    totalDuration: 'Total duration',
    libraryOverview: 'Library overview coming soon.',
    libraryOverviewBrowse: 'Browse',
    libraryOverviewOr: 'or',
    // ── Playlists list ──
    sortLabel: 'Sort:',
    sortAZ: 'A–Z',
    sortRecentlyUpdated: 'Recently Updated',
    sortMostPlayed: 'Most Played',
    sortDateCreated: 'Date Created',
    // ── Playlist detail ──
    playAction: 'Play',
    shuffleAction: 'Shuffle',
    shareAction: 'Share',
    exportJSON: 'Export as JSON',
    exportM3U8: 'Export as M3U8',
    collaborativeLabel: 'Collaborative',
    addTracks: 'Add tracks',
    searchInPlaylist: 'Search tracks in playlist\u2026',
    moreOptions: 'More options',
    // ── Artists list ──
    albumSingular: 'album',
    albumPlural: 'albums',
    // ── Artist detail ──
    verifiedArtist: 'Verified Artist',
    followAction: 'Follow',
    topTracks: 'Top Tracks',
    discography: 'Discography',
    filterAll: 'All',
    filterAlbums: 'Albums',
    filterEPs: 'EPs',
    filterSingles: 'Singles',
    similarArtists: 'Similar Artists',
    showFullLyrics: 'Show full lyrics',
    aboutLabel: 'About',
    keyLabel: 'Key',
    valenceLabel: 'Valence',
    acousticnessLabel: 'Acousticness',
    instrumentalnessLabel: 'Instrumentalness',
    livenessLabel: 'Liveness',
    speechinessLabel: 'Speechiness',
    // ── Genres ──
    browseByGenre: 'Browse by Genre',
    // ── Search ──
    searchPlaceholder: 'Search tracks, artists, playlists\u2026',
    tracksTab: 'Tracks',
    artistsTab: 'Artists',
    playlistsTab: 'Playlists',
    startTyping: 'Start typing to search your library',
    noTracksFound: 'No tracks found for',
    noArtistsFound: 'No artists found for',
    noPlaylistsFound: 'No playlists found for',
    searchAcrossWeb: 'Search Across the Web',
    searchAcrossWebDesc: 'Discover music from the world\u2019s largest databases. Powered by MusicBrainz, Spotify, iTunes, Genius & Last.fm.',
    searchGlobalPlaceholder: 'Search for songs, albums, or artists\u2026',
    searchingLabel: 'Searching\u2026',
    searchErrorLabel: 'Search failed. Please try again.',
    popularityLabel: 'Popularity',
    playcountLabel: 'Plays',
    bpmLabel: 'BPM',
    energyLabel: 'Energy',
    danceabilityLabel: 'Danceability',
    previewLabel: 'Preview',
    noPreviewLabel: 'No preview available',
    lyricsLabel: 'Lyrics',
    similarTracksLabel: 'Similar Tracks',
    audioFeaturesLabel: 'Audio Features',
    // ── Account ──
    myAccount: 'My Account',
    profileInformation: 'Profile Information',
    displayName: 'Display name',
    emailLabel: 'Email',
    bioLabel: 'Bio',
    saveChanges: 'Save changes',
    linkedAccounts: 'Linked Accounts',
    connectedLabel: 'Connected',
    disconnectAction: 'Disconnect',
    dangerZone: 'Danger Zone',
    dangerZoneDesc: 'Once you delete your account, there is no going back. Please be certain.',
    deleteAccount: 'Delete account',
    deleteConfirmTitle: 'Delete Account',
    deleteConfirmDesc: 'This action is permanent. To confirm, type DELETE below.',
    typeDeleteConfirm: 'Type DELETE to confirm',
    deleting: 'Deleting\u2026',
    free: 'Free',
    googleAccountLinked: 'Google account linked',
    editPhoto: 'Edit photo',
    // ── Auth / Login ──
    welcomeBack: 'Welcome back',
    signInToContinue: 'Sign in to continue to your library',
    continueWithGoogle: 'Continue with Google',
    orDivider: 'or',
    passwordLabel: 'Password',
    forgotPassword: 'Forgot password?',
    signingIn: 'Signing in\u2026',
    lockedLabel: 'Locked',
    noAccount: "Don't have an account?",
    signUp: 'Sign up',
    accountCreatedBanner: 'Account created successfully! Please sign in.',
    accountLocked: 'Account Temporarily Locked',
    tooManyAttempts: 'Too many failed login attempts. Please try again in',
    attemptsRemaining: 'attempts remaining before temporary lockout',
    wrongCredentials: 'Wrong email or password. Please try again.',
    accessDeniedGoogle: 'You denied the Google sign-in. Please try again.',
    authFailedGoogle: 'Google sign-in failed. Please try again.',
    authFailed: 'Authentication failed. Please try again.',
    closeLoginPage: 'Close login page',
    // ── Register ──
    createYourAccount: 'Create your account',
    joinClarkPlayer: 'Join ClarkPlayer and start building your library',
    fullName: 'Full name',
    confirmPassword: 'Confirm password',
    agreeTerms: 'I agree to the Terms of Service and Privacy Policy',
    createAccount: 'Create account',
    creatingAccount: 'Creating account\u2026',
    alreadyHaveAccount: 'Already have an account?',
    weak: 'Weak',
    fair: 'Fair',
    strong: 'Strong',
    accountCreated: 'Account created!',
    redirectingSignIn: 'Redirecting you to sign in\u2026',
    // ── Forgot Password ──
    forgotPasswordTitle: 'Forgot your password?',
    forgotPasswordDesc: "Enter your email address and we'll send you a link to reset it.",
    checkInbox: 'Check your inbox',
    resetLinkSent: "We've sent a password reset link to",
    clickLinkToReset: 'Click the link in the email to reset your password.',
    backToLogin: 'Back to login',
    sendResetLink: 'Send reset link',
    sending: 'Sending\u2026',
    // ── Reset Password ──
    resetPassword: 'Reset password',
    newPassword: 'New password',
    resetPasswordBtn: 'Reset password',
    passwordResetComplete: 'Password reset complete',
    passwordUpdated: 'Your password has been updated. You can now sign in.',
    invalidResetLink: 'Invalid reset link',
    invalidResetLinkDesc: 'This password reset link is invalid or has expired. Please request a new one.',
    enterNewPassword: 'Enter your new password below.',
    goToSignIn: 'Go to sign in',
    // ── Verify Email ──
    verifying: 'Verifying\u2026',
    emailVerified: 'Email Verified',
    verificationFailed: 'Verification Failed',
    verificationTokenMissing: 'Verification token is missing. Please check the link in your email.',
    emailVerifiedMessage: 'Your email has been verified! You can now sign in.',
    verificationFailedMessage: 'Verification failed. The token may have expired. Please request a new one.',
    // ── Google Callback ──
    signingInGoogle: 'Signing you in with Google\u2026',
    // ── CreatePlaylistModal ──
    dropImageUpload: 'Drop an image or click to upload',
    pngJpgLimit: 'PNG, JPG up to 5MB',
    playlistNamePlaceholder: 'My Playlist',
    playlistCoverPreview: 'Playlist cover preview',
    togglePrivacy: 'Toggle privacy',
    // ── TrackRow ──
    addToFavorites: 'Add to favorites',
    unfavorite: 'Unfavorite',
    selectTrack: 'Select',
    currentlyPlaying: 'Currently playing',
  } satisfies TranslationMap,

  'pt-BR': {
    // ── Settings tab labels ──
    settings: 'Configura\u00e7\u00f5es',
    appearance: 'Apar\u00eancia',
    language: 'Idioma',
    libraryFiles: 'Biblioteca e Arquivos',
    playback: 'Reprodu\u00e7\u00e3o',
    about: 'Sobre',
    // ── Appearance ──
    theme: 'Tema',
    dark: 'Escuro',
    light: 'Claro',
    midnight: 'Meia-noite',
    accentColor: 'Cor de Destaque',
    fontSize: 'Tamanho da Fonte',
    small: 'Pequeno',
    default: 'Padr\u00e3o',
    large: 'Grande',
    boldMode: 'Modo Negrito',
    boldModeDesc: 'Ativar texto em negrito em toda a interface.',
    // ── Language / Region ──
    dateTimeFormat: 'Formato de Data e Hora',
    dateFormat: 'Formato de data',
    timeFormat: 'Formato de hora',
    translationContributors: 'Contribuidores de Tradu\u00e7\u00e3o',
    translationThanks: 'Agradecemos aos nossos tradutores da comunidade: Maria S., Jo\u00e3o P., Yuki T., Ahmed K. e outros.',
    languageLabel: 'Idioma',
    // ── Library / Files ──
    folderScanning: 'Digitaliza\u00e7\u00e3o de Pastas',
    scanNow: 'Digitalizar todas as pastas agora',
    hiddenFiles: 'Arquivos Ocultos',
    showHiddenFiles: 'Mostrar arquivos ocultos',
    hiddenFilesDesc: 'Arquivos ocultos geralmente come\u00e7am com um ponto (ex.: .DS_Store). Ative apenas se necess\u00e1rio.',
    supportedFormats: 'Formatos Suportados',
    unsupportedFormat: 'Formato n\u00e3o suportado?',
    letUsKnow: 'Avise-nos',
    storageUsage: 'Uso de Armazenamento',
    // ── Playback / Equalizer ──
    equalizer: 'Equalizador',
    preset: 'Preset',
    playbackOptions: 'Op\u00e7\u00f5es de Reprodu\u00e7\u00e3o',
    crossfade: 'Crossfade',
    crossfadeDesc: 'Transi\u00e7\u00e3o suave entre faixas',
    gapless: 'Reprodu\u00e7\u00e3o cont\u00ednua',
    gaplessDesc: 'Sem sil\u00eancio entre faixas consecutivas',
    normalization: 'Normaliza\u00e7\u00e3o',
    normalizationDesc: 'Ajustar volume para um n\u00edvel consistente',
    sleepTimer: 'Temporizador',
    off: 'Desligado',
    min: 'min',
    hour: 'hora',
    endOfTrack: 'Final da faixa',
    cancelTimer: 'Cancelar timer',
    // ── About ──
    version: 'Vers\u00e3o',
    whatsNew: 'Novidades',
    privacyPolicy: 'Pol\u00edtica de Privacidade',
    termsOfService: 'Termos de Servi\u00e7o',
    ossLicenses: 'Licen\u00e7as Open Source',
    madeWith: 'Feito com \u2665 pela equipe ClarkPlayer',
    // ── Navigation ──
    browseGenres: 'Navegar por G\u00eanero',
    yourPlaylists: 'Suas Playlists',
    newPlaylist: 'Nova Playlist',
    sort: 'Ordenar',
    tracks: 'faixas',
    updated: 'Atualizado',
    noTracksInQueue: 'Nenhuma faixa na fila',
    browseTracks: 'Navegue pelas faixas para come\u00e7ar a ouvir',
    nowPlaying: 'Tocando Agora',
    queue: 'Fila',
    createPlaylist: 'Criar Playlist',
    publicLabel: 'P\u00fablico',
    privateLabel: 'Privado',
    nameLabel: 'Nome',
    descriptionOptional: 'Descri\u00e7\u00e3o (opcional)',
    descriptionPlaceholder: 'Sobre o que \u00e9 esta playlist?',
    loginAccount: 'Entrar na Conta',
    signOut: 'Sair',
    signIn: 'Entrar',
    home: 'In\u00edcio',
    allTracks: 'Todas as Faixas',
    library: 'Biblioteca',
    playlists: 'Playlists',
    artists: 'Artistas',
    genres: 'G\u00eaneros',
    search: 'Buscar',
    settingsNav: 'Configura\u00e7\u00f5es',
    // ── AppShell / player bar ──
    mainNavigation: 'Navega\u00e7\u00e3o principal',
    openSidebar: 'Abrir barra lateral',
    closeSidebar: 'Fechar barra lateral',
    closePanel: 'Fechar painel',
    hidePlayer: 'Ocultar player',
    showPlayer: 'Mostrar player',
    toggleFavorite: 'Alternar favorito',
    toggleShuffle: 'Alternar aleat\u00f3rio',
    previousTrack: 'Faixa anterior',
    nextTrack: 'Pr\u00f3xima faixa',
    playBtn: 'Reproduzir',
    pauseBtn: 'Pausar',
    toggleRepeat: 'Alternar repeti\u00e7\u00e3o',
    volumeLabel: 'Volume',
    lyricsBtn: 'Letras',
    sleepBtn: 'Dormir',
    openNowPlayingPanel: 'Abrir painel de reprodu\u00e7\u00e3o',
    closeNowPlayingPanel: 'Fechar painel de reprodu\u00e7\u00e3o',
    closeNavigation: 'Fechar navega\u00e7\u00e3o',
    // ── Home / NowPlayingContent ──
    welcomeToClarkPlayer: 'Bem-vindo ao ClarkPlayer',
    fortressOfSound: 'Sua Fortaleza Sonora est\u00e1 pronta. Explore sua biblioteca, crie playlists e deixe a m\u00fasica voar.',
    recentlyPlayed: 'Tocados Recentemente',
    // ── All Tracks ──
    titleColumn: 'T\u00edtulo',
    albumColumn: '\u00c1lbum',
    durationColumn: 'Dura\u00e7\u00e3o',
    formatColumn: 'Formato',
    selectAction: 'Selecionar',
    songsLabel: 'm\u00fasicas',
    addToPlaylist: 'Adicionar \u00e0 playlist',
    deleteAction: 'Excluir',
    cancelAction: 'Cancelar',
    dateAdded: 'Data de adi\u00e7\u00e3o',
    artistColumn: 'Artista',
    sortAction: 'Ordenar',
    selectedLabel: 'selecionadas',
    trackIndex: '#',
    // ── Library ──
    totalTracks: 'Total de faixas',
    favorites: 'Favoritas',
    totalDuration: 'Dura\u00e7\u00e3o total',
    libraryOverview: 'Vis\u00e3o geral da biblioteca em breve.',
    libraryOverviewBrowse: 'Navegar',
    libraryOverviewOr: 'ou',
    // ── Playlists list ──
    sortLabel: 'Ordenar:',
    sortAZ: 'A–Z',
    sortRecentlyUpdated: 'Atualizadas Recentemente',
    sortMostPlayed: 'Mais Tocadas',
    sortDateCreated: 'Data de Cria\u00e7\u00e3o',
    // ── Playlist detail ──
    playAction: 'Reproduzir',
    shuffleAction: 'Aleat\u00f3rio',
    shareAction: 'Compartilhar',
    exportJSON: 'Exportar como JSON',
    exportM3U8: 'Exportar como M3U8',
    collaborativeLabel: 'Colaborativa',
    addTracks: 'Adicionar faixas',
    searchInPlaylist: 'Buscar faixas na playlist\u2026',
    moreOptions: 'Mais op\u00e7\u00f5es',
    // ── Artists list ──
    albumSingular: '\u00e1lbum',
    albumPlural: '\u00e1lbuns',
    // ── Artist detail ──
    verifiedArtist: 'Artista Verificado',
    followAction: 'Seguir',
    topTracks: 'Mais Tocadas',
    discography: 'Discografia',
    filterAll: 'Tudo',
    filterAlbums: '\u00c1lbuns',
    filterEPs: 'EPs',
    filterSingles: 'Singles',
    similarArtists: 'Artistas Semelhantes',
    showFullLyrics: 'Mostrar letra completa',
    aboutLabel: 'Sobre',
    keyLabel: 'Tonalidade',
    valenceLabel: 'Val\u00eancia',
    acousticnessLabel: 'Ac\u00fastica',
    instrumentalnessLabel: 'Instrumentalidade',
    livenessLabel: 'Ao Vivo',
    speechinessLabel: 'Falabilidade',
    // ── Genres ──
    browseByGenre: 'Navegar por G\u00eanero',
    // ── Search ──
    searchPlaceholder: 'Buscar faixas, artistas, playlists\u2026',
    tracksTab: 'Faixas',
    artistsTab: 'Artistas',
    playlistsTab: 'Playlists',
    startTyping: 'Comece a digitar para buscar na biblioteca',
    noTracksFound: 'Nenhuma faixa encontrada para',
    noArtistsFound: 'Nenhum artista encontrado para',
    noPlaylistsFound: 'Nenhuma playlist encontrada para',
    searchAcrossWeb: 'Buscar na Internet',
    searchAcrossWebDesc: 'Descubra m\u00fasica dos maiores bancos de dados do mundo. Com MusicBrainz, Spotify, iTunes, Genius e Last.fm.',
    searchGlobalPlaceholder: 'Buscar m\u00fasicas, \u00e1lbuns ou artistas\u2026',
    searchingLabel: 'Buscando\u2026',
    searchErrorLabel: 'Busca falhou. Tente novamente.',
    popularityLabel: 'Popularidade',
    playcountLabel: 'Reprodu\u00e7\u00f5es',
    bpmLabel: 'BPM',
    energyLabel: 'Energia',
    danceabilityLabel: 'Dan\u00e7abilidade',
    previewLabel: 'Pr\u00e9via',
    noPreviewLabel: 'Pr\u00e9via indispon\u00edvel',
    lyricsLabel: 'Letras',
    similarTracksLabel: 'Faixas Semelhantes',
    audioFeaturesLabel: 'Caracter\u00edsticas de \u00c1udio',
    // ── Account ──
    myAccount: 'Minha Conta',
    profileInformation: 'Informa\u00e7\u00f5es do Perfil',
    displayName: 'Nome de exibi\u00e7\u00e3o',
    emailLabel: 'E-mail',
    bioLabel: 'Bio',
    saveChanges: 'Salvar altera\u00e7\u00f5es',
    linkedAccounts: 'Contas Vinculadas',
    connectedLabel: 'Conectado',
    disconnectAction: 'Desconectar',
    dangerZone: '\u00c1rea de Risco',
    dangerZoneDesc: 'Depois de excluir sua conta, n\u00e3o h\u00e1 como voltar. Tenha certeza.',
    deleteAccount: 'Excluir conta',
    deleteConfirmTitle: 'Excluir Conta',
    deleteConfirmDesc: 'Esta a\u00e7\u00e3o \u00e9 permanente. Para confirmar, digite EXCLUIR abaixo.',
    typeDeleteConfirm: 'Digite EXCLUIR para confirmar',
    deleting: 'Excluindo\u2026',
    free: 'Gr\u00e1tis',
    googleAccountLinked: 'Conta Google vinculada',
    editPhoto: 'Editar foto',
    // ── Auth / Login ──
    welcomeBack: 'Bem-vindo de volta',
    signInToContinue: 'Entre para continuar em sua biblioteca',
    continueWithGoogle: 'Continuar com Google',
    orDivider: 'ou',
    passwordLabel: 'Senha',
    forgotPassword: 'Esqueceu a senha?',
    signingIn: 'Entrando\u2026',
    lockedLabel: 'Bloqueado',
    noAccount: 'N\u00e3o tem uma conta?',
    signUp: 'Cadastre-se',
    accountCreatedBanner: 'Conta criada com sucesso! Fa\u00e7a login.',
    accountLocked: 'Conta Temporariamente Bloqueada',
    tooManyAttempts: 'Muitas tentativas de login. Tente novamente em',
    attemptsRemaining: 'tentativas restantes antes do bloqueio tempor\u00e1rio',
    wrongCredentials: 'E-mail ou senha incorretos. Tente novamente.',
    accessDeniedGoogle: 'Voc\u00ea negou o login com Google. Tente novamente.',
    authFailedGoogle: 'Falha no login com Google. Tente novamente.',
    authFailed: 'Falha na autentica\u00e7\u00e3o. Tente novamente.',
    closeLoginPage: 'Fechar p\u00e1gina de login',
    // ── Register ──
    createYourAccount: 'Crie sua conta',
    joinClarkPlayer: 'Entre no ClarkPlayer e comece a montar sua biblioteca',
    fullName: 'Nome completo',
    confirmPassword: 'Confirmar senha',
    agreeTerms: 'Concordo com os Termos de Servi\u00e7o e Pol\u00edtica de Privacidade',
    createAccount: 'Criar conta',
    creatingAccount: 'Criando conta\u2026',
    alreadyHaveAccount: 'J\u00e1 tem uma conta?',
    weak: 'Fraca',
    fair: 'Razo\u00e1vel',
    strong: 'Forte',
    accountCreated: 'Conta criada!',
    redirectingSignIn: 'Redirecionando para o login\u2026',
    // ── Forgot Password ──
    forgotPasswordTitle: 'Esqueceu sua senha?',
    forgotPasswordDesc: 'Digite seu e-mail e enviaremos um link para redefini-la.',
    checkInbox: 'Verifique sua caixa de entrada',
    resetLinkSent: 'Enviamos um link de redefini\u00e7\u00e3o para',
    clickLinkToReset: 'Clique no link no e-mail para redefinir sua senha.',
    backToLogin: 'Voltar ao login',
    sendResetLink: 'Enviar link de redefini\u00e7\u00e3o',
    sending: 'Enviando\u2026',
    // ── Reset Password ──
    resetPassword: 'Redefinir senha',
    newPassword: 'Nova senha',
    resetPasswordBtn: 'Redefinir senha',
    passwordResetComplete: 'Senha redefinida',
    passwordUpdated: 'Sua senha foi atualizada. Agora voc\u00ea pode entrar.',
    invalidResetLink: 'Link inv\u00e1lido',
    invalidResetLinkDesc: 'Este link de redefini\u00e7\u00e3o \u00e9 inv\u00e1lido ou expirou. Solicite um novo.',
    enterNewPassword: 'Digite sua nova senha abaixo.',
    goToSignIn: 'Ir para o login',
    // ── Verify Email ──
    verifying: 'Verificando\u2026',
    emailVerified: 'E-mail Verificado',
    verificationFailed: 'Falha na Verifica\u00e7\u00e3o',
    verificationTokenMissing: 'Token de verifica\u00e7\u00e3o ausente. Verifique o link no seu e-mail.',
    emailVerifiedMessage: 'Seu e-mail foi verificado! Agora voc\u00ea pode entrar.',
    verificationFailedMessage: 'Falha na verifica\u00e7\u00e3o. O token pode ter expirado. Solicite um novo.',
    // ── Google Callback ──
    signingInGoogle: 'Entrando com o Google\u2026',
    // ── CreatePlaylistModal ──
    dropImageUpload: 'Solte uma imagem ou clique para enviar',
    pngJpgLimit: 'PNG, JPG at\u00e9 5MB',
    playlistNamePlaceholder: 'Minha Playlist',
    playlistCoverPreview: 'Pr\u00e9-visualiza\u00e7\u00e3o da capa',
    togglePrivacy: 'Alternar privacidade',
    // ── TrackRow ──
    addToFavorites: 'Adicionar aos favoritos',
    unfavorite: 'Remover dos favoritos',
    selectTrack: 'Selecionar',
    currentlyPlaying: 'Tocando agora',
  } satisfies TranslationMap,

  es: {
    // ── Settings tab labels ──
    settings: 'Configuraci\u00f3n',
    appearance: 'Apariencia',
    language: 'Idioma',
    libraryFiles: 'Biblioteca y Archivos',
    playback: 'Reproducci\u00f3n',
    about: 'Acerca de',
    // ── Appearance ──
    theme: 'Tema',
    dark: 'Oscuro',
    light: 'Claro',
    midnight: 'Medianoche',
    accentColor: 'Color de Acento',
    fontSize: 'Tama\u00f1o de Fuente',
    small: 'Peque\u00f1o',
    default: 'Predeterminado',
    large: 'Grande',
    boldMode: 'Modo Negrita',
    boldModeDesc: 'Activar texto en negrita en toda la interfaz.',
    // ── Language / Region ──
    dateTimeFormat: 'Formato de Fecha y Hora',
    dateFormat: 'Formato de fecha',
    timeFormat: 'Formato de hora',
    translationContributors: 'Colaboradores de Traducci\u00f3n',
    translationThanks: 'Gracias a nuestros traductores comunitarios: Maria S., Jo\u00e3o P., Yuki T., Ahmed K. y otros.',
    languageLabel: 'Idioma',
    // ── Library / Files ──
    folderScanning: 'Escaneo de Carpetas',
    scanNow: 'Escanear todas las carpetas ahora',
    hiddenFiles: 'Archivos Ocultos',
    showHiddenFiles: 'Mostrar archivos ocultos',
    hiddenFilesDesc: 'Los archivos ocultos generalmente comienzan con un punto (ej.: .DS_Store). Active solo si es necesario.',
    supportedFormats: 'Formatos Soportados',
    unsupportedFormat: '\u00bfFormato no soportado?',
    letUsKnow: 'Av\u00edsenos',
    storageUsage: 'Uso de Almacenamiento',
    // ── Playback / Equalizer ──
    equalizer: 'Ecualizador',
    preset: 'Preajuste',
    playbackOptions: 'Opciones de Reproducci\u00f3n',
    crossfade: 'Crossfade',
    crossfadeDesc: 'Transici\u00f3n suave entre pistas',
    gapless: 'Reproducci\u00f3n sin pausas',
    gaplessDesc: 'Sin silencio entre pistas consecutivas',
    normalization: 'Normalizaci\u00f3n',
    normalizationDesc: 'Ajustar volumen a un nivel consistente',
    sleepTimer: 'Temporizador',
    off: 'Apagado',
    min: 'min',
    hour: 'hora',
    endOfTrack: 'Fin de pista',
    cancelTimer: 'Cancelar temporizador',
    // ── About ──
    version: 'Versi\u00f3n',
    whatsNew: 'Novedades',
    privacyPolicy: 'Pol\u00edtica de Privacidad',
    termsOfService: 'T\u00e9rminos de Servicio',
    ossLicenses: 'Licencias Open Source',
    madeWith: 'Hecho con \u2665 por el equipo ClarkPlayer',
    // ── Navigation ──
    browseGenres: 'Explorar por G\u00e9nero',
    yourPlaylists: 'Tus Playlists',
    newPlaylist: 'Nueva Playlist',
    sort: 'Ordenar',
    tracks: 'pistas',
    updated: 'Actualizado',
    noTracksInQueue: 'Sin pistas en cola',
    browseTracks: 'Explore las pistas para empezar a escuchar',
    nowPlaying: 'Reproduciendo',
    queue: 'Cola',
    createPlaylist: 'Crear Playlist',
    publicLabel: 'P\u00fablico',
    privateLabel: 'Privado',
    nameLabel: 'Nombre',
    descriptionOptional: 'Descripci\u00f3n (opcional)',
    descriptionPlaceholder: '\u00bfDe qu\u00e9 trata esta playlist?',
    loginAccount: 'Iniciar Sesi\u00f3n',
    signOut: 'Cerrar sesi\u00f3n',
    signIn: 'Iniciar sesi\u00f3n',
    home: 'Inicio',
    allTracks: 'Todas las Pistas',
    library: 'Biblioteca',
    playlists: 'Playlists',
    artists: 'Artistas',
    genres: 'G\u00e9neros',
    search: 'Buscar',
    settingsNav: 'Configuraci\u00f3n',
    // ── AppShell / player bar ──
    mainNavigation: 'Navegaci\u00f3n principal',
    openSidebar: 'Abrir barra lateral',
    closeSidebar: 'Cerrar barra lateral',
    closePanel: 'Cerrar panel',
    hidePlayer: 'Ocultar reproductor',
    showPlayer: 'Mostrar reproductor',
    toggleFavorite: 'Alternar favorito',
    toggleShuffle: 'Alternar aleatorio',
    previousTrack: 'Pista anterior',
    nextTrack: 'Pista siguiente',
    playBtn: 'Reproducir',
    pauseBtn: 'Pausar',
    toggleRepeat: 'Alternar repetici\u00f3n',
    volumeLabel: 'Volumen',
    lyricsBtn: 'Letras',
    sleepBtn: 'Dormir',
    openNowPlayingPanel: 'Abrir panel de reproducci\u00f3n',
    closeNowPlayingPanel: 'Cerrar panel de reproducci\u00f3n',
    closeNavigation: 'Cerrar navegaci\u00f3n',
    // ── Home / NowPlayingContent ──
    welcomeToClarkPlayer: 'Bienvenido a ClarkPlayer',
    fortressOfSound: 'Tu Fortaleza del Sonido est\u00e1 lista. Explora tu biblioteca, crea playlists y deja volar la m\u00fasica.',
    recentlyPlayed: 'Reproducido Recientemente',
    // ── All Tracks ──
    titleColumn: 'T\u00edtulo',
    albumColumn: '\u00c1lbum',
    durationColumn: 'Duraci\u00f3n',
    formatColumn: 'Formato',
    selectAction: 'Seleccionar',
    songsLabel: 'canciones',
    addToPlaylist: 'A\u00f1adir a playlist',
    deleteAction: 'Eliminar',
    cancelAction: 'Cancelar',
    dateAdded: 'Fecha de adici\u00f3n',
    artistColumn: 'Artista',
    sortAction: 'Ordenar',
    selectedLabel: 'seleccionadas',
    trackIndex: '#',
    // ── Library ──
    totalTracks: 'Total de pistas',
    favorites: 'Favoritas',
    totalDuration: 'Duraci\u00f3n total',
    libraryOverview: 'Vista general de la biblioteca pronto.',
    libraryOverviewBrowse: 'Explorar',
    libraryOverviewOr: 'o',
    // ── Playlists list ──
    sortLabel: 'Ordenar:',
    sortAZ: 'A–Z',
    sortRecentlyUpdated: 'Actualizadas Recientemente',
    sortMostPlayed: 'M\u00e1s Reproducidas',
    sortDateCreated: 'Fecha de Creaci\u00f3n',
    // ── Playlist detail ──
    playAction: 'Reproducir',
    shuffleAction: 'Aleatorio',
    shareAction: 'Compartir',
    exportJSON: 'Exportar como JSON',
    exportM3U8: 'Exportar como M3U8',
    collaborativeLabel: 'Colaborativa',
    addTracks: 'A\u00f1adir pistas',
    searchInPlaylist: 'Buscar pistas en la playlist\u2026',
    moreOptions: 'M\u00e1s opciones',
    // ── Artists list ──
    albumSingular: '\u00e1lbum',
    albumPlural: '\u00e1lbumes',
    // ── Artist detail ──
    verifiedArtist: 'Artista Verificado',
    followAction: 'Seguir',
    topTracks: 'Canciones Principales',
    discography: 'Discograf\u00eda',
    filterAll: 'Todo',
    filterAlbums: '\u00c1lbumes',
    filterEPs: 'EPs',
    filterSingles: 'Singles',
    similarArtists: 'Artistas Similares',
    showFullLyrics: 'Mostrar letra completa',
    aboutLabel: 'Acerca de',
    keyLabel: 'Tonalidad',
    valenceLabel: 'Valencia',
    acousticnessLabel: 'Ac\u00fastica',
    instrumentalnessLabel: 'Instrumentalidad',
    livenessLabel: 'En Vivo',
    speechinessLabel: 'Habla',
    // ── Genres ──
    browseByGenre: 'Explorar por G\u00e9nero',
    // ── Search ──
    searchPlaceholder: 'Buscar pistas, artistas, playlists\u2026',
    tracksTab: 'Pistas',
    artistsTab: 'Artistas',
    playlistsTab: 'Playlists',
    startTyping: 'Empieza a escribir para buscar en tu biblioteca',
    noTracksFound: 'No se encontraron pistas para',
    noArtistsFound: 'No se encontraron artistas para',
    noPlaylistsFound: 'No se encontraron playlists para',
    searchAcrossWeb: 'Buscar en la Web',
    searchAcrossWebDesc: 'Descubre m\u00fasica de las mayores bases de datos del mundo. Con MusicBrainz, Spotify, iTunes, Genius y Last.fm.',
    searchGlobalPlaceholder: 'Buscar canciones, \u00e1lbumes o artistas\u2026',
    searchingLabel: 'Buscando\u2026',
    searchErrorLabel: 'B\u00fasqueda fallida. Int\u00e9ntalo de nuevo.',
    popularityLabel: 'Popularidad',
    playcountLabel: 'Reproducciones',
    bpmLabel: 'BPM',
    energyLabel: 'Energ\u00eda',
    danceabilityLabel: 'Bailabilidad',
    previewLabel: 'Vista previa',
    noPreviewLabel: 'Sin vista previa',
    lyricsLabel: 'Letras',
    similarTracksLabel: 'Pistas Similares',
    audioFeaturesLabel: 'Caracter\u00edsticas de Audio',
    // ── Account ──
    myAccount: 'Mi Cuenta',
    profileInformation: 'Informaci\u00f3n del Perfil',
    displayName: 'Nombre de visualizaci\u00f3n',
    emailLabel: 'Correo electr\u00f3nico',
    bioLabel: 'Bio',
    saveChanges: 'Guardar cambios',
    linkedAccounts: 'Cuentas Vinculadas',
    connectedLabel: 'Conectado',
    disconnectAction: 'Desconectar',
    dangerZone: 'Zona de Peligro',
    dangerZoneDesc: 'Una vez que elimines tu cuenta, no hay vuelta atr\u00e1s. Aseg\u00farate.',
    deleteAccount: 'Eliminar cuenta',
    deleteConfirmTitle: 'Eliminar Cuenta',
    deleteConfirmDesc: 'Esta acci\u00f3n es permanente. Para confirmar, escribe ELIMINAR abajo.',
    typeDeleteConfirm: 'Escribe ELIMINAR para confirmar',
    deleting: 'Eliminando\u2026',
    free: 'Gratis',
    googleAccountLinked: 'Cuenta de Google vinculada',
    editPhoto: 'Editar foto',
    // ── Auth / Login ──
    welcomeBack: 'Bienvenido de nuevo',
    signInToContinue: 'Inicia sesi\u00f3n para continuar en tu biblioteca',
    continueWithGoogle: 'Continuar con Google',
    orDivider: 'o',
    passwordLabel: 'Contrase\u00f1a',
    forgotPassword: '\u00bfOlvidaste tu contrase\u00f1a?',
    signingIn: 'Iniciando sesi\u00f3n\u2026',
    lockedLabel: 'Bloqueado',
    noAccount: '\u00bfNo tienes una cuenta?',
    signUp: 'Reg\u00edstrate',
    accountCreatedBanner: '\u00a1Cuenta creada con \u00e9xito! Inicia sesi\u00f3n.',
    accountLocked: 'Cuenta Bloqueada Temporalmente',
    tooManyAttempts: 'Demasiados intentos fallidos. Intenta de nuevo en',
    attemptsRemaining: 'intentos restantes antes del bloqueo temporal',
    wrongCredentials: 'Correo o contrase\u00f1a incorrectos. Intenta de nuevo.',
    accessDeniedGoogle: 'Negaste el inicio de sesi\u00f3n con Google. Intenta de nuevo.',
    authFailedGoogle: 'Fall\u00f3 el inicio de sesi\u00f3n con Google. Intenta de nuevo.',
    authFailed: 'Fall\u00f3 la autenticaci\u00f3n. Intenta de nuevo.',
    closeLoginPage: 'Cerrar p\u00e1gina de inicio de sesi\u00f3n',
    // ── Register ──
    createYourAccount: 'Crea tu cuenta',
    joinClarkPlayer: '\u00danete a ClarkPlayer y comienza a construir tu biblioteca',
    fullName: 'Nombre completo',
    confirmPassword: 'Confirmar contrase\u00f1a',
    agreeTerms: 'Acepto los T\u00e9rminos de Servicio y la Pol\u00edtica de Privacidad',
    createAccount: 'Crear cuenta',
    creatingAccount: 'Creando cuenta\u2026',
    alreadyHaveAccount: '\u00bfYa tienes una cuenta?',
    weak: 'D\u00e9bil',
    fair: 'Regular',
    strong: 'Fuerte',
    accountCreated: '\u00a1Cuenta creada!',
    redirectingSignIn: 'Redirigiendo al inicio de sesi\u00f3n\u2026',
    // ── Forgot Password ──
    forgotPasswordTitle: '\u00bfOlvidaste tu contrase\u00f1a?',
    forgotPasswordDesc: 'Ingresa tu correo y te enviaremos un enlace para restablecerla.',
    checkInbox: 'Revisa tu bandeja de entrada',
    resetLinkSent: 'Hemos enviado un enlace de restablecimiento a',
    clickLinkToReset: 'Haz clic en el enlace del correo para restablecer tu contrase\u00f1a.',
    backToLogin: 'Volver al inicio de sesi\u00f3n',
    sendResetLink: 'Enviar enlace de restablecimiento',
    sending: 'Enviando\u2026',
    // ── Reset Password ──
    resetPassword: 'Restablecer contrase\u00f1a',
    newPassword: 'Nueva contrase\u00f1a',
    resetPasswordBtn: 'Restablecer contrase\u00f1a',
    passwordResetComplete: 'Contrase\u00f1a restablecida',
    passwordUpdated: 'Tu contrase\u00f1a ha sido actualizada. Ahora puedes iniciar sesi\u00f3n.',
    invalidResetLink: 'Enlace inv\u00e1lido',
    invalidResetLinkDesc: 'Este enlace de restablecimiento no es v\u00e1lido o ha expirado. Solicita uno nuevo.',
    enterNewPassword: 'Ingresa tu nueva contrase\u00f1a abajo.',
    goToSignIn: 'Ir al inicio de sesi\u00f3n',
    // ── Verify Email ──
    verifying: 'Verificando\u2026',
    emailVerified: 'Correo Verificado',
    verificationFailed: 'Verificaci\u00f3n Fallida',
    verificationTokenMissing: 'Falta el token de verificaci\u00f3n. Revisa el enlace en tu correo.',
    emailVerifiedMessage: '\u00a1Tu correo ha sido verificado! Ahora puedes iniciar sesi\u00f3n.',
    verificationFailedMessage: 'La verificaci\u00f3n fall\u00f3. El token puede haber expirado. Solicita uno nuevo.',
    // ── Google Callback ──
    signingInGoogle: 'Iniciando sesi\u00f3n con Google\u2026',
    // ── CreatePlaylistModal ──
    dropImageUpload: 'Suelta una imagen o haz clic para subir',
    pngJpgLimit: 'PNG, JPG hasta 5MB',
    playlistNamePlaceholder: 'Mi Playlist',
    playlistCoverPreview: 'Vista previa de la portada',
    togglePrivacy: 'Alternar privacidad',
    // ── TrackRow ──
    addToFavorites: 'A\u00f1adir a favoritos',
    unfavorite: 'Quitar de favoritos',
    selectTrack: 'Seleccionar',
    currentlyPlaying: 'Reproduciendo ahora',
  } satisfies TranslationMap,

  fr: {
    // ── Settings tab labels ──
    settings: 'Param\u00e8tres',
    appearance: 'Apparence',
    language: 'Langue',
    libraryFiles: 'Biblioth\u00e8que et Fichiers',
    playback: 'Lecture',
    about: '\u00c0 propos',
    // ── Appearance ──
    theme: 'Th\u00e8me',
    dark: 'Sombre',
    light: 'Clair',
    midnight: 'Minuit',
    accentColor: "Couleur d'accent",
    fontSize: 'Taille de police',
    small: 'Petite',
    default: 'Normale',
    large: 'Grande',
    boldMode: 'Mode Gras',
    boldModeDesc: "Activer le texte en gras dans toute l'interface.",
    // ── Language / Region ──
    dateTimeFormat: 'Format de date et heure',
    dateFormat: 'Format de date',
    timeFormat: "Format de l'heure",
    translationContributors: 'Contributeurs \u00e0 la traduction',
    translationThanks: 'Merci \u00e0 nos traducteurs communautaires : Maria S., Jo\u00e3o P., Yuki T., Ahmed K. et autres.',
    languageLabel: 'Langue',
    // ── Library / Files ──
    folderScanning: 'Analyse des dossiers',
    scanNow: 'Analyser tous les dossiers maintenant',
    hiddenFiles: 'Fichiers cach\u00e9s',
    showHiddenFiles: 'Afficher les fichiers cach\u00e9s',
    hiddenFilesDesc: 'Les fichiers cach\u00e9s commencent g\u00e9n\u00e9ralement par un point (ex. : .DS_Store). Activez seulement si n\u00e9cessaire.',
    supportedFormats: 'Formats pris en charge',
    unsupportedFormat: 'Format non pris en charge ?',
    letUsKnow: 'Faites-nous savoir',
    storageUsage: 'Utilisation du stockage',
    // ── Playback / Equalizer ──
    equalizer: '\u00c9galiseur',
    preset: 'Pr\u00e9r\u00e9glage',
    playbackOptions: 'Options de lecture',
    crossfade: 'Fondu encha\u00een\u00e9',
    crossfadeDesc: 'Transition fluide entre les pistes',
    gapless: 'Lecture sans interruption',
    gaplessDesc: 'Pas de silence entre les pistes cons\u00e9cutives',
    normalization: 'Normalisation',
    normalizationDesc: 'Ajuster le volume \u00e0 un niveau constant',
    sleepTimer: 'Minuteur',
    off: 'D\u00e9sactiv\u00e9',
    min: 'min',
    hour: 'heure',
    endOfTrack: 'Fin de piste',
    cancelTimer: 'Annuler le minuteur',
    // ── About ──
    version: 'Version',
    whatsNew: 'Nouveaut\u00e9s',
    privacyPolicy: 'Politique de confidentialit\u00e9',
    termsOfService: "Conditions d'utilisation",
    ossLicenses: 'Licences Open Source',
    madeWith: "Fait avec \u2665 par l'\u00e9quipe ClarkPlayer",
    // ── Navigation ──
    browseGenres: 'Parcourir par genre',
    yourPlaylists: 'Vos playlists',
    newPlaylist: 'Nouvelle playlist',
    sort: 'Trier',
    tracks: 'pistes',
    updated: 'Mis \u00e0 jour',
    noTracksInQueue: 'Aucune piste dans la file',
    browseTracks: 'Parcourez les pistes pour commencer \u00e0 \u00e9couter',
    nowPlaying: 'En cours de lecture',
    queue: "File d'attente",
    createPlaylist: 'Cr\u00e9er une playlist',
    publicLabel: 'Publique',
    privateLabel: 'Priv\u00e9e',
    nameLabel: 'Nom',
    descriptionOptional: 'Description (facultative)',
    descriptionPlaceholder: 'De quoi parle cette playlist ?',
    loginAccount: 'Connexion',
    signOut: 'D\u00e9connexion',
    signIn: 'Connexion',
    home: 'Accueil',
    allTracks: 'Toutes les pistes',
    library: 'Biblioth\u00e8que',
    playlists: 'Playlists',
    artists: 'Artistes',
    genres: 'Genres',
    search: 'Rechercher',
    settingsNav: 'Param\u00e8tres',
    // ── AppShell / player bar ──
    mainNavigation: 'Navigation principale',
    openSidebar: 'Ouvrir la barre lat\u00e9rale',
    closeSidebar: 'Fermer la barre lat\u00e9rale',
    closePanel: 'Fermer le panneau',
    hidePlayer: 'Cacher le lecteur',
    showPlayer: 'Afficher le lecteur',
    toggleFavorite: 'Basculer favori',
    toggleShuffle: 'Basculer al\u00e9atoire',
    previousTrack: 'Piste pr\u00e9c\u00e9dente',
    nextTrack: 'Piste suivante',
    playBtn: 'Lire',
    pauseBtn: 'Pause',
    toggleRepeat: 'Basculer r\u00e9p\u00e9tition',
    volumeLabel: 'Volume',
    lyricsBtn: 'Paroles',
    sleepBtn: 'Sommeil',
    openNowPlayingPanel: 'Ouvrir le panneau de lecture',
    closeNowPlayingPanel: 'Fermer le panneau de lecture',
    closeNavigation: 'Fermer la navigation',
    // ── Home / NowPlayingContent ──
    welcomeToClarkPlayer: 'Bienvenue sur ClarkPlayer',
    fortressOfSound: 'Votre Forteresse Sonore est pr\u00eate. Parcourez votre biblioth\u00e8que, cr\u00e9ez des playlists et laissez la musique s\u2019envoler.',
    recentlyPlayed: '\u00c9cout\u00e9s R\u00e9cemment',
    // ── All Tracks ──
    titleColumn: 'Titre',
    albumColumn: 'Album',
    durationColumn: 'Dur\u00e9e',
    formatColumn: 'Format',
    selectAction: 'S\u00e9lectionner',
    songsLabel: 'chansons',
    addToPlaylist: 'Ajouter \u00e0 la playlist',
    deleteAction: 'Supprimer',
    cancelAction: 'Annuler',
    dateAdded: "Date d'ajout",
    artistColumn: 'Artiste',
    sortAction: 'Trier',
    selectedLabel: 's\u00e9lectionn\u00e9es',
    trackIndex: '#',
    // ── Library ──
    totalTracks: 'Total de pistes',
    favorites: 'Favorites',
    totalDuration: 'Dur\u00e9e totale',
    libraryOverview: "Aper\u00e7u de la biblioth\u00e8que \u00e0 venir.",
    libraryOverviewBrowse: 'Parcourir',
    libraryOverviewOr: 'ou',
    // ── Playlists list ──
    sortLabel: 'Trier :',
    sortAZ: 'A–Z',
    sortRecentlyUpdated: 'R\u00e9cemment Mises \u00e0 Jour',
    sortMostPlayed: 'Les Plus \u00c9cout\u00e9es',
    sortDateCreated: 'Date de Cr\u00e9ation',
    // ── Playlist detail ──
    playAction: 'Lire',
    shuffleAction: 'Al\u00e9atoire',
    shareAction: 'Partager',
    exportJSON: 'Exporter en JSON',
    exportM3U8: 'Exporter en M3U8',
    collaborativeLabel: 'Collaborative',
    addTracks: 'Ajouter des pistes',
    searchInPlaylist: 'Rechercher dans la playlist\u2026',
    moreOptions: "Plus d'options",
    // ── Artists list ──
    albumSingular: 'album',
    albumPlural: 'albums',
    // ── Artist detail ──
    verifiedArtist: 'Artiste V\u00e9rifi\u00e9',
    followAction: 'Suivre',
    topTracks: 'Meilleures Pistes',
    discography: 'Discographie',
    filterAll: 'Tout',
    filterAlbums: 'Albums',
    filterEPs: 'EPs',
    filterSingles: 'Singles',
    similarArtists: 'Artistes Similaires',
    showFullLyrics: 'Afficher toutes les paroles',
    aboutLabel: '\u00c0 propos',
    keyLabel: 'Tonalit\u00e9',
    valenceLabel: 'Valence',
    acousticnessLabel: 'Acoustique',
    instrumentalnessLabel: 'Instrumentalit\u00e9',
    livenessLabel: 'Direct',
    speechinessLabel: 'Parole',
    // ── Genres ──
    browseByGenre: 'Parcourir par Genre',
    // ── Search ──
    searchPlaceholder: 'Rechercher pistes, artistes, playlists\u2026',
    tracksTab: 'Pistes',
    artistsTab: 'Artistes',
    playlistsTab: 'Playlists',
    startTyping: 'Commencez \u00e0 taper pour rechercher dans votre biblioth\u00e8que',
    noTracksFound: 'Aucune piste trouv\u00e9e pour',
    noArtistsFound: 'Aucun artiste trouv\u00e9 pour',
    noPlaylistsFound: 'Aucune playlist trouv\u00e9e pour',
    searchAcrossWeb: 'Rechercher sur le Web',
    searchAcrossWebDesc: 'D\u00e9couvrez de la musique gr\u00e2ce aux plus grandes bases de donn\u00e9es mondiales. Propuls\u00e9 par MusicBrainz, Spotify, iTunes, Genius et Last.fm.',
    searchGlobalPlaceholder: 'Rechercher des chansons, albums ou artistes\u2026',
    searchingLabel: 'Recherche en cours\u2026',
    searchErrorLabel: '\u00c9chec de la recherche. Veuillez r\u00e9essayer.',
    popularityLabel: 'Popularit\u00e9',
    playcountLabel: '\u00c9coutes',
    bpmLabel: 'BPM',
    energyLabel: '\u00c9nergie',
    danceabilityLabel: 'Dansabilit\u00e9',
    previewLabel: 'Aper\u00e7u',
    noPreviewLabel: 'Aper\u00e7u non disponible',
    lyricsLabel: 'Paroles',
    similarTracksLabel: 'Pistes Similaires',
    audioFeaturesLabel: 'Caract\u00e9ristiques Audio',
    // ── Account ──
    myAccount: 'Mon Compte',
    profileInformation: 'Informations du Profil',
    displayName: "Nom d'affichage",
    emailLabel: 'E-mail',
    bioLabel: 'Bio',
    saveChanges: 'Enregistrer les modifications',
    linkedAccounts: 'Comptes Li\u00e9s',
    connectedLabel: 'Connect\u00e9',
    disconnectAction: 'D\u00e9connecter',
    dangerZone: 'Zone de Danger',
    dangerZoneDesc: 'Une fois votre compte supprim\u00e9, il n\u2019y a pas de retour possible. Soyez certain.',
    deleteAccount: 'Supprimer le compte',
    deleteConfirmTitle: 'Supprimer le Compte',
    deleteConfirmDesc: 'Cette action est permanente. Pour confirmer, tapez SUPPRIMER ci-dessous.',
    typeDeleteConfirm: 'Tapez SUPPRIMER pour confirmer',
    deleting: 'Suppression\u2026',
    free: 'Gratuit',
    googleAccountLinked: 'Compte Google li\u00e9',
    editPhoto: 'Modifier la photo',
    // ── Auth / Login ──
    welcomeBack: 'Bon retour',
    signInToContinue: 'Connectez-vous pour acc\u00e9der \u00e0 votre biblioth\u00e8que',
    continueWithGoogle: 'Continuer avec Google',
    orDivider: 'ou',
    passwordLabel: 'Mot de passe',
    forgotPassword: 'Mot de passe oubli\u00e9 ?',
    signingIn: 'Connexion\u2026',
    lockedLabel: 'Verrouill\u00e9',
    noAccount: 'Pas de compte ?',
    signUp: "S'inscrire",
    accountCreatedBanner: 'Compte cr\u00e9\u00e9 avec succ\u00e8s ! Connectez-vous.',
    accountLocked: 'Compte Temporairement Verrouill\u00e9',
    tooManyAttempts: 'Trop de tentatives de connexion. R\u00e9essayez dans',
    attemptsRemaining: 'tentatives restantes avant le verrouillage temporaire',
    wrongCredentials: 'E-mail ou mot de passe incorrect. R\u00e9essayez.',
    accessDeniedGoogle: 'Vous avez refus\u00e9 la connexion Google. R\u00e9essayez.',
    authFailedGoogle: '\u00c9chec de la connexion Google. R\u00e9essayez.',
    authFailed: "\u00c9chec de l'authentification. R\u00e9essayez.",
    closeLoginPage: 'Fermer la page de connexion',
    // ── Register ──
    createYourAccount: 'Cr\u00e9ez votre compte',
    joinClarkPlayer: 'Rejoignez ClarkPlayer et commencez \u00e0 b\u00e2tir votre biblioth\u00e8que',
    fullName: 'Nom complet',
    confirmPassword: 'Confirmer le mot de passe',
    agreeTerms: "J'accepte les Conditions d'Utilisation et la Politique de Confidentialit\u00e9",
    createAccount: 'Cr\u00e9er un compte',
    creatingAccount: 'Cr\u00e9ation du compte\u2026',
    alreadyHaveAccount: 'Vous avez d\u00e9j\u00e0 un compte ?',
    weak: 'Faible',
    fair: 'Moyen',
    strong: 'Fort',
    accountCreated: 'Compte cr\u00e9\u00e9 !',
    redirectingSignIn: 'Redirection vers la connexion\u2026',
    // ── Forgot Password ──
    forgotPasswordTitle: 'Mot de passe oubli\u00e9 ?',
    forgotPasswordDesc: 'Entrez votre adresse e-mail et nous vous enverrons un lien de r\u00e9initialisation.',
    checkInbox: 'V\u00e9rifiez votre bo\u00eete de r\u00e9ception',
    resetLinkSent: 'Nous avons envoy\u00e9 un lien de r\u00e9initialisation \u00e0',
    clickLinkToReset: 'Cliquez sur le lien dans l\u2019e-mail pour r\u00e9initialiser votre mot de passe.',
    backToLogin: 'Retour \u00e0 la connexion',
    sendResetLink: 'Envoyer le lien de r\u00e9initialisation',
    sending: 'Envoi\u2026',
    // ── Reset Password ──
    resetPassword: 'R\u00e9initialiser le mot de passe',
    newPassword: 'Nouveau mot de passe',
    resetPasswordBtn: 'R\u00e9initialiser le mot de passe',
    passwordResetComplete: 'Mot de passe r\u00e9initialis\u00e9',
    passwordUpdated: 'Votre mot de passe a \u00e9t\u00e9 mis \u00e0 jour. Vous pouvez maintenant vous connecter.',
    invalidResetLink: 'Lien invalide',
    invalidResetLinkDesc: 'Ce lien de r\u00e9initialisation est invalide ou a expir\u00e9. Veuillez en demander un nouveau.',
    enterNewPassword: 'Entrez votre nouveau mot de passe ci-dessous.',
    goToSignIn: 'Aller \u00e0 la connexion',
    // ── Verify Email ──
    verifying: 'V\u00e9rification\u2026',
    emailVerified: 'E-mail V\u00e9rifi\u00e9',
    verificationFailed: '\u00c9chec de la V\u00e9rification',
    verificationTokenMissing: 'Jeton de v\u00e9rification manquant. V\u00e9rifiez le lien dans votre e-mail.',
    emailVerifiedMessage: 'Votre e-mail a \u00e9t\u00e9 v\u00e9rifi\u00e9 ! Vous pouvez maintenant vous connecter.',
    verificationFailedMessage: 'La v\u00e9rification a \u00e9chou\u00e9. Le jeton a peut-\u00eatre expir\u00e9. Veuillez en demander un nouveau.',
    // ── Google Callback ──
    signingInGoogle: 'Connexion avec Google\u2026',
    // ── CreatePlaylistModal ──
    dropImageUpload: 'D\u00e9posez une image ou cliquez pour t\u00e9l\u00e9charger',
    pngJpgLimit: 'PNG, JPG jusqu\u2019\u00e0 5 Mo',
    playlistNamePlaceholder: 'Ma Playlist',
    playlistCoverPreview: 'Aper\u00e7u de la pochette',
    togglePrivacy: 'Basculer la confidentialit\u00e9',
    // ── TrackRow ──
    addToFavorites: 'Ajouter aux favoris',
    unfavorite: 'Retirer des favoris',
    selectTrack: 'S\u00e9lectionner',
    currentlyPlaying: 'En cours de lecture',
  } satisfies TranslationMap,

  de: {
    // ── Settings tab labels ──
    settings: 'Einstellungen',
    appearance: 'Erscheinungsbild',
    language: 'Sprache',
    libraryFiles: 'Bibliothek & Dateien',
    playback: 'Wiedergabe',
    about: '\u00dcber',
    // ── Appearance ──
    theme: 'Design',
    dark: 'Dunkel',
    light: 'Hell',
    midnight: 'Mitternacht',
    accentColor: 'Akzentfarbe',
    fontSize: 'Schriftgr\u00f6\u00dfe',
    small: 'Klein',
    default: 'Standard',
    large: 'Gro\u00df',
    boldMode: 'Fettmodus',
    boldModeDesc: 'Fettschrift in der gesamten Oberfl\u00e4che aktivieren.',
    // ── Language / Region ──
    dateTimeFormat: 'Datums- und Zeitformat',
    dateFormat: 'Datumsformat',
    timeFormat: 'Zeitformat',
    translationContributors: '\u00dcbersetzungsmitwirkende',
    translationThanks: 'Dank an unsere Community-\u00dcbersetzer: Maria S., Jo\u00e3o P., Yuki T., Ahmed K. und andere.',
    languageLabel: 'Sprache',
    // ── Library / Files ──
    folderScanning: 'Ordnerscan',
    scanNow: 'Alle Ordner jetzt scannen',
    hiddenFiles: 'Versteckte Dateien',
    showHiddenFiles: 'Versteckte Dateien anzeigen',
    hiddenFilesDesc: 'Versteckte Dateien beginnen meist mit einem Punkt (z.B. .DS_Store). Nur aktivieren wenn n\u00f6tig.',
    supportedFormats: 'Unterst\u00fctzte Formate',
    unsupportedFormat: 'Nicht unterst\u00fctztes Format?',
    letUsKnow: 'Teilen Sie uns mit',
    storageUsage: 'Speichernutzung',
    // ── Playback / Equalizer ──
    equalizer: 'Equalizer',
    preset: 'Voreinstellung',
    playbackOptions: 'Wiedergabeoptionen',
    crossfade: '\u00dcberblendung',
    crossfadeDesc: 'Sanfter \u00dcbergang zwischen Titeln',
    gapless: 'Nahtlose Wiedergabe',
    gaplessDesc: 'Keine Stille zwischen aufeinanderfolgenden Titeln',
    normalization: 'Normalisierung',
    normalizationDesc: 'Lautst\u00e4rke auf ein gleichm\u00e4\u00dfiges Niveau anpassen',
    sleepTimer: 'Schlaftimer',
    off: 'Aus',
    min: 'Min.',
    hour: 'Stunde',
    endOfTrack: 'Titelende',
    cancelTimer: 'Timer abbrechen',
    // ── About ──
    version: 'Version',
    whatsNew: 'Neuerungen',
    privacyPolicy: 'Datenschutz',
    termsOfService: 'Nutzungsbedingungen',
    ossLicenses: 'Open-Source-Lizenzen',
    madeWith: 'Mit \u2665 gemacht vom ClarkPlayer-Team',
    // ── Navigation ──
    browseGenres: 'Nach Genre durchsuchen',
    yourPlaylists: 'Deine Playlists',
    newPlaylist: 'Neue Playlist',
    sort: 'Sortieren',
    tracks: 'Titel',
    updated: 'Aktualisiert',
    noTracksInQueue: 'Keine Titel in der Warteschlange',
    browseTracks: 'Durchst\u00f6bere Titel und beginne zu h\u00f6ren',
    nowPlaying: 'Aktuelle Wiedergabe',
    queue: 'Warteschlange',
    createPlaylist: 'Playlist erstellen',
    publicLabel: '\u00d6ffentlich',
    privateLabel: 'Privat',
    nameLabel: 'Name',
    descriptionOptional: 'Beschreibung (optional)',
    descriptionPlaceholder: 'Worum geht es in dieser Playlist?',
    loginAccount: 'Anmelden',
    signOut: 'Abmelden',
    signIn: 'Anmelden',
    home: 'Start',
    allTracks: 'Alle Titel',
    library: 'Bibliothek',
    playlists: 'Playlists',
    artists: 'K\u00fcnstler',
    genres: 'Genres',
    search: 'Suche',
    settingsNav: 'Einstellungen',
    // ── AppShell / player bar ──
    mainNavigation: 'Hauptnavigation',
    openSidebar: 'Seitenleiste \u00f6ffnen',
    closeSidebar: 'Seitenleiste schlie\u00dfen',
    closePanel: 'Panel schlie\u00dfen',
    hidePlayer: 'Player ausblenden',
    showPlayer: 'Player einblenden',
    toggleFavorite: 'Favorit umschalten',
    toggleShuffle: 'Zufallswiedergabe umschalten',
    previousTrack: 'Vorheriger Titel',
    nextTrack: 'N\u00e4chster Titel',
    playBtn: 'Abspielen',
    pauseBtn: 'Pause',
    toggleRepeat: 'Wiederholung umschalten',
    volumeLabel: 'Lautst\u00e4rke',
    lyricsBtn: 'Liedtexte',
    sleepBtn: 'Schlafen',
    openNowPlayingPanel: 'Wiedergabe-Panel \u00f6ffnen',
    closeNowPlayingPanel: 'Wiedergabe-Panel schlie\u00dfen',
    closeNavigation: 'Navigation schlie\u00dfen',
    // ── Home / NowPlayingContent ──
    welcomeToClarkPlayer: 'Willkommen bei ClarkPlayer',
    fortressOfSound: 'Deine Klangfestung ist bereit. Durchst\u00f6bere deine Bibliothek, erstelle Playlists und lass die Musik fliegen.',
    recentlyPlayed: 'K\u00fcrzlich gespielt',
    // ── All Tracks ──
    titleColumn: 'Titel',
    albumColumn: 'Album',
    durationColumn: 'Dauer',
    formatColumn: 'Format',
    selectAction: 'Ausw\u00e4hlen',
    songsLabel: 'Lieder',
    addToPlaylist: 'Zur Playlist hinzuf\u00fcgen',
    deleteAction: 'L\u00f6schen',
    cancelAction: 'Abbrechen',
    dateAdded: 'Hinzugef\u00fcgt am',
    artistColumn: 'K\u00fcnstler',
    sortAction: 'Sortieren',
    selectedLabel: 'ausgew\u00e4hlt',
    trackIndex: '#',
    // ── Library ──
    totalTracks: 'Titel insgesamt',
    favorites: 'Favoriten',
    totalDuration: 'Gesamtdauer',
    libraryOverview: 'Bibliotheks\u00fcbersicht folgt in K\u00fcrze.',
    libraryOverviewBrowse: 'Durchsuchen',
    libraryOverviewOr: 'oder',
    // ── Playlists list ──
    sortLabel: 'Sortieren:',
    sortAZ: 'A–Z',
    sortRecentlyUpdated: 'K\u00fcrzlich aktualisiert',
    sortMostPlayed: 'Am h\u00e4ufigsten gespielt',
    sortDateCreated: 'Erstellungsdatum',
    // ── Playlist detail ──
    playAction: 'Abspielen',
    shuffleAction: 'Zufall',
    shareAction: 'Teilen',
    exportJSON: 'Als JSON exportieren',
    exportM3U8: 'Als M3U8 exportieren',
    collaborativeLabel: 'Kollaborativ',
    addTracks: 'Titel hinzuf\u00fcgen',
    searchInPlaylist: 'Titel in Playlist suchen\u2026',
    moreOptions: 'Weitere Optionen',
    // ── Artists list ──
    albumSingular: 'Album',
    albumPlural: 'Alben',
    // ── Artist detail ──
    verifiedArtist: 'Verifizierter K\u00fcnstler',
    followAction: 'Folgen',
    topTracks: 'Top-Titel',
    discography: 'Diskografie',
    filterAll: 'Alle',
    filterAlbums: 'Alben',
    filterEPs: 'EPs',
    filterSingles: 'Singles',
    similarArtists: '\u00c4hnliche K\u00fcnstler',
    showFullLyrics: 'Alle Songtexte anzeigen',
    aboutLabel: '\u00dcber',
    keyLabel: 'Tonart',
    valenceLabel: 'Valenz',
    acousticnessLabel: 'Akustik',
    instrumentalnessLabel: 'Instrumentalit\u00e4t',
    livenessLabel: 'Live',
    speechinessLabel: 'Sprachanteil',
    // ── Genres ──
    browseByGenre: 'Nach Genre durchsuchen',
    // ── Search ──
    searchPlaceholder: 'Titel, K\u00fcnstler, Playlists suchen\u2026',
    tracksTab: 'Titel',
    artistsTab: 'K\u00fcnstler',
    playlistsTab: 'Playlists',
    startTyping: 'Beginne zu tippen, um deine Bibliothek zu durchsuchen',
    noTracksFound: 'Keine Titel gefunden f\u00fcr',
    noArtistsFound: 'Keine K\u00fcnstler gefunden f\u00fcr',
    noPlaylistsFound: 'Keine Playlists gefunden f\u00fcr',
    searchAcrossWeb: 'Im Web suchen',
    searchAcrossWebDesc: 'Entdecke Musik aus den weltweit gr\u00f6\u00dften Datenbanken. Unterst\u00fctzt von MusicBrainz, Spotify, iTunes, Genius & Last.fm.',
    searchGlobalPlaceholder: 'Suche nach Songs, Alben oder K\u00fcnstlern\u2026',
    searchingLabel: 'Suche l\u00e4uft\u2026',
    searchErrorLabel: 'Suche fehlgeschlagen. Bitte versuche es erneut.',
    popularityLabel: 'Beliebtheit',
    playcountLabel: 'Wiedergaben',
    bpmLabel: 'BPM',
    energyLabel: 'Energie',
    danceabilityLabel: 'Tanzbarkeit',
    previewLabel: 'Vorschau',
    noPreviewLabel: 'Keine Vorschau verf\u00fcgbar',
    lyricsLabel: 'Songtext',
    similarTracksLabel: '\u00c4hnliche Titel',
    audioFeaturesLabel: 'Audio-Merkmale',
    // ── Account ──
    myAccount: 'Mein Konto',
    profileInformation: 'Profilinformationen',
    displayName: 'Anzeigename',
    emailLabel: 'E-Mail',
    bioLabel: 'Bio',
    saveChanges: '\u00c4nderungen speichern',
    linkedAccounts: 'Verkn\u00fcpfte Konten',
    connectedLabel: 'Verbunden',
    disconnectAction: 'Trennen',
    dangerZone: 'Gefahrenzone',
    dangerZoneDesc: 'Wenn du dein Konto l\u00f6schst, gibt es kein Zur\u00fcck. Sei dir sicher.',
    deleteAccount: 'Konto l\u00f6schen',
    deleteConfirmTitle: 'Konto L\u00f6schen',
    deleteConfirmDesc: 'Diese Aktion ist endg\u00fcltig. Zur Best\u00e4tigung gib L\u00d6SCHEN ein.',
    typeDeleteConfirm: 'Gib L\u00d6SCHEN zur Best\u00e4tigung ein',
    deleting: 'Wird gel\u00f6scht\u2026',
    free: 'Kostenlos',
    googleAccountLinked: 'Google-Konto verkn\u00fcpft',
    editPhoto: 'Foto bearbeiten',
    // ── Auth / Login ──
    welcomeBack: 'Willkommen zur\u00fcck',
    signInToContinue: 'Melde dich an, um auf deine Bibliothek zuzugreifen',
    continueWithGoogle: 'Mit Google fortfahren',
    orDivider: 'oder',
    passwordLabel: 'Passwort',
    forgotPassword: 'Passwort vergessen?',
    signingIn: 'Anmeldung\u2026',
    lockedLabel: 'Gesperrt',
    noAccount: 'Noch kein Konto?',
    signUp: 'Registrieren',
    accountCreatedBanner: 'Konto erfolgreich erstellt! Bitte anmelden.',
    accountLocked: 'Konto Vor\u00fcbergehend Gesperrt',
    tooManyAttempts: 'Zu viele fehlgeschlagene Anmeldeversuche. Versuche es erneut in',
    attemptsRemaining: 'Versuche verbleibend vor vor\u00fcbergehender Sperre',
    wrongCredentials: 'Falsche E-Mail oder falsches Passwort. Versuche es erneut.',
    accessDeniedGoogle: 'Du hast die Google-Anmeldung abgelehnt. Versuche es erneut.',
    authFailedGoogle: 'Google-Anmeldung fehlgeschlagen. Versuche es erneut.',
    authFailed: 'Authentifizierung fehlgeschlagen. Versuche es erneut.',
    closeLoginPage: 'Anmeldeseite schlie\u00dfen',
    // ── Register ──
    createYourAccount: 'Erstelle dein Konto',
    joinClarkPlayer: 'Tritt ClarkPlayer bei und baue deine Bibliothek auf',
    fullName: 'Vollst\u00e4ndiger Name',
    confirmPassword: 'Passwort best\u00e4tigen',
    agreeTerms: 'Ich stimme den Nutzungsbedingungen und der Datenschutzerkl\u00e4rung zu',
    createAccount: 'Konto erstellen',
    creatingAccount: 'Konto wird erstellt\u2026',
    alreadyHaveAccount: 'Hast du bereits ein Konto?',
    weak: 'Schwach',
    fair: 'Mittel',
    strong: 'Stark',
    accountCreated: 'Konto erstellt!',
    redirectingSignIn: 'Weiterleitung zur Anmeldung\u2026',
    // ── Forgot Password ──
    forgotPasswordTitle: 'Passwort vergessen?',
    forgotPasswordDesc: 'Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zur\u00fccksetzen.',
    checkInbox: 'Pr\u00fcfe deinen Posteingang',
    resetLinkSent: 'Wir haben einen Link zum Zur\u00fccksetzen an gesendet',
    clickLinkToReset: 'Klicke auf den Link in der E-Mail, um dein Passwort zur\u00fcckzusetzen.',
    backToLogin: 'Zur\u00fcck zur Anmeldung',
    sendResetLink: 'Link zum Zur\u00fccksetzen senden',
    sending: 'Wird gesendet\u2026',
    // ── Reset Password ──
    resetPassword: 'Passwort zur\u00fccksetzen',
    newPassword: 'Neues Passwort',
    resetPasswordBtn: 'Passwort zur\u00fccksetzen',
    passwordResetComplete: 'Passwort zur\u00fcckgesetzt',
    passwordUpdated: 'Dein Passwort wurde aktualisiert. Du kannst dich jetzt anmelden.',
    invalidResetLink: 'Ung\u00fcltiger Link',
    invalidResetLinkDesc: 'Dieser Link zum Zur\u00fccksetzen ist ung\u00fcltig oder abgelaufen. Bitte fordere einen neuen an.',
    enterNewPassword: 'Gib dein neues Passwort unten ein.',
    goToSignIn: 'Zur Anmeldung',
    // ── Verify Email ──
    verifying: 'Wird verifiziert\u2026',
    emailVerified: 'E-Mail Verifiziert',
    verificationFailed: 'Verifizierung Fehlgeschlagen',
    verificationTokenMissing: 'Verifizierungs-Token fehlt. \u00dcberpr\u00fcfe den Link in deiner E-Mail.',
    emailVerifiedMessage: 'Deine E-Mail wurde verifiziert! Du kannst dich jetzt anmelden.',
    verificationFailedMessage: 'Verifizierung fehlgeschlagen. Das Token ist m\u00f6glicherweise abgelaufen. Bitte fordere ein neues an.',
    // ── Google Callback ──
    signingInGoogle: 'Anmeldung mit Google\u2026',
    // ── CreatePlaylistModal ──
    dropImageUpload: 'Bild ablegen oder klicken zum Hochladen',
    pngJpgLimit: 'PNG, JPG bis 5 MB',
    playlistNamePlaceholder: 'Meine Playlist',
    playlistCoverPreview: 'Cover-Vorschau',
    togglePrivacy: 'Privatsph\u00e4re umschalten',
    // ── TrackRow ──
    addToFavorites: 'Zu Favoriten hinzuf\u00fcgen',
    unfavorite: 'Aus Favoriten entfernen',
    selectTrack: 'Ausw\u00e4hlen',
    currentlyPlaying: 'Wird gerade gespielt',
  } satisfies TranslationMap,
}

export default translations
