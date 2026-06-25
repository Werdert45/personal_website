// Render a title with its last word italicised. If an optional `italicToken`
// is supplied and present in the title, that token is italicised instead
// (the writing-teaser variant). Behavior matches the previous per-component copies.
export function renderTitle(title, italicToken) {
  if (!title) return null;
  if (italicToken && title.includes(italicToken)) {
    const [before, ...rest] = title.split(italicToken);
    return (
      <>
        {before}
        <i>{italicToken}</i>
        {rest.join(italicToken)}
      </>
    );
  }
  const parts = title.split(" ");
  if (parts.length === 1) return <i>{title}</i>;
  const last = parts.pop();
  return (
    <>
      {parts.join(" ")} <i>{last}</i>
    </>
  );
}
