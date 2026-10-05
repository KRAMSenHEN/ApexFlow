export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role?: 'owner' | 'admin' | 'member';
  githubUsername?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPresence {
  userId: string;
  status: PresenceStatus;
  lastSeen: string;
  currentActivity?: string;
  currentProjectId?: string;
  currentIssueId?: string;
  currentVoiceChannelId?: string;
  isMuted?: boolean;
  isDeafened?: boolean;
  isCameraOn?: boolean;
  isScreenSharing?: boolean;
  updatedAt?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  key: string;
  description: string;
  leadId: string;
  ownerId: string;
  createdAt: string;
  members?: string[];
}

export type IssueStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';
export type IssuePriority = 'urgent' | 'high' | 'medium' | 'low';
export type IssueType = 'story' | 'task' | 'bug' | 'epic';

export interface Issue {
  id: string;
  projectId: string;
  key: string;
  sprintId?: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  type: IssueType;
  reporterId: string;
  assigneeId?: string;
  storyPoints?: number;
  dueDate?: string;
  labels?: string[];
  branchName?: string;
  prNumber?: number;
  prUrl?: string;
  prStatus?: 'open' | 'draft' | 'review_requested' | 'approved' | 'merged' | 'closed';
  repoName?: string;
  forkName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal: string;
  status: 'future' | 'active' | 'completed';
  startDate?: string;
  endDate?: string;
  sprintNumber?: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  issueId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export type ChannelType = 'text' | 'voice';

export interface Channel {
  id: string;
  projectId: string;
  name: string;
  type: ChannelType;
  topic?: string;
  isPrivate?: boolean;
  createdBy: string;
  createdAt: string;
}

export interface MessageReaction {
  emoji: string;
  users: string[]; // user UIDs
}

export interface EmbedField {
  id: string;
  name: string;
  value: string;
  inline?: boolean;
}

export interface EmbedButton {
  id: string;
  label: string;
  url: string;
  style: 'primary' | 'secondary' | 'success' | 'danger' | 'purple' | 'outline';
  icon?: string;
}

export type EmbedTransition = 'none' | 'fade' | 'slide-up' | 'slide-down' | 'pop-scale' | 'flip-3d' | 'liquid-glow' | 'shimmer';
export type EmbedAmbient = 'none' | 'pulse-glow' | 'float' | 'gradient-shift';

export interface EmbedTypography {
  fontFamily: 'default' | 'sans' | 'mono' | 'serif' | 'display' | 'orbitron';
  fontSize: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  alignment: 'left' | 'center' | 'right' | 'justify';
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrikethrough?: boolean;
  isGradientText?: boolean;
  textColor?: string;
  highlightColor?: string;
}

export interface EmbedDesign {
  themePreset: 'custom' | 'slate' | 'cyberpunk' | 'aurora' | 'sunset' | 'matrix' | 'glass' | 'neon';
  accentColor: string;
  bgType: 'solid' | 'linear-gradient' | 'radial-gradient' | 'glassmorphism';
  bgColor: string;
  bgGradientStart?: string;
  bgGradientEnd?: string;
  borderStyle: 'solid' | 'dashed' | 'gradient' | 'neon-glow' | 'none';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  elevation: 'none' | 'subtle' | 'float' | '3d-pop' | 'neon-glow';
}

export interface EmbedAnimation {
  transition: EmbedTransition;
  speed: 'fast' | 'normal' | 'dramatic';
  ambient: EmbedAmbient;
}

export interface RichEmbed {
  id: string;
  type: 'custom' | 'link' | 'image' | 'presentation';
  title?: string;
  description?: string;
  url?: string;
  authorName?: string;
  authorIcon?: string;
  authorUrl?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  footerText?: string;
  footerIcon?: string;
  timestamp?: string;
  fields?: EmbedField[];
  buttons?: EmbedButton[];
  typography?: EmbedTypography;
  design?: EmbedDesign;
  animation?: EmbedAnimation;
}

export interface ImageAttachment {
  id: string;
  url: string;
  name: string;
  size?: number;
  width?: number;
  height?: number;
  isGif?: boolean;
  mediaType?: 'image' | 'gif';
}

export interface LinkPreview {
  url: string;
  title: string;
  description: string;
  siteName: string;
  favicon?: string;
  imageUrl?: string;
  domain: string;
}

export interface Message {
  id: string;
  channelId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
  replyToId?: string;
  replyToAuthor?: string;
  replyToContent?: string;
  reactions?: Record<string, string[]>; // emoji -> array of user uids
  images?: ImageAttachment[];
  linkPreviews?: LinkPreview[];
  embeds?: RichEmbed[];
  createdAt: string;
  updatedAt?: string;
}

export interface ActivityFeedItem {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'task_created' | 'task_moved' | 'task_completed' | 'comment_added' | 'code_pushed' | 'pr_opened' | 'pr_updated' | 'call_joined' | 'member_joined';
  message: string;
  issueKey?: string;
  issueTitle?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  link?: string;
  type: 'assignment' | 'mention' | 'status' | 'github';
  read: boolean;
  createdAt: string;
}

export interface GitHubConnection {
  id: string;
  projectId: string;
  repoName: string;
  repoOwner: string;
  defaultBranch: string;
  connectedAt: string;
  status: 'connected' | 'disconnected';
}

export interface GitHubMemberFork {
  id: string;
  projectId: string;
  userId: string;
  githubUsername: string;
  forkRepo: string;
  defaultBranch: string;
  updatedAt: string;
}

export interface GitHubActivityItem {
  id: string;
  projectId: string;
  repoName: string;
  eventType: 'push' | 'pull_request_opened' | 'pull_request_review' | 'pull_request_merged' | 'branch_created';
  author: string;
  commitSha?: string;
  commitMessage?: string;
  prNumber?: number;
  prTitle?: string;
  prState?: string;
  prUrl?: string;
  branch?: string;
  timestamp: string;
}

export interface VoiceParticipant {
  userId: string;
  displayName: string;
  photoURL?: string;
  isMuted: boolean;
  isDeafened: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  joinedAt: string;
}

// -------------------------------------------------------------
// THREAD SYSTEM & RMMM RISK FRAMEWORK
// -------------------------------------------------------------

export type ThreadType = 'normal' | 'risk';
export type ThreadStatus = 'unsolved' | 'solved';

export type RiskCategory = 
  | 'Technical' 
  | 'Schedule' 
  | 'Budget' 
  | 'Resource' 
  | 'Security' 
  | 'Operational' 
  | 'Dependency';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'severe';

export interface RMMMRiskData {
  riskId: string; // e.g. RISK-101 or APEX-RSK-101
  category: RiskCategory;
  // Risk Analysis & Quantification (1-5 scale)
  probability: number; // 1 (Very Low <10%) to 5 (Critical >70%)
  impact: number; // 1 (Negligible) to 5 (Catastrophic)
  exposureScore: number; // probability * impact (1 - 25)
  riskLevel: RiskLevel; // low (1-4), moderate (5-9), high (10-16), severe (17-25)
  
