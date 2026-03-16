interface HomePageProps {
  items: string[];
}

export function HomePage({ items }: HomePageProps) {
  return (
    <section>
      <h2>Latest Medical Breakthroughs</h2>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
