import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  getDocs,
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { 
  Project, 
  Issue, 
  Sprint, 
  Channel, 
  Message, 
  ActivityFeedItem, 
  NotificationItem, 
  GitHubConnection, 
  GitHubActivityItem,
  GitHubMemberFork,
  IssueStatus,
  UserPresence,
  UserProfile,
  PresenceStatus,
  RichEmbed,
  ImageAttachment,
  LinkPreview,
  ThreadItem,
  ThreadMessage,
  ThreadType,
  RMMMRiskData
} from '../types';
import { detectLinkPreviews } from '../utils/linkEmbedUtils';
import { initializeProjectChannels } from '../services/seedData';

interface WorkspaceContextType {
  projects: Project[];
  activeProject: Project | null;
  setActiveProject: (p: Project | null) => void;
  createNewProject: (name: string, key: string, description: string) => Promise<Project>;
  addProjectMember: (projectId: string, userEmailOrUid: string) => Promise<{ success: boolean; message: string }>;
  isProjectMember: (projectId: string) => boolean;

  issues: Issue[];
  sprints: Sprint[];
  activeSprint: Sprint | null;
  channels: Channel[];
  activeChannel: Channel | null;
  setActiveChannel: (channel: Channel | null) => void;
  activities: ActivityFeedItem[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  githubConnection: GitHubConnection | null;
  githubActivities: GitHubActivityItem[];
  githubMemberForks: GitHubMemberFork[];
  activeVoiceChannel: Channel | null;
  setActiveVoiceChannel: (channel: Channel | null) => void;
  teamMembers: Array<UserProfile & { presence?: UserPresence }>;

  // Thread Systems (Normal & RMMM Risk)
  threads: ThreadItem[];
  createThread: (threadData: {
    title: string;
    initialContent: string;
    type?: ThreadType;
    channelId?: string;
    parentMessageId?: string;
    tags?: string[];
    images?: ImageAttachment[];
    embeds?: RichEmbed[];
    riskData?: RMMMRiskData;
  }) => Promise<ThreadItem>;
  closeThread: (threadId: string) => Promise<void>;
  reopenThread: (threadId: string) => Promise<void>;
  deleteThread: (threadId: string) => Promise<void>;
  sendThreadMessage: (
    threadId: string,
    content: string,
    attachments?: {
      images?: ImageAttachment[];
      linkPreviews?: LinkPreview[];
      embeds?: RichEmbed[];
    }
  ) => Promise<void>;
  canCloseThread: (thread: ThreadItem) => boolean;

  // CRUD Actions
  createIssue: (issueData: Partial<Issue>) => Promise<Issue>;
  updateIssue: (issueId: string, updates: Partial<Issue>) => Promise<void>;
  moveIssueStatus: (issueId: string, newStatus: IssueStatus) => Promise<void>;
  deleteIssue: (issueId: string) => Promise<void>;
  createSprint: (name: string, goal: string, startDate?: string, endDate?: string) => Promise<void>;
  startSprint: (sprintId: string) => Promise<void>;
  completeSprint: (sprintId: string) => Promise<void>;
  addComment: (issueId: string, content: string) => Promise<void>;
  sendMessage: (
    channelId: string, 
    content: string, 
    replyTo?: { id: string; author: string; content: string },
    attachments?: {
      images?: ImageAttachment[];
      linkPreviews?: LinkPreview[];
      embeds?: RichEmbed[];
    }
  ) => Promise<void>;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  createChannel: (name: string, type: 'text' | 'voice', topic?: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  triggerSimulatedGitHubEvent: (eventType: 'push' | 'pull_request_opened' | 'pull_request_review', details?: any) => Promise<void>;
  associateMemberFork: (userId: string, forkRepo: string, defaultBranch: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, currentUser } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // Active project scoped entities
  const [issues, setIssues] = useState<Issue[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [activeVoiceChannel, setActiveVoiceChannel] = useState<Channel | null>(null);
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [githubConnection, setGithubConnection] = useState<GitHubConnection | null>(null);
  const [githubActivities, setGithubActivities] = useState<GitHubActivityItem[]>([]);
  const [githubMemberForks, setGithubMemberForks] = useState<GitHubMemberFork[]>([]);
  const [teamMembers, setTeamMembers] = useState<Array<UserProfile & { presence?: UserPresence }>>([]);
  const [threads, setThreads] = useState<ThreadItem[]>([]);

  const activeSprint = sprints.find((s) => s.status === 'active') || null;
  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  // Check if a user is a member or owner of a project
  const isProjectMember = useCallback((projectId: string): boolean => {
    if (!currentUser) return false;
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return false;
    if (proj.ownerId === currentUser.uid || proj.leadId === currentUser.uid) return true;
    return Boolean(proj.members && proj.members.includes(currentUser.uid));
  }, [currentUser, projects]);

  // 1. Subscribe to Projects accessible by the logged-in user
  useEffect(() => {
    if (!currentUser) {
      setProjects([]);
      setActiveProject(null);
      return;
    }

    const unsub = onSnapshot(collection(db, 'projects'), (snap) => {
      const list: Project[] = [];
      snap.forEach((d) => {
        const data = d.data() as Project;
        const proj: Project = { ...data, id: d.id };
        // Access Check: user is owner, lead, or listed in members array
        const isMember = (proj.ownerId === currentUser.uid) ||
                         (proj.leadId === currentUser.uid) ||
                         (Array.isArray(proj.members) && proj.members.includes(currentUser.uid));

        if (isMember) {
          list.push(proj);
        }
      });

      setProjects(list);

      // Auto-select or preserve currently active project
      setActiveProject((current) => {
        if (current && list.some((p) => p.id === current.id)) {
          // Re-fetch updated project definition
          return list.find((p) => p.id === current.id) || current;
        }
        return list.length > 0 ? list[0] : null;
      });
    }, (err) => {
      console.warn('Projects snapshot note:', err);
    });

    return () => unsub();
  }, [currentUser]);

  // 2. Subscribe to issues in active project
  useEffect(() => {
    if (!currentUser || !activeProject) {
      setIssues([]);
      return;
    }

    const q = query(collection(db, 'issues'), where('projectId', '==', activeProject.id));
    const unsub = onSnapshot(q, (snap) => {
      const list: Issue[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Issue));
      setIssues(list);
    }, (err) => {
      console.warn('Issues snapshot note:', err);
    });

    return () => unsub();
  }, [currentUser, activeProject?.id]);

  // 3. Subscribe to sprints in active project
  useEffect(() => {
    if (!currentUser || !activeProject) {
      setSprints([]);
      return;
    }

    const q = query(collection(db, 'sprints'), where('projectId', '==', activeProject.id));
    const unsub = onSnapshot(q, (snap) => {
      const list: Sprint[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Sprint));
      // Sort: active first, then future, then completed
      list.sort((a, b) => {
        const order = { active: 0, future: 1, completed: 2 };
        return (order[a.status] ?? 3) - (order[b.status] ?? 3);
      });
      setSprints(list);
    }, (err) => {
      console.warn('Sprints snapshot note:', err);
    });

    return () => unsub();
  }, [currentUser, activeProject?.id]);

  // 4. Subscribe to channels in active project
  useEffect(() => {
    if (!currentUser || !activeProject) {
      setChannels([]);
      setActiveChannel(null);
      return;
    }

    const q = query(collection(db, 'channels'), where('projectId', '==', activeProject.id));
    const unsub = onSnapshot(q, (snap) => {
      const list: Channel[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Channel));
      setChannels(list);
      
      // Default to general text channel if none selected
      setActiveChannel((curr) => {
        if (curr && list.some((c) => c.id === curr.id)) {
          return curr;
        }
        const general = list.find((c) => c.name === 'general' && c.type === 'text');
        return general || list[0] || null;
      });
    }, (err) => {
      console.warn('Channels snapshot note:', err);
    });

    return () => unsub();
  }, [currentUser, activeProject?.id]);