  // RMMM Process Components
  mitigationPlan: string; // Proactive actions to eliminate or reduce probability
  monitoringStrategy: string; // Triggers, metrics, and symptoms to watch
  managementPlan: string; // Contingency reaction plan if the risk triggers
  
  // Ownership & Organization
  ownerName: string;
  ownerId?: string;
  reviewDate?: string;
  targetSprintId?: string;
  targetIssueKey?: string;
}

export interface ThreadItem {
  id: string;
  projectId: string; // Strictly scoped to project!
  channelId?: string;
  parentMessageId?: string;
  type: ThreadType; // 'normal' | 'risk'
  title: string;
  initialContent: string;
  status: ThreadStatus; // 'unsolved' | 'solved'
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  createdAt: string;
  updatedAt: string;
  solvedAt?: string;
  solvedById?: string;
  solvedByName?: string;
  replyCount: number;
  lastReplyAt?: string;
  tags?: string[];
  images?: ImageAttachment[];
  linkPreviews?: LinkPreview[];
  embeds?: RichEmbed[];
  riskData?: RMMMRiskData;
}

export interface ThreadMessage {
  id: string;
  threadId: string;
  projectId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
  reactions?: Record<string, string[]>;
  images?: ImageAttachment[];
  linkPreviews?: LinkPreview[];
  embeds?: RichEmbed[];
  createdAt: string;
}
