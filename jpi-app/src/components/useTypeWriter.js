import { useEffect, useState } from "react";

function useTypewriter(texts, speed = 45, pause = 1400) {
  const [text, setText] = useState("");
  const [i, setI] = useState(0);
  const [j, setJ] = useState(0);
  const [del, setDel] = useState(false);

  useEffect(() => {
    const current = texts[i];

    if (!del && j === current.length) {
      setTimeout(() => setDel(true), pause);
      return;
    }

    if (del && j === 0) {
      setDel(false);
      setI((i + 1) % texts.length);
      return;
    }

    const t = setTimeout(() => {
      setText(current.slice(0, j + (del ? -1 : 1)));
      setJ(j + (del ? -1 : 1));
    }, del ? speed / 2 : speed);

    return () => clearTimeout(t);
  }, [texts, i, j, del]);

  return text;
}

export default useTypewriter