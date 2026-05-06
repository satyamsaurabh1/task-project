const fs = require('fs');

// Fix index.css
let css = fs.readFileSync('taskflow-frontend/src/index.css', 'utf8');

css = css.replace(
  '.dm-user-item:hover { background: rgba(148, 163, 184, 0.08); }\r\n.dm-user-item--active { background: rgba(16, 185, 129, 0.08); border-right: 2px solid #10b981; }',
  '.dm-user-item:hover { background: rgba(148, 163, 184, 0.08); }\n.dm-user-item--active { background: rgba(6, 78, 59, 0.4); border-right: 3px solid #10b981; }\n\n.unread-badge {\n  background: #10b981;\n  color: white;\n  font-size: 0.7rem;\n  font-weight: bold;\n  border-radius: 50%;\n  width: 20px;\n  height: 20px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  margin-left: auto;\n}'
).replace(
  '.dm-user-item:hover { background: rgba(148, 163, 184, 0.08); }\n.dm-user-item--active { background: rgba(16, 185, 129, 0.08); border-right: 2px solid #10b981; }',
  '.dm-user-item:hover { background: rgba(148, 163, 184, 0.08); }\n.dm-user-item--active { background: rgba(6, 78, 59, 0.4); border-right: 3px solid #10b981; }\n\n.unread-badge {\n  background: #10b981;\n  color: white;\n  font-size: 0.7rem;\n  font-weight: bold;\n  border-radius: 50%;\n  width: 20px;\n  height: 20px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  margin-left: auto;\n}'
);

css = css.replace(
  '.dm-bubble {\r\n  padding: 10px 14px;\r\n  border-radius: 16px 16px 16px 4px;\r\n  background: rgba(30, 41, 59, 0.9);\r\n  font-size: 0.9rem;\r\n  line-height: 1.45;\r\n  word-break: break-word;\r\n}',
  '.dm-bubble {\n  padding: 10px 14px;\n  border-radius: 16px 16px 16px 4px;\n  background: #1e293b;\n  font-size: 0.9rem;\n  line-height: 1.45;\n  word-break: break-word;\n  color: #f8fafc;\n}'
).replace(
  '.dm-bubble {\n  padding: 10px 14px;\n  border-radius: 16px 16px 16px 4px;\n  background: rgba(30, 41, 59, 0.9);\n  font-size: 0.9rem;\n  line-height: 1.45;\n  word-break: break-word;\n}',
  '.dm-bubble {\n  padding: 10px 14px;\n  border-radius: 16px 16px 16px 4px;\n  background: #1e293b;\n  font-size: 0.9rem;\n  line-height: 1.45;\n  word-break: break-word;\n  color: #f8fafc;\n}'
);

css = css.replace(
  '.dm-bubble--own {\r\n  border-radius: 16px 16px 4px 16px;\r\n  background: linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(6, 182, 212, 0.18));\r\n  border: 1px solid rgba(16, 185, 129, 0.2);\r\n}',
  '.dm-bubble--own {\n  border-radius: 16px 16px 4px 16px;\n  background: #0f766e;\n  border: none;\n  color: #ffffff;\n}'
).replace(
  '.dm-bubble--own {\n  border-radius: 16px 16px 4px 16px;\n  background: linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(6, 182, 212, 0.18));\n  border: 1px solid rgba(16, 185, 129, 0.2);\n}',
  '.dm-bubble--own {\n  border-radius: 16px 16px 4px 16px;\n  background: #0f766e;\n  border: none;\n  color: #ffffff;\n}'
);

fs.writeFileSync('taskflow-frontend/src/index.css', css);

// Fix DirectMessages.jsx
let jsx = fs.readFileSync('taskflow-frontend/src/pages/DirectMessages.jsx', 'utf8');

jsx = jsx.replace(
  'const [readReceipts, setReadReceipts] = useState(new Set());',
  'const [readReceipts, setReadReceipts] = useState(new Set());\n    const [unreadCounts, setUnreadCounts] = useState({});'
);

jsx = jsx.replace(
  'setMessages(data.messages || []);',
  'setMessages(data.messages || []);\n                setUnreadCounts(prev => ({ ...prev, [activeUserId]: 0 }));'
);

jsx = jsx.replace(
  /const onDm = \(\{ fromUserId, message \}\) => \{[\s\S]*?if \(String\(fromUserId\) === String\(activeUserId\)\) \{[\s\S]*?setMessages\(prev => \[\.\.\.prev, message\]\);[\s\S]*?\/\/ Mark message as read[\s\S]*?socket\.emit\('dm:read', \{ messageId: message\._id, userId: activeUserId \}\);[\s\S]*?\}[\s\S]*?\};/,
  `const onDm = ({ fromUserId, message }) => {
            if (String(fromUserId) === String(activeUserId)) {
                setMessages(prev => {
                    if (prev.some(m => String(m._id) === String(message._id))) return prev;
                    return [...prev, message];
                });
                socket.emit('dm:read', { messageId: message._id, userId: activeUserId });
            } else {
                setUnreadCounts(prev => ({
                    ...prev,
                    [fromUserId]: (prev[fromUserId] || 0) + 1
                }));
            }
        };`
);

jsx = jsx.replace(
  /<div>\s*<strong>\{getDisplayName\(u\)\}<\/strong>\s*<span>\{u\.email\}<\/span>\s*<\/div>\s*<\/Link>/g,
  `<div>
                                        <strong>{getDisplayName(u)}</strong>
                                        <span>{u.email}</span>
                                    </div>
                                    {unreadCounts[u._id] > 0 && (
                                        <div className="unread-badge">{unreadCounts[u._id]}</div>
                                    )}
                                </Link>`
);

fs.writeFileSync('taskflow-frontend/src/pages/DirectMessages.jsx', jsx);

console.log('Fixed successfully');
