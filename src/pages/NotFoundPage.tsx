import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
export function NotFoundPage() { return <div className="page"><div className="empty-state not-found"><span>404</span><strong>这页飘到云外去了</strong><p>返回学习桌，继续今天的口语训练。</p><Link className="button primary" to="/"><ArrowLeft size={17} /> 回到首页</Link></div></div>; }
