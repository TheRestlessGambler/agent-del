import * as vscode from 'vscode';
import { callGeminiAPI } from './ai/geminiCall';

export class ChatPanel {
  public static currentPanel: ChatPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private readonly _context: vscode.ExtensionContext;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
    const column = vscode.ViewColumn.One;

    if (ChatPanel.currentPanel) {
      ChatPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'aiChatSidebar',
      'AI Agent Chat',
      { viewColumn: column, preserveFocus: false },
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    ChatPanel.currentPanel = new ChatPanel(panel, extensionUri, context);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._context = context;

    this._panel.webview.html = this._getHtmlForWebview();

    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        if (message.command === 'sendMessage') {
          const userText = message.text.trim();
          if (!userText) return;

          this._panel.webview.postMessage({ command: 'addMessage', text: userText, sender: 'user' });

          this._panel.webview.postMessage({ command: 'showLoading', text: 'AI is typing...' });

          try {
            const lowerText = userText.toLowerCase();
            let reply = '';

            if (/(check|verify).*(tool|node|npm|vite)/.test(lowerText)) {
              const { checkTools } = await import('./commands/checkTools.js');
              reply = await checkTools(true);
            } else if (/(setup|create).*(react|vite).*(app|project)/.test(lowerText)) {
              const { setupReactApp } = await import('./commands/setupReactApp.js');
              await setupReactApp();
              reply = 'React app setup complete!';
            } else if (/(generate|make|create).*(todo|to-do).*(component|app|project)?/.test(lowerText)) {
              const { generateCode } = await import('./commands/generateCode.js');
              await generateCode(this._context);
              reply = 'ToDo component generated.';
            } else if (/run command (.+)/.test(lowerText)) {
              const { executeCommand } = await import('./commands/executeCommand.js');
              const cmdMatch = lowerText.match(/run command (.+)/);
              if (cmdMatch && cmdMatch[1]) {
                const cmd = cmdMatch[1].trim();
                await executeCommand(cmd);
                reply = `Executed command: ${cmd}`;
              } else {
                reply = 'Please provide a command after "run command".';
              }
            } else {
              reply = await callGeminiAPI(userText, this._context);
            }

            this._panel.webview.postMessage({ command: 'hideLoading' });
            this._panel.webview.postMessage({ command: 'addMessage', text: reply, sender: 'bot' });
          } catch (error: any) {
            this._panel.webview.postMessage({ command: 'hideLoading' });
            this._panel.webview.postMessage({ command: 'addMessage', text: `Error: ${error.message || error}`, sender: 'bot' });
          }
        }
      },
      null,
      this._disposables
    );

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

  public dispose() {
    ChatPanel.currentPanel = undefined;
    this._disposables.forEach(d => d.dispose());
  }

  private _getHtmlForWebview() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>AI Agent Chat</title>
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    margin: 0; padding: 0; height: 100vh; display: flex; flex-direction: column;
    background-color: #1e1e1e;
    color: #ddd;
  }
  #chat {
    flex-grow: 1;
    padding: 10px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .message {
    max-width: 80%;
    padding: 10px 15px;
    border-radius: 8px;
    word-wrap: break-word;
    font-size: 14px;
    line-height: 1.4;
  }
  .user {
    align-self: flex-end;
    background-color: #f3f3f3dd;
    color: #000;
  }
  .bot {
    align-self: flex-start;
    background-color: #fff;
    color: #000;
  }
  #loading {
    font-style: italic;
    color: #999;
    margin-bottom: 10px;
    display: none;
  }
  #loadingSpinner {
    border: 4px solid rgba(0,0,0,0.1);
    border-left-color: #0e639c;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    display: inline-block;
    animation: spin 1s linear infinite;
    vertical-align: middle;
    margin-right: 6px;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  #input-container {
    display: flex;
    padding: 10px;
    border-top: 1px solid #333;
    background-color: #252526;
  }
  #input {
    flex-grow: 1;
    font-size: 14px;
    padding: 8px 12px;
    border-radius: 6px;
    border: none;
    outline: none;
    background-color: #f3f3f3dd;
    color: #000;
  }
  #sendBtn {
    margin-left: 10px;
    background-color: #0e639c;
    border: none;
    color: white;
    padding: 0 15px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
  }
  #sendBtn:hover {
    background-color: #1177d2;
  }
</style>
</head>
<body>
  <div id="chat" role="log" aria-live="polite" aria-relevant="additions"></div>
  <div id="loading"><span id="loadingSpinner"></span><span id="loadingText"></span></div>
  <div id="input-container">
    <input id="input" type="text" placeholder="Type your message here..." aria-label="Chat input" />
    <button id="sendBtn" aria-label="Send message">Send</button>
  </div>

<script>
  const vscode = acquireVsCodeApi();

  const chatDiv = document.getElementById('chat');
  const input = document.getElementById('input');
  const sendBtn = document.getElementById('sendBtn');
  const loadingDiv = document.getElementById('loading');
  const loadingText = document.getElementById('loadingText');

  function appendMessage(sender, text) {
    const div = document.createElement('div');
    div.className = 'message ' + sender;
    div.textContent = text;
    chatDiv.appendChild(div);
    chatDiv.scrollTop = chatDiv.scrollHeight;
  }

  sendBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;
    vscode.postMessage({ command: 'sendMessage', text });
    input.value = '';
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendBtn.click();
    }
  });

  window.addEventListener('message', event => {
    const message = event.data;
    if (message.command === 'addMessage') {
      appendMessage(message.sender, message.text);
    } else if (message.command === 'showLoading') {
      loadingText.textContent = message.text || 'Loading...';
      loadingDiv.style.display = 'block';
    } else if (message.command === 'hideLoading') {
      loadingDiv.style.display = 'none';
    }
  });

  input.focus();
</script>
</body>
</html>`;
  }
}
