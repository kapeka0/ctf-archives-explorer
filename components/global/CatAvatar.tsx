"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

function CatAvatar({ size = 28 }: { size?: number }) {
  const avatarUrl = useQuery(api.avatars.get);
  const setAvatar = useMutation(api.avatars.set);
  const fetching = useRef(false);

  useEffect(() => {
    if (avatarUrl === null && !fetching.current) {
      fetching.current = true;
      fetch("/api/cat-avatar")
        .then((r) => r.json())
        .then((data) => {
          if (data.url) void setAvatar({ url: data.url });
        })
        .catch(() => {})
        .finally(() => {
          fetching.current = false;
        });
    }
  }, [avatarUrl, setAvatar]);

  const style = { width: size, height: size };

  if (!avatarUrl) {
    return <div className="rounded-full bg-muted animate-pulse" style={style} />;
  }

  return <img alt="" className="rounded-full object-cover" src={avatarUrl} style={style} />;
}

export default CatAvatar;
