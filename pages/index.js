import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 重定向到 public 目录下的 index.html 文件
    router.replace('/index.html');
  }, [router]);

  // 重定向期间不渲染任何内容
  return null;


} 