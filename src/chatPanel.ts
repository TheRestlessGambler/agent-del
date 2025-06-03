import * as vscode from 'vscode';
import { callGeminiAPI } from './ai/geminiCall';

export class ChatPanel {
  public static currentPanel: ChatPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

    // If panel already exists, reveal it
    if (ChatPanel.currentPanel) {
      ChatPanel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create new panel
    const panel = vscode.window.createWebviewPanel(
      'aiChat',
      'AI Agent Chat',
      column || vscode.ViewColumn.One,
      { enableScripts: true }
    );

    ChatPanel.currentPanel = new ChatPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set HTML content
    this._panel.webview.html = this._getHtmlForWebview();

    // Listen for messages from the webview
    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'sendMessage':
            const reply = await callGeminiAPI(message.text);
            this._panel.webview.postMessage({ command: 'showReply', text: reply });
            break;
        }
      },
      null,
      this._disposables
    );

    // Clean up on dispose
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

  public dispose() {
    ChatPanel.currentPanel = undefined;
    this._disposables.forEach((d) => d.dispose());
  }

  private _getHtmlForWebview() {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>AI Agent Chat</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 10px; }
          #chat { height: 80vh; overflow-y: auto; border: 1px solid #ddd; padding: 10px; }
          .message { margin-bottom: 10px; }
          .user { color: blue; }
          .bot { color: green; }
          input[type=text] { width: 80%; padding: 8px; }
          button { padding: 8px; }
        </style>
      </head>
      <body>
        <div id="chat"></div>
        <input type="text" id="input" placeholder="Type your message here..." />
        <button id="sendBtn">Send</button>

        <script>
          const vscode = acquireVsCodeApi();

          const chatDiv = document.getElementById('chat');
          const input = document.getElementById('input');
          const sendBtn = document.getElementById('sendBtn');

          sendBtn.onclick = () => {
            const text = input.value.trim();
            if (!text) return;
            appendMessage('You', text, 'user');
            vscode.postMessage({ command: 'sendMessage', text });
            input.value = '';
          };

          window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'showReply') {
              appendMessage('AI Agent', message.text, 'bot');
            }
          });

          function appendMessage(sender, text, cssClass) {
            const div = document.createElement('div');
            div.className = 'message ' + cssClass;
            div.textContent = sender + ': ' + text;
            chatDiv.appendChild(div);
            chatDiv.scrollTop = chatDiv.scrollHeight;
          }
        </script>
      </body>
      </html>
    `;
  }
}
