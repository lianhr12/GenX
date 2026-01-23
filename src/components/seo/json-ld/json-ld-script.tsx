/**
 * Base JSON-LD Script Component
 *
 * Renders structured data as a script tag in the document head
 */

interface JsonLdScriptProps {
  data: Record<string, unknown>;
}

export function JsonLdScript({ data }: JsonLdScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 0),
      }}
    />
  );
}
