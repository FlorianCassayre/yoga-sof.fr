export function AuthorQuote({ author, quote, source }) {
  return (
    <figure className="text-center">
      <blockquote className="blockquote">
        <p className="mb-0">
          <em>{author}</em>
        </p>
        <p className="h6">
          "
          {quote}
          "
        </p>
      </blockquote>
      <figcaption className="blockquote-footer">
        <cite title={source}>{source}</cite>
      </figcaption>
    </figure>
  );
}
