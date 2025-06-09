import React, { useState, useRef, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, IconButton, Paper, TextField, CircularProgress, Fade, Chip, Typography, Tooltip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import styled, { keyframes } from 'styled-components';

// Improved typography theme
const theme = createTheme({
  palette: {
    primary: { main: '#fcb237' },
    background: { default: '#f8f9fa' },
    secondary: { main: '#f3f4f6' },
    text: { primary: '#1a1a1a', secondary: '#4a4a4a' },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
    h3: {
      fontWeight: 700,
      fontSize: '1.1rem',
      letterSpacing: '-0.02em',
      color: '#fcb237',
      fontFamily: 'inherit',
    },
    body1: {
      fontSize: '0.98rem',
      lineHeight: 1.65,
      letterSpacing: '-0.01em',
      color: '#1a1a1a',
    },
  },
});

// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
`;

const FloatingButton = styled(IconButton)`
  position: fixed !important;
  bottom: 32px !important;
  right: 32px !important;
  width: 64px !important;
  height: 64px !important;
  background: linear-gradient(135deg, #fcb237 0%, #ffd77a 100%) !important;
  color: #fff !important;
  box-shadow: 0 4px 24px rgba(252,178,55,0.25) !important;
  z-index: 9999 !important;
  border-radius: 50% !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  &:hover {
    box-shadow: 0 8px 32px rgba(252,178,55,0.35) !important;
    transform: scale(1.05) !important;
    background: linear-gradient(135deg, #ffd77a 0%, #fcb237 100%) !important;
    animation: ${pulse} 1s ease-in-out;
  }
`;

const ChatPopup = styled(Paper)`
  position: fixed;
  bottom: 112px;
  right: 32px;
  width: 380px;
  max-width: 95vw;
  height: 600px;
  display: flex;
  flex-direction: column;
  border-radius: 36px;
  box-shadow: 0 12px 48px rgba(0,0,0,0.15);
  background: #fff;
  z-index: 9998;
  overflow: hidden;
  animation: ${fadeInUp} 0.4s cubic-bezier(.23,1.01,.32,1) both;
  font-family: inherit;
  @media (max-width: 600px) {
    right: 0;
    left: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    box-shadow: 0 2px 16px rgba(0,0,0,0.12);
  }
`;

const PopupHeader = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 20px 12px 20px;
  background: #fcb237;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  position: relative;
  @media (max-width: 600px) {
    padding: 16px 10px 10px 10px;
  }
`;

const HeaderTitle = styled(Typography)`
  margin: 0 auto;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff !important;
  font-family: inherit;
  letter-spacing: 0.08em;
  text-shadow: 0 1px 0 #b8860b;
  text-transform: uppercase;
  text-align: center;
`;

const MessagesArea = styled(Box)`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #f8f9fa;
  font-family: inherit;
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.1);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0,0,0,0.15);
  }
  @media (max-width: 600px) {
    padding: 12px 6px;
    font-size: 0.97rem;
  }
`;

const Bubble = styled(Box).withConfig({ shouldForwardProp: (prop) => prop !== 'isUser' })`
  max-width: 85%;
  margin: 12px 0;
  padding: 16px 20px;
  border-radius: 20px;
  font-size: 0.98rem;
  line-height: 1.65;
  letter-spacing: -0.01em;
  font-family: inherit;
  background: ${({ isUser }) => isUser ? 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)' : '#fff'};
  color: ${({ isUser }) => isUser ? '#fff' : '#1a1a1a'};
  align-self: ${({ isUser }) => isUser ? 'flex-end' : 'flex-start'};
  box-shadow: ${({ isUser }) => isUser ? '0 3px 12px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.06)'};
  border-bottom-right-radius: ${({ isUser }) => isUser ? '6px' : '20px'};
  border-bottom-left-radius: ${({ isUser }) => isUser ? '20px' : '6px'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ isUser }) => isUser ? '0 4px 16px rgba(0,0,0,0.12)' : '0 3px 12px rgba(0,0,0,0.08)'};
  }
  & a {
    color: ${({ isUser }) => isUser ? '#fff' : '#fcb237'};
    text-decoration: underline;
    text-underline-offset: 2px;
    transition: opacity 0.2s ease;
    &:hover {
      opacity: 0.8;
    }
  }
  & span.emoji {
    font-size: 1.7em;
    vertical-align: middle;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.10));
  }
`;

const QuickRepliesArea = styled(Box)`
  padding: 16px 20px;
  background: #fff;
  border-top: 1px solid rgba(0,0,0,0.06);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  @media (max-width: 600px) {
    padding: 8px 6px;
    gap: 4px;
  }
`;

const QuickReplyChip = styled(Chip)`
  font-size: 0.9rem !important;
  font-family: inherit !important;
  background: #fcb237 !important;
  border: none !important;
  color: #fff !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  cursor: pointer !important;
  &:hover {
    background: #ffd77a !important;
    color: #fff !important;
    transform: translateY(-1px) !important;
  }
`;

const InputArea = styled(Box)`
  padding: 20px;
  background: #fff;
  border-top: 1px solid rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  gap: 12px;
  @media (max-width: 600px) {
    padding: 12px 6px;
    gap: 6px;
  }
`;

const StyledTextField = styled(TextField)`
  flex: 1;
  & .MuiOutlinedInput-root {
    border-radius: 16px;
    background: #f8f9fa;
    font-size: 0.98rem;
    font-family: inherit;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    &:hover {
      background: #ffe7b3;
    }
    &.Mui-focused {
      background: #fff;
      box-shadow: 0 0 0 3px rgba(252,178,55,0.1);
    }
  }
  & .MuiOutlinedInput-input {
    font-family: inherit;
    letter-spacing: -0.01em;
  }
`;

const HistoryButton = styled(IconButton)`
  color: #fcb237 !important;
  transition: all 0.2s ease !important;
  &:hover {
    color: #ffd77a !important;
    transform: translateY(-1px) !important;
  }
`;

const TypingIndicatorWrapper = styled(Box)`
  display: flex;
  align-items: center;
  margin: 8px 0 0 0;
  padding: 0 0 0 44px;
`;
const TypingBubble = styled(Box)`
  background: #fff7e0;
  color: #fcb237;
  border-radius: 16px;
  padding: 10px 18px;
  font-size: 0.97rem;
  font-family: inherit;
  box-shadow: 0 2px 8px rgba(252,178,55,0.08);
  display: flex;
  align-items: center;
  font-weight: 500;
`;
const TypingDots = styled.span`
  display: inline-block;
  margin-left: 4px;
  letter-spacing: 2px;
  & span {
    animation: blink 1.2s infinite both;
    opacity: 0.7;
  }
  & span:nth-child(2) { animation-delay: 0.2s; }
  & span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes blink {
    0%, 80%, 100% { opacity: 0.7; }
    40% { opacity: 1; }
  }
`;

const NotificationBadge = styled('span')`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 14px;
  height: 14px;
  background: #fcb237;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px #fcb23744;
  z-index: 10000;
`;

function formatMessage(text) {
  // Convert markdown links (with or without http(s)://)
  text = text.replace(/\[(.*?)\]\(([^)]+)\)/g, (match, label, url) => {
    let href = url.trim();
    if (!/^https?:\/\//i.test(href)) {
      // If it starts with www. or just a domain, prepend https://
      href = 'https://' + href.replace(/^\/*/, '');
    }
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });

  // Format bold text
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Format paragraphs
  text = text.replace(/\n{2,}/g, '</p><p>');
  text = '<p>' + text + '</p>';
  text = text.replace(/<p><\/p>/g, '');

  return text;
}

const AIAvatar = () => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #fff7e0 60%, #ffe7b3 100%)',
    marginRight: 12,
    marginTop: 2,
    boxShadow: '0 2px 8px rgba(34,34,34,0.08), 0 0 0 3px #fcb23744',
    overflow: 'hidden',
    border: '2.5px solid #fcb237',
    outline: '3px solid #ffe7b3',
    outlineOffset: '-2px',
  }}>
    <img 
      src="/avatar.png" 
      alt="AI Assistant" 
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }}
    />
  </span>
);

export default function App() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    return savedMessages ? JSON.parse(savedMessages) : [
      { text: "Hej! Jag är 1753 Skincare's AI-assistent och holistiska hudterapeut. Jag kan hjälpa dig med allt från hudvård till hudhälsa! ✨", isUser: false }
    ];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const quickReplies = [
    "Jag har torr hud, vilka produkter rekommenderar ni?",
    "Hur fungerar ert hudvårdskoncept?",
    "Vart kan jag ladda hem er e-bok?"
  ];

  // Save chat history to localStorage
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (open) {
      setHasNewMessage(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If the last message is from AI, set notification
      if (messages.length > 0 && !messages[messages.length - 1].isUser) {
        setHasNewMessage(true);
      }
    }
  }, [messages, open]);

  const handleSend = async (messageText = input) => {
    if (!messageText.trim() || loading) return;
    setMessages(prev => [...prev, { text: messageText, isUser: true }]);
    setInput('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { text: data.reply, isUser: false }]);
    } catch {
      setMessages(prev => [...prev, { text: 'Tyvärr kunde jag inte processa din fråga just nu. Vänligen försök igen eller kontakta christopher@1753skincare.com', isUser: false }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = (reply) => {
    handleSend(reply);
  };

  const clearHistory = () => {
    setMessages([{ text: "Hej! Jag är 1753 Skincare's AI-assistent och holistiska hudterapeut. Jag kan hjälpa dig med allt från hudvård till hudhälsa! ✨", isUser: false }]);
    setShowHistory(false);
  };

  return (
    <ThemeProvider theme={theme}>
      {!open && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <FloatingButton onClick={() => setOpen(true)} aria-label="Öppna chatt">
            <ChatIcon sx={{ fontSize: 32 }} />
            {hasNewMessage && <NotificationBadge />}
          </FloatingButton>
        </div>
      )}
      {open && (
        <ChatPopup>
          <PopupHeader>
            <HeaderTitle variant="h3">Maja Glowberg</HeaderTitle>
            <Box sx={{ display: 'flex', gap: 1, position: 'absolute', right: 20, top: 18 }}>
              <Tooltip title="Chatthistorik">
                <HistoryButton onClick={() => setShowHistory(!showHistory)} size="small">
                  <HistoryIcon />
                </HistoryButton>
              </Tooltip>
              <IconButton onClick={() => setOpen(false)} size="small" aria-label="Stäng chatt">
                <CloseIcon />
              </IconButton>
            </Box>
          </PopupHeader>
          <MessagesArea>
            {messages.map((msg, i) => (
              <Fade in={true} key={i}>
                {msg.isUser ? (
                  <Bubble isUser>{msg.text}</Bubble>
                ) : (
                  <Bubble isUser={false} dangerouslySetInnerHTML={{ __html: `<span style='display:inline-block;vertical-align:top;'><span style='display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg, #e0e7ef 60%, #b3c0d1 100%);margin-right:12px;margin-top:2px;box-shadow:0 2px 8px rgba(34,34,34,0.08);overflow:hidden;'><img src="/avatar.png" alt="AI Assistant" style="width:100%;height:100%;object-fit:cover;" /></span></span><span style="display:inline-block;vertical-align:top;margin-top:4px;">${formatMessage(msg.text)}</span>` }} />
                )}
              </Fade>
            ))}
            {loading && (
              <TypingIndicatorWrapper>
                <TypingBubble>
                  Maja skriver
                  <TypingDots>
                    <span>.</span><span>.</span><span>.</span>
                  </TypingDots>
                </TypingBubble>
              </TypingIndicatorWrapper>
            )}
            <div ref={messagesEndRef} />
          </MessagesArea>
          {showHistory && (
            <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderTop: '1px solid #dee2e6' }}>
              <Typography variant="body2" sx={{ mb: 1, color: '#495057' }}>
                Chatthistorik sparas lokalt i din webbläsare
              </Typography>
              <IconButton 
                onClick={clearHistory}
                size="small"
                sx={{ 
                  color: '#dc3545',
                  '&:hover': { color: '#c82333' }
                }}
              >
                Rensa historik
              </IconButton>
            </Box>
          )}
          <QuickRepliesArea>
            {quickReplies.map((reply, i) => (
              <QuickReplyChip
                key={i}
                label={reply}
                onClick={() => handleQuickReply(reply)}
                size="small"
              />
            ))}
          </QuickRepliesArea>
          <InputArea>
            <StyledTextField
              placeholder="Skriv ditt meddelande..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              disabled={loading}
              size="small"
            />
            <IconButton 
              color="primary" 
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              sx={{
                backgroundColor: '#fcb237',
                color: 'white',
                width: 44,
                height: 44,
                '&:hover': {
                  backgroundColor: '#ffd77a'
                }
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            </IconButton>
          </InputArea>
        </ChatPopup>
      )}
    </ThemeProvider>
  );
} 