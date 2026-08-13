export function LoadingState({ message = "正在铺开今天的学习桌…" }: { message?: string }) {
  return <div className="empty-state" role="status"><span className="loading-mark" />{message}</div>;
}
