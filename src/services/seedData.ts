import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Channel } from '../types';

/**
 * Creates default communication channels when a new project is created by a user.
 * No hardcoded issues, users, or fake metrics.
 */
export async function initializeProjectChannels(projectId: string, userId: string, userName: string) {
  try {
    const generalChannel: Channel = {
      id: `chan-gen-${projectId}`,
      projectId,
      name: 'general',
      type: 'text',
      topic: 'Team updates, architecture sync, and daily standup discussions.',
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };

    const announcementsChannel: Channel = {
      id: `chan-ann-${projectId}`,
      projectId,
      name: 'announcements',
      type: 'text',
      topic: 'Important sprint milestones, release notices, and deployment alerts.',
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };

    const voiceChannel: Channel = {
      id: `chan-voice-${projectId}`,
      projectId,
      name: 'Team Voice Lounge',
      type: 'voice',
      topic: 'Open drop-in voice room for pair programming & standups.',
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'channels', generalChannel.id), generalChannel);
    await setDoc(doc(db, 'channels', announcementsChannel.id), announcementsChannel);
    await setDoc(doc(db, 'channels', voiceChannel.id), voiceChannel);

    // Initial welcome message in #general
    const welcomeMsgRef = doc(db, 'messages', `msg-welcome-${projectId}`);
    await setDoc(welcomeMsgRef, {
      id: `msg-welcome-${projectId}`,
      channelId: generalChannel.id,
      authorId: userId,
      authorName: userName,
      authorPhotoURL: '',
      content: '🚀 Project created! Welcome to your real-time Agile workspace. Create your backlog tasks, define sprints, start WebRTC voice discussions, and register RMMM project risks.',
      reactions: { '🎉': [userId] },
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error creating default project channels:', err);
  }
}
