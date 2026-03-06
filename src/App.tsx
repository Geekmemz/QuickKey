import { useMemo, useState } from "react";
import {
  type GeneratorMode,
  type PassphraseOptions,
  type PasswordOptions,
  type PinOptions,
  type UsernameOptions,
  generatePassphrase,
  generatePassword,
  generatePin,
  generateUsername,
  nowIsoString,
  scorePassword
} from "./lib/generator";
import { clearHistory, loadHistory, loadSettings, pushHistory, saveSettings } from "./lib/storage";

type AppSettings = {
  mode: GeneratorMode;
  password: PasswordOptions;
  passphrase: PassphraseOptions;
  username: UsernameOptions;
  pin: PinOptions;
};

const defaultSettings: AppSettings = {
  mode: "password",
  password: {
    length: 14,
    useUpper: true,
    useLower: true,
    useNumbers: true,
    useSymbols: false,
    minNumbers: 1,
    minSymbols: 0,
    avoidAmbiguous: false
  },
  passphrase: {
    words: 3,
    separator: "-",
    capitalize: false,
    includeNumber: false
  },
  username: {
    pattern: "random-word",
    capitalize: false,
    includeNumber: false
  },
  pin: {
    length: 6
  }
};

function getModeTitle(mode: GeneratorMode): string {
  if (mode === "password") return "密码";
  if (mode === "passphrase") return "密码短语";
  if (mode === "username") return "用户名";
  return "PIN";
}

