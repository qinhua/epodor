import React, { useState } from "react";
import { login, register, getCurrentUser, logout } from "../services/auth";

const Auth: React.FC = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const user = getCurrentUser();

  if (user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <img src={user.avatarUrl} alt="avatar" className="w-12 h-12 rounded-full border border-border" />
          <div>
            <div className="text-white font-bold">{user.username}</div>
            <div className="text-muted text-xs">已登录</div>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            location.reload();
          }}
          className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-500"
        >
          退出登录
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md bg-surface border border-border rounded-xl p-6">
      <div className="flex gap-2 mb-4">
        <button
          className={`px-3 py-1 rounded ${mode === "login" ? "bg-primary text-black" : "bg-slate-800 text-muted"}`}
          onClick={() => setMode("login")}
        >
          登录
        </button>
        <button
          className={`px-3 py-1 rounded ${mode === "register" ? "bg-primary text-black" : "bg-slate-800 text-muted"}`}
          onClick={() => setMode("register")}
        >
          注册
        </button>
      </div>
      <div className="space-y-3">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="用户名"
          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
        />
        {mode === "register" && (
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="邮箱（可选）"
            className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
          />
        )}
        <button
          onClick={() => {
            if (!username.trim()) return;
            mode === "login" ? login(username, "") : register(username, email);
            location.assign("/dashboard");
          }}
          className="w-full px-4 py-2 bg-primary text-black rounded-lg hover:bg-cyan-400"
        >
          {mode === "login" ? "立即登录" : "创建账户"}
        </button>
      </div>
      <p className="text-xs text-muted mt-3">默认头像已启用，登录后用于统计学习数据。</p>
    </div>
  );
};

export default Auth;

