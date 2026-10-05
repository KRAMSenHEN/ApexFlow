/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { VoiceProvider, useVoice } from './context/VoiceContext';
import { GlobalNavbar } from './components/layout/GlobalNavbar';
import { ProjectSidebar } from './components/layout/ProjectSidebar';
import { ActiveTab } from './components/layout/Sidebar';
import { BoardView } from './components/board/BoardView';
import { BacklogView } from './components/backlog/BacklogView';
import { ChatView } from './components/chat/ChatView';
import { ProjectThreadsView } from './components/threads/ProjectThreadsView';
import { RiskSystemView } from './components/risk/RiskSystemView';
import { VoiceView } from './components/voice/VoiceView';
import { VoiceFloatingBar } from './components/voice/VoiceFloatingBar';
import { GitHubView } from './components/github/GitHubView';
import { ActivityFeedView } from './components/activity/ActivityFeedView';
import { MembersView } from './components/members/MembersView';
import { IssueDetailModal } from './components/issues/IssueDetailModal';
import { CreateIssueModal } from './components/modals/CreateIssueModal';
import { CreateChannelModal } from './components/modals/CreateChannelModal';
import { CreateProjectModal } from './components/modals/CreateProjectModal';
import { CommandPalette } from './components/modals/CommandPalette';
import { SignInView } from './components/auth/SignInView';
import { Issue, IssueStatus } from './types';
import { FolderGit2, Plus } from 'lucide-react';

const MainWorkspaceContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('board');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false);
  const [createIssueDefaultStatus, setCreateIssueDefaultStatus] = useState<IssueStatus>('todo');
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { activeProject, setActiveChannel } = useWorkspace();
  const { isJoined } = useVoice();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b0f19] text-slate-100 antialiased font-sans">
      {/* 1. Leftmost Navigation Rail */}
      <GlobalNavbar
        onOpenCreateIssue={() => {
          setCreateIssueDefaultStatus('todo');
          setIsCreateIssueOpen(true);
        }}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* 2. Collapsible Project Navigation Sidebar */}
      <ProjectSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateChannel={() => setIsCreateChannelOpen(true)}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* 3. Center Main Stage Content */}
      <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden relative">
        {!activeProject ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-xl">
              <FolderGit2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">No Project Selected</h2>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                You are not currently part of any projects. Create a new agile project or have a team member add your email to their project.
              </p>
            </div>
            <button
              onClick={() => setIsCreateProjectOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Project</span>
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'board' && (
              <BoardView
                onSelectIssue={(issue) => setSelectedIssue(issue)}
                onOpenCreateIssue={(status) => {
                  setCreateIssueDefaultStatus(status || 'todo');
                  setIsCreateIssueOpen(true);
                }}
              />
            )}

            {activeTab === 'backlog' && (
              <BacklogView
                onSelectIssue={(issue) => setSelectedIssue(issue)}
                onOpenCreateIssue={() => {
                  setCreateIssueDefaultStatus('backlog');
                  setIsCreateIssueOpen(true);
                }}
              />
            )}

            {activeTab === 'chat' && <ChatView />}
            {activeTab === 'threads' && <ProjectThreadsView />}
            {activeTab === 'risks' && <RiskSystemView />}

            {activeTab === 'voice' && <VoiceView />}

            {activeTab === 'github' && <GitHubView />}

            {activeTab === 'activity' && <ActivityFeedView />}

            {activeTab === 'members' && <MembersView />}

            {/* Floating Voice Room Indicator when browsing other pages */}
            {activeTab !== 'voice' && (
              <VoiceFloatingBar onOpenVoiceTab={() => setActiveTab('voice')} />
            )}
          </>
        )}
      </main>

      {/* Slide-Over & Dialog Modals */}
      <IssueDetailModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
      />

      <CreateIssueModal
        isOpen={isCreateIssueOpen}
        onClose={() => setIsCreateIssueOpen(false)}
        defaultStatus={createIssueDefaultStatus}
      />

      <CreateChannelModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
      />

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectIssue={(issue) => setSelectedIssue(issue)}
        onSelectTab={(tab) => setActiveTab(tab)}
        onSelectChannel={(channel) => {
          setActiveChannel(channel);
          setActiveTab(channel.type === 'voice' ? 'voice' : 'chat');
        }}
      />
    </div>
  );
};

const WorkspaceRoot: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-[#0b0f19] flex flex-col items-center justify-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-[#0747A6] flex items-center justify-center text-white font-extrabold text-xl shadow-xl shadow-blue-900/40 animate-pulse">
          Δ
        </div>
        <span className="text-xs text-slate-400 font-mono">Loading ApexFlow Workspace...</span>
      </div>
    );
  }

  // Strict Login Gate: Nobody can access without login!
  if (!currentUser) {
    return <SignInView />;
  }

  return (
    <WorkspaceProvider>
      <VoiceProvider>
        <MainWorkspaceContent />
      </VoiceProvider>
    </WorkspaceProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceRoot />
    </AuthProvider>
  );
}