  // 5. Subscribe to activity feed for active project
  useEffect(() => {
    if (!currentUser || !activeProject) {
      setActivities([]);
      return;
    }

    const q = query(collection(db, 'activities'), where('projectId', '==', activeProject.id));
    const unsub = onSnapshot(q, (snap) => {
      const list: ActivityFeedItem[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as ActivityFeedItem));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setActivities(list);
    }, (err) => {
      console.warn('Activities snapshot note:', err);
    });

    return () => unsub();
  }, [currentUser, activeProject?.id]);

  // 6. Subscribe to project-scoped threads and RMMM risk items
  useEffect(() => {
    if (!currentUser || !activeProject) {
      setThreads([]);
      return;
    }

    const threadsQuery = query(collection(db, 'threads'), where('projectId', '==', activeProject.id));
    const unsub = onSnapshot(threadsQuery, (snap) => {
      const list: ThreadItem[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as ThreadItem));
      list.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
      setThreads(list);
    }, (err) => {
      console.warn('Threads onSnapshot note:', err);
    });

    return () => unsub();
  }, [currentUser, activeProject?.id]);

  // 7. Subscribe to real project team members and presence
  useEffect(() => {
    if (!currentUser || !activeProject) {
      setTeamMembers([]);
      return;
    }

    const memberUids = new Set<string>();
    if (activeProject.ownerId) memberUids.add(activeProject.ownerId);
    if (activeProject.leadId) memberUids.add(activeProject.leadId);
    if (Array.isArray(activeProject.members)) {
      activeProject.members.forEach((uid) => memberUids.add(uid));
    }
    memberUids.add(currentUser.uid); // Always include active user

    const unsubUsers = onSnapshot(collection(db, 'users'), (userSnap) => {
      const usersMap: Record<string, UserProfile> = {};
      userSnap.forEach((d) => {
        if (memberUids.has(d.id)) {
          usersMap[d.id] = { uid: d.id, ...d.data() } as UserProfile;
        }
      });

      // Presence documents
      const unsubPresence = onSnapshot(collection(db, 'presence'), (presSnap) => {
        const presenceMap: Record<string, UserPresence> = {};
        presSnap.forEach((p) => {
          if (memberUids.has(p.id)) {
            presenceMap[p.id] = p.data() as UserPresence;
          }
        });

        const combined = Array.from(memberUids).map((uid) => {
          const u = usersMap[uid] || {
            uid,
            displayName: uid === currentUser.uid ? (profile?.displayName || 'Current User') : 'Team Member',
            email: uid === currentUser.uid ? (profile?.email || '') : '',
            photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`,
            role: uid === activeProject.ownerId ? 'owner' : 'member',
          };
          const p = presenceMap[uid];
          let status: PresenceStatus = (p?.status as PresenceStatus) || 'offline';
          if (p?.lastSeen) {
            const diffMin = (Date.now() - new Date(p.lastSeen).getTime()) / 60000;
            if (diffMin > 4 && status === 'online') {
              status = 'away';
            }
          }
          return {
            ...u,
            presence: p ? { ...p, status } : { userId: uid, status: 'offline' as PresenceStatus, lastSeen: '' },
          };
        });

        setTeamMembers(combined);
      });

      return () => unsubPresence();
    });

    return () => unsubUsers();
  }, [currentUser, activeProject?.id, activeProject?.members, activeProject?.ownerId, activeProject?.leadId, profile]);

  // Log workspace activity helper
  const logActivity = async (type: ActivityFeedItem['type'], message: string, issueKey?: string, issueTitle?: string) => {
    if (!activeProject || !currentUser) return;
    try {
      const actId = `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      await setDoc(doc(db, 'activities', actId), {
        id: actId,
        projectId: activeProject.id,
        userId: profile?.uid || currentUser.uid,
        userName: profile?.displayName || currentUser.displayName || 'Engineer',
        userAvatar: profile?.photoURL || currentUser.photoURL || '',
        type,
        message,
        issueKey: issueKey || '',
        issueTitle: issueTitle || '',
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Log activity note:', e);
    }
  };

  // Create New Project with strict ownership
  const createNewProject = async (name: string, key: string, description: string): Promise<Project> => {
    if (!currentUser) throw new Error('You must be logged in to create a project.');

    const cleanKey = key.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'PRJ';
    const projectId = `proj-${Date.now()}-${cleanKey.toLowerCase()}`;
    const now = new Date().toISOString();

    const newProject: Project = {
      id: projectId,
      workspaceId: 'ws-apex-main',
      name: name.trim(),
      key: cleanKey,
      description: description.trim(),
      ownerId: currentUser.uid,
      leadId: currentUser.uid,
      members: [currentUser.uid],
      createdAt: now,
    };

    await setDoc(doc(db, 'projects', projectId), newProject);

    // Initialize real communication channels
    await initializeProjectChannels(
      projectId, 
      currentUser.uid, 
      profile?.displayName || currentUser.displayName || 'Lead Architect'
    );

    setActiveProject(newProject);
    await logActivity('member_joined', `created project ${newProject.name} [${newProject.key}]`);
    return newProject;
  };

  // Add Member to active Project
  const addProjectMember = async (projectId: string, userEmailOrUid: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) throw new Error('Login required.');
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) throw new Error('Project not found.');

    const queryTarget = userEmailOrUid.trim().toLowerCase();

    // Search user in Firestore
    let targetUid: string | null = null;
    let targetName = 'Member';

    // 1. Check direct UID
    const userDoc = await getDoc(doc(db, 'users', queryTarget));
    if (userDoc.exists()) {
      targetUid = userDoc.id;
      targetName = userDoc.data().displayName || targetName;
    } else {
      // 2. Check by email
      const q = query(collection(db, 'users'), where('email', '==', queryTarget));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const u = snap.docs[0];
        targetUid = u.id;
        targetName = u.data().displayName || targetName;
      }
    }

    if (!targetUid) {
      return { success: false, message: `No registered user found with email or ID: "${userEmailOrUid}".` };
    }

    const currentMembers = Array.isArray(proj.members) ? [...proj.members] : [proj.ownerId];
    if (currentMembers.includes(targetUid)) {
      return { success: true, message: `${targetName} is already a member of this project.` };
    }

    currentMembers.push(targetUid);
    await updateDoc(doc(db, 'projects', projectId), {
      members: currentMembers,
    });

    await logActivity('member_joined', `added ${targetName} to project ${proj.name}`);
    return { success: true, message: `Successfully added ${targetName} to project ${proj.name}!` };
  };

  // Issue CRUD
  const createIssue = async (issueData: Partial<Issue>): Promise<Issue> => {
    if (!activeProject) throw new Error('Select a project first.');
    const nextNum = issues.length + 101;
    const key = `${activeProject.key}-${nextNum}`;
    const id = `issue-${Date.now()}`;
    const newIssue: Issue = {
      id,
      projectId: activeProject.id,
      key,
      sprintId: issueData.sprintId || activeSprint?.id || '',
      title: issueData.title || 'Untitled Issue',
      description: issueData.description || '',
      status: issueData.status || 'todo',
      priority: issueData.priority || 'medium',
      type: issueData.type || 'story',
      reporterId: profile?.uid || currentUser?.uid || '',
      assigneeId: issueData.assigneeId || profile?.uid || currentUser?.uid || '',
      storyPoints: issueData.storyPoints || 3,
      dueDate: issueData.dueDate || '',
      labels: issueData.labels || ['general'],
      branchName: issueData.branchName || '',
      prNumber: issueData.prNumber,
      prUrl: issueData.prUrl || '',
      prStatus: issueData.prStatus || undefined,
      repoName: issueData.repoName || '',
      forkName: issueData.forkName || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setIssues((prev) => [newIssue, ...prev]);
    await setDoc(doc(db, 'issues', id), newIssue);
    await logActivity('task_created', `created issue ${key}: "${newIssue.title}"`, key, newIssue.title);
    return newIssue;
  };

  const updateIssue = async (issueId: string, updates: Partial<Issue>) => {
    setIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, ...updates } : i)));
    const issueRef = doc(db, 'issues', issueId);
    const updatedData = { ...updates, updatedAt: new Date().toISOString() };
    await updateDoc(issueRef, updatedData);

    const issue = issues.find((i) => i.id === issueId);
    if (updates.status && issue && updates.status !== issue.status) {
      await logActivity(
        updates.status === 'done' ? 'task_completed' : 'task_moved',
        `transitioned ${issue.key} to ${updates.status.toUpperCase()}`,
        issue.key,
        issue.title
      );
    }
  };

  const moveIssueStatus = async (issueId: string, newStatus: IssueStatus) => {
    await updateIssue(issueId, { status: newStatus });
  };

  const deleteIssue = async (issueId: string) => {
    const issue = issues.find((i) => i.id === issueId);
    setIssues((prev) => prev.filter((i) => i.id !== issueId));
    await deleteDoc(doc(db, 'issues', issueId));
    if (issue) {
      await logActivity('task_moved', `deleted issue ${issue.key}`, issue.key, issue.title);
    }
  };

  // Sprint management
  const createSprint = async (name: string, goal: string, startDate?: string, endDate?: string) => {
    if (!activeProject) return;
    const id = `sprint-${Date.now()}`;
    const sprintNumber = sprints.length + 1;
    const newSprint: Sprint = {
      id,
      projectId: activeProject.id,
      name,
      goal,
      status: 'future',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      sprintNumber,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'sprints', id), newSprint);
    await logActivity('task_moved', `created sprint ${name}`);
  };

  const startSprint = async (sprintId: string) => {
    await updateDoc(doc(db, 'sprints', sprintId), {
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
    });
    const s = sprints.find((sp) => sp.id === sprintId);
    await logActivity('task_moved', `started sprint "${s?.name || sprintId}"`);
  };

  const completeSprint = async (sprintId: string) => {
    await updateDoc(doc(db, 'sprints', sprintId), {
      status: 'completed',
      endDate: new Date().toISOString().split('T')[0],
    });
    const s = sprints.find((sp) => sp.id === sprintId);
    await logActivity('task_moved', `completed sprint "${s?.name || sprintId}"`);
  };

  // Comments
  const addComment = async (issueId: string, content: string) => {
    if (!currentUser) return;
    const commentId = `comment-${Date.now()}`;
    await setDoc(doc(db, 'comments', commentId), {
      id: commentId,
      issueId,
      authorId: profile?.uid || currentUser.uid,
      authorName: profile?.displayName || currentUser.displayName || 'Engineer',
      authorPhotoURL: profile?.photoURL || currentUser.photoURL || '',
      content,
      createdAt: new Date().toISOString(),
    });
    const issue = issues.find((i) => i.id === issueId);
    await logActivity('comment_added', `commented on ${issue?.key || 'issue'}: "${content.slice(0, 60)}"`, issue?.key, issue?.title);
  };

  const sendMessage = async (
    channelId: string, 
    content: string, 
    replyTo?: { id: string; author: string; content: string },
    attachments?: {
      images?: ImageAttachment[];
      linkPreviews?: LinkPreview[];
      embeds?: RichEmbed[];
    }
  ) => {
    if (!currentUser) return;
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const detectedLinks = detectLinkPreviews(content);
    const finalLinks = attachments?.linkPreviews?.length 
      ? attachments.linkPreviews 
      : (detectedLinks.length ? detectedLinks : undefined);

    const msg: Message = {
      id: msgId,
      channelId,
      authorId: profile?.uid || currentUser.uid,
      authorName: profile?.displayName || currentUser.displayName || 'Engineer',
      authorPhotoURL: profile?.photoURL || currentUser.photoURL || '',
      content,
      replyToId: replyTo?.id,
      replyToAuthor: replyTo?.author,
      replyToContent: replyTo?.content,
      reactions: {},
      images: attachments?.images?.length ? attachments.images : undefined,
      linkPreviews: finalLinks,
      embeds: attachments?.embeds?.length ? attachments.embeds : undefined,
      createdAt: new Date().toISOString(),
    };
    
    await setDoc(doc(db, 'messages', msgId), msg);
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    const uid = profile?.uid || currentUser?.uid;
    if (!uid) return;
    // Realtime reaction toggle handled on Firestore doc
  };

  const deleteMessage = async (messageId: string) => {
    await deleteDoc(doc(db, 'messages', messageId));
  };

  const createChannel = async (name: string, type: 'text' | 'voice', topic?: string) => {
    if (!activeProject || !currentUser) return;
    const id = `chan-${Date.now()}`;
    const cleanName = name.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const newChan: Channel = {
      id,
      projectId: activeProject.id,
      name: cleanName,
      type,
      topic: topic || '',
      createdBy: profile?.uid || currentUser.uid,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'channels', id), newChan);
    await logActivity('member_joined', `created #${cleanName} ${type} channel`);
    if (type === 'text') setActiveChannel(newChan);
  };

  const markNotificationAsRead = async (notificationId: string) => {
    await updateDoc(doc(db, 'notifications', notificationId), { read: true });
  };

  const markAllNotificationsAsRead = async () => {
    for (const n of notifications) {
      if (!n.read) {
        await updateDoc(doc(db, 'notifications', n.id), { read: true });
      }
    }
  };

  const associateMemberFork = async (userId: string, forkRepo: string, defaultBranch: string) => {
    if (!activeProject) return;
    const forkId = `fork-${userId}`;
    const member = teamMembers.find((m) => m.uid === userId);
    const memberFork: GitHubMemberFork = {
      id: forkId,
      projectId: activeProject.id,
      userId,
      githubUsername: member?.githubUsername || 'dev',
      forkRepo,
      defaultBranch,
      updatedAt: new Date().toISOString(),
    };
    setGithubMemberForks((prev) => [...prev.filter((f) => f.userId !== userId), memberFork]);
    await logActivity('code_pushed', `associated fork ${forkRepo} (${defaultBranch}) with ${member?.displayName || userId}`);
  };

  const triggerSimulatedGitHubEvent = async (
    eventType: 'push' | 'pull_request_opened' | 'pull_request_review',
    details?: any
  ) => {
    if (!activeProject || !currentUser) return;
    const actId = `gh-act-${Date.now()}`;
    const author = profile?.displayName || currentUser.displayName || 'Engineer';
    let activityRecord: GitHubActivityItem;

    if (eventType === 'push') {
      const commitSha = Math.random().toString(16).substring(2, 9);
      activityRecord = {
        id: actId,
        projectId: activeProject.id,
        repoName: activeProject.name.toLowerCase().replace(/\s+/g, '-'),
        eventType: 'push',
        author,
        commitSha,
        commitMessage: details?.message || 'feat(core): update distributed cluster sync & pipeline',
        branch: details?.branch || 'main',
        timestamp: new Date().toISOString(),
      };
      await logActivity('code_pushed', `pushed commit [${commitSha}] to ${activityRecord.branch}`);
    } else if (eventType === 'pull_request_opened') {
      const prNumber = Math.floor(Math.random() * 20) + 85;
      activityRecord = {
        id: actId,
        projectId: activeProject.id,
        repoName: activeProject.name.toLowerCase().replace(/\s+/g, '-'),
        eventType: 'pull_request_opened',
        author,
        prNumber,
        prTitle: details?.title || 'feat: add real-time signaling & peer audio streams',
        prState: 'Open',
        prUrl: `https://github.com/project/pull/${prNumber}`,
        branch: 'feature/pipeline',
        timestamp: new Date().toISOString(),
      };
      await logActivity('pr_opened', `opened PR #${prNumber}: ${activityRecord.prTitle}`);
    } else {
      activityRecord = {
        id: actId,
        projectId: activeProject.id,
        repoName: activeProject.name.toLowerCase().replace(/\s+/g, '-'),
        eventType: 'pull_request_review',
        author,
        prNumber: 82,
        prTitle: 'Implement WebRTC audio room and peer signaling',
        prState: 'Approved & Review Finished',
        prUrl: `https://github.com/project/pull/82`,
        branch: 'main',
        timestamp: new Date().toISOString(),
      };
      await logActivity('pr_updated', `submitted review for PR #82: Approved with no blocking feedback`);
    }

    await setDoc(doc(db, 'githubActivity', actId), activityRecord);
  };

  // -------------------------------------------------------------
  // THREAD SYSTEM (NORMAL THREADS & RMMM RISK THREADS)
  // -------------------------------------------------------------

  const canCloseThread = (thread: ThreadItem): boolean => {
    const currentUid = profile?.uid || currentUser?.uid;
    if (!currentUid) return false;
    if (thread.authorId === currentUid) return true;
    if (activeProject && (activeProject.ownerId === currentUid || activeProject.leadId === currentUid)) return true;
    if (profile?.role === 'owner') return true;
    return false;
  };

  const createThread = async (threadData: {
    title: string;
    initialContent: string;
    type?: ThreadType;
    channelId?: string;
    parentMessageId?: string;
    tags?: string[];
    images?: ImageAttachment[];
    embeds?: RichEmbed[];
    riskData?: RMMMRiskData;
  }): Promise<ThreadItem> => {
    if (!activeProject || !currentUser) throw new Error('Active project required.');
    const id = `th-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const currentUid = profile?.uid || currentUser.uid;
    const currentName = profile?.displayName || currentUser.displayName || 'Engineer';
    const currentPhoto = profile?.photoURL || currentUser.photoURL || '';
    const now = new Date().toISOString();

    const linkPreviews = detectLinkPreviews(threadData.initialContent);

    const newThread: ThreadItem = {
      id,
      projectId: activeProject.id,
      channelId: threadData.channelId,
      parentMessageId: threadData.parentMessageId,
      type: threadData.type || 'normal',
      title: threadData.title.trim(),
      initialContent: threadData.initialContent.trim(),
      status: 'unsolved',
      authorId: currentUid,
      authorName: currentName,
      authorPhotoURL: currentPhoto,
      createdAt: now,
      updatedAt: now,
      replyCount: 0,
      tags: threadData.tags || [],
      images: threadData.images,
      linkPreviews: linkPreviews.length ? linkPreviews : undefined,
      embeds: threadData.embeds,
      riskData: threadData.riskData,
    };

    setThreads((prev) => [newThread, ...prev]);
    await setDoc(doc(db, 'threads', id), newThread);

    await logActivity(
      'task_created',
      `created ${newThread.type === 'risk' ? 'RMMM Risk Thread' : 'Thread'}: "${newThread.title.slice(0, 45)}"`
    );

    return newThread;
  };

  const closeThread = async (threadId: string) => {
    const target = threads.find((t) => t.id === threadId);
    if (!target) return;

    if (!canCloseThread(target)) {
      throw new Error('Only the thread creator or project owner can resolve this.');
    }

    const currentUid = profile?.uid || currentUser?.uid || '';
    const currentName = profile?.displayName || currentUser?.displayName || 'Engineer';
    const now = new Date().toISOString();

    const updates: Partial<ThreadItem> = {
      status: 'solved',
      solvedAt: now,
      solvedById: currentUid,
      solvedByName: currentName,
      updatedAt: now,
    };

    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, ...updates } : t)));
    await updateDoc(doc(db, 'threads', threadId), updates);

    await logActivity(
      'task_completed',
      `marked ${target.type === 'risk' ? 'Risk' : 'Thread'} "${target.title.slice(0, 45)}" as Solved/Mitigated`
    );
  };

  const reopenThread = async (threadId: string) => {
    const target = threads.find((t) => t.id === threadId);
    if (!target) return;

    if (!canCloseThread(target)) {
      throw new Error('Only the thread creator or project owner can reopen this.');
    }

    const now = new Date().toISOString();
    const updates: Partial<ThreadItem> = {
      status: 'unsolved',
      solvedAt: undefined,
      solvedById: undefined,
      solvedByName: undefined,
      updatedAt: now,
    };

    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, ...updates } : t)));
    await updateDoc(doc(db, 'threads', threadId), {
      status: 'unsolved',
      solvedAt: null,
      solvedById: null,
      solvedByName: null,
      updatedAt: now,
    });

    await logActivity(
      'task_moved',
      `reopened ${target.type === 'risk' ? 'Risk' : 'Thread'} "${target.title.slice(0, 45)}"`
    );
  };

  const deleteThread = async (threadId: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== threadId));
    await deleteDoc(doc(db, 'threads', threadId));
  };

  const sendThreadMessage = async (
    threadId: string,
    content: string,
    attachments?: {
      images?: ImageAttachment[];
      linkPreviews?: LinkPreview[];
      embeds?: RichEmbed[];
    }
  ) => {
    if (!activeProject || !currentUser) return;
    const id = `thmsg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const currentUid = profile?.uid || currentUser.uid;
    const currentName = profile?.displayName || currentUser.displayName || 'Engineer';
    const currentPhoto = profile?.photoURL || currentUser.photoURL || '';
    const now = new Date().toISOString();

    const autoLinkPreviews = attachments?.linkPreviews || detectLinkPreviews(content);

    const messageRecord: ThreadMessage = {
      id,
      threadId,
      projectId: activeProject.id,
      authorId: currentUid,
      authorName: currentName,
      authorPhotoURL: currentPhoto,
      content: content.trim(),
      images: attachments?.images,
      linkPreviews: autoLinkPreviews.length ? autoLinkPreviews : undefined,
      embeds: attachments?.embeds,
      createdAt: now,
    };

    await setDoc(doc(db, 'threadMessages', id), messageRecord);

    const target = threads.find((t) => t.id === threadId);
    const newReplyCount = (target?.replyCount || 0) + 1;
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, replyCount: newReplyCount, lastReplyAt: now } : t))
    );
    await updateDoc(doc(db, 'threads', threadId), {
      replyCount: newReplyCount,
      lastReplyAt: now,
      updatedAt: now,
    });
  };

  return (
    <WorkspaceContext.Provider
      value={{
        projects,
        activeProject,
        setActiveProject,
        createNewProject,
        addProjectMember,
        isProjectMember,
        issues,
        sprints,
        activeSprint,
        channels,
        activeChannel,
        setActiveChannel,
        activities,
        notifications,
        unreadNotificationCount,
        githubConnection,
        githubActivities,
        githubMemberForks,
        activeVoiceChannel,
        setActiveVoiceChannel,
        teamMembers,
        threads,
        createThread,
        closeThread,
        reopenThread,
        deleteThread,
        sendThreadMessage,
        canCloseThread,
        createIssue,
        updateIssue,
        moveIssueStatus,
        deleteIssue,
        createSprint,
        startSprint,
        completeSprint,
        addComment,
        sendMessage,
        toggleReaction,
        deleteMessage,
        createChannel,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        triggerSimulatedGitHubEvent,
        associateMemberFork,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return context;
};