function App(): JSX.Element {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings(defaultSettings));
  const [value, setValue] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [history, setHistory] = useState(loadHistory());

  const strength = useMemo(() => {
    if (settings.mode !== "password") return null;
    return scorePassword(value);
  }, [settings.mode, value]);

  function updateSettings(next: AppSettings): void {
    setSettings(next);
    saveSettings(next);
  }

  function generateCurrent(): void {
    let generated = "";

    if (settings.mode === "password") {
      generated = generatePassword(settings.password);
    } else if (settings.mode === "passphrase") {
      generated = generatePassphrase(settings.passphrase);
    } else if (settings.mode === "username") {
      generated = generateUsername(settings.username);
    } else {
      generated = generatePin(settings.pin);
    }

    setValue(generated);
    setCopied(false);
    const nextHistory = pushHistory({
      id: crypto.randomUUID(),
      mode: settings.mode,
      value: generated,
      time: nowIsoString()
    });
    setHistory(nextHistory);
  }

  async function copyValue(): Promise<void> {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
  }

  function switchMode(mode: GeneratorMode): void {
    const next = { ...settings, mode };
    updateSettings(next);
    setValue("");
    setCopied(false);
  }

  function clearAllHistory(): void {
    clearHistory();
    setHistory([]);
  }

  return (
    <div className="app-shell">
      <div className="generator-card">
        <header className="header-row">
          <h1>生成器</h1>
          <span className="sub">QuickKey</span>
        </header>

        <div className="mode-tabs" role="tablist" aria-label="生成模式">
          {(["password", "passphrase", "username", "pin"] as GeneratorMode[]).map((mode) => (
            <button
              key={mode}
              className={`tab ${settings.mode === mode ? "active" : ""}`}
              onClick={() => switchMode(mode)}
            >
              {getModeTitle(mode)}
            </button>
          ))}
        </div>

        <section className="tip-box">
          <div className="tip-title">快速创建{getModeTitle(settings.mode)}</div>
          <div className="tip-desc">一键创建强大且唯一的内容，默认本地离线生成，不上传云端。</div>
        </section>

        <section className="result-box">
          <div className="result-value">{value || "点击刷新生成"}</div>
          <div className="result-actions">
            <button className="icon-btn" onClick={generateCurrent} title="刷新">↻</button>
            <button className="icon-btn" onClick={copyValue} title="复制">⧉</button>
          </div>
        </section>

        {strength && (
          <section className="strength-box">
            <span>强度：{strength.label}</span>
            <div className="meter">
              {[0, 1, 2, 3, 4].map((n) => (
                <i key={n} className={n <= strength.score ? "on" : ""} />
              ))}
            </div>
          </section>
        )}

        <section className="options-box">
          <h2>选项</h2>

          {settings.mode === "password" && (
            <div className="option-grid">
              <label>
                长度
                <input
                  type="number"
                  min={5}
                  max={128}
                  value={settings.password.length}
                  onChange={(e) =>
                    updateSettings({
                      ...settings,
                      password: { ...settings.password, length: Number(e.target.value) }
                    })
                  }
                />
              </label>

              <div className="checks">
                <label><input type="checkbox" checked={settings.password.useUpper} onChange={(e) => updateSettings({ ...settings, password: { ...settings.password, useUpper: e.target.checked } })} />A-Z</label>
                <label><input type="checkbox" checked={settings.password.useLower} onChange={(e) => updateSettings({ ...settings, password: { ...settings.password, useLower: e.target.checked } })} />a-z</label>
                <label><input type="checkbox" checked={settings.password.useNumbers} onChange={(e) => updateSettings({ ...settings, password: { ...settings.password, useNumbers: e.target.checked } })} />0-9</label>
                <label><input type="checkbox" checked={settings.password.useSymbols} onChange={(e) => updateSettings({ ...settings, password: { ...settings.password, useSymbols: e.target.checked } })} />!@#$%</label>
              </div>

              <label>
                数字最少个数
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={settings.password.minNumbers}
                  onChange={(e) => updateSettings({ ...settings, password: { ...settings.password, minNumbers: Number(e.target.value) } })}
                />
              </label>

              <label>
                符号最少个数
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={settings.password.minSymbols}
                  onChange={(e) => updateSettings({ ...settings, password: { ...settings.password, minSymbols: Number(e.target.value) } })}
                />
              </label>

              <label className="single-check">
                <input
                  type="checkbox"
                  checked={settings.password.avoidAmbiguous}
                  onChange={(e) => updateSettings({ ...settings, password: { ...settings.password, avoidAmbiguous: e.target.checked } })}
                />
                避免易混淆字符
              </label>
            </div>
          )}

          {settings.mode === "passphrase" && (
            <div className="option-grid">
              <label>
                单词数
                <input
                  type="number"
                  min={3}
                  max={20}
                  value={settings.passphrase.words}
                  onChange={(e) => updateSettings({ ...settings, passphrase: { ...settings.passphrase, words: Number(e.target.value) } })}
                />
              </label>
              <label>
                单词分隔符
                <input
                  type="text"
                  value={settings.passphrase.separator}
                  onChange={(e) => updateSettings({ ...settings, passphrase: { ...settings.passphrase, separator: e.target.value } })}
                />
              </label>
              <label className="single-check"><input type="checkbox" checked={settings.passphrase.capitalize} onChange={(e) => updateSettings({ ...settings, passphrase: { ...settings.passphrase, capitalize: e.target.checked } })} />首字母大写</label>
              <label className="single-check"><input type="checkbox" checked={settings.passphrase.includeNumber} onChange={(e) => updateSettings({ ...settings, passphrase: { ...settings.passphrase, includeNumber: e.target.checked } })} />包含数字</label>
            </div>
          )}

          {settings.mode === "username" && (
            <div className="option-grid">
              <label>
                类型
                <select
                  value={settings.username.pattern}
                  onChange={(e) =>
                    updateSettings({
                      ...settings,
                      username: { ...settings.username, pattern: e.target.value as UsernameOptions["pattern"] }
                    })
                  }
                >
                  <option value="random-word">随机单词</option>
                  <option value="adjective-noun">形容词+名词</option>
                  <option value="name-style">姓名风格</option>
                </select>
              </label>
              <label className="single-check"><input type="checkbox" checked={settings.username.capitalize} onChange={(e) => updateSettings({ ...settings, username: { ...settings.username, capitalize: e.target.checked } })} />首字母大写</label>
              <label className="single-check"><input type="checkbox" checked={settings.username.includeNumber} onChange={(e) => updateSettings({ ...settings, username: { ...settings.username, includeNumber: e.target.checked } })} />包含数字</label>
            </div>
          )}

          {settings.mode === "pin" && (
            <div className="option-grid">
              <label>
                PIN 长度
                <input
                  type="number"
                  min={4}
                  max={12}
                  value={settings.pin.length}
                  onChange={(e) => updateSettings({ ...settings, pin: { ...settings.pin, length: Number(e.target.value) } })}
                />
              </label>
            </div>
          )}
        </section>

        <section className="history-box">
          <button className="history-toggle" onClick={() => setHistoryOpen((v) => !v)}>
            生成器历史记录 <span>{historyOpen ? "▾" : "▸"}</span>
          </button>
          {historyOpen && (
            <div className="history-list">
              {history.length === 0 ? <p>暂无历史</p> : history.map((item) => (
                <div key={item.id} className="history-item">
                  <span className="mode">{getModeTitle(item.mode)}</span>
                  <code>{item.value}</code>
                  <time>{new Date(item.time).toLocaleString()}</time>
                </div>
              ))}
              {history.length > 0 && <button className="clear-btn" onClick={clearAllHistory}>清空历史</button>}
            </div>
          )}
        </section>

        <footer className="footer-row">
          <button className="primary" onClick={generateCurrent}>生成</button>
          <button className="ghost" onClick={copyValue}>{copied ? "已复制" : "复制"}</button>
        </footer>
      </div>
    </div>
  );
}

export default App;
