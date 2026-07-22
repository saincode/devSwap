import React from 'react';

const VEGGIE_AVATARS = [
  { id: '1', url: '/avatars/avatar_carrot.png' },
  { id: '2', url: '/avatars/avatar_broccoli.png' },
  { id: '3', url: '/avatars/avatar_tomato.png' },
  { id: '4', url: '/avatars/avatar_eggplant.png' },
  { id: '5', url: '/avatars/avatar_corn.png' },
  { id: '6', url: '/avatars/avatar_pea.png' },
];
const getAvatarUrl = (id) =>
  VEGGIE_AVATARS.find(a => a.id === String(id))?.url || null;

export function ChatSidebar({ conversations, loadingConvs, selectedPartner, onSelect }) {
  return (
    <aside className="chat-sidebar">
      <div className="chat-sidebar-header">
        <h2>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',marginRight:7,color:'#f97316'}}>
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          Messages
        </h2>
      </div>

      {loadingConvs ? (
        <div className="chat-loading"><div className="chat-spinner" /></div>
      ) : conversations.length === 0 ? (
        <div className="chat-sidebar-empty">
          <p>No conversations yet.</p>
          <p>Start chatting from your Matches!</p>
        </div>
      ) : (
        <ul className="conversation-list">
          {conversations.map((conv) => (
            <li
              key={conv.conversationId}
              className={`conversation-item ${selectedPartner?._id === conv.partner?._id ? 'active' : ''}`}
              onClick={() => onSelect(conv.partner)}
            >
              <div className="conv-avatar conv-avatar--img">
                {getAvatarUrl(conv.partner?.avatar) ? (
                  <img src={getAvatarUrl(conv.partner?.avatar)} alt={conv.partner?.name} className="conv-avatar-img" />
                ) : (
                  conv.partner?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="conv-info">
                <div className="conv-name">{conv.partner?.name}</div>
                <div className="conv-last-msg">
                  {conv.lastMessageType === 'code' && <span style={{color:'#f97316',fontWeight:700}}>{'</> '}</span>}
                  {conv.lastMessageType === 'file' && <span style={{color:'#f97316',fontWeight:700}}>{'↗ '}</span>}
                  {conv.lastMessageType === 'link' && <span style={{color:'#f97316',fontWeight:700}}>{'⬡ '}</span>}
                  {conv.lastMessage}
                </div>
              </div>
              <div className="conv-meta">
                {conv.lastMessageTime && (
                  <div className="conv-time">
                    {new Date(conv.lastMessageTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                )}
                {conv.unread > 0 && (
                  <span className="conv-unread-badge">{conv.unread}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

export default ChatSidebar;
